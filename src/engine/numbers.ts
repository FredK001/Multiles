/* Questions de nombres jusqu'à 100 (CP). Une question = { île, rang } ; ses deux nombres x, y se lisent selon l'île :
   du = x dizaines et y unités ; suite = juste après x (y = 1) ou juste avant x (y = 0) ;
   comp = le plus grand de x et y ; droite = nombre y caché entre x et x + 10. */
import { NUM_SETS, numSetOf, type NumId } from '../content/numbers';
import type { SeriesDef } from '../content/series';
import { shuffle, type Rng } from './random';

export const numSetOfSeries = (s: SeriesDef): NumId => {
  if (s.spec.kind !== 'num') throw new RangeError(`${s.id} n'est pas une série de nombres`);
  return s.spec.set;
};

export interface NumQ {
  set: NumId;
  x: number;
  y: number;
}

/** Les deux nombres de la question n° `b` de l'île. */
export function numQ(set: NumId, b: number): NumQ {
  const f = numSetOf(set).facts[b - 1];
  if (!f) throw new RangeError(`${set} : pas de question n° ${b}`);
  return { set, x: f.a, y: f.b };
}

/** Question d'une clé de nombres (île a, rang b), pour l'espace parent. */
export const numOfKey = (a: number, b: number): NumQ | null => {
  const s = NUM_SETS[a - 1];
  return s && s.facts[b - 1] ? numQ(s.id, b) : null;
};

/** Réponse attendue. */
export function numAnswer(set: NumId, a: number, b: number): number {
  if (set === 'du') return a * 10 + b;
  if (set === 'suite') return b === 1 ? a + 1 : a - 1;
  if (set === 'comp') return Math.max(a, b);
  return b;
}

/** Propositions du QCM : les erreurs typiques (chiffres inversés, une dizaine d'écart, un d'écart). */
export function numChoices(set: NumId, a: number, b: number, rng: Rng): number[] {
  const r = numAnswer(set, a, b);
  if (set === 'comp') return shuffle([a, b], rng);
  const cands =
    set === 'du' ? [b * 10 + a, r + 10, r - 10, r + 1, r - 1]
    : set === 'suite' ? [a, b === 1 ? a - 1 : a + 1, r + 10, r - 10]
    : [r + 1, r - 1, a + 10 - (b - a), r + 2, r - 2];
  const lo = set === 'droite' ? a + 1 : 0, hi = set === 'droite' ? a + 9 : 100;
  const out = [r];
  for (const x of shuffle(cands, rng)) if (out.length < 3 && x >= lo && x <= hi && !out.includes(x)) out.push(x);
  return shuffle(out, rng);
}
