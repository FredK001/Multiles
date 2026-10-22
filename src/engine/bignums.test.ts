import { describe, expect, it } from 'vitest';
import { BIG_SETS, toWords } from '../content/bignums';
import { spoken, tipOf } from '../content/messages';
import { CURRICULUM, seriesOf } from '../content/series';
import { fmtNum, sayMaths } from '../content/written';
import { factKey, parseFact } from './keys';
import { seriesBossPlan, seriesStepPlan } from './plan';
import { generateQuestion } from './questions';
import { seeded } from './random';
import { factsOf } from './series';
import { writtenFactLabel } from './written';

/** « 4 532 » → 4532. */
const num = (s: string): number => Number(s.replace(/[\u202f\u00a0 ]/g, ''));
const set = (id: string) => BIG_SETS.find((s) => s.id === id)!;

describe('grands nombres (CM1)', () => {
  it('au CM1 après les fractions, 4 îles, « lire les nombres » ouverte au départ', () => {
    expect(CURRICULUM.CM1.indexOf('big')).toBe(CURRICULUM.CM1.indexOf('frac') + 1);
    expect(seriesOf('big').map((s) => s.id)).toEqual(['big-lire', 'big-chiffre', 'big-calc', 'big-reste']);
    expect(seriesOf('big').map((s) => s.need)).toEqual([0, 1, 1, 2]);
  });

  it('nombres en lettres, orthographe rectifiée (traits d’union, accords de vingt et cent)', () => {
    expect(toWords(4532)).toBe('quatre-mille-cinq-cent-trente-deux');
    expect(toWords(80)).toBe('quatre-vingts');
    expect(toWords(80300)).toBe('quatre-vingt-mille-trois-cents');
    expect(toWords(200)).toBe('deux-cents');
    expect(toWords(200000)).toBe('deux-cent-mille');
    expect(toWords(1001)).toBe('mille-un');
    expect(toWords(21000)).toBe('vingt-et-un-mille');
    expect(toWords(71)).toBe('soixante-et-onze');
    expect(toWords(81)).toBe('quatre-vingt-un');
    expect(toWords(97)).toBe('quatre-vingt-dix-sept');
    expect(toWords(1000000)).toBe('un million');
    expect(toWords(2500000)).toBe('deux millions cinq-cent-mille');
    expect(toWords(300090)).toBe('trois-cent-mille-quatre-vingt-dix');
  });

  it('espace fine insécable des milliers ; la voix lit chaque nombre d’un seul tenant, et les signes en mots', () => {
    expect(fmtNum(4532)).toBe('4\u202f532');
    expect(fmtNum(1250000)).toBe('1\u202f250\u202f000');
    expect(fmtNum(999)).toBe('999');
    expect(sayMaths('4\u202f532 × 100 = ?')).toBe('4532 fois 100 égale combien ?');
    expect(sayMaths('47 ÷ 5 = ?')).toBe('47 divisé par 5 égale combien ?');
    expect(sayMaths('63 + ? = 100')).toBe('63 plus combien égale 100 ?');
  });

  it('contenu : 3 réponses distinctes, pas de doublon ; aucun écart d’espace (U+202F partout)', () => {
    for (const s of BIG_SETS) {
      expect(s.items.length, s.id).toBeGreaterThanOrEqual(10);
      expect(new Set(s.items.map((it) => it.q + it.a)).size, s.id).toBe(s.items.length);
      for (const it of s.items) {
        expect(new Set([it.a, ...it.x]).size, `${s.id} ${it.q}`).toBe(3);
        for (const t of [it.q, it.a, ...it.x, it.tip]) expect(t, t).not.toMatch(/\d \d{3}(?!\d)/);
      }
    }
  });

  it('lire : l’écriture en chiffres correspond aux lettres, et aucun intrus n’a la même valeur', () => {
    for (const it of set('lire').items) {
      const words = /^« (.+) » s'écrit…$/.exec(it.q);
      if (words) {
        expect(toWords(num(it.a))).toBe(words[1]);
        for (const x of it.x) expect(num(x)).not.toBe(num(it.a));
      } else {
        const n = num(it.q.replace(" s'écrit…", ''));
        expect(it.a).toBe(toWords(n));
        for (const x of it.x) expect(x).not.toBe(toWords(n));
      }
    }
  });

  it('valeur des chiffres, comparer, ranger : une seule bonne réponse', () => {
    for (const it of set('chiffre').items) {
      const d = /^Dans (.+), le chiffre des (.+) est…$/.exec(it.q), c = /^Dans (.+), le nombre de (.+) est…$/.exec(it.q);
      const k = (place: string) => ['unités', 'dizaines', 'centaines', 'milliers', 'dizaines de mille', 'centaines de mille'].indexOf(place);
      if (d) {
        expect(Number(it.a)).toBe(Math.floor(num(d[1]!) / 10 ** k(d[2]!)) % 10);
        for (const x of it.x) expect(x).not.toBe(it.a);
      } else if (c) {
        expect(num(it.a)).toBe(Math.floor(num(c[1]!) / 10 ** k(c[2]!)));
      } else if (it.q.startsWith('Quel est le plus')) {
        const vals = [it.a, ...it.x].map(num), big = it.q.includes('grand');
        expect(num(it.a)).toBe(big ? Math.max(...vals) : Math.min(...vals));
      } else if (it.q.startsWith('Du plus petit')) {
        const ok = (s: string) => s.split(' < ').map(num).every((v, i, a) => i === 0 || a[i - 1]! < v);
        expect(ok(it.a)).toBe(true);
        for (const x of it.x) expect(ok(x)).toBe(false);
      } else if (it.q.includes(' + ')) {
        const sum = it.q.replace(' = ?', '').split(' + ').map(num).reduce((p, q) => p + q, 0);
        expect(num(it.a)).toBe(sum);
        for (const x of it.x) expect(num(x)).not.toBe(sum);
      }
    }
  });

  it('calcul mental : une seule réponse rend l’égalité juste ; les quotients sont entiers', () => {
    for (const it of set('calc').items) {
      const t = /^(.+) × (.+) = \?$/.exec(it.q), d = /^(.+) ÷ 10 = \?$/.exec(it.q), c = /^(.+) \+ \? = (.+)$/.exec(it.q);
      const good = (v: number) => (t ? v === num(t[1]!) * num(t[2]!) : d ? v * 10 === num(d[1]!) : num(c![1]!) + v === num(c![2]!));
      expect(t || d || c, it.q).toBeTruthy();
      expect(good(num(it.a)), it.q).toBe(true);
      for (const x of it.x) expect(good(num(x)), `${it.q} ${x}`).toBe(false);
    }
  });

  it('division avec reste : seule la bonne réponse a un reste plus petit que le diviseur et refait le dividende', () => {
    for (const it of set('reste').items) {
      const [n, b] = (it.q.match(/\d+/g) ?? []).map(Number) as [number, number];
      const ok = (s: string) => {
        const [q, r] = (s.match(/\d+/g) ?? []).map(Number) as [number, number];
        return q * b + r === n && r < b;
      };
      expect(ok(it.a), it.q).toBe(true);
      for (const x of it.x) expect(ok(x), `${it.q} ${x}`).toBe(false);
    }
  });

  it('questions valides ; la voix ne lit ni « ÷ », ni « × », ni un nombre coupé en deux', () => {
    const rng = seeded(4);
    for (const s of seriesOf('big')) for (const f of factsOf(s)) {
      const q = generateQuestion({ series: s, fact: f, fmt: 'qcm', rng });
      expect(q.big!.options[q.p]).toBe(writtenFactLabel('big', f.a, f.b).a);
      expect(spoken(q)).not.toMatch(/[÷×\u202f]|\d \d{3}(?!\d)/);
      expect(tipOf(q).length).toBeGreaterThan(10);
    }
  });

  it('clés « 2g7 » ; sessions de 10 questions', () => {
    expect(parseFact(factKey('big', 2, 7))).toEqual({ op: 'big', a: 2, b: 7 });
    expect(factKey('big', 2, 7)).toBe('2g7');
    const rng = seeded(6), base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-21' as const, rng };
    for (const s of seriesOf('big')) {
      expect(seriesStepPlan({ ...base, series: s.id, stepIdx: 0 })).toHaveLength(10);
      expect(seriesBossPlan(s.id, rng)).toHaveLength(10);
    }
  });
});
