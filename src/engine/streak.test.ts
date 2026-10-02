import { describe, expect, it } from 'vitest';
import type { Streak } from '../store/schema';
import { addDays, dayKey, dayNumber, weekday, weekOf, type DayKey } from './dates';
import { dailyTable, defiDone } from './daily';
import { BUOY_EVERY, checkStreak, MAX_BUOYS, recordPlayedDay, weekView } from './streak';
import { newKid, TODAY } from './test-helpers';
import { withDefiPick } from './profile';

const S = (over: Partial<Streak> = {}): Streak => ({ current: 0, best: 0, buoys: 1, lastDay: null, buoyDays: [], checkedDay: null, ...over });
const D = (n: number) => addDays(TODAY, n);

/** Joue les jours donnés (décalages par rapport à TODAY), en vérifiant la série chaque jour joué. */
function playDays(offsets: number[], start = S()): Streak {
  let s = start;
  for (const o of offsets) {
    s = checkStreak(s, D(o)).streak;
    s = recordPlayedDay(s, D(o)).streak;
  }
  return s;
}

describe('Dates locales', () => {
  it('jour calendaire local, lundi = 0', () => {
    expect(dayKey(new Date(2026, 9, 2, 23, 59))).toBe('2026-10-02');
    expect(dayKey(new Date(2026, 9, 3, 0, 0))).toBe('2026-10-03');
    expect(weekday('2026-10-02')).toBe(4); // vendredi
    expect(weekOf('2026-10-02')[0]).toBe('2026-09-28');
    expect(dayNumber('2026-03-30') - dayNumber('2026-03-29')).toBe(1); // passage à l'heure d'été
  });
});

describe('Série de jours', () => {
  it('jours consécutifs', () => {
    expect(playDays([-2, -1, 0]).current).toBe(3);
  });
  it('rejouer le même jour ne compte qu\'une fois', () => {
    expect(playDays([0, 0, 0]).current).toBe(1);
  });
  it('une bouée sauve la série en cas de jour manqué', () => {
    const s = playDays([-3, -2]); // série de 2, 1 bouée
    const { streak, event } = checkStreak(s, D(0)); // hier manqué
    expect(event).toEqual({ kind: 'buoy', streak: 2, buoysLeft: 0, missed: 1 });
    expect(streak.buoyDays).toEqual([D(-1)]);
    expect(recordPlayedDay(streak, D(0)).streak.current).toBe(3);
  });
  it('la bouée n\'est consommée qu\'une fois par jour', () => {
    const s = playDays([-3, -2]);
    const once = checkStreak(s, D(0)).streak;
    expect(checkStreak(once, D(0)).event).toBeNull();
    expect(checkStreak(once, D(0)).streak.buoys).toBe(0);
  });
  it('sans bouée, la série repart à 0 mais le record est conservé', () => {
    const s = playDays([-5, -4, -3, -2], S({ buoys: 0 }));
    const { streak, event } = checkStreak(s, D(0));
    expect(event).toEqual({ kind: 'reset', best: 4 });
    expect(streak.current).toBe(0);
    expect(streak.best).toBe(4);
    expect(recordPlayedDay(streak, D(0)).streak).toMatchObject({ current: 1, best: 4 });
  });
  it('plus de jours manqués que de bouées : la série repart à 0 et les bouées restent', () => {
    const s = playDays([-6, -5], S({ buoys: 2 }));
    const { streak, event } = checkStreak(s, D(0)); // 4 jours manqués
    expect(event?.kind).toBe('reset');
    expect(streak.buoys).toBe(2);
  });
  it('une bouée tous les 7 jours de suite, 2 au maximum', () => {
    expect(BUOY_EVERY).toBe(7);
    expect(MAX_BUOYS).toBe(2);
    const days = Array.from({ length: 21 }, (_, i) => i - 20);
    let s = S({ buoys: 0 });
    const earned: number[] = [];
    for (const o of days) {
      s = checkStreak(s, D(o)).streak;
      const r = recordPlayedDay(s, D(o));
      s = r.streak;
      if (r.buoyEarned) earned.push(s.current);
    }
    expect(earned).toEqual([7, 14]);
    expect(s.buoys).toBe(2);
    expect(s.current).toBe(21);
  });
  it('semaine affichée : jours joués, bouée, aujourd\'hui', () => {
    const days = { [D(-4)]: { sessions: 1 }, [D(-3)]: { sessions: 2 } };
    const w = weekView(days, S({ buoyDays: [D(-1)] }), TODAY);
    expect(w).toHaveLength(7);
    expect(w.map((d) => (d.played ? 'J' : d.buoy ? 'B' : d.today ? 'T' : '.')).join('')).toBe('JJ.BT..');
  });
});

describe('Défi du jour', () => {
  it('table tirée de la date, parmi les îles ouvertes, stable dans la journée', () => {
    const open = [1, 2, 5, 10] as const;
    const t = dailyTable(TODAY, [...open]);
    expect(open).toContain(t);
    expect(dailyTable(TODAY, [10, 5, 2, 1])).toBe(t);
    const seen = new Set(Array.from({ length: 60 }, (_, i) => dailyTable(D(i), [...open])));
    expect(seen.size).toBe(4); // toutes les tables ouvertes finissent par sortir
  });
  it('mémorisée pour la journée même si une île s\'ouvre', () => {
    const p = withDefiPick(newKid(), TODAY);
    const t = p.defiPick!.table;
    const later = withDefiPick({ ...p, isl: { 1: { steps: 3, trophy: true, stepStars: [3, 3, 3] }, 2: { steps: 3, trophy: true, stepStars: [3, 3, 3] } } }, TODAY);
    expect(later.defiPick!.table).toBe(t);
    expect(withDefiPick(p, D(1)).defiPick!.day).toBe(D(1));
  });
  it('réinitialisé à minuit local', () => {
    expect(defiDone(TODAY, TODAY)).toBe(true);
    expect(defiDone(TODAY, D(1))).toBe(false);
    expect(defiDone(null, TODAY)).toBe(false);
  });
});

describe('Dates : utilitaires', () => {
  it('addDays et weekOf', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(weekOf('2026-10-04' as DayKey)).toEqual(['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
  });
});
