/* Questions de géométrie (CM1) : un énoncé (avec, souvent, un dessin), deux ou trois réponses écrites. */
import { GEO_SETS, geoSetOf, type GeoId, type GeoPic } from '../content/geometry';
import type { SeriesDef } from '../content/series';
import { defaultRng, shuffle, type Rng } from './random';

export interface GeoQ {
  set: GeoId;
  /** Énoncé. */
  text: string;
  /** Les deux ou trois réponses, mélangées. */
  options: readonly string[];
  pic?: GeoPic;
  tip: string;
}

export const geoSetOfSeries = (s: SeriesDef): GeoId => {
  if (s.spec.kind !== 'geo') throw new RangeError(`${s.id} n'est pas une série de géométrie`);
  return s.spec.set;
};

/** Question n° `b` de l'île ; `p` = indice de la bonne réponse. */
export function geoDraft(set: GeoId, b: number, rng: Rng = defaultRng): { geo: GeoQ; p: number } {
  const it = geoSetOf(set).items[b - 1];
  if (!it) throw new RangeError(`${set} : pas de question n° ${b}`);
  const options = shuffle([it.a, ...it.x], rng);
  return { geo: { set, text: it.q, options, tip: it.tip, ...(it.pic ? { pic: it.pic } : {}) }, p: options.indexOf(it.a) };
}

/** Question et réponse d'une clé de géométrie (île a, rang b), pour l'espace parent. */
export function geoFactLabel(a: number, b: number): { q: string; a: string } {
  const it = GEO_SETS[a - 1]?.items[b - 1];
  return it ? { q: it.q, a: it.a } : { q: '?', a: '' };
}
