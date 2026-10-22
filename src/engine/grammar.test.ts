import { describe, expect, it } from 'vitest';
import { ALL_QUIZZES, fillBlank, itemText } from '../content/french';
import { GRAMMAR } from '../content/grammar';
import { lookOf } from '../content/isles';
import { spoken, tipOf } from '../content/messages';
import { SERIES, seriesOf } from '../content/series';
import { frAnswer, frFactLabel } from './french';
import { factKey, parseFact } from './keys';
import { generateQuestion } from './questions';
import { seriesBossPlan, seriesStepPlan } from './plan';
import { seeded } from './random';
import { factsOf } from './series';

const NATURES = ['nom', 'verbe', 'adjectif', 'déterminant', 'pronom'];

describe('français : grammaire et accords (CM1)', () => {
  it('4 îles ajoutées à la fin : les clés des 8 îles existantes ne bougent pas', () => {
    expect(ALL_QUIZZES.slice(0, 8).map((q) => q.id)).toEqual(['a', 'et', 'son', 'on', 'pres', 'fut', 'imp', 'pc']);
    expect(seriesOf('fr').slice(8).map((s) => s.id)).toEqual(['fr-nat', 'fr-sv', 'fr-gn', 'fr-inv']);
    expect(seriesOf('fr').slice(8).map((s) => s.need)).toEqual([1, 2, 3, 2]);
    expect(parseFact(factKey('fr', 9, 3))).toEqual({ op: 'fr', a: 9, b: 3 });
    expect(frFactLabel(9, 1)).toEqual({ text: 'Le chat dort sur le canapé. (chat : nom)', pair: 'La nature des mots' });
  });

  it('contenu : un seul trou, 2 ou 3 réponses distinctes dont la bonne, pas de phrase en double, une astuce', () => {
    for (const q of GRAMMAR) {
      expect(q.grammar?.rule, q.id).toBeTruthy();
      expect(q.grammar!.lesson.length).toBeGreaterThan(1);
      expect(q.items.length, q.id).toBeGreaterThanOrEqual(20);
      expect(new Set(q.items.map((x) => x.s)).size, q.id).toBe(q.items.length);
      for (const it of q.items) {
        expect(it.s.split('___').length, it.s).toBe(2);
        expect(it.opts!.length, it.s).toBeGreaterThanOrEqual(2);
        expect(it.opts!.length, it.s).toBeLessThanOrEqual(3);
        expect(new Set(it.opts).size, it.s).toBe(it.opts!.length);
        expect(it.opts, it.s).toContain(it.a);
        expect(it.tip, it.s).toBeTruthy();
        expect(fillBlank(it.s, it.w ?? it.a)).not.toMatch(/ {2}|___/);
      }
    }
  });

  it('nature des mots : le mot étudié, une nature parmi cinq, les cinq natures représentées', () => {
    const nat = GRAMMAR[0]!;
    for (const it of nat.items) {
      expect(it.w, it.s).toBeTruthy();
      for (const o of it.opts!) expect(NATURES).toContain(o);
    }
    for (const n of NATURES) expect(nat.items.filter((x) => x.a === n).length, n).toBeGreaterThanOrEqual(3);
    // Étape 1 : seulement nom, verbe, adjectif.
    expect(factsOf('fr-nat', 0).every((f) => ['nom', 'verbe', 'adjectif'].includes(nat.items[f.b - 1]!.a))).toBe(true);
  });

  it('sujet-verbe : l’infinitif est donné ; accords du nom : le mot de départ est donné', () => {
    for (const it of GRAMMAR[1]!.items) expect(it.verb, it.s).toBeTruthy();
    for (const it of GRAMMAR[2]!.items) expect(it.cue?.[1], it.s).toBeTruthy();
    // Mots invariables : les intrus ne sont jamais la bonne orthographe.
    for (const it of GRAMMAR[3]!.items) for (const x of it.opts!) if (x !== it.a) expect(x).not.toBe(it.a);
  });

  it('questions : réponses mélangées, énoncé lu, astuce et phrase juste', () => {
    const rng = seeded(8);
    for (const s of seriesOf('fr').slice(8)) for (const f of factsOf(s)) {
      const q = generateQuestion({ series: s, fact: f, fmt: 'qcm', rng });
      expect(q.fr!.gram).toBe(true);
      expect(tipOf(q)).toBeTruthy();
      expect(spoken(q)).not.toContain('___');
    }
    const n = generateQuestion({ series: 'fr-nat', fact: { a: 9, b: 1 }, fmt: 'qcm', rng });
    expect(n.fr!.focus).toBe('chat');
    expect(frAnswer(n)).toBe('« chat » est un nom.');
    expect(spoken(n)).toBe('Le chat dort sur le canapé. Quelle est la nature du mot « chat » ?');
    const v = generateQuestion({ series: 'fr-sv', fact: { a: 10, b: 13 }, fmt: 'qcm', rng });
    expect(frAnswer(v)).toBe('Les enfants de ma classe jouent au foot.');
    expect(tipOf(v)).toContain('ils jouent');
    const g = generateQuestion({ series: 'fr-gn', fact: { a: 11, b: 1 }, fmt: 'qcm', rng });
    expect(spoken(g)).toBe('Léa a acheté des robes …. Adjectif « vert ».');
    expect(frAnswer(g)).toBe('Léa a acheté des robes vertes.');
    const i = generateQuestion({ series: 'fr-inv', fact: { a: 12, b: 1 }, fmt: 'qcm', rng });
    expect(tipOf(i)).toContain('b-e-a-u-c-o-u-p');
    expect(itemText(GRAMMAR[3]!.items[0]!)).toBe('Il y a beaucoup de monde au marché.');
  });

  it('îles habillées ; sessions de 10 questions', () => {
    expect(seriesOf('fr').slice(8).map((s) => lookOf(s.id).name)).toEqual(['Atelier', 'Kiosque', 'Mercerie', 'Menhir']);
    expect(SERIES['fr-inv'].title).toBe('Les mots invariables');
    const rng = seeded(2), base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-21' as const, rng };
    for (const s of seriesOf('fr').slice(8)) {
      expect(seriesStepPlan({ ...base, series: s.id, stepIdx: 1 })).toHaveLength(10);
      expect(seriesBossPlan(s.id, rng)).toHaveLength(10);
    }
  });
});
