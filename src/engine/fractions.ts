/* Questions de fractions et décimaux (CM1) : un énoncé (avec, pour « lire », le dessin), trois réponses écrites. */
import { FRAC_SETS, fracSetOf, type Frac, type FracId } from '../content/fractions';
import type { SeriesDef } from '../content/series';
import { defaultRng, shuffle, type Rng } from './random';

export interface FracQ {
  set: FracId;
  /** Énoncé. */
  text: string;
  /** Les trois réponses, mélangées. */
  options: readonly string[];
  pic?: Frac;
  tip: string;
}

export const fracSetOfSeries = (s: SeriesDef): FracId => {
  if (s.spec.kind !== 'frac') throw new RangeError(`${s.id} n'est pas une série de fractions`);
  return s.spec.set;
};

/** Question n° `b` de l'île ; `p` = indice de la bonne réponse. */
export function fracDraft(set: FracId, b: number, rng: Rng = defaultRng): { frac: FracQ; p: number } {
  const it = fracSetOf(set).items[b - 1];
  if (!it) throw new RangeError(`${set} : pas de question n° ${b}`);
  const options = shuffle([it.a, ...it.x], rng);
  return { frac: { set, text: it.q, options, tip: it.tip, ...(it.pic ? { pic: it.pic } : {}) }, p: options.indexOf(it.a) };
}

/** Question et réponse d'une clé de fractions (île a, rang b), pour l'espace parent. */
export function fracFactLabel(a: number, b: number): { q: string; a: string } {
  const it = FRAC_SETS[a - 1]?.items[b - 1];
  return it ? { q: it.q, a: it.a } : { q: '?', a: '' };
}
