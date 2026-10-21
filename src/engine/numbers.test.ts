import { describe, expect, it } from 'vitest';
import { NUM_SETS } from '../content/numbers';
import { numEq, spoken, tipOf } from '../content/messages';
import { seriesOf } from '../content/series';
import { factKey, parseFact, sameFact } from './keys';
import { numAnswer, numQ } from './numbers';
import { FORMAT_ORDER, generateQuestion } from './questions';
import { seriesBossPlan, seriesStepPlan } from './plan';
import { seeded } from './random';
import { factsOf } from './series';

describe('nombres jusqu’à 100 (CP)', () => {
  it('4 îles, dizaines/unités et avant/après ouvertes au départ', () => {
    expect(seriesOf('num').map((s) => s.id)).toEqual(['num-du', 'num-suite', 'num-comp', 'num-droite']);
    expect(seriesOf('num').map((s) => s.need)).toEqual([0, 0, 1, 2]);
  });

  it('réponses : 47, 40, le plus grand, le nombre caché', () => {
    expect(numAnswer('du', 4, 7)).toBe(47);
    expect(numAnswer('suite', 39, 1)).toBe(40);
    expect(numAnswer('suite', 40, 0)).toBe(39);
    expect(numAnswer('comp', 58, 85)).toBe(85);
    expect(numAnswer('droite', 40, 47)).toBe(47);
  });

  it('clé = île et rang : deux îles ne partagent jamais une clé', () => {
    const du = factsOf('num-du')[3]!, suite = factsOf('num-suite')[3]!;
    expect(sameFact(factKey('num', du.a, du.b), factKey('num', suite.a, suite.b))).toBe(false);
    expect(parseFact(factKey('num', 2, 196))).toEqual({ op: 'num', a: 2, b: 196 });
    expect(Math.max(...NUM_SETS.map((s) => s.facts.length))).toBeLessThan(1000);
  });

  it('toutes les questions sont valides, au pavé et au choix ; « comparer » toujours au choix entre 2', () => {
    const rng = seeded(8);
    for (const s of seriesOf('num')) for (const f of factsOf(s)) for (const fmt of FORMAT_ORDER) {
      const q = generateQuestion({ series: s, fact: f, fmt, rng });
      if (s.id === 'num-comp') expect(q.choices).toHaveLength(2);
      expect(q.p).toBeGreaterThanOrEqual(0);
    }
  });

  it('énoncés, réponses et astuces', () => {
    const q = (id: 'num-du' | 'num-suite' | 'num-comp' | 'num-droite', x: number, y: number) => {
      const set = id.slice(4) as 'du', b = NUM_SETS.find((s) => s.id === set)!.facts.findIndex((f) => f.a === x && f.b === y) + 1;
      expect(b).toBeGreaterThan(0);
      return generateQuestion({ series: id, fact: { a: seriesOf('num').findIndex((s) => s.id === id) + 1, b }, fmt: 'pave', rng: seeded(1) });
    };
    const du = q('num-du', 4, 7);
    expect(spoken(du)).toBe("4 dizaines et 7 unités, c'est quel nombre ?");
    expect(numEq(du.num!)).toBe('4 dizaines et 7 unités = 47');
    expect(tipOf(du)).toBe("4 dizaines, c'est 40. 40 et 7, ça fait 47.");
    expect(tipOf(q('num-suite', 39, 1))).toBe('Après 39, on change de dizaine : 40.');
    expect(tipOf(q('num-comp', 58, 85))).toContain('On regarde d\'abord les dizaines');
    expect(numEq(numQ('droite', 8))).toBe('0 … 8 … 10');
  });

  it('sessions de 10 questions', () => {
    const rng = seeded(4), base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-21' as const, rng };
    for (const s of seriesOf('num')) {
      expect(seriesStepPlan({ ...base, series: s.id, stepIdx: 0 })).toHaveLength(10);
      expect(seriesBossPlan(s.id, rng)).toHaveLength(10);
    }
  });
});
