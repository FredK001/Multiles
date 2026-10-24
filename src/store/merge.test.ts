import { describe, expect, it } from 'vitest';
import { createProfile, defaultAvatar } from '../engine/profile';
import { opProg } from '../engine/progress';
import { mergeData, mergeProfile, restoreText } from './merge';
import { emptyData, MAX_PROFILES, type Profile } from './schema';

const kid = (name: string, color = '#0D7A5F'): Profile => createProfile({ name, color, av: defaultAvatar(), pepin: 'braise' }, 1000);
const day = (ms: number) => ({ ms, sessions: 1, ops: { mul: { ms, sessions: 1 } } });
const withData = (...profiles: Profile[]) => ({ ...emptyData(), profiles });

/** Même enfant, joué sur deux appareils depuis le dernier transfert. */
function twoDevices() {
  const base = kid('Nina');
  const mul = opProg(base, 'mul');
  const a: Profile = {
    ...base, coins: 80, level: 3, xp: 10, owned: ['chapeau'], days: { '2026-10-20': day(600) },
    streak: { ...base.streak, current: 2, best: 5, lastDay: '2026-10-20' },
    prog: { mul: { ...mul, series: { 'mul-1': { steps: 3, trophy: true, stepStars: [3, 2, 1] } }, mastered: ['2x3'], stickers: ['mul-1-lieu'], records: { 'mul-1': 12 } } },
  };
  const b: Profile = {
    ...base, coins: 30, level: 2, xp: 40, owned: ['lunettes'], av: { ...base.av, hair: 'boucle' }, days: { '2026-10-20': day(300), '2026-10-22': day(900) },
    streak: { ...base.streak, current: 1, best: 2, lastDay: '2026-10-22' },
    prog: { mul: { ...mul, series: { 'mul-1': { steps: 2, trophy: false, stepStars: [1, 3, 0] }, 'mul-2': { steps: 1, trophy: false, stepStars: [2, 0, 0] } }, mastered: ['4x5'], stickers: [], records: { 'mul-1': 15 } } },
  };
  return { a, b };
}

describe('Fusion d\'un même enfant', () => {
  it('garde le meilleur de chaque côté', () => {
    const { a, b } = twoDevices();
    const m = mergeProfile(a, b), mul = m.prog.mul!;
    expect(mul.series['mul-1']).toEqual({ steps: 3, trophy: true, stepStars: [3, 3, 1] });
    expect(mul.series['mul-2']).toEqual({ steps: 1, trophy: false, stepStars: [2, 0, 0] });
    expect(mul.mastered).toEqual(['2x3', '4x5']);
    expect(mul.stickers).toEqual(['mul-1-lieu']);
    expect(mul.records['mul-1']).toBe(15);
    expect(m.owned).toEqual(['chapeau', 'lunettes']);
    expect([m.level, m.xp]).toEqual([3, 10]);
    // Temps de jeu : maximum par jour, jamais additionné.
    expect(m.days['2026-10-20']!.ms).toBe(600);
    expect(m.days['2026-10-22']!.ms).toBe(900);
    expect(m.streak).toMatchObject({ current: 1, best: 5, lastDay: '2026-10-22' });
  });
  it('pièces et apparence : version jouée le plus récemment', () => {
    const { a, b } = twoDevices();
    for (const m of [mergeProfile(a, b), mergeProfile(b, a)]) {
      expect(m.coins).toBe(30);
      expect(m.av.hair).toBe('boucle');
    }
  });
  it('aller-retour sans rien compter deux fois', () => {
    const { a, b } = twoDevices();
    const once = mergeProfile(a, b);
    expect(mergeProfile(once, b)).toEqual(once);
    expect(mergeProfile(once, once)).toEqual(once);
  });
});

describe('Fusion des appareils', () => {
  it('un enfant reçu s\'ajoute sans effacer celui de l\'appareil', () => {
    const leo = kid('Léo'), nina = kid('Nina');
    const { data, report } = mergeData(withData(leo), withData(nina));
    expect(data.profiles.map((p) => p.name)).toEqual(['Léo', 'Nina']);
    // Même couleur que Léo : une autre lui est donnée.
    expect(data.profiles[1]!.color).not.toBe(leo.color);
    expect(report).toEqual([{ name: 'Nina', kind: 'added' }]);
    expect(restoreText(report)).toBe('Récupérer cette progression ? Nina : nouveau profil. Les autres profils de cet appareil ne changent pas.');
  });
  it('réglages de l\'appareil conservés, enfant identique signalé', () => {
    const nina = kid('Nina');
    const local = { ...withData(nina), settings: { sound: false, bossTime: 0 as const }, lastBackup: '2026-10-01' as const };
    const { data, report } = mergeData(local, withData({ ...nina }));
    expect(data.settings.sound).toBe(false);
    expect(data.lastBackup).toBe('2026-10-01');
    expect(report).toEqual([{ name: 'Nina', kind: 'same' }]);
    expect(restoreText(report)).toBe('Rien à récupérer. Nina : déjà à jour.');
  });
  it(`${MAX_PROFILES} profils au maximum`, () => {
    const full = withData(...['A', 'B', 'C', 'D'].map((n) => kid(n)));
    const { data, report } = mergeData(full, withData(kid('Zoé')));
    expect(data.profiles).toHaveLength(MAX_PROFILES);
    expect(report).toEqual([{ name: 'Zoé', kind: 'full' }]);
  });
});
