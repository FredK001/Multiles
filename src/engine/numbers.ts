/* Questions de nombres jusqu'à 100 (CP). Une question = { île, rang } ; ses deux nombres x, y se lisent selon l'île :
   du = x dizaines et y unités ; suite = juste après x (y = 1) ou juste avant x (y = 0) ;
   comp = le plus grand de x et y ; droite = nombre y caché entre x et x + 10 ;
   pg = le plus petit (k = 0) ou le plus grand (k = 1) de x et y ; signe = <, = ou > entre x et y (réponse 0, 1 ou 2) ;
   vf = l'affirmation k sur x et y est-elle vraie (réponse 1) ou fausse (0) ; trois = le plus petit ou le plus grand de x, y, z. */
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
  /** Troisième nombre (le plus petit des trois). */
  z?: number;
  /** Variante : le plus petit ou le plus grand, ou l'affirmation du vrai/faux (content/numbers.ts). */
  k?: number;
}

/** Les trois signes, dans l'ordre des réponses de l'île « signes ». */
export const NUM_SIGNS = ['<', '=', '>'] as const;

/** Les deux nombres de la question n° `b` de l'île. */
export function numQ(set: NumId, b: number): NumQ {
  const f = numSetOf(set).facts[b - 1];
  if (!f) throw new RangeError(`${set} : pas de question n° ${b}`);
  return { set, x: f.a, y: f.b, ...(f.c !== undefined ? { z: f.c } : {}), ...(f.k !== undefined ? { k: f.k } : {}) };
}

/** Question d'une clé de nombres (île a, rang b), pour l'espace parent. */
export const numOfKey = (a: number, b: number): NumQ | null => {
  const s = NUM_SETS[a - 1];
  return s && s.facts[b - 1] ? numQ(s.id, b) : null;
};

/** L'affirmation du vrai/faux est-elle juste ? */
export const numTruth = (a: number, b: number, k: number): boolean => (k % 2 === 0 ? a < b : a > b);

/** Les nombres à comparer : deux, ou trois pour « le plus petit des trois ». */
export const numsOf = (n: NumQ): number[] => (n.z === undefined ? [n.x, n.y] : [n.x, n.y, n.z]);

/** Réponse attendue. */
export function numAnswer(n: NumQ): number {
  const { set, x: a, y: b, k = 0 } = n;
  if (set === 'du') return a * 10 + b;
  if (set === 'suite') return b === 1 ? a + 1 : a - 1;
  if (set === 'comp') return Math.max(a, b);
  if (set === 'pg' || set === 'trois') return k === 0 ? Math.min(...numsOf(n)) : Math.max(...numsOf(n));
  if (set === 'signe') return Math.sign(a - b) + 1;
  if (set === 'vf') return numTruth(a, b, k) ? 1 : 0;
  return b;
}

/** Propositions du QCM : les erreurs typiques (chiffres inversés, une dizaine d'écart, un d'écart). */
export function numChoices(n: NumQ, rng: Rng): number[] {
  const { set, x: a, y: b } = n, r = numAnswer(n);
  if (set === 'comp' || set === 'pg' || set === 'trois') return shuffle(numsOf(n), rng);
  // Les signes restent dans l'ordre < = > : l'enfant les retrouve toujours au même endroit.
  if (set === 'signe') return [0, 1, 2];
  const cands =
    set === 'du' ? [b * 10 + a, r + 10, r - 10, r + 1, r - 1]
    : set === 'suite' ? [a, b === 1 ? a - 1 : a + 1, r + 10, r - 10]
    : [r + 1, r - 1, a + 10 - (b - a), r + 2, r - 2];
  const lo = set === 'droite' ? a + 1 : 0, hi = set === 'droite' ? a + 9 : 100;
  const out = [r];
  for (const x of shuffle(cands, rng)) if (out.length < 3 && x >= lo && x <= hi && !out.includes(x)) out.push(x);
  return shuffle(out, rng);
}
