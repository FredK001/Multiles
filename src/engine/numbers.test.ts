import { describe, expect, it } from 'vitest';
import { NUM_SETS } from '../content/numbers';
import { numEq, spoken, tipOf } from '../content/messages';
import { seriesOf } from '../content/series';
import { factKey, parseFact, sameFact } from './keys';
import { NUM_SIGNS, numAnswer, numQ } from './numbers';
import { FORMAT_ORDER, generateQuestion } from './questions';
import { seriesBossPlan, seriesStepPlan } from './plan';
import { seeded } from './random';
import { factsOf } from './series';

describe('nombres jusqu’à 100 (CP)', () => {
  it('8 îles, dizaines/unités, avant/après et « plus petit, plus grand » ouvertes au départ', () => {
    expect(seriesOf('num').map((s) => s.id)).toEqual(['num-du', 'num-suite', 'num-comp', 'num-droite', 'num-pg', 'num-signe', 'num-vf', 'num-trois']);
    expect(seriesOf('num').map((s) => s.need)).toEqual([0, 0, 1, 2, 0, 1, 2, 3]);
  });

  it('réponses : 47, 40, le plus grand, le nombre caché', () => {
    expect(numAnswer({ set: 'du', x: 4, y: 7 })).toBe(47);
    expect(numAnswer({ set: 'suite', x: 39, y: 1 })).toBe(40);
    expect(numAnswer({ set: 'suite', x: 40, y: 0 })).toBe(39);
    expect(numAnswer({ set: 'comp', x: 58, y: 85 })).toBe(85);
    expect(numAnswer({ set: 'droite', x: 40, y: 47 })).toBe(47);
  });

  it('comparer : plus petit/plus grand, signes, vrai ou faux, le plus petit des trois', () => {
    expect(numAnswer({ set: 'pg', x: 2, y: 6, k: 0 })).toBe(2);
    expect(numAnswer({ set: 'pg', x: 2, y: 6, k: 1 })).toBe(6);
    expect(NUM_SIGNS[numAnswer({ set: 'signe', x: 2, y: 6 })]).toBe('<');
    expect(NUM_SIGNS[numAnswer({ set: 'signe', x: 7, y: 7 })]).toBe('=');
    expect(NUM_SIGNS[numAnswer({ set: 'signe', x: 74, y: 47 })]).toBe('>');
    // La fiche de la classe : « 6 < 2 » est faux, « 6 est plus grand que 2 » est vrai.
    expect(numAnswer({ set: 'vf', x: 6, y: 2, k: 0 })).toBe(0);
    expect(numAnswer({ set: 'vf', x: 6, y: 2, k: 3 })).toBe(1);
    expect(numAnswer({ set: 'trois', x: 12, y: 21, z: 13, k: 0 })).toBe(12);
    expect(numAnswer({ set: 'trois', x: 12, y: 21, z: 13, k: 1 })).toBe(21);
  });

  it('comparer : îles équilibrées (autant de « plus petit » que de « plus grand », de vrai que de faux)', () => {
    const facts = (id: string) => NUM_SETS.find((s) => s.id === id)!.facts;
    for (const id of ['pg', 'trois']) {
      const small = facts(id).filter((f) => f.k === 0).length;
      expect(Math.abs(2 * small - facts(id).length)).toBeLessThanOrEqual(facts(id).length / 5);
    }
    const vf = facts('vf'), yes = vf.filter((f) => (f.k! % 2 === 0 ? f.a < f.b : f.a > f.b)).length;
    expect(Math.abs(2 * yes - vf.length)).toBeLessThanOrEqual(vf.length / 10);
    expect(facts('pg').every((f) => f.a >= 1 && f.b <= 10 && f.a !== f.b)).toBe(true);
    expect(facts('trois').every((f) => new Set([f.a, f.b, f.c]).size === 3)).toBe(true);
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
      if (s.id === 'num-comp' || s.id === 'num-pg') expect(q.choices).toHaveLength(2);
      if (s.id === 'num-trois') expect(q.choices).toHaveLength(3);
      if (s.id === 'num-signe') expect(q.choices).toEqual([0, 1, 2]);
      if (s.id === 'num-vf') expect(q.fmt).toBe('vf');
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
    expect(numEq({ set: 'vf', x: 6, y: 2, k: 0 })).toBe('Faux : 6 > 2');
    expect(numEq({ set: 'trois', x: 12, y: 21, z: 13, k: 0 })).toBe('12 < 13 < 21');
    const pg = generateQuestion({ series: 'num-pg', fact: { a: 5, b: 1 }, fmt: 'qcm', rng: seeded(1) });
    expect(spoken(pg)).toMatch(/^Lequel est le plus (petit|grand) : \d+ ou \d+ \?$/);
  });

  it('sessions de 10 questions', () => {
    const rng = seeded(4), base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-21' as const, rng };
    for (const s of seriesOf('num')) {
      expect(seriesStepPlan({ ...base, series: s.id, stepIdx: 0 })).toHaveLength(10);
      expect(seriesBossPlan(s.id, rng)).toHaveLength(10);
    }
  });
});
