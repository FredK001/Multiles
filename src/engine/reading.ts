/* Questions de lecture (CP) : la voix dit un son ou un mot, l'enfant touche la bonne écriture parmi trois.
   Sans voix française, la question devient « trouve la même écriture » (format qcm). */
import { READ_SETS, readSetOf, sayOf, type ReadId } from '../content/reading';
import type { SeriesDef } from '../content/series';
import { defaultRng, shuffle, type Rng } from './random';
import type { Fact } from './series';

export interface ReadQ {
  set: ReadId;
  /** Ce que lit la voix. */
  say: string;
  /** La bonne écriture (montrée au format qcm). */
  target: string;
  /** Les trois écritures, mélangées. */
  options: readonly string[];
}

/** Série de lecture d'une série. */
export const readOfSeries = (s: SeriesDef) => {
  if (s.spec.kind !== 'read') throw new RangeError(`${s.id} n'est pas une série de lecture`);
  return readSetOf(s.spec.set);
};

/** Question sur l'élément `f.b` ; `p` = indice de la bonne écriture. */
export function readDraft(s: SeriesDef, f: Fact, rng: Rng = defaultRng): { read: ReadQ; p: number } {
  const set = readOfSeries(s), it = set.items[f.b - 1];
  if (!it) throw new RangeError(`${s.id} : pas d'élément n° ${f.b}`);
  const options = shuffle([it.w, ...it.x], rng);
  return { read: { set: set.id, say: sayOf(it), target: it.w, options }, p: options.indexOf(it.w) };
}

/** Écriture d'une clé de lecture (espace parent, grille). */
export function readFactLabel(a: number, b: number): { w: string; say: string; set: string } {
  const set = READ_SETS[a - 1], it = set?.items[b - 1];
  return it ? { w: it.w, say: sayOf(it), set: set.title } : { w: '?', say: '', set: '' };
}
