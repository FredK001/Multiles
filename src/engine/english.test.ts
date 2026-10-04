import { describe, expect, it } from 'vitest';
import { fillDrill, NUMBERS, THEMES, themeOf } from '../content/english';
import { CURRICULUM, DRILL_BASE, SERIES, seriesOf, type SeriesId } from '../content/series';
import { engAnswer } from './english';
import { canonKey, factKey, parseFact, sameFact } from './keys';
import { buildTrapsPlan, nextTimedQuestion, seriesBossPlan, seriesStepPlan } from './plan';
import { assertValid, ENG_CHRONO_ORDER, ENG_ORDER, generateQuestion, isCorrect, remakeQ, withoutListening, type Question } from './questions';
import { seeded } from './random';
import { factsOf, isDrill } from './series';
import { openSeries } from './unlock';
import { migrate } from '../store/migrations';
import { SCHEMA_VERSION } from '../store/schema';
import { engPrompt, MSG_ENG, tipOf } from '../content/messages';

const ENG = seriesOf('eng').map((s) => s.id);
const today = '2026-10-04';
const plan = (series: SeriesId, stepIdx: number, seed: number) =>
  seriesStepPlan({ series, stepIdx, traps: [], trapLog: {}, mastered: [], today, rng: seeded(seed) });

/** Toutes les questions d'anglais : chaque mot et chaque phrase, dans chaque format, plusieurs tirages. */
function* everything(seeds = 6): Generator<Question> {
  for (const id of ENG)
    for (const fact of factsOf(id))
      for (const fmt of ['qcm', 'ecoute', 'vf'] as const)
        for (let s = 1; s <= seeds; s++) yield generateQuestion({ series: id, fact, fmt, rng: seeded(s * 7919 + fact.a * 31 + fact.b) });
}

describe('séries d’anglais', () => {
  it('une série par thème, dans l’ordre des fiches ; proposée au CM1 après les tables', () => {
    expect(ENG).toEqual(THEMES.map((t) => `eng-${t.id}`));
    expect(CURRICULUM.CM1).toEqual(['mul', 'eng']);
  });
  it('mots puis phrases : étapes 1-2 = les deux moitiés des mots, étape 3 et gardien = mots + phrases', () => {
    for (const id of ENG) {
      const t = themeOf(id.slice(4) as never), s = SERIES[id];
      expect(factsOf(id)).toHaveLength(t.words.length + t.drills.length);
      expect(factsOf(id, 0).every((f) => !isDrill(f) && f.b <= Math.ceil(t.words.length / 2))).toBe(true);
      expect(factsOf(id, 1).every((f) => !isDrill(f))).toBe(true);
      expect(factsOf(id).filter(isDrill).map((f) => f.b)).toEqual(t.drills.map((_, i) => DRILL_BASE + i + 1));
      const n = s.spec.kind === 'theme' ? s.spec.n : -1;
      expect(factsOf(id).every((f) => f.a === n)).toBe(true);
    }
  });
  it('ouverture : Hello, School, Toys au départ, puis une île de plus par trophée', () => {
    expect(openSeries({}, 'eng')).toEqual(['eng-hello', 'eng-school', 'eng-toys']);
    expect(openSeries({ 'eng-hello': { steps: 3, trophy: true, stepStars: [3, 3, 3] } }, 'eng')).toContain('eng-family');
    expect(SERIES['eng-classroom'].need).toBe(15);
  });
});

describe('clés de l’anglais', () => {
  it('« 4e12 » : thème 4, mot 12 ; jamais confondue avec « 12e4 »', () => {
    expect(factKey('eng', 4, 12)).toBe('4e12');
    expect(parseFact('4e12')).toEqual({ op: 'eng', a: 4, b: 12 });
    expect(parseFact('4e57')).toEqual({ op: 'eng', a: 4, b: 57 });
    expect(sameFact('4e12', '12e4')).toBe(false);
    expect(canonKey('12e4')).toBe('12e4');
  });
});

describe('questions d’anglais', () => {
  it('toutes valides (propositions distinctes, bonne réponse présente)', () => {
    let n = 0;
    for (const q of everything()) {
      expect(() => assertValid(q)).not.toThrow();
      n++;
    }
    expect(n).toBeGreaterThan(4000);
  });

  it('mot, dessin → mot : le dessin est le mot attendu, la bonne proposition aussi', () => {
    for (const q of everything(3)) {
      if (isDrill(q) || q.fmt !== 'qcm') continue;
      expect(q.eng!.pic).toBe(q.b - 1);
      expect(q.eng!.options[q.p]!.word).toBe(q.b - 1);
      expect(q.eng!.options).toHaveLength(3);
      expect(isCorrect(q, q.p)).toBe(true);
      expect(isCorrect(q, (q.p + 1) % 3)).toBe(false);
    }
  });

  it('mot, écoute → dessin : rien n’est dessiné dans la consigne, la voix dit le mot attendu', () => {
    for (const q of everything(3)) {
      if (isDrill(q) || q.fmt !== 'ecoute') continue;
      const w = themeOf(q.eng!.theme).words[q.b - 1]!;
      expect(q.eng!.pic).toBeNull();
      expect(q.eng!.say).toBe(w.en);
      expect(q.eng!.options[q.p]!.word).toBe(q.b - 1);
    }
  });

  it('mot, vrai/faux : juste si et seulement si le mot montré est celui du dessin', () => {
    let yes = 0, no = 0;
    for (const q of everything(3)) {
      if (isDrill(q) || q.fmt !== 'vf') continue;
      expect(q.eng!.options[0]!.word === q.eng!.pic).toBe(q.truth);
      expect(engAnswer(q)).toBe(themeOf(q.eng!.theme).words[q.b - 1]!.en);
      if (q.truth) yes++; else no++;
    }
    expect(yes).toBeGreaterThan(100);
    expect(no).toBeGreaterThan(100);
  });

  it('phrases : toujours un choix ; oui/non cohérent avec le dessin, le visage ou le geste', () => {
    for (const q of everything(4)) {
      if (!isDrill(q)) continue;
      const t = themeOf(q.eng!.theme), d = t.drills[q.b - DRILL_BASE - 1]!, e = q.eng!;
      expect(q.fmt).toBe('qcm');
      if (d.kind === 'yesno') {
        expect(e.options.map((o) => o.text)).toEqual([d.yes, d.no]);
        const yes = q.p === 0;
        if (d.cue === 'match') expect(e.text === fillDrill(d.q, t.words[e.pic!]!)).toBe(yes);
        if (d.cue === 'like') expect(e.cue).toBe(yes ? 'like' : 'dislike');
        if (d.cue === 'can') expect(e.cue).toBe(yes ? 'can' : 'cant');
      }
      if (d.kind === 'count') expect(e.options[q.p]!.text).toContain(` ${NUMBERS[e.count! - 1]} `);
      if (d.kind === 'pick') expect(e.options[q.p]!.text).toBe(fillDrill(d.a, t.words[e.pic!]!));
      if (d.kind === 'qa') {
        expect(e.options[q.p]!.text).toBe(d.a);
        expect(e.text).toBe(d.q);
        expect(e.options).toHaveLength(3);
      }
    }
  });

  it('une question ratée revient avec le même mot ou la même phrase', () => {
    const q = generateQuestion({ series: 'eng-animals', fact: { a: 9, b: 3 }, fmt: 'qcm', rng: seeded(1) });
    const r = remakeQ(q, seeded(2));
    expect([r.a, r.b, r.fmt]).toEqual([q.a, q.b, q.fmt]);
    expect(engAnswer(r)).toBe(engAnswer(q));
  });
});

describe('sessions d’anglais', () => {
  it('étapes 1 et 2 : 10 mots de la bonne moitié, formats en rotation qcm, écoute, vrai/faux, écoute', () => {
    for (const id of ENG)
      for (const step of [0, 1])
        for (let s = 1; s <= 5; s++) {
          const qs = plan(id, step, s), half = factsOf(id, step).map((f) => f.b);
          expect(qs).toHaveLength(10);
          expect(qs.every((q) => half.includes(q.b))).toBe(true);
          expect(qs.map((q) => q.fmt)).toEqual(qs.map((_, i) => ENG_ORDER[i % 4]));
        }
  });
  it('étape 3 et gardien : 5 mots et 5 phrases', () => {
    for (const id of ENG) {
      let drills = 0, total = 0;
      for (let s = 1; s <= 30; s++)
        for (const q of [...plan(id, 2, s), ...seriesBossPlan(id, seeded(100 + s))]) {
          total++;
          if (isDrill(q)) drills++;
        }
      expect(drills / total, id).toBe(0.5);
    }
  });
  it('chrono : questions sans fin, jamais deux fois la même de suite', () => {
    let prev: Question | null = null;
    for (let i = 0; i < 40; i++) {
      const q = nextTimedQuestion('eng-food', prev, i, seeded(i));
      if (prev) expect(`${q.a},${q.b}`).not.toBe(`${prev.a},${prev.b}`);
      if (!isDrill(q)) expect(q.fmt).toBe(ENG_CHRONO_ORDER[i % 5]);
      prev = q;
    }
  });
  it('session Pièges avec des mots et des phrases ratés', () => {
    const qs = buildTrapsPlan(['9e3', '9e51', '2e4'], seeded(3));
    expect(qs).toHaveLength(10);
    expect(qs.every((q) => q.op === 'eng')).toBe(true);
    expect(new Set(qs.map((q) => q.series))).toEqual(new Set(['eng-animals', 'eng-school']));
  });
});

describe('sauvegarde de l’anglais', () => {
  it('la progression d’anglais passe la relecture des données (sans changement de schéma)', () => {
    const eng = {
      current: 'eng-animals',
      series: { 'eng-hello': { steps: 3, trophy: true, stepStars: [3, 2, 3] }, 'mul-7': { steps: 1, trophy: false, stepStars: [3, 0, 0] } },
      mastered: ['1e3', '1e52', '9e2', '7x8', '1e99'],
      traps: ['9e4'],
      trapLog: { '9e4': ['2026-10-04'] },
      records: { 'eng-hello': 7 },
      stickers: ['eng-hello-gardien', 'mul-7-lieu'],
      defiDay: null,
      defiPick: { day: '2026-10-04', series: 'eng-school' },
    };
    const d = migrate({ version: SCHEMA_VERSION, profiles: [{ id: 'k', name: 'Léo', grade: 'CM1', op: 'mul', prog: { eng } }] });
    const o = d.profiles[0]!.prog.eng!;
    expect(o.current).toBe('eng-animals');
    expect(Object.keys(o.series)).toEqual(['eng-hello']);
    expect(o.mastered).toEqual(['1e3', '1e52', '9e2']);
    expect(o.traps).toEqual(['9e4']);
    expect(o.stickers).toEqual(['eng-hello-gardien']);
    expect(o.defiPick?.series).toBe('eng-school');
  });
});

describe('sans voix anglaise', () => {
  it('une question d’écoute devient dessin → mot sur le même mot ; les autres ne changent pas', () => {
    for (let s = 1; s <= 20; s++) {
      const q = { ...generateQuestion({ series: 'eng-farm', fact: { a: 17, b: 1 + (s % 9) }, fmt: 'ecoute', rng: seeded(s) }), retry: true };
      const r = withoutListening(q, seeded(s + 1));
      expect(r.fmt).toBe('qcm');
      expect([r.a, r.b, r.retry]).toEqual([q.a, q.b, true]);
      expect(r.eng!.pic).toBe(q.b - 1);
      expect(() => assertValid(r)).not.toThrow();
    }
    const v = generateQuestion({ series: 'eng-farm', fact: { a: 17, b: 2 }, fmt: 'vf', rng: seeded(1) });
    expect(withoutListening(v)).toBe(v);
  });
});

describe('consignes et aides de l’anglais', () => {
  it('consigne selon le format ; l’aide d’un mot donne son sens, celle d’une phrase ne répète pas la réponse', () => {
    const word = generateQuestion({ series: 'eng-food', fact: { a: 7, b: 1 }, fmt: 'qcm', rng: seeded(1) });
    expect(engPrompt(word)).toBe(MSG_ENG.word);
    expect(tipOf(word)).toBe('« apple » veut dire « pomme ».');
    expect(engPrompt({ ...word, fmt: 'ecoute' })).toBe(MSG_ENG.ecoute);
    const say = generateQuestion({ series: 'eng-food', fact: { a: 7, b: 53 }, fmt: 'qcm', rng: seeded(1) });
    expect(engPrompt(say)).toBe(MSG_ENG.dire);
    for (let s = 1; s <= 30; s++)
      for (const b of factsOf('eng-food').filter(isDrill).map((f) => f.b)) {
        const q = generateQuestion({ series: 'eng-food', fact: { a: 7, b }, fmt: 'qcm', rng: seeded(s) });
        expect(tipOf(q)).not.toContain(engAnswer(q));
      }
  });
});
