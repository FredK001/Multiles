import { describe, expect, it } from 'vitest';
import { tipOf } from '../content/messages';
import { SERIES, seriesOf, type SeriesId } from '../content/series';
import { canonKey, factKey, parseFact, sameFact } from './keys';
import { FORMAT_ORDER, generateQuestion, isCorrect } from './questions';
import { seriesBossPlan, seriesStepPlan, nextTimedQuestion } from './plan';
import { seeded } from './random';
import { factsOf, resultOf, seriesForFact } from './series';

describe('division : les tables à l’envers', () => {
  it('10 îles, une par table, mêmes ouvertures que les tables', () => {
    const div = seriesOf('div');
    expect(div.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `div-${n}`));
    for (const s of div) expect(s.need).toBe(SERIES[`mul-${s.id.slice(4)}` as SeriesId].need);
  });

  it('la table de 7 à l’envers : 7 ÷ 7 à 70 ÷ 7, quotients 1 à 5 puis 6 à 10', () => {
    expect(factsOf('div-7').map((f) => `${f.a}÷${f.b}`)).toEqual([7, 14, 21, 28, 35, 42, 49, 56, 63, 70].map((a) => `${a}÷7`));
    expect(factsOf('div-7', 0).map((f) => resultOf('div', f.a, f.b))).toEqual([1, 2, 3, 4, 5]);
    expect(factsOf('div-7', 1).map((f) => resultOf('div', f.a, f.b))).toEqual([6, 7, 8, 9, 10]);
  });

  it('clés : « 56d7 », jusqu’à « 100d10 », sans symétrique', () => {
    expect(factKey('div', 56, 7)).toBe('56d7');
    expect(parseFact('100d10')).toEqual({ op: 'div', a: 100, b: 10 });
    expect(sameFact('56d7', '7d56')).toBe(false);
    expect(canonKey('56d7')).toBe('56d7');
    expect(seriesForFact('div', { a: 56, b: 7 })?.id).toBe('div-7');
  });

  it('toutes les questions de toutes les tables sont valides, dans tous les formats', () => {
    const rng = seeded(7);
    for (const s of seriesOf('div')) for (const f of factsOf(s)) for (const fmt of FORMAT_ORDER) for (let k = 0; k < 5; k++) {
      const q = generateQuestion({ series: s, fact: f, fmt, rng });
      expect(q.p).toBe(f.a / f.b);
      if (fmt === 'manquant') expect(isCorrect(q, f.b)).toBe(true);
      if (fmt === 'pave') expect(isCorrect(q, q.p)).toBe(true);
    }
  });

  it('sessions : étapes, gardien et chrono tirent dans la table', () => {
    const rng = seeded(3), base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-21' as const, rng };
    for (const step of [0, 1, 2]) {
      const plan = seriesStepPlan({ ...base, series: 'div-8', stepIdx: step });
      expect(plan).toHaveLength(10);
      expect(plan.every((q) => q.op === 'div' && q.b === 8)).toBe(true);
    }
    expect(seriesBossPlan('div-8', rng).every((q) => q.series === 'div-8')).toBe(true);
    expect(nextTimedQuestion('div-3', null, 0, rng).b).toBe(3);
  });

  it('astuce : on remonte à la table', () => {
    expect(tipOf({ op: 'div', a: 56, b: 7 })).toBe('Pense à la table de 7 : 7 × 8 = 56. Donc 56 ÷ 7 = 8.');
    expect(tipOf({ op: 'div', a: 70, b: 10 })).toContain('on enlève le zéro');
  });
});
