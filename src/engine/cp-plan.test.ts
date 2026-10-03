import { describe, expect, it } from 'vitest';
import type { SeriesId } from '../content/series';
import { canonKey, factKey, hasKey } from './keys';
import { buildBossPlan, buildRangeStepPlan, buildStepPlan, nextTimedQuestion, seriesBossPlan, seriesStepPlan, SESSION_LENGTH } from './plan';
import { makeQ, type Question } from './questions';
import { seeded } from './random';
import { factsOf, inSeries } from './series';
import { TODAY } from './test-helpers';

const key = (q: Question) => factKey(q.op, q.a, q.b);
const base = { traps: [] as string[], trapLog: {}, mastered: [] as string[], today: TODAY };

describe('Sessions du CP', () => {
  it('étape : 10 questions de l\'étape, sans doublon, jamais deux fois la même de suite', () => {
    for (const series of ['add-10', 'add-20', 'sub-10', 'sub-20'] as SeriesId[])
      for (const stepIdx of [0, 1, 2])
        for (let seed = 0; seed < 20; seed++) {
          const plan = seriesStepPlan({ ...base, series, stepIdx, rng: seeded(seed) });
          expect(plan).toHaveLength(SESSION_LENGTH);
          const pool = factsOf(series, stepIdx);
          expect(plan.every((q) => q.series === series && inSeries(series, q) && pool.some((f) => f.a === q.a && f.b === q.b))).toBe(true);
          expect(new Set(plan.map(key)).size).toBe(Math.min(10, pool.length));
          for (let i = 1; i < plan.length; i++) expect(key(plan[i]!)).not.toBe(key(plan[i - 1]!));
        }
  });

  it('addition : un calcul et son symétrique (3+4, 4+3) ne sortent pas dans la même session', () => {
    for (const stepIdx of [0, 1, 2])
      for (let seed = 0; seed < 30; seed++) {
        const plan = seriesStepPlan({ ...base, series: 'add-10', stepIdx, rng: seeded(seed) });
        expect(new Set(plan.map((q) => canonKey(key(q)))).size).toBe(10);
        const boss = seriesBossPlan('add-20', seeded(seed));
        expect(new Set(boss.map((q) => canonKey(key(q)))).size).toBe(10);
      }
  });

  it('étape : formats en rotation, comme au CM1', () => {
    const plan = seriesStepPlan({ ...base, series: 'add-10', stepIdx: 1, rng: seeded(3) });
    expect(plan.map((q) => q.fmt)).toEqual(['pave', 'qcm', 'manquant', 'vf', 'pave', 'qcm', 'manquant', 'vf', 'pave', 'qcm']);
  });

  it('répétition intelligente : les pièges de l\'étape reviennent plus souvent, jamais en premier', () => {
    const traps = ['8+5', '7+6'];
    let extra = 0;
    for (let seed = 0; seed < 50; seed++) {
      const plan = buildRangeStepPlan({ ...base, traps, trapLog: { '5+8': [TODAY, TODAY] }, series: 'add-20', stepIdx: 1, rng: seeded(seed) });
      const t = plan.filter((q) => q.trap);
      expect(t.every((q) => hasKey(traps, key(q)))).toBe(true); // 5+8 est le piège 8+5
      expect(plan[0]!.trap).toBeFalsy();
      for (let i = 1; i < plan.length; i++) expect(canonKey(key(plan[i]!))).not.toBe(canonKey(key(plan[i - 1]!)));
      extra += t.length;
    }
    // Sans répétition, chaque piège sortirait 10 fois sur 59 calculs de l'étape : bien plus ici.
    expect(extra / 50).toBeGreaterThan(2);
  });

  it('un piège d\'une autre étape ou d\'une autre opération ne s\'invite pas', () => {
    const plan = buildRangeStepPlan({ ...base, traps: ['12+5', '13-5'], series: 'add-20', stepIdx: 1, rng: seeded(1) });
    expect(plan.some((q) => q.trap)).toBe(false);
  });

  it('gardien : 10 calculs différents de toute la série', () => {
    for (let seed = 0; seed < 20; seed++) {
      const plan = seriesBossPlan('sub-20', seeded(seed));
      expect(plan).toHaveLength(10);
      expect(new Set(plan.map(key)).size).toBe(10);
      expect(plan.every((q) => q.p >= 0 && q.a <= 20)).toBe(true);
    }
  });

  it('chrono : jamais deux fois le même calcul de suite, résultats bornés', () => {
    const rng = seeded(8);
    let prev: Question | null = null;
    for (let i = 0; i < 400; i++) {
      const q = nextTimedQuestion('sub-10', prev, i, rng);
      if (prev) expect(key(q)).not.toBe(key(prev));
      expect(q.p).toBeGreaterThanOrEqual(0);
      expect(q.a).toBeLessThanOrEqual(10);
      prev = q;
    }
  });
});

describe('Le CM1 garde ses sessions à l\'identique', () => {
  it('étape et gardien : même plan que les fonctions historiques', () => {
    for (let seed = 0; seed < 10; seed++) {
      expect(seriesStepPlan({ ...base, series: 'mul-7', stepIdx: 1, rng: seeded(seed) })).toEqual(buildStepPlan({ ...base, table: 7, stepIdx: 1, rng: seeded(seed) }));
      expect(seriesBossPlan('mul-4', seeded(seed))).toEqual(buildBossPlan(4, seeded(seed)));
    }
  });
  it('chrono : même tirage qu\'avant (multiplicateur de 1 à 10, jamais deux fois de suite)', () => {
    const legacy = (table: number, prev: Question | null, done: number, rng: () => number) => {
      let b: number;
      do b = 1 + Math.floor(rng() * 10);
      while (prev && b === prev.b && table === prev.a);
      return makeQ(table, b, (['pave', 'qcm', 'vf', 'pave', 'manquant'] as const)[done % 5]!, rng);
    };
    const r1 = seeded(42), r2 = seeded(42);
    let p1: Question | null = null, p2: Question | null = null;
    for (let i = 0; i < 200; i++) {
      p1 = nextTimedQuestion('mul-6', p1, i, r1);
      p2 = legacy(6, p2, i, r2);
      expect(p1).toEqual(p2);
    }
  });
});
