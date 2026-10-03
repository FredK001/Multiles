/* Indicateurs de l'espace parent. */
import type { Op } from '../content/series';
import type { OpProgress, Profile } from '../store/schema';
import { weekOf, type DayKey } from './dates';
import { parseFact } from './keys';
import { recentErrors } from './plan';
import { resultOf } from './series';

/** Minutes de jeu par jour, du lundi au dimanche de la semaine en cours (toutes opérations, ou une seule). */
export function weekMinutes(days: Profile['days'], today: DayKey, op?: Op): number[] {
  return weekOf(today).map((d) => Math.round(((op ? days[d]?.ops[op]?.ms : days[d]?.ms) ?? 0) / 60_000));
}

export const totalSessions = (days: Profile['days'], op?: Op): number =>
  Object.values(days).reduce((s, d) => s + ((op ? d.ops[op]?.sessions : d.sessions) ?? 0), 0);

/** Calculs difficiles : les pièges, triés par erreurs récentes (au moins 1 affichée). */
export function hardList(o: Pick<OpProgress, 'traps' | 'trapLog'>, today: DayKey): { key: string; op: Op; a: number; b: number; r: number; errors: number }[] {
  return o.traps
    .flatMap((key) => {
      const f = parseFact(key);
      return f ? [{ key, ...f, r: resultOf(f.op, f.a, f.b), errors: Math.max(1, recentErrors(o.trapLog, key, today)) }] : [];
    })
    .sort((x, y) => y.errors - x.errors);
}
