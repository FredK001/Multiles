/* Série de jours et bouées, calculées à partir des jours réellement joués. */
import type { Streak, StreakEvent } from '../store/schema';
import { addDays, daysBetween, weekOf, type DayKey } from './dates';

export const MAX_BUOYS = 2;
/** Une bouée gagnée tous les 7 jours de suite. */
export const BUOY_EVERY = 7;

/** À l'ouverture du profil : les jours manqués consomment une bouée chacun ;
    s'il n'y en a pas assez, la série repart à 0 (le record et les bouées restent). */
export function checkStreak(s: Streak, today: DayKey): { streak: Streak; event: StreakEvent | null } {
  if (s.checkedDay === today) return { streak: s, event: null };
  const next: Streak = { ...s, buoyDays: [...s.buoyDays], checkedDay: today };
  if (!s.lastDay || s.current === 0) return { streak: next, event: null };
  // Horloge reculée (lastDay dans le futur) : on ne touche à rien.
  const missed = daysBetween(s.lastDay, today) - 1;
  if (!(missed > 0)) return { streak: next, event: null };
  if (missed <= s.buoys) {
    next.buoys -= missed;
    for (let i = 1; i <= missed; i++) next.buoyDays.push(addDays(s.lastDay, i));
    next.lastDay = addDays(today, -1);
    return { streak: next, event: { kind: 'buoy', streak: next.current, buoysLeft: next.buoys, missed } };
  }
  next.best = Math.max(next.best, next.current);
  next.current = 0;
  return { streak: next, event: { kind: 'reset', best: next.best } };
}

/** Une session terminée aujourd'hui compte le jour comme joué. */
export function recordPlayedDay(s: Streak, today: DayKey): { streak: Streak; buoyEarned: boolean } {
  if (s.lastDay === today || (s.lastDay && daysBetween(s.lastDay, today) < 0)) return { streak: s, buoyEarned: false };
  const next: Streak = { ...s, buoyDays: [...s.buoyDays] };
  next.current = s.lastDay && s.current > 0 && daysBetween(s.lastDay, today) === 1 ? s.current + 1 : 1;
  next.lastDay = today;
  next.best = Math.max(next.best, next.current);
  let buoyEarned = false;
  if (next.current % BUOY_EVERY === 0 && next.buoys < MAX_BUOYS) {
    next.buoys++;
    buoyEarned = true;
  }
  return { streak: next, buoyEarned };
}

export interface WeekDay {
  day: DayKey;
  played: boolean;
  buoy: boolean;
  today: boolean;
}

/** Semaine affichée sur l'accueil (lundi → dimanche). */
export function weekView(days: Record<string, { sessions: number }>, s: Streak, today: DayKey): WeekDay[] {
  return weekOf(today).map((day) => ({
    day,
    played: (days[day]?.sessions ?? 0) > 0,
    buoy: s.buoyDays.includes(day),
    today: day === today,
  }));
}
