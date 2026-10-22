/* Questions « trois réponses écrites » des grands nombres et des mesures (CM1) :
   un énoncé (avec, pour l'heure, une horloge), trois réponses écrites, comme les fractions. */
import { BIG_SETS, bigSetOf, type BigId } from '../content/bignums';
import { MES_SETS, mesSetOf, type MesId } from '../content/measures';
import type { SeriesDef } from '../content/series';
import type { Clock, WrittenItem } from '../content/written';
import { defaultRng, shuffle, type Rng } from './random';

export type WrittenOp = 'big' | 'mes';

export interface WrittenQ {
  /** Île : grands nombres (lire, chiffre, calc, reste) ou mesures (long, masse, heure, pb). */
  set: BigId | MesId;
  /** Énoncé. */
  text: string;
  /** Les trois réponses, mélangées. */
  options: readonly string[];
  clock?: Clock;
  tip: string;
}

export const isWrittenOp = (op: string): op is WrittenOp => op === 'big' || op === 'mes';

/** Questions de l'île `n` (1 à 4) de l'opération. */
const setsOf = (op: WrittenOp): readonly { items: readonly WrittenItem[] }[] => (op === 'big' ? BIG_SETS : MES_SETS);

/** Île d'une série de grands nombres ou de mesures. */
export function writtenSetOfSeries(s: SeriesDef): BigId | MesId {
  if (s.spec.kind !== 'big' && s.spec.kind !== 'mes') throw new RangeError(`${s.id} n'est ni une série de grands nombres ni de mesures`);
  return s.spec.set;
}

/** Questions d'une île, d'après sa série. */
export function writtenItems(s: SeriesDef): readonly WrittenItem[] {
  if (s.spec.kind === 'big') return bigSetOf(s.spec.set).items;
  if (s.spec.kind === 'mes') return mesSetOf(s.spec.set).items;
  throw new RangeError(`${s.id} n'est ni une série de grands nombres ni de mesures`);
}

/** Question n° `b` de l'île ; `p` = indice de la bonne réponse. */
export function writtenDraft(s: SeriesDef, b: number, rng: Rng = defaultRng): { w: WrittenQ; p: number } {
  const it = writtenItems(s)[b - 1];
  if (!it) throw new RangeError(`${s.id} : pas de question n° ${b}`);
  const options = shuffle([it.a, ...it.x], rng);
  return { w: { set: writtenSetOfSeries(s), text: it.q, options, tip: it.tip, ...(it.clock ? { clock: it.clock } : {}) }, p: options.indexOf(it.a) };
}

/** Question et réponse d'une clé (île a, rang b), pour l'espace parent. */
export function writtenFactLabel(op: WrittenOp, a: number, b: number): { q: string; a: string } {
  const it = setsOf(op)[a - 1]?.items[b - 1];
  return it ? { q: it.q, a: it.a } : { q: '?', a: '' };
}
