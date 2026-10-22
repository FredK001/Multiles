import { describe, expect, it } from 'vitest';
import { readPicBody } from '../art/reading';
import { lookOf } from '../content/isles';
import { lecPrompts, spoken, tipOf } from '../content/messages';
import { dictKeys, kindOf, PICS, READ_SETS, type PicId, type ReadSet } from '../content/reading';
import { SERIES, seriesOf } from '../content/series';
import { assertValid, generateQuestion, withoutListening } from './questions';
import { seeded } from './random';
import { dictMax, dictOk, dictType } from './reading';
import { factsOf } from './series';

const phraseSets = READ_SETS.filter((s) => kindOf(s) === 'phrase');
const dictSets = READ_SETS.filter((s) => kindOf(s) === 'dictee');
/** Mots d'une phrase, en minuscules (« J'ai » → « j », « ai »). */
const words = (t: string): string[] => t.toLowerCase().split(/[^a-zàâçéèêëîïôûùüÿœ]+/).filter(Boolean);
const seriesOfSet = (s: ReadSet) => SERIES[`lec-${s.id}`];

describe('lecture au CP : phrases à lire', () => {
  it('deux îles, des phrases de 3-4 mots puis de 5-6 mots, avec majuscule et point', () => {
    expect(phraseSets.map((s) => s.id)).toEqual(['phr1', 'phr2']);
    const span = { phr1: [3, 4], phr2: [5, 6] } as const;
    for (const s of phraseSets) {
      expect(new Set(s.items.map((x) => x.w)).size, s.id).toBe(s.items.length);
      for (const it of s.items) {
        const n = it.w.split(' ').length, [lo, hi] = span[s.id as 'phr1' | 'phr2'];
        expect(n >= lo && n <= hi, `${it.w} : ${n} mots`).toBe(true);
        expect(it.w, it.w).toMatch(/^[A-Z].*\.$/);
      }
    }
  });

  it('phrase ↔ dessin : tout ce que montre le bon dessin est écrit ; chaque intrus montre au moins une chose qui ne l’est pas', () => {
    for (const s of phraseSets) for (const it of s.items) {
      const w = new Set(words(it.w)), pics = [it.pic!, ...it.x] as PicId[];
      expect(new Set(pics).size, it.w).toBe(3);
      for (const k of PICS[it.pic!].keys) expect(w.has(k), `${it.w} : « ${k} »`).toBe(true);
      for (const x of it.x as PicId[]) expect(PICS[x].keys.some((k) => !w.has(k)), `${it.w} : intrus ${x}`).toBe(true);
    }
  });

  it('chaque dessin existe, est un SVG bien formé et sert au moins une fois', () => {
    const used = new Set(READ_SETS.flatMap((s) => s.items.flatMap((it) => (it.pic ? [it.pic, ...(kindOf(s) === 'phrase' ? it.x : [])] : []))));
    for (const id of Object.keys(PICS) as PicId[]) {
      const b = readPicBody(id);
      expect(b.length, id).toBeGreaterThan(20);
      expect(b, id).not.toMatch(/NaN|undefined/);
      expect((b.match(/</g) ?? []).length, id).toBe((b.match(/>/g) ?? []).length);
      expect(used.has(id), `${id} inutilisé`).toBe(true);
    }
    // Couleurs : le vélo bleu n'est plus rouge, l'oiseau rouge n'est plus bleu.
    expect(readPicBody('velo-bleu')).not.toContain('#D62828');
    expect(readPicBody('oiseau-rouge')).not.toContain('#2F6FE4');
  });

  it('question : la phrase est écrite, trois dessins, le bon au bon indice ; sans voix, rien ne change', () => {
    const rng = seeded(4);
    for (const s of phraseSets) for (const f of factsOf(seriesOfSet(s))) {
      const q = generateQuestion({ series: seriesOfSet(s), fact: f, fmt: 'ecoute', rng });
      expect(q.fmt).toBe('qcm');
      expect(q.read!.kind).toBe('phrase');
      expect(q.read!.options[q.p]).toBe(q.read!.pic);
      expect(q.choices).toEqual([0, 1, 2]);
      expect(withoutListening(q, rng)).toBe(q);
      // La voix ne lit jamais la phrase : ni l'énoncé, ni la consigne.
      expect(spoken(q)).not.toContain(q.read!.target);
      expect(lecPrompts(q).join(' ')).not.toContain(q.read!.target);
    }
  });

  it('astuce : relire, et les mots qui départagent les dessins', () => {
    const s = seriesOf('lec').find((x) => x.id === 'lec-phr1')!;
    const tip = tipOf(generateQuestion({ series: s, fact: { a: 6, b: 1 }, fmt: 'qcm', rng: seeded(1) }));
    expect(tip).toContain('Le chat dort.');
    expect(tip).toContain('Les mots « chat » et « dort »');
    expect(tip).toContain('un chat qui dort en boule');
    const tip2 = tipOf(generateQuestion({ series: s, fact: { a: 6, b: 2 }, fmt: 'qcm', rng: seeded(1) }));
    expect(tip2).toContain('« vélo » et « rouge »');
  });
});

describe('lecture au CP : dictée de mots', () => {
  /** Mots qui se prononcent comme un mot dicté : ils ne doivent pas pouvoir s'écrire avec son clavier. */
  const HOMOPHONES: Record<string, readonly string[]> = { lit: ['lis', 'lie'], chat: ['chas'], vélo: ['vélos'], lune: ['lunes'] };
  /** Le mot peut-il s'écrire au clavier (lettres présentes, pas plus de cases que le mot dicté) ? */
  const spellable = (w: string, keys: readonly string[], max = 6) => w.length <= max && [...w].every((l) => keys.includes(l));

  it('deux îles : mots réguliers sans accent, puis des mots plus longs et des é', () => {
    expect(dictSets.map((s) => s.id)).toEqual(['dict1', 'dict2']);
    expect(dictSets[0]!.items.every((it) => /^[a-z]+$/.test(it.w))).toBe(true);
    expect(dictSets[1]!.items.every((it) => /^[a-zé]+$/.test(it.w))).toBe(true);
    expect(dictSets[1]!.items.filter((it) => it.w.includes('é')).length).toBeGreaterThanOrEqual(3);
  });

  it('clavier : lettres du mot + 2 ou 3 pièges absents du mot, 9 touches au plus, pas d’homophone possible', () => {
    for (const s of dictSets) {
      expect(new Set(s.items.map((x) => x.w)).size, s.id).toBe(s.items.length);
      for (const it of s.items) {
        expect(it.w.length, it.w).toBeLessThanOrEqual(6);
        expect(it.x.length >= 2 && it.x.length <= 3, it.w).toBe(true);
        expect(it.x.some((l) => it.w.includes(l)), `${it.w} : piège dans le mot`).toBe(false);
        const keys = dictKeys(it);
        expect(keys.length, it.w).toBeLessThanOrEqual(9);
        expect(new Set(keys).size).toBe(keys.length);
        expect(spellable(it.w, keys)).toBe(true);
        // Chaque mot a son propre clavier dans l'île.
        expect(s.items.filter((o) => dictKeys(o).sort().join('') === [...keys].sort().join('')), it.w).toHaveLength(1);
        for (const h of HOMOPHONES[it.w] ?? []) expect(spellable(h, keys, it.w.length), `${it.w} → ${h}`).toBe(false);
        expect(it.pic && PICS[it.pic].keys.includes(it.w), it.w).toBe(true);
        expect(it.say!.startsWith(`${it.w}… `), it.w).toBe(true);
      }
    }
  });

  it('question : format dictée, clavier mélangé contenant toutes les lettres ; sans voix, le dessin', () => {
    const rng = seeded(7);
    for (const s of dictSets) for (const f of factsOf(seriesOfSet(s))) {
      const q = generateQuestion({ series: seriesOfSet(s), fact: f, fmt: 'ecoute', rng });
      expect(q.fmt).toBe('dictee');
      expect(q.choices).toBeUndefined();
      expect([...q.read!.target].every((l) => q.read!.options.includes(l))).toBe(true);
      expect(spoken(q)).toBe('Écoute et écris le mot.');
      const v = withoutListening(q, rng);
      expect(v.read!.seen).toBe(true);
      expect(v.fmt).toBe('dictee');
      expect(lecPrompts(v)).toEqual(['Écris le mot du dessin.']);
      expect(spoken(v)).toContain(PICS[q.read!.pic!].label);
    }
  });

  it('saisie : longueur bornée, comparaison exacte (accents compris)', () => {
    const s = SERIES['lec-dict2'], velo = dictSets[1]!.items.findIndex((x) => x.w === 'vélo') + 1;
    const q = generateQuestion({ series: s, fact: { a: 9, b: velo }, fmt: 'dictee', rng: seeded(2) }), r = q.read!;
    expect(dictMax(r)).toBe(4);
    let t = '';
    for (const l of 'véloo') t = dictType(r, t, l);
    expect(t).toBe('vélo');
    expect(dictOk(r, 'vélo')).toBe(true);
    expect(dictOk(r, 'vélo'.normalize('NFD'))).toBe(true);
    expect(dictOk(r, 'velo')).toBe(false);
    expect(dictOk(r, 'vél')).toBe(false);
  });

  it('astuce : le mot épelé lettre par lettre, l’accent rappelé', () => {
    const q = generateQuestion({ series: SERIES['lec-dict1'], fact: { a: 7, b: 1 }, fmt: 'dictee', rng: seeded(1) });
    expect(tipOf(q)).toBe('On entend « moto » : ça s\'écrit m, o, t, o.');
    expect(tipOf(withoutListening(q))).toBe('C\'est une moto : ça s\'écrit m, o, t, o.');
    const b = dictSets[1]!.items.findIndex((x) => x.w === 'bébé') + 1;
    expect(tipOf(generateQuestion({ series: SERIES['lec-dict2'], fact: { a: 9, b }, fmt: 'dictee', rng: seeded(1) }))).toContain("l'accent sur le é");
  });

  it('garde-fou : un clavier sans une lettre du mot est refusé', () => {
    const q = generateQuestion({ series: SERIES['lec-dict1'], fact: { a: 7, b: 1 }, fmt: 'dictee', rng: seeded(1) });
    expect(() => assertValid({ ...q, read: { ...q.read!, options: q.read!.options.filter((l) => l !== 'm') } })).toThrow(/dictée/);
  });
});

describe('lecture au CP : îles ajoutées', () => {
  it('noms, gardiens et stickers propres à chaque île de lecture', () => {
    const looks = seriesOf('lec').map((s) => lookOf(s.id));
    expect(new Set(looks.map((l) => l.name)).size).toBe(9);
    expect(new Set(looks.map((l) => l.boss)).size).toBe(9);
    expect(lookOf('lec-dict1')).toMatchObject({ name: 'Ardoise', boss: 'Dictor' });
  });
});
