/* Défi du jour : une série tirée de la date parmi les îles ouvertes de l'opération. */
import { SERIES_IDS, type SeriesId } from '../content/series';
import type { DayKey } from './dates';

export const DEFI_BONUS = 20;
/** Tables trop faciles pour un bonus plein : le défi n'y rapporte que 5 pièces. */
export const EASY_SERIES: readonly SeriesId[] = ['mul-1', 'mul-10'];
export const DEFI_BONUS_EASY = 5;

/** Bonus du défi du jour réussi selon la série. */
export const defiBonus = (s: SeriesId): number => (EASY_SERIES.includes(s) ? DEFI_BONUS_EASY : DEFI_BONUS);

/** Hachage FNV-1a 32 bits. */
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Série du défi : même résultat toute la journée pour un même ensemble d'îles ouvertes
    (rangées dans l'ordre du catalogue : pour le CM1, la table 1 d'abord). */
export function dailySeries(today: DayKey, open: readonly SeriesId[]): SeriesId {
  const sorted = [...open].sort((a, b) => SERIES_IDS.indexOf(a) - SERIES_IDS.indexOf(b));
  return sorted[fnv1a(`multiles:${today}`) % sorted.length]!;
}

export const defiDone = (defiDay: DayKey | null, today: DayKey): boolean => defiDay === today;
