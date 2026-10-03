import { describe, expect, it } from 'vitest';
import type { DayKey } from './dates';
import { mulKey } from './keys';
import { arrange, buildBossPlan, buildStepPlan, buildTrapsPlan, recentErrors, stepMultipliers, trapMultipliers } from './plan';
import { seeded } from './random';
import { TODAY } from './test-helpers';

const base = { table: 7, trapLog: {}, mastered: [] as string[], today: TODAY };
const counts = (ms: number[]) => ms.reduce<Record<number, number>>((c, m) => ({ ...c, [m]: (c[m] ?? 0) + 1 }), {});

describe('Session de base (sans piège)', () => {
  it('étapes 1-2 : chaque multiplication de la plage 2 fois', () => {
    for (const [stepIdx, range] of [[0, [1, 2, 3, 4, 5]], [1, [6, 7, 8, 9, 10]]] as const) {
      const { ms } = stepMultipliers({ ...base, stepIdx, traps: [], rng: seeded(stepIdx) });
      expect(counts(ms)).toEqual(Object.fromEntries(range.map((m) => [m, 2])));
    }
  });
  it('étape 3 et gardien : toute la table, une fois chacune', () => {
    const { ms } = stepMultipliers({ ...base, stepIdx: 2, traps: [], rng: seeded(3) });
    expect([...ms].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(buildBossPlan(7, seeded(1)).map((q) => q.b).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('jamais deux fois la même question de suite', () => {
    for (let seed = 0; seed < 50; seed++) {
      const { ms } = stepMultipliers({ ...base, stepIdx: 0, traps: [], rng: seeded(seed) });
      for (let i = 1; i < ms.length; i++) expect(ms[i]).not.toBe(ms[i - 1]);
    }
  });
});

describe('Répétition intelligente', () => {
  it('ne retient que les pièges de la table, dans la plage de l\'étape (symétriques compris)', () => {
    const traps = ['7x3', '8x7', '6x9', '7x7'];
    expect(trapMultipliers(traps, 7, [1, 2, 3, 4, 5]).sort()).toEqual([3]);
    expect(trapMultipliers(traps, 7, [6, 7, 8, 9, 10]).sort()).toEqual([7, 8]);
    expect(trapMultipliers(traps, 7, null).sort()).toEqual([3, 7, 8]);
  });
  it('étapes 1-2 : un piège garde ses 2 apparitions et en gagne 1 (3 sur 10)', () => {
    const { ms, extras } = stepMultipliers({ ...base, stepIdx: 0, traps: ['7x3'], rng: seeded(1) });
    expect(extras).toEqual([3]);
    expect(counts(ms)[3]).toBe(3);
    expect(ms).toHaveLength(10);
    // toute multiplication de la plage reste présente au moins une fois
    for (const m of [1, 2, 4, 5]) expect(counts(ms)[m]).toBeGreaterThanOrEqual(1);
  });
  it('au plus 3 apparitions en plus', () => {
    const { extras, ms } = stepMultipliers({ ...base, stepIdx: 2, traps: ['7x1', '7x2', '7x3', '7x4', '7x5'], mastered: ['7x6', '7x8', '7x9', '7x10'], rng: seeded(5) });
    expect(extras).toHaveLength(3);
    expect(ms).toHaveLength(10);
  });
  it('étape 3 : les répétitions remplacent des multiplications déjà maîtrisées', () => {
    const { ms, extras } = stepMultipliers({ ...base, stepIdx: 2, traps: ['7x8', '6x7'], mastered: ['7x1', '2x7'], rng: seeded(2) });
    expect(extras.sort()).toEqual([6, 8]);
    const c = counts(ms);
    expect(c[6]).toBe(2);
    expect(c[8]).toBe(2);
    expect((c[1] ?? 0) + (c[2] ?? 0)).toBe(0); // les 2 maîtrisées ont cédé leur place
    for (const m of [3, 4, 5, 7, 9, 10]) expect(c[m]).toBe(1); // les non maîtrisées restent
  });
  it('étape 3 : sans multiplication maîtrisée, pas de répétition en plus', () => {
    expect(stepMultipliers({ ...base, stepIdx: 2, traps: ['7x8'], rng: seeded(2) }).extras).toEqual([]);
  });
  it('tirage pondéré par les erreurs des 14 derniers jours', () => {
    const log: Record<string, DayKey[]> = { '7x8': Array<DayKey>(9).fill(TODAY), '7x9': [] };
    let eight = 0;
    for (let seed = 0; seed < 400; seed++) {
      const { extras } = stepMultipliers({ ...base, stepIdx: 1, traps: ['7x8', '7x9', '7x6', '7x10'], trapLog: log, rng: seeded(seed) });
      expect(extras).toHaveLength(1); // une seule multiplication non piège (7) a un doublon à céder
      if (extras[0] === 8) eight++;
    }
    // poids 10 contre 1 + 1 + 1 : environ 77 % des tirages
    expect(eight / 400).toBeGreaterThan(0.65);
    expect(eight / 400).toBeLessThan(0.88);
  });
  it('erreurs récentes : fenêtre de 14 jours', () => {
    const log = { '7x8': ['2026-09-18', '2026-09-19', '2026-10-02'] as DayKey[] };
    expect(recentErrors(log, '8x7', TODAY)).toBe(2);
    expect(recentErrors({ '9-2': [TODAY] }, '2-9', TODAY)).toBe(0);
    expect(recentErrors({ '3+4': [TODAY] }, '4+3', TODAY)).toBe(1);
  });
  it('jamais de piège en question 1, ni deux pièges à la suite quand c\'est possible', () => {
    for (let seed = 0; seed < 100; seed++) {
      const plan = buildStepPlan({ ...base, stepIdx: 2, traps: ['7x8', '7x9'], mastered: ['7x1', '7x2', '7x3'], rng: seeded(seed) });
      expect(plan[0]!.trap).toBeFalsy();
      for (let i = 1; i < plan.length; i++) {
        expect(plan[i]!.b).not.toBe(plan[i - 1]!.b);
        expect(plan[i]!.trap && plan[i - 1]!.trap).toBeFalsy();
      }
    }
  });
  it('arrange respecte les contraintes', () => {
    const out = arrange([1, 1, 2, 2, 3, 3, 4, 4, 5, 5], (m) => m === 5, seeded(9));
    expect(out[0]).not.toBe(5);
    for (let i = 1; i < out.length; i++) expect(out[i]).not.toBe(out[i - 1]);
  });
});

describe('Session « Pièges »', () => {
  it('10 questions qui reprennent les pièges en boucle', () => {
    const plan = buildTrapsPlan(['7x8', '6x9', '4x7'], seeded(4));
    expect(plan).toHaveLength(10);
    const c = counts(plan.map((q) => q.p));
    expect(c[56]! + c[54]! + c[28]!).toBe(10);
    expect(Math.min(c[56]!, c[54]!, c[28]!)).toBe(3);
    expect(plan.map((q) => mulKey(q.a, q.b))).toContain('7x8');
  });
  it('pas deux fois la même multiplication de suite', () => {
    for (let seed = 0; seed < 50; seed++) {
      const plan = buildTrapsPlan(['7x8', '6x9'], seeded(seed));
      for (let i = 1; i < plan.length; i++) expect(plan[i]!.p).not.toBe(plan[i - 1]!.p);
    }
  });
});
