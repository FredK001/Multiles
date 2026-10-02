/* Composition des sessions : étape (avec répétition intelligente), gardien, pièges, chrono. */
import { addDays, dayNumber, type DayKey } from './dates';
import { hasKey, mulKey, normKey, parseKey } from './keys';
import { CHRONO_ORDER, FORMAT_ORDER, makeQ, type Question } from './questions';
import { defaultRng, shuffle, weightedSample, type Rng } from './random';
import { ALL_MULTIPLIERS, RANGES } from './unlock';

export const SESSION_LENGTH = 10;
/** Répétitions en plus tirées parmi les pièges, au maximum. */
export const MAX_TRAP_EXTRAS = 3;
/** Fenêtre des « erreurs récentes » (jours). */
export const RECENT_DAYS = 14;

/** Erreurs d'une multiplication dans les RECENT_DAYS derniers jours (aujourd'hui compris). */
export function recentErrors(log: Record<string, readonly string[]>, a: number, b: number, today: DayKey): number {
  const from = dayNumber(addDays(today, -(RECENT_DAYS - 1)));
  return (log[normKey(a, b)] ?? []).filter((d) => dayNumber(d) >= from).length;
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
  const drawn = weightedSample(trapMs, (m) => 1 + recentErrors(trapLog, table, m, today), MAX_TRAP_EXTRAS, rng);
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

/** Session « Pièges » lancée depuis la grille : les pièges en boucle sur 10 questions. */
export function buildTrapsPlan(traps: readonly string[], rng: Rng = defaultRng): Question[] {
  const pairs = traps.map(parseKey);
  if (!pairs.length) return [];
  // Ordre anti-répétition : jamais deux fois la même multiplication de suite (sauf avec un seul piège).
  const idx = arrange(Array.from({ length: SESSION_LENGTH }, (_, i) => i % pairs.length), () => false, rng);
  return idx.map((j, i) => makeQ(pairs[j]![0], pairs[j]![1], FORMAT_ORDER[i % 4]!, rng));
}

/** Question suivante en mode chrono : jamais deux fois le même multiplicateur de suite. */
export function nextTimedQuestion(table: number, prev: Question | null, done: number, rng: Rng = defaultRng): Question {
  let b: number;
  do b = 1 + Math.floor(rng() * 10);
  while (prev && b === prev.b && table === prev.a);
  return makeQ(table, b, CHRONO_ORDER[done % 5]!, rng);
}
