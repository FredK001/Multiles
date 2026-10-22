import { describe, expect, it } from 'vitest';
import { kindOf, READ_SETS } from '../content/reading';
import { spoken, tipOf } from '../content/messages';
import { CURRICULUM, seriesOf } from '../content/series';
import { factKey, parseFact } from './keys';
import { generateQuestion, withoutListening } from './questions';
import { seriesBossPlan, seriesStepPlan } from './plan';
import { seeded } from './random';
import { factsOf } from './series';

describe('lecture au CP', () => {
  it('proposée au CP, 9 îles (phrases et dictée ajoutées à la fin), voyelles et premières syllabes ouvertes au départ', () => {
    expect(CURRICULUM.CP).toEqual(['add', 'sub', 'num', 'grd', 'esp', 'lec']);
    expect(seriesOf('lec').map((s) => s.id)).toEqual(['lec-voy', 'lec-syl1', 'lec-syl2', 'lec-sons', 'lec-mots', 'lec-phr1', 'lec-dict1', 'lec-phr2', 'lec-dict2']);
    expect(seriesOf('lec').map((s) => s.need)).toEqual([0, 0, 1, 2, 3, 4, 4, 5, 6]);
  });

  it('contenu : trois écritures distinctes par élément, jamais deux fois le même élément dans une île', () => {
    for (const s of READ_SETS) {
      if (kindOf(s) === 'son') for (const it of s.items) expect(new Set([it.w, ...it.x]).size, `${s.id}/${it.w}`).toBe(3);
      expect(new Set(s.items.map((x) => x.w)).size, s.id).toBe(s.items.length);
    }
  });

  it('écoute : trois écritures, la bonne au bon indice ; sans voix, « trouve la même »', () => {
    const rng = seeded(2);
    for (const s of seriesOf('lec').slice(0, 5)) for (const f of factsOf(s)) {
      const q = generateQuestion({ series: s, fact: f, fmt: 'ecoute', rng });
      expect(q.fmt).toBe('ecoute');
      expect(q.read!.options[q.p]).toBe(q.read!.target);
      const v = withoutListening(q, rng);
      expect(v.fmt).toBe('qcm');
      expect(spoken(v)).toBe(`Trouve : ${v.read!.target}.`);
    }
  });

  it('astuce : b et d, syllabe à l’envers, et le cas général', () => {
    const q = (set: number, b: number) => generateQuestion({ series: seriesOf('lec')[set - 1]!, fact: { a: set, b }, fmt: 'ecoute', rng: seeded(1) });
    expect(tipOf(q(3, 7))).toContain('le ventre du b est à droite'); // da / ba / ad
    expect(tipOf(q(2, 1))).toContain('On lit de gauche à droite : l puis a'); // la / al / le
    expect(tipOf(q(1, 1))).toContain('On entend « a »');
  });

  it('clés « 2l5 » ; sessions de 10 questions', () => {
    expect(factKey('lec', 2, 5)).toBe('2l5');
    expect(parseFact('2l5')).toEqual({ op: 'lec', a: 2, b: 5 });
    const rng = seeded(9), base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-21' as const, rng };
    for (const s of seriesOf('lec')) {
      // Le format suit l'île : écoute (sons), qcm (phrases à lire), dictée.
      const fmt = { son: 'ecoute', phrase: 'qcm', dictee: 'dictee' }[kindOf(READ_SETS[s.spec.kind === 'read' ? s.spec.n - 1 : 0]!)];
      expect(seriesStepPlan({ ...base, series: s.id, stepIdx: 0 }).every((x) => x.op === 'lec' && x.fmt === fmt)).toBe(true);
      expect(seriesBossPlan(s.id, rng)).toHaveLength(10);
    }
  });
});
