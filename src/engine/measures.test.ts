import { describe, expect, it } from 'vitest';
import { clockArt, clockLabel } from '../art';
import { MES_SETS, UNIT_VALUE } from '../content/measures';
import { spoken, tipOf } from '../content/messages';
import { CURRICULUM, seriesOf } from '../content/series';
import { fmtHour, sayMaths } from '../content/written';
import { factKey, parseFact } from './keys';
import { seriesBossPlan, seriesStepPlan } from './plan';
import { generateQuestion } from './questions';
import { seeded } from './random';
import { factsOf } from './series';

/** Grandeur de chaque unité. */
const DIM: Record<string, string> = { km: 'L', m: 'L', cm: 'L', mm: 'L', kg: 'M', g: 'M', L: 'C', cL: 'C', mL: 'C', h: 'T', min: 'T', s: 'T' };

/** Valeur d'une mesure dans l'unité de base (« 1 h 30 min » → 5 400 s ; « 9 h 10 » → 33 000 s).
    null si l'écriture est fausse : plusieurs grandeurs, ou 60 minutes et plus après « h » (« 8 h 70 »). */
function value(s: string): { dim: string; v: number } | null {
  const t = s.replace(/[\u202f\u00a0](?=\d{3})/g, '');
  const parts = [...t.matchAll(/(\d+) (km|mm|cm|m|kg|g|cL|mL|L|min|h|s)(?![\p{L}])(?: (\d+)(?!\d| ?\p{L}))?/gu)];
  if (!parts.length) return null;
  let dim = '', v = 0;
  for (const [, n, u, after] of parts) {
    if (dim && DIM[u!] !== dim) return null;
    dim = DIM[u!]!;
    v += Number(n) * UNIT_VALUE[u!]!;
    // « 9 h 10 » : des minutes sans « min ».
    if (after !== undefined) {
      if (Number(after) >= 60) return null;
      v += Number(after) * 60;
    }
  }
  if (/(\d+) min/.test(t) && /h (\d+) min/.test(t) && Number(/h (\d+) min/.exec(t)![1]) >= 60) return null;
  return { dim, v };
}
const same = (a: string, b: string): boolean => {
  const p = value(a), q = value(b);
  return !!p && !!q && p.dim === q.dim && p.v === q.v;
};

describe('mesures (CM1)', () => {
  it('au CM1 après les grands nombres, 4 îles, les longueurs ouvertes au départ', () => {
    expect(CURRICULUM.CM1.indexOf('mes')).toBe(CURRICULUM.CM1.indexOf('big') + 1);
    expect(seriesOf('mes').map((s) => s.id)).toEqual(['mes-long', 'mes-masse', 'mes-heure', 'mes-pb']);
    expect(seriesOf('mes').map((s) => s.need)).toEqual([0, 1, 1, 2]);
  });

  it('contenu : 3 réponses distinctes, pas de doublon, au moins 10 questions par île', () => {
    for (const s of MES_SETS) {
      expect(s.items.length, s.id).toBeGreaterThanOrEqual(10);
      expect(new Set(s.items.map((it) => `${it.q}${it.a}${it.clock?.h}`)).size, s.id).toBe(s.items.length);
      for (const it of s.items) {
        expect(new Set([it.a, ...it.x]).size, it.q).toBe(3);
        for (const t of [it.q, it.a, ...it.x, it.tip]) expect(t, t).not.toMatch(/\d \d{3}(?!\d)/);
      }
    }
  });

  it('conversions et durées : une seule réponse a la bonne valeur (8 h 70, 1 h 65 min ne sont pas des écritures justes)', () => {
    let n = 0;
    for (const s of MES_SETS) for (const it of s.items) {
      const conv = /^(.+) = \? (\S+)$/.exec(it.q) ?? /^(.+), c'est…$/.exec(it.q);
      const dur = /^De (.+) à (.+), il s'écoule…$/.exec(it.q), later = /^Il est (.+)\. Dans (.+), il sera…$/.exec(it.q);
      let target: string | null = null;
      if (conv && /^\d/.test(conv[1]!) && value(conv[1]!)) target = conv[1]!;
      else if (dur) target = `${(value(dur[2]!)!.v - value(dur[1]!)!.v) / 60} min`;
      else if (later) target = `${(value(later[1]!)!.v + value(later[2]!)!.v) / 3600 | 0} h ${((value(later[1]!)!.v + value(later[2]!)!.v) % 3600) / 60}`;
      if (!target) continue;
      n++;
      expect(same(it.a, target), `${it.q} → ${it.a}`).toBe(true);
      for (const x of it.x) expect(same(x, target), `${it.q} : ${x}`).toBe(false);
    }
    expect(n).toBeGreaterThan(30);
  });

  it('comparer deux mesures : la plus grande, ou « c’est pareil »', () => {
    const items = MES_SETS.flatMap((s) => s.items).filter((it) => / : .+ ou .+ \?$/.test(it.q));
    expect(items.length).toBeGreaterThanOrEqual(5);
    for (const it of items) {
      const [, p, q] = / : (.+) ou (.+) \?$/.exec(it.q)!, vp = value(p!)!, vq = value(q!)!;
      expect(vp.dim).toBe(vq.dim);
      expect(it.a).toBe(vp.v === vq.v ? 'c\'est pareil' : vp.v > vq.v ? p : q);
    }
  });

  it('horloges : la bonne heure ; ni aiguilles inversées ni autre heure ne sont justes ; matin et après-midi jamais mélangés', () => {
    const clocks = MES_SETS.flatMap((s) => s.items).filter((it) => it.clock);
    expect(clocks.length).toBeGreaterThanOrEqual(8);
    for (const it of clocks) {
      expect(it.a).toBe(fmtHour(it.clock!.h, it.clock!.m));
      for (const x of [it.a, ...it.x]) expect(Number(x.split(' ')[0])).toBeLessThanOrEqual(12);
    }
    expect(clockLabel(3, 45)).toBe('Une horloge à aiguilles : la petite aiguille est entre le 3 et le 4, la grande aiguille est sur le 9.');
    expect(clockLabel(7, 0)).toContain('la petite aiguille est sur le 7, la grande aiguille est sur le 12');
    expect(clockArt(3, 45)).toContain('<svg');
  });

  it('la voix dit les unités et les heures en mots', () => {
    expect(sayMaths('3 m = ? cm')).toBe('3 mètres égale combien de centimètres ?');
    expect(sayMaths('De 9 h 45 à 11 h 10, il s\'écoule…')).toBe('De 9 heures 45 à 11 heures 10, il s\'écoule…');
    expect(sayMaths('1 h 15 min = ? min')).toBe('1 heure 15 minutes égale combien de minutes ?');
    expect(sayMaths('Le plus lourd : 1\u202f500 g ou 2 kg ?')).toBe('Le plus lourd : 1500 grammes ou 2 kilogrammes ?');
    const rng = seeded(8);
    for (const s of seriesOf('mes')) for (const f of factsOf(s)) {
      const q = generateQuestion({ series: s, fact: f, fmt: 'qcm', rng });
      expect(spoken(q), q.mes!.text).not.toMatch(/\d (km|mm|cm|m|kg|g|cL|mL|L|min|h|s)(?![\p{L}])|\u202f/u);
      expect(tipOf(q).length).toBeGreaterThan(10);
    }
  });

  it('clés « 3m12 » ; sessions de 10 questions', () => {
    expect(parseFact(factKey('mes', 3, 12))).toEqual({ op: 'mes', a: 3, b: 12 });
    const rng = seeded(6), base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-21' as const, rng };
    for (const s of seriesOf('mes')) {
      expect(seriesStepPlan({ ...base, series: s.id, stepIdx: 1 })).toHaveLength(10);
      expect(seriesBossPlan(s.id, rng)).toHaveLength(10);
    }
  });
});
