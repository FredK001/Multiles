/* Défi du jour : 60 s, 8 bonnes réponses, une table tirée de la date parmi les îles ouvertes. */
import type { IsleId } from '../content/isles';
import type { DayKey } from './dates';

export const DEFI_BONUS = 20;
/** Tables trop faciles pour un bonus plein : le défi n'y rapporte que 5 pièces. */
export const EASY_TABLES: readonly number[] = [1, 10];
export const DEFI_BONUS_EASY = 5;

/** Bonus du défi du jour réussi selon la table. */
export const defiBonus = (table: number): number => (EASY_TABLES.includes(table) ? DEFI_BONUS_EASY : DEFI_BONUS);

/** Hachage FNV-1a 32 bits. */
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Table du défi : même résultat toute la journée pour un même ensemble d'îles ouvertes. */
export function dailyTable(today: DayKey, open: readonly IsleId[]): IsleId {
  const sorted = [...open].sort((a, b) => a - b);
  return sorted[fnv1a(`multiles:${today}`) % sorted.length]!;
}

export const defiDone = (defiDay: DayKey | null, today: DayKey): boolean => defiDay === today;
