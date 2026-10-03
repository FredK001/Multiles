import { describe, expect, it } from 'vitest';
import { CURRICULUM, GRADES, SERIES, SERIES_IDS, seriesOf, type SeriesId } from '../content/series';
import { factKey, parseFact, sameFact } from './keys';
import { assertValid, FORMAT_ORDER, generateQuestion, makeQ, type Question } from './questions';
import { seeded } from './random';
import { crossesTen, drawFact, drawFacts, factsOf, resultOf, type Fact } from './series';
import { RANGES } from './unlock';

const CP: SeriesId[] = ['add-10', 'add-20', 'sub-10', 'sub-20'];
const key = (f: Fact) => `${f.a},${f.b}`;

describe('catalogue des séries', () => {
  it('chaque niveau propose des opérations qui ont des séries', () => {
    for (const g of GRADES) for (const op of CURRICULUM[g]) expect(seriesOf(op).length).toBeGreaterThan(0);
    expect(CURRICULUM.CP).toEqual(['add', 'sub']);
    expect(CURRICULUM.CM1).toEqual(['mul']);
  });
  it('les tables du CM1 gardent leurs étapes ×1-5, ×6-10, toute la table', () => {
    for (let n = 1; n <= 10; n++) {
      expect(factsOf(`mul-${n}` as SeriesId, 0).map((f) => f.b)).toEqual(RANGES[0]);
      expect(factsOf(`mul-${n}` as SeriesId, 1).map((f) => f.b)).toEqual(RANGES[1]);
      expect(factsOf(`mul-${n}` as SeriesId, 2)).toHaveLength(10);
      expect(factsOf(`mul-${n}` as SeriesId).every((f) => f.a === n)).toBe(true);
    }
  });
  it('nombre de calculs par série CP', () => {
    expect(factsOf('add-10')).toHaveLength(66);
    expect(factsOf('sub-10')).toHaveLength(66);
    expect(factsOf('add-20')).toHaveLength(145);
    expect(factsOf('sub-20')).toHaveLength(100);
  });
  it('les étapes 1 et 2 partagent la série sans recouvrement, l\'étape 3 et le gardien la couvrent', () => {
    for (const id of SERIES_IDS) {
      const all = factsOf(id).map(key), e1 = factsOf(id, 0).map(key), e2 = factsOf(id, 1).map(key);
      expect(e1.length).toBeGreaterThan(0);
      expect(e2.length).toBeGreaterThan(0);
      expect(e1.filter((k) => e2.includes(k))).toEqual([]);
      expect([...e1, ...e2].sort()).toEqual([...all].sort());
      expect(factsOf(id, 2).map(key)).toEqual(all);
      expect(factsOf(id, 3).map(key)).toEqual(all);
    }
  });
});

describe('bornes des séries CP', () => {
  it('additions jusqu\'à 10 : deux termes de 0 à 10, somme ≤ 10', () => {
    for (const f of factsOf('add-10')) {
      expect(f.a).toBeGreaterThanOrEqual(0);
      expect(f.b).toBeGreaterThanOrEqual(0);
      expect(f.a).toBeLessThanOrEqual(10);
      expect(f.b).toBeLessThanOrEqual(10);
      expect(f.a + f.b).toBeLessThanOrEqual(10);
    }
    expect(factsOf('add-10', 0).every((f) => f.a + f.b <= 5)).toBe(true);
    expect(factsOf('add-10', 1).every((f) => f.a + f.b >= 6)).toBe(true);
  });
  it('additions jusqu\'à 20 : somme de 11 à 20, sans terme nul', () => {
    for (const f of factsOf('add-20')) {
      expect(f.a + f.b).toBeGreaterThanOrEqual(11);
      expect(f.a + f.b).toBeLessThanOrEqual(20);
      expect(Math.min(f.a, f.b)).toBeGreaterThanOrEqual(1);
    }
    expect(factsOf('add-20', 0).some((f) => f.a === 12 && f.b === 5)).toBe(true);
    expect(factsOf('add-20', 1).some((f) => f.a === 8 && f.b === 5)).toBe(true);
  });
  it('soustractions : jamais de résultat négatif', () => {
    for (const id of ['sub-10', 'sub-20'] as const)
      for (const f of factsOf(id)) {
        expect(f.b).toBeLessThanOrEqual(f.a);
        expect(resultOf('sub', f.a, f.b)).toBeGreaterThanOrEqual(0);
      }
  });
  it('soustractions jusqu\'à 10 : on part de 0 à 10 ; jusqu\'à 20 : de 11 à 20, on enlève 1 à 10', () => {
    expect(factsOf('sub-10').every((f) => f.a <= 10)).toBe(true);
    expect(factsOf('sub-10', 0).every((f) => f.a <= 5)).toBe(true);
    expect(factsOf('sub-10', 1).every((f) => f.a >= 6)).toBe(true);
    expect(factsOf('sub-20').every((f) => f.a >= 11 && f.a <= 20 && f.b >= 1 && f.b <= 10)).toBe(true);
  });
  it('passage de la dizaine (étape 2 des séries jusqu\'à 20)', () => {
    expect(crossesTen('add', { a: 8, b: 5 })).toBe(true);
    expect(crossesTen('add', { a: 12, b: 5 })).toBe(false);
    expect(crossesTen('sub', { a: 13, b: 5 })).toBe(true);
    expect(crossesTen('sub', { a: 17, b: 4 })).toBe(false);
    expect(crossesTen('sub', { a: 15, b: 10 })).toBe(false);
    for (const id of ['add-20', 'sub-20'] as const) {
      const op = SERIES[id].op;
      expect(factsOf(id, 0).every((f) => !crossesTen(op, f))).toBe(true);
      expect(factsOf(id, 1).every((f) => crossesTen(op, f))).toBe(true);
    }
  });
});

describe('generateQuestion', () => {
  /** Toutes les questions possibles : chaque calcul de chaque série, dans les 4 formats, plusieurs tirages. */
  function* everything(ids: readonly SeriesId[], seeds = 4): Generator<Question> {
    for (const id of ids)
      for (const fact of factsOf(id))
        for (const fmt of FORMAT_ORDER)
          for (let s = 1; s <= seeds; s++) yield generateQuestion({ series: id, fact, fmt, rng: seeded(s * 7919 + fact.a * 31 + fact.b) });
  }

  it('aucune question CP ne contient de nombre négatif ou hors plage', () => {
    let n = 0;
    for (const q of everything(CP)) {
      n++;
      const max = (SERIES[q.series].spec as { max: number }).max;
      const shown = [q.a, q.b, q.p, ...(q.choices ?? []), ...(q.shown === undefined ? [] : [q.shown])];
      expect(shown.every((x) => Number.isInteger(x) && x >= 0)).toBe(true);
      expect(q.p).toBeLessThanOrEqual(max);
      expect((q.choices ?? []).every((c) => c <= max)).toBe(true);
      if (q.shown !== undefined) expect(q.shown).toBeLessThanOrEqual(max);
    }
    expect(n).toBe((66 + 145 + 66 + 100) * 4 * 4);
  });

  it('toutes les questions passent le garde-fou, multiplications comprises', () => {
    for (const q of everything(SERIES_IDS, 2)) expect(() => assertValid(q)).not.toThrow();
  });

  it('QCM : 3 propositions distinctes dont la bonne ; vrai/faux cohérent', () => {
    for (const q of everything(CP, 2)) {
      if (q.fmt === 'qcm') {
        expect(new Set(q.choices).size).toBe(3);
        expect(q.choices).toContain(q.p);
      }
      if (q.fmt === 'vf') expect(q.shown === q.p).toBe(q.truth);
    }
  });

  it('le résultat correspond à l\'opération', () => {
    expect(generateQuestion({ series: 'add-10', fact: { a: 3, b: 4 }, fmt: 'pave' }).p).toBe(7);
    expect(generateQuestion({ series: 'sub-20', fact: { a: 13, b: 5 }, fmt: 'pave' }).p).toBe(8);
    expect(generateQuestion({ series: 'mul-7', fact: { a: 7, b: 8 }, fmt: 'pave' }).p).toBe(56);
  });

  it('refuse un calcul hors de la série', () => {
    expect(() => generateQuestion({ series: 'add-10', fact: { a: 7, b: 5 }, fmt: 'pave' })).toThrow(RangeError);
    expect(() => generateQuestion({ series: 'sub-10', fact: { a: 3, b: 5 }, fmt: 'pave' })).toThrow(RangeError);
    expect(() => generateQuestion({ series: 'sub-20', fact: { a: 9, b: 2 }, fmt: 'pave' })).toThrow(RangeError);
    expect(() => generateQuestion({ series: 'mul-7', fact: { a: 7, b: 11 }, fmt: 'pave' })).toThrow(RangeError);
  });

  it('le garde-fou détecte une question trafiquée', () => {
    const q = generateQuestion({ series: 'sub-10', fact: { a: 5, b: 2 }, fmt: 'qcm', rng: seeded(3) });
    expect(() => assertValid({ ...q, p: -1 })).toThrow();
    expect(() => assertValid({ ...q, choices: [3, 1, -1] })).toThrow();
    expect(() => assertValid({ ...q, a: 2, b: 5 })).toThrow();
  });

  it('sans calcul imposé, tire dans l\'étape demandée', () => {
    const rng = seeded(11);
    for (let i = 0; i < 300; i++) {
      const q = generateQuestion({ series: 'add-20', step: 1, fmt: 'pave', rng });
      expect(crossesTen('add', q)).toBe(true);
      const r = generateQuestion({ series: 'sub-10', step: 0, fmt: 'vf', rng });
      expect(r.a).toBeLessThanOrEqual(5);
    }
  });

  it('makeQ (CM1) donne exactement la même question que le générateur sur la table', () => {
    for (const fmt of FORMAT_ORDER)
      expect(makeQ(7, 8, fmt, seeded(5))).toEqual(generateQuestion({ series: 'mul-7', fact: { a: 7, b: 8 }, fmt, rng: seeded(5) }));
  });
});

describe('répartition', () => {
  it('tous les calculs sortent ; ceux avec un 0 sont 4 fois plus rares', () => {
    const pool = factsOf('add-10'), rng = seeded(2026), N = 40_000, count = new Map<string, number>();
    for (let i = 0; i < N; i++) {
      const f = drawFact(pool, rng);
      count.set(key(f), (count.get(key(f)) ?? 0) + 1);
    }
    expect(count.size).toBe(pool.length);
    const zeros = pool.filter((f) => f.a === 0 || f.b === 0), others = pool.length - zeros.length;
    const unit = N / (others + zeros.length * 0.25);
    for (const f of pool) {
      const exp = (f.a === 0 || f.b === 0 ? 0.25 : 1) * unit, got = count.get(key(f))!;
      expect(Math.abs(got - exp) / exp).toBeLessThan(0.25);
    }
    const zeroShare = zeros.reduce((s, f) => s + count.get(key(f))!, 0) / N;
    expect(zeroShare).toBeGreaterThan(0.08);
    expect(zeroShare).toBeLessThan(0.13);
  });

  it('une session de 10 calculs n\'a pas de doublon tant que l\'étape en contient assez', () => {
    for (const id of CP)
      for (const step of [0, 1, 2]) {
        const pool = factsOf(id, step);
        if (pool.length < 10) continue;
        for (let s = 0; s < 50; s++) expect(new Set(drawFacts(pool, 10, seeded(s)).map(key)).size).toBe(10);
      }
  });

  it('une étape trop courte est parcourue en entier avant de recommencer', () => {
    const pool = factsOf('mul-7', 0), got = drawFacts(pool, 10, seeded(4)).map(key);
    for (const f of pool) expect(got.filter((k) => k === key(f))).toHaveLength(2);
  });

  it('vrai/faux juste une fois sur deux ; la bonne réponse du QCM change de place', () => {
    const rng = seeded(9);
    let vrais = 0;
    const pos = [0, 0, 0];
    for (let i = 0; i < 3000; i++) {
      if (generateQuestion({ series: 'sub-20', fmt: 'vf', rng }).truth) vrais++;
      const q = generateQuestion({ series: 'add-10', fmt: 'qcm', rng });
      pos[q.choices!.indexOf(q.p)]!++;
    }
    expect(vrais / 3000).toBeGreaterThan(0.45);
    expect(vrais / 3000).toBeLessThan(0.55);
    for (const c of pos) expect(c / 3000).toBeGreaterThan(0.28);
  });
});

describe('clés de calcul', () => {
  it('écriture et lecture', () => {
    expect(factKey('mul', 7, 8)).toBe('7x8');
    expect(factKey('add', 3, 4)).toBe('3+4');
    expect(factKey('sub', 9, 2)).toBe('9-2');
    expect(parseFact('13-5')).toEqual({ op: 'sub', a: 13, b: 5 });
    expect(parseFact('0+10')).toEqual({ op: 'add', a: 0, b: 10 });
    expect(parseFact('7x8')).toEqual({ op: 'mul', a: 7, b: 8 });
    expect(parseFact('7*8')).toBeNull();
    expect(parseFact('-3+4')).toBeNull();
  });
  it('3+4 et 4+3 sont le même calcul, pas 9-2 et 2-9, ni 3+4 et 3x4', () => {
    expect(sameFact('3+4', '4+3')).toBe(true);
    expect(sameFact('7x8', '8x7')).toBe(true);
    expect(sameFact('9-2', '2-9')).toBe(false);
    expect(sameFact('9-2', '9-2')).toBe(true);
    expect(sameFact('3+4', '3x4')).toBe(false);
  });
});
