import { describe, expect, it } from 'vitest';
import { SERIES, seriesOf } from '../content/series';
import { FORMAT_ORDER, generateQuestion } from './questions';
import { seriesBossPlan, seriesStepPlan } from './plan';
import { seeded } from './random';
import { factsOf } from './series';

describe('CP : les amis de 10 et les doubles', () => {
  it('deux îles d’addition de plus, ouvertes au premier trophée', () => {
    expect(seriesOf('add').map((s) => s.id)).toEqual(['add-10', 'add-c10', 'add-dbl', 'add-pb', 'add-20']);
    expect(SERIES['add-c10'].need).toBe(1);
    expect(SERIES['add-dbl'].need).toBe(1);
  });

  it('amis de 10 : toujours 10, du 10 + 0 au 5 + 5 puis du 4 + 6 au 0 + 10', () => {
    expect(factsOf('add-c10').every((f) => f.a + f.b === 10)).toBe(true);
    expect(factsOf('add-c10', 0).map((f) => `${f.a}+${f.b}`)).toEqual(['5+5', '6+4', '7+3', '8+2', '9+1', '10+0']);
    expect(factsOf('add-c10', 1).map((f) => `${f.a}+${f.b}`)).toEqual(['0+10', '1+9', '2+8', '3+7', '4+6']);
    expect(factsOf('add-c10')).toHaveLength(11);
  });

  it('doubles : 1 + 1 à 5 + 5, puis 6 + 6 à 10 + 10', () => {
    expect(factsOf('add-dbl', 0).map((f) => f.a + f.b)).toEqual([2, 4, 6, 8, 10]);
    expect(factsOf('add-dbl', 1).map((f) => f.a + f.b)).toEqual([12, 14, 16, 18, 20]);
  });

  it('toutes les questions sont valides ; les amis de 10 commencent par le nombre manquant', () => {
    const rng = seeded(11);
    for (const s of ['add-c10', 'add-dbl'] as const) for (const f of factsOf(s)) for (const fmt of FORMAT_ORDER) generateQuestion({ series: s, fact: f, fmt, rng });
    const base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-21' as const, rng };
    const plan = seriesStepPlan({ ...base, series: 'add-c10', stepIdx: 0 });
    expect(plan).toHaveLength(10);
    expect(plan[0]!.fmt).toBe('manquant');
    expect(plan.filter((q) => q.fmt === 'manquant')).toHaveLength(5);
    expect(seriesBossPlan('add-dbl', rng).every((q) => q.a === q.b)).toBe(true);
  });
});
