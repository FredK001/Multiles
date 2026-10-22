import { describe, expect, it } from 'vitest';
import { ALL_QUIZZES, fillBlank, QUIZZES } from '../content/french';
import { spoken, tipOf } from '../content/messages';
import { SERIES, seriesOf } from '../content/series';
import { frAnswer, frFactLabel } from './french';
import { factKey, parseFact, sameFact } from './keys';
import { generateQuestion } from './questions';
import { seriesBossPlan, seriesStepPlan } from './plan';
import { seeded } from './random';
import { factsOf } from './series';

describe('français : les homophones', () => {
  it('4 îles, a/à et et/est ouvertes au départ', () => {
    expect(seriesOf('fr').slice(0, 4).map((s) => s.id)).toEqual(['fr-a', 'fr-et', 'fr-son', 'fr-on']);
    expect(seriesOf('fr').slice(0, 4).map((s) => s.need)).toEqual([0, 0, 1, 2]);
  });

  it('contenu : chaque phrase a un trou et sa réponse fait partie de la paire, les deux mots sont bien représentés', () => {
    for (const q of QUIZZES) {
      for (const it of q.items) {
        expect(it.s, it.s).toContain('___');
        expect(q.choices, it.s).toContain(it.a);
      }
      for (const w of q.choices) expect(q.items.filter((x) => x.a === w).length, `${q.id}/${w}`).toBeGreaterThanOrEqual(8);
      expect(new Set(q.items.map((x) => x.s)).size).toBe(q.items.length);
    }
  });

  it('étapes : deux moitiés sans recouvrement', () => {
    const all = factsOf('fr-a'), e1 = factsOf('fr-a', 0), e2 = factsOf('fr-a', 1);
    expect(e1.length + e2.length).toBe(all.length);
  });

  it('question : la phrase à trou, les deux mots, la bonne réponse et l’astuce', () => {
    const q = generateQuestion({ series: 'fr-a', fact: { a: 1, b: 2 }, fmt: 'pave', rng: seeded(1) });
    expect(q.fmt).toBe('qcm');
    expect(q.fr?.options).toEqual(['a', 'à']);
    expect(q.p).toBe(1);
    expect(frAnswer(q)).toBe('Nous allons à la piscine.');
    expect(spoken(q)).toBe('Nous allons … la piscine.');
    expect(tipOf(q)).toContain('« Nous allons avait la piscine », ça ne va pas.');
    const q2 = generateQuestion({ series: 'fr-on', fact: { a: 4, b: 1 }, fmt: 'qcm' });
    expect(tipOf(q2)).toContain('Ici : « Il va au parc ».');
    expect(fillBlank('Quand ___ a froid, ___ met un pull.', 'on')).toBe('Quand on a froid, on met un pull.');
  });

  it('clés « 1f2 », jamais confondues ; libellé pour les parents', () => {
    expect(factKey('fr', 1, 2)).toBe('1f2');
    expect(parseFact('3f12')).toEqual({ op: 'fr', a: 3, b: 12 });
    expect(sameFact('1f2', '2f1')).toBe(false);
    expect(frFactLabel(1, 1)).toEqual({ text: 'Léo a un vélo rouge.', pair: 'a ou à' });
  });

  it('sessions : 10 questions de la paire', () => {
    const rng = seeded(5), base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-21' as const, rng };
    for (const s of seriesOf('fr')) {
      expect(seriesStepPlan({ ...base, series: s.id, stepIdx: 0 }).every((q) => q.series === s.id && q.fr)).toBe(true);
      expect(seriesBossPlan(s.id, rng)).toHaveLength(10);
    }
    expect(SERIES['fr-son'].title).toBe('son ou sont');
  });
});

describe('français : la conjugaison', () => {
  it('4 îles de plus après les homophones, le présent ouvert au départ', () => {
    // Puis les 4 îles de grammaire (grammar.test.ts).
    expect(seriesOf('fr').map((s) => s.id)).toEqual(['fr-a', 'fr-et', 'fr-son', 'fr-on', 'fr-pres', 'fr-fut', 'fr-imp', 'fr-pc', 'fr-nat', 'fr-sv', 'fr-gn', 'fr-inv']);
    expect(seriesOf('fr').slice(4, 8).map((s) => s.need)).toEqual([0, 1, 2, 3]);
  });

  it('chaque phrase propose 3 formes distinctes du même verbe, dont la bonne', () => {
    for (const q of ALL_QUIZZES.filter((x) => x.tense)) for (const it of q.items) {
      expect(it.opts, it.s).toHaveLength(3);
      expect(new Set(it.opts).size).toBe(3);
      expect(it.opts).toContain(it.a);
      expect(q.tense!.tables[it.verb!]![it.who!]).toBe(it.a);
    }
  });

  it('« je » s’élide devant une voyelle', () => {
    expect(fillBlank('Hier, je ___ une chanson.', 'ai chanté')).toBe("Hier, j'ai chanté une chanson.");
    expect(fillBlank('Autrefois, je ___ en CM1.', 'étais')).toBe("Autrefois, j'étais en CM1.");
    expect(fillBlank("Aujourd'hui, je ___ une chanson.", 'chante')).toBe("Aujourd'hui, je chante une chanson.");
  });

  it('question : 3 boutons mélangés, le verbe, l’astuce du temps', () => {
    const rng = seeded(4);
    for (const s of ['fr-pres', 'fr-fut', 'fr-imp', 'fr-pc'] as const) for (const f of factsOf(s)) {
      const q = generateQuestion({ series: s, fact: f, fmt: 'qcm', rng });
      expect(q.fr!.options).toHaveLength(3);
      expect(q.fr!.verb).toBeTruthy();
    }
    const q = generateQuestion({ series: 'fr-fut', fact: { a: 6, b: 4 }, fmt: 'qcm', rng });
    expect(frAnswer(q)).toBe('Demain, nous finirons nos devoirs.');
    expect(tipOf(q)).toContain('Ici : nous finirons (finir).');
    expect(spoken(q)).toBe('Demain, nous … nos devoirs. Verbe finir.');
  });
});
