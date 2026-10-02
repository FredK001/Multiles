import { describe, expect, it } from 'vitest';
import { BOSS } from '../content/isles';
import type { IsleProgress } from '../store/schema';
import { bossOpen, chronoOpen, currentStep, defaultSelection, isOpen, missingTrophies, OPEN_START, openIsles, RANGES, stepOpen, trophies, type IsleMap } from './unlock';

const won = (): IsleProgress => ({ steps: 3, trophy: true, stepStars: [3, 3, 3] });
const withTrophies = (n: number): IsleMap => Object.fromEntries([1, 2, 5, 10, 3, 4, 6, 7].slice(0, n).map((i) => [i, won()]));

describe('Îles', () => {
  it('les îles 1, 2, 5 et 10 sont ouvertes au départ', () => {
    expect(OPEN_START).toEqual([1, 2, 5, 10]);
    expect(openIsles({})).toEqual([1, 2, 5, 10]);
  });
  it.each([
    [3, 2], [4, 2], [6, 4], [7, 4], [8, 6], [9, 6],
  ] as const)('l\'île %i s\'ouvre à %i trophées', (n, req) => {
    expect(isOpen(withTrophies(req - 1), n)).toBe(false);
    expect(missingTrophies(withTrophies(req - 1), n)).toBe(1);
    expect(isOpen(withTrophies(req), n)).toBe(true);
    expect(missingTrophies(withTrophies(req), n)).toBe(0);
  });
  it('compte les trophées', () => {
    expect(trophies(withTrophies(4))).toBe(4);
  });
  it('nomme les 10 gardiens', () => {
    expect(Object.values(BOSS)).toEqual(['Coquillo', 'Lianor', 'Pommax', 'Sablor', 'Glaçor', 'Sucrette', 'Magmo', 'Ventor', 'Nimbo', 'Astro']);
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
