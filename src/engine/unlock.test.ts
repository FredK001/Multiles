import { describe, expect, it } from 'vitest';
import { BOSS } from '../content/isles';
import type { IsleProgress } from '../store/schema';
import { bossOpen, chronoOpen, currentStep, defaultSelection, isOpen, missingTrophies, openSeries, RANGES, stepOpen, tableId, tableNum, totalStars, trophies, type SeriesMap } from './unlock';

const won = (): IsleProgress => ({ steps: 3, trophy: true, stepStars: [3, 3, 3] });
const withTrophies = (n: number): SeriesMap => Object.fromEntries([1, 2, 5, 10, 3, 4, 6, 7].slice(0, n).map((i) => [tableId(i), won()]));

describe('Îles', () => {
  it('les îles 1, 2, 5 et 10 sont ouvertes au départ', () => {
    expect(openSeries({}, 'mul')).toEqual(['mul-1', 'mul-2', 'mul-5', 'mul-10']);
  });
  it.each([
    [3, 2], [4, 2], [6, 4], [7, 4], [8, 6], [9, 6],
  ] as const)('l\'île %i s\'ouvre à %i trophées', (n, req) => {
    expect(isOpen(withTrophies(req - 1), tableId(n))).toBe(false);
    expect(missingTrophies(withTrophies(req - 1), tableId(n))).toBe(1);
    expect(isOpen(withTrophies(req), tableId(n))).toBe(true);
    expect(missingTrophies(withTrophies(req), tableId(n))).toBe(0);
  });
  it('compte les trophées et les étoiles', () => {
    expect(trophies(withTrophies(4), 'mul')).toBe(4);
    expect(totalStars(withTrophies(4))).toBe(36);
  });
  it('table ↔ série', () => {
    expect(tableId(7)).toBe('mul-7');
    expect(tableNum('mul-10')).toBe(10);
  });
  it('nomme les 10 gardiens', () => {
    expect(Object.values(BOSS)).toEqual(['Coquillo', 'Lianor', 'Pommax', 'Sablor', 'Glaçor', 'Sucrette', 'Magmo', 'Ventor', 'Nimbo', 'Astro']);
  });
});

describe('Îles du CP', () => {
  it('les séries jusqu\'à 10 sont ouvertes au départ', () => {
    expect(openSeries({}, 'add')).toEqual(['add-10']);
    expect(openSeries({}, 'sub')).toEqual(['sub-10']);
  });
  it('la série jusqu\'à 20 s\'ouvre avec le trophée de la série jusqu\'à 10, opération par opération', () => {
    const m: SeriesMap = { 'add-10': won() };
    expect(openSeries(m, 'add')).toEqual(['add-10', 'add-20']);
    expect(openSeries(m, 'sub')).toEqual(['sub-10']);
    expect(missingTrophies({}, 'sub-20')).toBe(1);
  });
  it('les trophées du CM1 ne comptent pas pour le CP', () => {
    expect(trophies(withTrophies(8), 'add')).toBe(0);
    expect(isOpen(withTrophies(8), 'add-20')).toBe(false);
  });
});

describe('Étapes', () => {
  it('3 étapes : ×1 à ×5, ×6 à ×10, toute la table', () => {
    expect(RANGES).toEqual([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], null]);
  });
  it("une étape s'ouvre quand la précédente est réussie", () => {
    const p: IsleProgress = { steps: 1, trophy: false, stepStars: [2, 0, 0] };
    expect([0, 1, 2].map((i) => stepOpen(p, i))).toEqual([true, true, false]);
    expect(currentStep(p)).toBe(2);
  });
  it("le gardien s'ouvre après les 3 étapes", () => {
    expect(bossOpen({ steps: 2, trophy: false, stepStars: [1, 1, 0] })).toBe(false);
    expect(bossOpen({ steps: 3, trophy: false, stepStars: [1, 1, 1] })).toBe(true);
  });
  it("le défi chrono s'ouvre après l'étape 1", () => {
    expect(chronoOpen({ steps: 0, trophy: false, stepStars: [0, 0, 0] })).toBe(false);
    expect(chronoOpen({ steps: 1, trophy: false, stepStars: [1, 0, 0] })).toBe(true);
  });
  it("sélection par défaut : étape suivante, puis gardien, puis dernière étape", () => {
    expect(defaultSelection({ steps: 1, trophy: false, stepStars: [3, 0, 0] })).toBe(1);
    expect(defaultSelection({ steps: 3, trophy: false, stepStars: [3, 3, 3] })).toBe(3);
    expect(defaultSelection({ steps: 3, trophy: true, stepStars: [3, 3, 3] })).toBe(2);
  });
});
