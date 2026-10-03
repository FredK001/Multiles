import { describe, expect, it } from 'vitest';
import type { Streak } from '../store/schema';
import { addDays, dayKey, dayNumber, weekday, weekOf, type DayKey } from './dates';
import { dailySeries, defiBonus, defiDone } from './daily';
import { opProg } from './progress';
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
    const open = ['mul-1', 'mul-2', 'mul-5', 'mul-10'] as const;
    const t = dailySeries(TODAY, [...open]);
    expect(open).toContain(t);
    expect(dailySeries(TODAY, ['mul-10', 'mul-5', 'mul-2', 'mul-1'])).toBe(t);
    const seen = new Set(Array.from({ length: 60 }, (_, i) => dailySeries(D(i), [...open])));
    expect(seen.size).toBe(4); // toutes les tables ouvertes finissent par sortir
  });
  it('même tirage qu\'avant la généralisation (tables rangées 1, 2, 5, 10)', () => {
    // fnv1a("multiles:2026-10-02") % 4, indice dans [1, 2, 5, 10]
    const legacy = (day: DayKey) => {
      let h = 0x811c9dc5;
      for (const c of `multiles:${day}`) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0;
      return [1, 2, 5, 10][h % 4];
    };
    for (let i = 0; i < 30; i++) expect(dailySeries(D(i), ['mul-10', 'mul-1', 'mul-5', 'mul-2'])).toBe(`mul-${legacy(D(i))}`);
  });
  it('bonus : 5 pièces pour les tables 1 et 10, 20 sinon (séries CP comprises)', () => {
    expect([defiBonus('mul-1'), defiBonus('mul-10'), defiBonus('mul-7'), defiBonus('add-10'), defiBonus('sub-20')]).toEqual([5, 5, 20, 20, 20]);
  });
  it('mémorisée pour la journée même si une île s\'ouvre', () => {
    const p = withDefiPick(newKid(), TODAY);
    const t = opProg(p, 'mul').defiPick!.series;
    const won = { steps: 3, trophy: true, stepStars: [3, 3, 3] as [number, number, number] };
    const later = withDefiPick({ ...p, prog: { mul: { ...opProg(p, 'mul'), series: { 'mul-1': won, 'mul-2': won } } } }, TODAY);
    expect(opProg(later, 'mul').defiPick!.series).toBe(t);
    expect(withDefiPick(later, TODAY)).toBe(later); // rien à changer : même objet
    expect(opProg(withDefiPick(p, D(1)), 'mul').defiPick!.day).toBe(D(1));
  });
  it('au CP, un défi par opération', () => {
    const p = withDefiPick({ ...newKid(), grade: 'CP', op: 'add' }, TODAY);
    expect(opProg(p, 'add').defiPick).toEqual({ day: TODAY, series: 'add-10' });
    expect(opProg(p, 'sub').defiPick).toEqual({ day: TODAY, series: 'sub-10' });
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
