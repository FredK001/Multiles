/* Maîtrise (grille de Pythagore) et pièges. */
import type { DayKey } from './dates';
import { hasKey, normKey, parseKey, sameKey, type MulKey } from './keys';

export const isMastered = (mastered: readonly string[], r: number, c: number): boolean => hasKey(mastered, `${r}x${c}`);
export const isTrap = (traps: readonly string[], r: number, c: number): boolean => hasKey(traps, `${r}x${c}`);

/** Multiplications réussies du premier coup et pas encore maîtrisées (ni elles ni leur symétrique). */
export function freshMastered(mastered: readonly string[], firstOK: readonly MulKey[]): MulKey[] {
  const out: MulKey[] = [];
  for (const k of new Set(firstOK)) if (!hasKey(mastered, k) && !hasKey(out, k)) out.push(k);
  return out;
}

export interface TrapUpdate {
  traps: MulKey[];
  trapLog: Record<string, DayKey[]>;
  /** Pièges sortis pendant cette session. */
  cleared: MulKey[];
}

/** Toute erreur ajoute la multiplication aux pièges (sans doublon de symétrique) ;
    un piège réussi du premier coup, sans erreur dans la session, en sort et son compteur repart à zéro. */
export function updateTraps(traps: readonly MulKey[], trapLog: Readonly<Record<string, readonly DayKey[]>>, firstOK: readonly MulKey[], missed: readonly MulKey[], today: DayKey): TrapUpdate {
  const log: Record<string, DayKey[]> = Object.fromEntries(Object.entries(trapLog).map(([k, v]) => [k, [...v]]));
  const cleared = traps.filter((t) => firstOK.some((k) => sameKey(k, t)) && !missed.some((k) => sameKey(k, t)));
  const next = traps.filter((t) => !cleared.includes(t));
  for (const t of cleared) delete log[normKey(...parseKey(t))];
  for (const k of missed) {
    if (!hasKey(next, k)) next.push(k);
    const nk = normKey(...parseKey(k));
    (log[nk] ??= []).push(today);
  }
  return { traps: next, trapLog: log, cleared };
}

/** Part de la table r maîtrisée, en % (espace parent). */
export function rowPct(mastered: readonly string[], r: number): number {
  let n = 0;
  for (let c = 1; c <= 10; c++) if (isMastered(mastered, r, c)) n++;
  return n * 10;
}

export const tablesDone = (mastered: readonly string[]): number =>
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((r) => rowPct(mastered, r) === 100).length;

/** Cases colorées de la grille : maîtrisées et pas en piège (compte « N cases sur 100 »). */
export function gridCount(mastered: readonly string[], traps: readonly string[]): number {
  let n = 0;
  for (let r = 1; r <= 10; r++) for (let c = 1; c <= 10; c++) if (isMastered(mastered, r, c) && !isTrap(traps, r, c)) n++;
  return n;
}
