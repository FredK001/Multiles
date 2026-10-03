/* Composition des sessions : étape (avec répétition intelligente), gardien, pièges, chrono. */
import { addDays, dayNumber, type DayKey } from './dates';
import { SERIES, type SeriesId } from '../content/series';
import { canonKey, factKey, hasKey, mulKey, parseFact, parseKey } from './keys';
import { CHRONO_ORDER, FORMAT_ORDER, generateQuestion, makeQ, type Question } from './questions';
import { defaultRng, shuffle, weightedSample, type Rng } from './random';
import { drawFact, drawFacts, factsOf, seriesForFact, type Fact } from './series';
import { ALL_MULTIPLIERS, RANGES } from './unlock';

export const SESSION_LENGTH = 10;
/** Répétitions en plus tirées parmi les pièges, au maximum. */
export const MAX_TRAP_EXTRAS = 3;
/** Fenêtre des « erreurs récentes » (jours). */
export const RECENT_DAYS = 14;

/** Erreurs d'un calcul dans les RECENT_DAYS derniers jours (aujourd'hui compris). */
export function recentErrors(log: Record<string, readonly string[]>, key: string, today: DayKey): number {
  const from = dayNumber(addDays(today, -(RECENT_DAYS - 1)));
  return (log[canonKey(key)] ?? []).filter((d) => dayNumber(d) >= from).length;
}

/** Multiplicateurs de `table` qui sont des pièges, limités à `range` (null = toute la table). */
export function trapMultipliers(traps: readonly string[], table: number, range: readonly number[] | null): number[] {
  const out = new Set<number>();
  for (const k of traps) {
    const [x, y] = parseKey(k);
    const m = x === table ? y : y === table ? x : null;
    if (m !== null && (!range || range.includes(m))) out.add(m);
  }
  return [...out];
}

/** Ordonne les multiplicateurs : pas deux fois le même de suite, pas de piège en premier, pas deux pièges consécutifs.
    Alterne mélanges au hasard et constructions gloutonnes (le plus fréquent restant d'abord), et garde le meilleur ordre. */
export function arrange(ms: number[], isTrap: (m: number) => boolean, rng: Rng, tries = 300): number[] {
  const score = (a: number[]) => {
    let s = 0;
    if (isTrap(a[0]!)) s += 10;
    for (let i = 1; i < a.length; i++) {
      if (a[i] === a[i - 1]) s += 100;
      else if (isTrap(a[i]!) && isTrap(a[i - 1]!)) s += 1;
    }
    return s;
  };
  const greedy = (): number[] => {
    const count = new Map<number, number>();
    for (const m of ms) count.set(m, (count.get(m) ?? 0) + 1);
    const out: number[] = [];
    for (let i = 0; i < ms.length; i++) {
      const prev = out[i - 1];
      let best: number | null = null, bestW = -Infinity;
      for (const [m, c] of count) {
        if (c === 0) continue;
        let w = c * 10 + rng();
        if (m === prev) w -= 1000;
        if (isTrap(m) && (i === 0 || (prev !== undefined && isTrap(prev)))) w -= 5;
        if (w > bestW) [best, bestW] = [m, w];
      }
      out.push(best!);
      count.set(best!, count.get(best!)! - 1);
    }
    return out;
  };
  let best = greedy(), bestScore = score(best);
  for (let t = 0; t < tries && bestScore > 0; t++) {
    const c = t % 2 ? greedy() : shuffle([...ms], rng), s = score(c);
    if (s < bestScore) [best, bestScore] = [c, s];
  }
  return best;
}

export interface StepPlanInput {
  table: number;
  /** 0, 1 ou 2. */
  stepIdx: number;
  traps: readonly string[];
  trapLog: Record<string, readonly string[]>;
  mastered: readonly string[];
  today: DayKey;
  rng?: Rng;
}

/** Les multiplicateurs d'une session d'étape, avec la répétition intelligente. */
export function stepMultipliers({ table, stepIdx, traps, trapLog, mastered, today, rng = defaultRng }: StepPlanInput): { ms: number[]; extras: number[] } {
  const range = RANGES[stepIdx] ?? null;
  const base = range ?? ALL_MULTIPLIERS;
  // Session de base du prototype : la plage répétée jusqu'à 10 questions.
  const count = new Map<number, number>();
  for (let i = 0; i < SESSION_LENGTH; i++) {
    const m = base[i % base.length]!;
    count.set(m, (count.get(m) ?? 0) + 1);
  }
  const trapMs = trapMultipliers(traps, table, range);
  const isTrap = (m: number) => trapMs.includes(m);
  const drawn = weightedSample(trapMs, (m) => 1 + recentErrors(trapLog, mulKey(table, m), today), MAX_TRAP_EXTRAS, rng);
  const extras: number[] = [];
  for (const t of drawn) {
    // Donneur : un doublon d'une multiplication non piège (étapes 1-2),
    // ou une multiplication non piège déjà maîtrisée (étape 3).
    const donors = [...count.entries()]
      .filter(([m, c]) => !isTrap(m) && (range ? c > 1 : c >= 1 && hasKey(mastered, mulKey(table, m))))
      .map(([m]) => m);
    if (!donors.length) break;
    const maxC = Math.max(...donors.map((m) => count.get(m)!));
    const pool = donors.filter((m) => count.get(m) === maxC);
    const donor = pool[Math.floor(rng() * pool.length)]!;
    count.set(donor, count.get(donor)! - 1);
    if (count.get(donor) === 0) count.delete(donor);
    count.set(t, (count.get(t) ?? 0) + 1);
    extras.push(t);
  }
  const multiset = [...count.entries()].flatMap(([m, c]) => Array<number>(c).fill(m));
  return { ms: arrange(multiset, isTrap, rng), extras };
}

/** Session d'étape : 10 questions, formats alternés. */
export function buildStepPlan(input: StepPlanInput): Question[] {
  const rng = input.rng ?? defaultRng;
  const { ms } = stepMultipliers(input);
  const trapMs = trapMultipliers(input.traps, input.table, RANGES[input.stepIdx] ?? null);
  return ms.map((m, i) => {
    const q = makeQ(input.table, m, FORMAT_ORDER[i % 4]!, rng);
    if (trapMs.includes(m)) q.trap = true;
    return q;
  });
}

/** Gardien : toute la table, 10 questions (comme le prototype). */
export function buildBossPlan(table: number, rng: Rng = defaultRng): Question[] {
  const bs = shuffle(Array.from({ length: SESSION_LENGTH }, (_, i) => ALL_MULTIPLIERS[i % 10]!), rng);
  return bs.map((b, i) => makeQ(table, b, FORMAT_ORDER[i % 4]!, rng));
}

/** Session « Pièges » lancée depuis la grille : les pièges (d'une même opération) en boucle sur 10 questions. */
export function buildTrapsPlan(traps: readonly string[], rng: Rng = defaultRng): Question[] {
  const facts = traps.flatMap((k) => {
    const f = parseFact(k), s = f && seriesForFact(f.op, f);
    return f && s ? [{ series: s, fact: { a: f.a, b: f.b } }] : [];
  });
  if (!facts.length) return [];
  // Ordre anti-répétition : jamais deux fois le même calcul de suite (sauf avec un seul piège).
  const idx = arrange(Array.from({ length: SESSION_LENGTH }, (_, i) => i % facts.length), () => false, rng);
  return idx.map((j, i) => generateQuestion({ ...facts[j]!, fmt: FORMAT_ORDER[i % 4]!, rng }));
}

/* ---- Toutes séries ---- */

export interface SeriesPlanInput extends Omit<StepPlanInput, 'table'> {
  series: SeriesId;
}

/** Session d'étape d'une série : les tables gardent leur composition historique, les plages (CP) tirent dans l'étape. */
export function seriesStepPlan(input: SeriesPlanInput): Question[] {
  const s = SERIES[input.series];
  if (s.spec.kind === 'table') return buildStepPlan({ ...input, table: s.spec.n });
  return buildRangeStepPlan(input);
}

/** Gardien d'une série : toute la série, 10 questions. */
export function seriesBossPlan(series: SeriesId, rng: Rng = defaultRng): Question[] {
  const s = SERIES[series];
  if (s.spec.kind === 'table') return buildBossPlan(s.spec.n, rng);
  return drawFacts(factsOf(s), SESSION_LENGTH, rng, (f) => canonKey(factKey(s.op, f.a, f.b))).map((fact, i) => generateQuestion({ series: s, fact, fmt: FORMAT_ORDER[i % 4]!, rng }));
}

/** Étape d'une plage : 10 calculs différents de l'étape, puis la répétition intelligente (comme les tables) :
    jusqu'à 3 apparitions en plus pour les pièges de l'étape, à la place de calculs non pièges, déjà maîtrisés d'abord. */
export function buildRangeStepPlan({ series, stepIdx, traps, trapLog, mastered, today, rng = defaultRng }: SeriesPlanInput): Question[] {
  const s = SERIES[series], key = (f: Fact) => factKey(s.op, f.a, f.b), isTrap = (f: Fact) => hasKey(traps, key(f));
  const canon = (f: Fact) => canonKey(key(f));
  const pool = factsOf(s, stepIdx);
  const chosen = drawFacts(pool, SESSION_LENGTH, rng, canon);
  // Pièges de l'étape, une seule fois chacun (8+5 et 5+8 sont le même piège).
  const trapPool = pool.filter((f, i) => isTrap(f) && pool.findIndex((g) => canon(g) === canon(f)) === i);
  for (const t of weightedSample(trapPool, (f) => 1 + recentErrors(trapLog, key(f), today), MAX_TRAP_EXTRAS, rng)) {
    const donors = chosen.flatMap((f, i) => (isTrap(f) ? [] : [i]));
    if (!donors.length) break;
    const known = donors.filter((i) => hasKey(mastered, key(chosen[i]!)));
    const from = known.length ? known : donors;
    chosen[from[Math.floor(rng() * from.length)]!] = t;
  }
  // Ordre : jamais deux fois le même calcul de suite, pas de piège en premier ni deux pièges consécutifs.
  // Un même calcul (ou son symétrique) n'apparaît jamais deux fois de suite.
  const ids = [...new Set(chosen.map(canon))];
  const order = arrange(chosen.map((f) => ids.indexOf(canon(f))), (id) => isTrap(chosen.find((f) => canon(f) === ids[id])!), rng);
  const queue = new Map(ids.map((id) => [id, chosen.filter((f) => canon(f) === id)]));
  const factOf = (id: number) => queue.get(ids[id]!)!.shift()!;
  return order.map((id, i) => {
    const fact = factOf(id), q = generateQuestion({ series: s, fact, fmt: FORMAT_ORDER[i % 4]!, rng });
    if (isTrap(fact)) q.trap = true;
    return q;
  });
}

/** Question suivante en mode chrono : jamais deux fois le même calcul de suite.
    Pour une table, le tirage est celui d'avant la généralisation (un multiplicateur de 1 à 10). */
export function nextTimedQuestion(series: SeriesId, prev: Question | null, done: number, rng: Rng = defaultRng): Question {
  const pool = factsOf(series);
  let f: Fact;
  do f = drawFact(pool, rng);
  while (prev && pool.length > 1 && f.a === prev.a && f.b === prev.b);
  return generateQuestion({ series, fact: f, fmt: CHRONO_ORDER[done % 5]!, rng });
}
