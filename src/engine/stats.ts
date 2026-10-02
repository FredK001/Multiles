/* Indicateurs de l'espace parent. */
import type { Profile } from '../store/schema';
import { weekOf, type DayKey } from './dates';
import { parseKey } from './keys';
import { recentErrors } from './plan';

/** Minutes de jeu par jour, du lundi au dimanche de la semaine en cours. */
export function weekMinutes(days: Profile['days'], today: DayKey): number[] {
  return weekOf(today).map((d) => Math.round((days[d]?.ms ?? 0) / 60_000));
}

export const totalSessions = (days: Profile['days']): number => Object.values(days).reduce((s, d) => s + d.sessions, 0);

/** Multiplications difficiles : les pièges, triés par erreurs récentes (au moins 1 affichée). */
export function hardList(p: Pick<Profile, 'traps' | 'trapLog'>, today: DayKey): { key: string; a: number; b: number; errors: number }[] {
  return p.traps
    .map((key) => {
      const [a, b] = parseKey(key);
      return { key, a, b, errors: Math.max(1, recentErrors(p.trapLog, a, b, today)) };
    })
    .sort((x, y) => y.errors - x.errors);
}
