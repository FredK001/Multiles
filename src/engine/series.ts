/* Calculs d'une série : liste exhaustive, filtrée par étape, construite une fois pour toutes.
   Toute question est tirée de cette liste : aucun calcul hors plage ni résultat négatif n'est possible. */
import { SERIES, seriesOf, type Op, type SeriesDef, type SeriesId, type StepFilter } from '../content/series';
import { defaultRng, type Rng } from './random';

/** Un calcul : a op b. Pour la table de n, a = n. */
export interface Fact {
  a: number;
  b: number;
}

export function resultOf(op: Op, a: number, b: number): number {
  return op === 'mul' ? a * b : op === 'add' ? a + b : a - b;
}

/** Plus grand nombre du calcul : la somme (+), le nombre de départ (−), le produit (×). */
const topOf = (op: Op, f: Fact): number => (op === 'sub' ? f.a : resultOf(op, f.a, f.b));

/** Passage de la dizaine : les unités débordent (8 + 5) ou il faut casser une dizaine (13 − 5). */
export function crossesTen(op: Op, f: Fact): boolean {
  if (op === 'add') return (f.a % 10) + (f.b % 10) >= 10;
  if (op === 'sub') return f.a % 10 < f.b % 10;
  return false;
}

function allFacts(s: SeriesDef): Fact[] {
  const out: Fact[] = [];
  const sp = s.spec;
  if (sp.kind === 'table') {
    for (let b = 1; b <= 10; b++) out.push({ a: sp.n, b });
    return out;
  }
  const lo = sp.zero ? 0 : 1;
  if (s.op === 'add') {
    for (let a = lo; a <= sp.termMax; a++)
      for (let b = lo; b <= sp.termMax; b++) if (a + b >= sp.min && a + b <= sp.max) out.push({ a, b });
  } else if (s.op === 'sub') {
    for (let a = sp.min; a <= sp.max; a++)
      for (let b = lo; b <= Math.min(a, sp.termMax); b++) out.push({ a, b });
  }
  return out;
}

function matches(op: Op, f: Fact, flt: StepFilter): boolean {
  if (flt.mult && !flt.mult.includes(f.b)) return false;
  if (flt.top) {
    const t = topOf(op, f);
    if (t < flt.top[0] || t > flt.top[1]) return false;
  }
  if (flt.crossTen !== undefined && crossesTen(op, f) !== flt.crossTen) return false;
  return true;
}

const cache = new Map<string, readonly Fact[]>();

/** Calculs de la série, ou de l'une de ses étapes (0 à 2). null ou 3 (gardien) = toute la série. */
export function factsOf(s: SeriesDef | SeriesId, step: number | null = null): readonly Fact[] {
  const def = typeof s === 'string' ? SERIES[s] : s;
  const flt = step === null ? null : (def.steps[step] ?? null);
  const k = `${def.id}:${flt ? step : 'all'}`;
  let list = cache.get(k);
  if (!list) {
    list = Object.freeze(allFacts(def).filter((f) => !flt || matches(def.op, f, flt)));
    cache.set(k, list);
  }
  return list;
}

/** Le calcul appartient-il à la série ? */
export const inSeries = (s: SeriesDef | SeriesId, f: Fact): boolean => factsOf(s).some((x) => x.a === f.a && x.b === f.b);

/** Première série de l'opération qui contient le calcul (table de a pour ×) ; null si aucune. */
export function seriesForFact(op: Op, f: Fact): SeriesDef | null {
  return seriesOf(op).find((s) => inSeries(s, f)) ?? null;
}

/** Bornes des nombres affichés (résultat, propositions du QCM, résultat du vrai/faux). */
export function displayBounds(s: SeriesDef): { lo: number; hi: number } {
  return s.spec.kind === 'range' ? { lo: 0, hi: s.spec.max } : { lo: 1, hi: Number.POSITIVE_INFINITY };
}

/** Poids d'un calcul au tirage : ceux avec un 0 (« 4 + 0 », « 7 − 0 ») sont 4 fois plus rares. */
export const factWeight = (f: Fact): number => (f.a === 0 || f.b === 0 ? 0.25 : 1);

/** Tire un calcul au hasard (pondéré) parmi `pool`. */
export function drawFact(pool: readonly Fact[], rng: Rng = defaultRng): Fact {
  if (!pool.length) throw new RangeError('Aucun calcul à tirer');
  const total = pool.reduce((t, f) => t + factWeight(f), 0);
  let r = rng() * total;
  for (const f of pool) {
    r -= factWeight(f);
    if (r < 0) return f;
  }
  return pool[pool.length - 1]!;
}

/** `n` calculs pour une session : tirage pondéré sans remise, recommencé si la liste est épuisée.
    `same` regroupe les calculs équivalents (3+4 et 4+3) : un seul du groupe sort avant que la liste ne recommence. */
export function drawFacts(pool: readonly Fact[], n: number, rng: Rng = defaultRng, same: (f: Fact) => string = (f) => `${f.a},${f.b}`): Fact[] {
  const out: Fact[] = [];
  let left = [...pool];
  while (out.length < n) {
    if (!left.length) left = [...pool];
    const f = drawFact(left, rng), k = same(f);
    out.push(f);
    left = left.filter((x) => same(x) !== k);
  }
  return out;
}
