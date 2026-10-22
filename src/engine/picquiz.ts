/* Questions à dessins du CP (grandeurs, espace) : une consigne lue, un dessin, trois réponses écrites ou dessinées. */
import { GRD_SETS, grdSetOf } from '../content/grandeurs';
import { picLabel, type PicCode, type PicItem } from '../content/picquiz';
import type { SeriesDef, SeriesSpec } from '../content/series';
import { ESP_SETS, espSetOf } from '../content/space';
import { defaultRng, shuffle, type Rng } from './random';

export interface PicQ {
  /** Île : « pieces », « formes »… */
  set: string;
  /** Consigne (bulle). */
  text: string;
  /** Les trois réponses, mélangées : textes, ou codes de dessin si `pics`. */
  options: readonly string[];
  pics: boolean;
  pic?: PicCode;
  alt?: string;
  big?: string;
  tip: string;
}

type PicSpec = Extract<SeriesSpec, { kind: 'grd' | 'esp' }>;

/** Questions d'une île de grandeurs ou d'espace. */
export const picItemsOf = (sp: PicSpec): readonly PicItem[] => (sp.kind === 'grd' ? grdSetOf(sp.set) : espSetOf(sp.set)).items;

export const picSpecOf = (s: SeriesDef): PicSpec => {
  if (s.spec.kind !== 'grd' && s.spec.kind !== 'esp') throw new RangeError(`${s.id} n'est pas une série de grandeurs ou d'espace`);
  return s.spec;
};

/** Question n° `b` de l'île ; `p` = indice de la bonne réponse. */
export function picDraft(sp: PicSpec, b: number, rng: Rng = defaultRng): { pic: PicQ; p: number } {
  const it = picItemsOf(sp)[b - 1];
  if (!it) throw new RangeError(`${sp.set} : pas de question n° ${b}`);
  const options = shuffle([it.a, ...it.x], rng);
  const pic: PicQ = { set: sp.set, text: it.q, options, pics: !!it.pics, tip: it.tip };
  if (it.pic) pic.pic = it.pic;
  if (it.alt) pic.alt = it.alt;
  if (it.big) pic.big = it.big;
  return { pic, p: options.indexOf(it.a) };
}

/** Texte d'une réponse : elle-même, ou la description du dessin. */
export const optionText = (q: Pick<PicQ, 'pics'>, o: string): string => (q.pics ? picLabel(o) : o);

/** Question et réponse d'une clé de grandeurs (« 3h5 ») ou d'espace (« 2s4 »), pour l'espace parent. */
export function picFactLabel(op: 'grd' | 'esp', a: number, b: number): { q: string; a: string } {
  const it = (op === 'grd' ? GRD_SETS : ESP_SETS)[a - 1]?.items[b - 1];
  return it ? { q: it.q, a: it.pics ? picLabel(it.a) : it.a } : { q: '?', a: '' };
}
