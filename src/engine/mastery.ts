/* Maîtrise (grille de Pythagore) et pièges, pour toutes les opérations. */
import { SERIES, seriesOf, type Op, type SeriesId } from '../content/series';
import type { DayKey } from './dates';
import { canonKey, factKey, hasKey, sameFact, type FactKey } from './keys';
import { factsOf } from './series';

export const isMastered = (mastered: readonly string[], r: number, c: number): boolean => hasKey(mastered, `${r}x${c}`);
export const isTrap = (traps: readonly string[], r: number, c: number): boolean => hasKey(traps, `${r}x${c}`);

/** Calculs réussis du premier coup et pas encore maîtrisés (ni eux ni leur symétrique pour × et +). */
export function freshMastered(mastered: readonly string[], firstOK: readonly FactKey[]): FactKey[] {
  const out: FactKey[] = [];
  for (const k of new Set(firstOK)) if (!hasKey(mastered, k) && !hasKey(out, k)) out.push(k);
  return out;
}

export interface TrapUpdate {
  traps: FactKey[];
  trapLog: Record<string, DayKey[]>;
  /** Pièges sortis pendant cette session. */
  cleared: FactKey[];
}

/** Toute erreur ajoute le calcul aux pièges (sans doublon de symétrique) ;
    un piège réussi du premier coup, sans erreur dans la session, en sort et son compteur repart à zéro. */
export function updateTraps(traps: readonly FactKey[], trapLog: Readonly<Record<string, readonly DayKey[]>>, firstOK: readonly FactKey[], missed: readonly FactKey[], today: DayKey): TrapUpdate {
  const log: Record<string, DayKey[]> = Object.fromEntries(Object.entries(trapLog).map(([k, v]) => [k, [...v]]));
  const cleared = traps.filter((t) => firstOK.some((k) => sameFact(k, t)) && !missed.some((k) => sameFact(k, t)));
  const next = traps.filter((t) => !cleared.includes(t));
  for (const t of cleared) delete log[canonKey(t)];
  for (const k of missed) {
    if (!hasKey(next, k)) next.push(k);
    (log[canonKey(k)] ??= []).push(today);
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

/** Part des calculs d'une série maîtrisés, en % arrondi (espace parent). 3+4 maîtrisé compte aussi pour 4+3. */
export function seriesPct(mastered: readonly string[], id: SeriesId): number {
  const done = new Set(mastered.map(canonKey)), op = SERIES[id].op, facts = factsOf(id);
  const n = facts.filter((f) => done.has(canonKey(factKey(op, f.a, f.b)))).length;
  return Math.round((n * 100) / facts.length);
}

/** Séries entièrement maîtrisées d'une opération. */
export const seriesDone = (mastered: readonly string[], op: Op): number => seriesOf(op).filter((s) => seriesPct(mastered, s.id) === 100).length;
