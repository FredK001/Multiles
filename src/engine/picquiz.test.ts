import { describe, expect, it } from 'vitest';
import { picArt } from '../art/pic';
import { GRD_SETS, moneySum } from '../content/grandeurs';
import { spoken, tipOf } from '../content/messages';
import { clockOf, hourText, moneyOf, picLabel, sayEuros, shapeOf, SIDES, type PicItem } from '../content/picquiz';
import { CURRICULUM, seriesOf } from '../content/series';
import { ESP_SETS } from '../content/space';
import { factKey, parseFact } from './keys';
import { seriesBossPlan, seriesStepPlan } from './plan';
import { picFactLabel } from './picquiz';
import { generateQuestion } from './questions';
import { seeded } from './random';
import { factsOf } from './series';

const ALL: readonly (readonly [string, PicItem])[] = [...GRD_SETS, ...ESP_SETS].flatMap((s) => s.items.map((it) => [s.id, it] as const));
const opts = (it: PicItem): string[] => [it.a, ...it.x];
const euroVal = (s: string): number => Number(s.replace(/\D/g, ''));

describe('grandeurs et espace (CP) : îles', () => {
  it('au CP, après les nombres : 4 îles chacune, deux ouvertes au départ', () => {
    expect(CURRICULUM.CP).toEqual(['add', 'sub', 'num', 'grd', 'esp', 'lec']);
    expect(seriesOf('grd').map((s) => s.id)).toEqual(['grd-pieces', 'grd-payer', 'grd-heure', 'grd-demie']);
    expect(seriesOf('esp').map((s) => s.id)).toEqual(['esp-formes', 'esp-cotes', 'esp-quadri', 'esp-position']);
    expect(seriesOf('grd').map((s) => s.need)).toEqual([0, 1, 0, 1]);
    expect(seriesOf('esp').map((s) => s.need)).toEqual([0, 1, 2, 0]);
  });

  it('clés « 3h5 » et « 2s4 » ; sessions de 10 questions, étapes non vides', () => {
    expect(parseFact(factKey('grd', 3, 5))).toEqual({ op: 'grd', a: 3, b: 5 });
    expect(parseFact(factKey('esp', 2, 14))).toEqual({ op: 'esp', a: 2, b: 14 });
    const rng = seeded(4), base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-22' as const, rng };
    for (const s of [...seriesOf('grd'), ...seriesOf('esp')]) {
      for (const step of [0, 1, 2]) expect(factsOf(s, step).length, `${s.id} étape ${step}`).toBeGreaterThan(0);
      expect(seriesStepPlan({ ...base, series: s.id, stepIdx: 0 })).toHaveLength(10);
      expect(seriesBossPlan(s.id, rng)).toHaveLength(10);
    }
  });
});

describe('grandeurs et espace (CP) : contenu', () => {
  it('trois réponses distinctes, une astuce, aucune question en double dans une île', () => {
    for (const set of [...GRD_SETS, ...ESP_SETS]) {
      const seen = new Set<string>();
      for (const it of set.items) {
        expect(new Set(opts(it)).size, `${set.id} ${it.q}`).toBe(3);
        expect(it.tip.length, `${set.id} ${it.q}`).toBeGreaterThan(10);
        const k = `${it.q}|${it.pic ?? ''}|${it.a}`;
        expect(seen.has(k), `doublon ${set.id} ${k}`).toBe(false);
        seen.add(k);
        if (it.pics) expect(new Set(opts(it).map(picLabel)).size, `${set.id} ${it.q} : dessins décrits pareil`).toBe(3);
        expect(it.pic || it.big || it.pics, `${set.id} ${it.q} : rien à montrer`).toBeTruthy();
      }
    }
  });

  it('chaque dessin se dessine et se décrit', () => {
    for (const [, it] of ALL) for (const code of [it.pic, ...(it.pics ? opts(it) : [])].filter((c): c is string => !!c)) {
      expect(picArt(code), code).toMatch(/^<svg/);
      expect(picLabel(code), code).not.toBe(code);
    }
  });

  it('monnaie : la bonne réponse est la somme dessinée, les intrus ne le sont pas ; 10 € puis 20 € au plus', () => {
    for (const [id, it] of ALL.filter(([id]) => id === 'pieces' || id === 'payer')) {
      const max = id === 'pieces' ? 10 : 20;
      if (it.pic) {
        expect(euroVal(it.a), it.pic).toBe(moneySum(it.pic));
        for (const x of it.x) expect(euroVal(x), `${it.pic} : ${x}`).not.toBe(moneySum(it.pic));
        expect(moneySum(it.pic)).toBeLessThanOrEqual(max);
      }
      if (it.pics && it.big && /^\d/.test(it.big) && moneyOf(it.a).length > 1) {
        expect(moneySum(it.a), it.q).toBe(euroVal(it.big));
        for (const x of it.x) expect(moneySum(x), `${it.q} : ${x}`).not.toBe(euroVal(it.big));
      }
      if (it.pics && moneyOf(it.a).length === 1 && it.big && /^\d/.test(it.big)) {
        expect(moneyOf(it.a)[0], it.q).toBe(euroVal(it.big));
        for (const x of it.x) expect(moneyOf(x)[0]).not.toBe(euroVal(it.big));
      }
    }
    const most = ALL.find(([, it]) => it.q === 'Touche ce qui vaut le plus.')![1];
    for (const x of most.x) expect(moneySum(most.a)).toBeGreaterThan(moneySum(x));
  });

  it("l'heure : la réponse lit les aiguilles dessinées ; les intrus ne sont jamais la bonne heure", () => {
    for (const [, it] of ALL.filter(([id]) => id === 'heure' || id === 'demie')) {
      if (it.pic?.startsWith('clock:')) {
        const { h, m } = clockOf(it.pic);
        expect(it.a).toBe(hourText(h, m === 30));
        expect(it.x).not.toContain(it.a);
      }
      if (it.pics) {
        const { h, m } = clockOf(it.a);
        expect(it.q).toContain(hourText(h));
        expect(m).toBe(0);
        for (const x of it.x) expect(x).not.toBe(it.a);
      }
    }
    expect(hourText(1)).toBe('1 heure');
    expect(hourText(7, true)).toBe('7 heures et demie');
  });

  it('formes : un carré est aussi un rectangle, jamais les deux quand l’un est la réponse', () => {
    for (const [id, it] of ALL.filter(([id]) => id === 'formes' || id === 'cotes')) {
      if (it.pics) {
        if (shapeOf(it.a).k === 'rectangle') for (const x of it.x) expect(shapeOf(x).k, `${id} ${it.q}`).not.toBe('carre');
      } else {
        if (it.a === 'un carré') expect(it.x).not.toContain('un rectangle');
        if (it.a === 'un rectangle') expect(it.pic && shapeOf(it.pic).k).toBe('rectangle');
      }
      // Compter : la réponse est le nombre de côtés (ou de coins) de la forme dessinée.
      if (id === 'cotes' && it.pic) {
        expect(Number(it.a), it.q).toBe(SIDES[shapeOf(it.pic).k]);
        for (const x of it.x) expect(Number(x)).not.toBe(SIDES[shapeOf(it.pic).k]);
      }
      if (id === 'formes' && it.pic) expect(it.alt, 'la description ne donne pas le nom').toBeTruthy();
    }
  });

  it("quadrillage : la réponse est la case de l'étoile, les 16 cases sont travaillées", () => {
    const items = ESP_SETS[2]!.items;
    expect(new Set(items.map((it) => it.a)).size).toBe(16);
    for (const it of items) {
      expect(it.pic).toBe(`grid:${it.a}`);
      for (const x of it.x) expect(x).toMatch(/^[A-D][1-4]$/);
    }
  });

  it('position : jamais « dans » et « derrière » ensemble ; la phrase et le dessin vont ensemble', () => {
    for (const it of ESP_SETS[3]!.items) {
      const o = opts(it).map((v) => (it.pics ? picLabel(v) : v)).join(' | ');
      expect(o.includes('dans la boîte') && o.includes('derrière la boîte'), o).toBe(false);
      if (it.pic) expect(picLabel(it.pic)).toBe(`Le chat est ${it.a}.`);
      if (it.pics) expect(it.q).toContain(picLabel(it.a).replace(/^Le chat est /, '').replace(/\.$/, ''));
    }
  });
});

describe('grandeurs et espace (CP) : questions', () => {
  it('toutes valides ; la voix lit la consigne et les réponses écrites, les euros en toutes lettres', () => {
    const rng = seeded(2);
    for (const s of [...seriesOf('grd'), ...seriesOf('esp')]) for (const f of factsOf(s)) {
      const q = generateQuestion({ series: s, fact: f, fmt: 'pave', rng });
      expect(q.fmt).toBe('qcm');
      expect(q.picq!.options[q.p]).toBe((s.op === 'grd' ? GRD_SETS : ESP_SETS)[f.a - 1]!.items[f.b - 1]!.a);
      const say = spoken(q);
      expect(say).not.toContain('€');
      if (!q.picq!.pics) for (const o of q.picq!.options) expect(say.toLowerCase()).toContain(sayEuros(o).toLowerCase());
      expect(tipOf(q)).toBe(q.picq!.tip);
    }
  });

  it('exemples lus et espace parent', () => {
    const q = generateQuestion({ series: 'esp-position', fact: { a: 4, b: 1 }, fmt: 'qcm', rng: seeded(1) });
    expect(spoken(q)).toMatch(/^Où est le chat \? .+, .+ ou .+ \?$/);
    expect(sayEuros('Combien font 2 € et 1 € ?')).toBe('Combien font 2 euros et 1 euro ?');
    expect(picFactLabel('grd', 1, 1)).toEqual({ q: 'Touche la pièce de 1 €.', a: 'La pièce de 1 €' });
    expect(picLabel('money:10,2,2')).toBe('Un billet de 10 € et deux pièces de 2 €');
    expect(picLabel('clock:7:30')).toBe('Une horloge : la petite aiguille est entre le 7 et le 8, la grande aiguille est sur le 6.');
  });
});
