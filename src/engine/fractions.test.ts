import { describe, expect, it } from 'vitest';
import { FRAC_SETS, fracWords, sayFrac } from '../content/fractions';
import { spoken, tipOf } from '../content/messages';
import { CURRICULUM, seriesOf } from '../content/series';
import { factKey, parseFact } from './keys';
import { generateQuestion } from './questions';
import { seriesBossPlan, seriesStepPlan } from './plan';
import { seeded } from './random';
import { factsOf } from './series';

const val = (s: string): number => (s.includes('/') ? Number(s.split('/')[0]) / Number(s.split('/')[1]) : Number(s.replace(',', '.')));

describe('fractions et décimaux (CM1)', () => {
  it('au CM1, 4 îles, « lire une fraction » ouverte au départ', () => {
    expect(CURRICULUM.CM1).toContain('frac');
    expect(seriesOf('frac').map((s) => s.id)).toEqual(['frac-lire', 'frac-unite', 'frac-dix', 'frac-comp']);
    expect(seriesOf('frac').map((s) => s.need)).toEqual([0, 1, 1, 2]);
  });

  it('contenu : 3 réponses distinctes ; aucun intrus n’a la même valeur que la bonne réponse', () => {
    for (const s of FRAC_SETS) for (const it of s.items) {
      expect(new Set([it.a, ...it.x]).size, `${s.id} ${it.q}`).toBe(3);
      if (s.id === 'dix' || s.id === 'comp') for (const x of it.x) if (/^[\d,/]+$/.test(x) && /^[\d,/]+$/.test(it.a) && !it.q.includes('chiffre')) expect(val(x), `${it.q} : ${x}`).not.toBe(val(it.a));
      if (it.pic) expect(it.a).toBe(`${it.pic.n}/${it.pic.d}`);
    }
  });

  it('comparer : la bonne réponse est la plus grande, ou « ils sont égaux » quand un zéro final ne change rien', () => {
    for (const it of FRAC_SETS[3]!.items) {
      if (it.a === 'ils sont égaux') expect(val(it.x[0])).toBe(val(it.x[1]));
      else expect(val(it.a)).toBeGreaterThan(val(it.x[0]));
    }
    expect(FRAC_SETS[3]!.items.filter((it) => it.a === 'ils sont égaux').length).toBeGreaterThan(0);
  });

  it('la voix lit les fractions en mots, jamais « 2/5 » (que la synthèse peut lire comme une date)', () => {
    for (const s of seriesOf('frac')) for (const f of factsOf(s)) {
      const q = generateQuestion({ series: s, fact: f, fmt: 'qcm', rng: seeded(1) });
      expect(spoken(q)).not.toMatch(/\d\/\d/);
    }
    expect(sayFrac('1/2 = 2/4 et 7/10')).toBe('un demi = 2 quarts et 7 dixièmes');
  });

  it('questions valides ; lecture des fractions à voix haute', () => {
    const rng = seeded(3);
    for (const s of seriesOf('frac')) for (const f of factsOf(s)) generateQuestion({ series: s, fact: f, fmt: 'qcm', rng });
    const q = generateQuestion({ series: 'frac-unite', fact: { a: 2, b: 1 }, fmt: 'qcm', rng });
    expect(spoken(q)).toBe('3 quarts, c\'est…');
    expect(tipOf(q)).toContain('il en manque');
    expect(fracWords({ n: 3, d: 4 })).toBe('3 quarts');
    expect(fracWords({ n: 1, d: 2 })).toBe('un demi');
  });

  it('clés « 2r5 » ; sessions de 10 questions', () => {
    expect(parseFact(factKey('frac', 2, 5))).toEqual({ op: 'frac', a: 2, b: 5 });
    const rng = seeded(6), base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-21' as const, rng };
    for (const s of seriesOf('frac')) {
      expect(seriesStepPlan({ ...base, series: s.id, stepIdx: 0 })).toHaveLength(10);
      expect(seriesBossPlan(s.id, rng)).toHaveLength(10);
    }
  });
});
