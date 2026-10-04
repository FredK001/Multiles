import { describe, expect, it } from 'vitest';
import { drillWords, fillDrill, pluralOf, stepWords, THEMES, withArticle, type Word } from './english';

const find = (en: string): Word => THEMES.flatMap((t) => t.words).find((x) => x.en === en)!;

describe('catalogue anglais', () => {
  it('18 thèmes, identifiants uniques, dans l’ordre des fiches', () => {
    expect(THEMES).toHaveLength(18);
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(18);
    expect(THEMES.map((t) => t.sheet)).toEqual([...Array(9).fill('CE1'), ...Array(8).fill('CE2'), 'Classe']);
  });

  it('chaque thème : mots uniques, traduits, deux étapes non vides qui couvrent tout', () => {
    for (const t of THEMES) {
      expect(new Set(t.words.map((x) => x.en)).size, t.id).toBe(t.words.length);
      for (const x of t.words) expect(x.fr.trim(), `${t.id}:${x.en}`).not.toBe('');
      const [a, b] = [stepWords(t, 0), stepWords(t, 1)];
      expect(a.length && b.length, t.id).toBeTruthy();
      expect([...a, ...b]).toEqual(t.words);
      expect(stepWords(t, null)).toEqual(t.words);
      expect(t.drills.length, t.id).toBeGreaterThan(0);
    }
  });

  it('les phrases ne visent que des mots du thème et se remplissent entièrement', () => {
    for (const t of THEMES)
      for (const d of t.drills) {
        if (d.kind === 'qa') continue;
        if (d.only) for (const en of d.only) expect(t.words.map((x) => x.en), `${t.id}: ${en}`).toContain(en);
        const ws = drillWords(t, d);
        // Choix à 3 propositions (pick, count) : au moins 3 mots ; oui/non : au moins 2.
        expect(ws.length, `${t.id}: ${d.q}`).toBeGreaterThanOrEqual(d.kind === 'yesno' ? 2 : 3);
        for (const x of ws) {
          const tpl = [d.q, d.kind === 'yesno' ? d.yes + d.no : d.a].join(' ');
          expect(fillDrill(tpl, x, 3), `${t.id}: ${x.en}`).not.toMatch(/[{}]/);
          if (tpl.includes('{ing}')) expect(x.ing, `${t.id}: ${x.en} sans -ing`).toBeDefined();
        }
      }
  });

  it('les paires question-réponse d’un thème ont des réponses distinctes (au moins 3 si seules)', () => {
    for (const t of THEMES) {
      const qa = t.drills.filter((d) => d.kind === 'qa');
      expect(new Set(qa.map((d) => d.a)).size, t.id).toBe(qa.length);
      if (qa.length && qa.length === t.drills.length) expect(qa.length, t.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('articles et pluriels', () => {
    expect(withArticle(find('apple'))).toBe('an apple');
    expect(withArticle(find('art set'))).toBe('an art set');
    expect(withArticle(find('book'))).toBe('a book');
    expect(withArticle(find('jeans'))).toBe('jeans');
    expect(pluralOf(find('mouse'))).toBe('mice');
    expect(pluralOf(find('pen'))).toBe('pens');
    expect(fillDrill('I can see {n} {pl}.', find('pencil'), 4)).toBe('I can see four pencils.');
  });

  it('les mots sans dessin sont ceux qu’on ne peut pas dessiner sans ambiguïté', () => {
    const noPic = THEMES.flatMap((t) => t.words.filter((x) => !x.pic).map((x) => x.en));
    expect(noPic).toEqual(['hall', 'breakfast', 'lunch', 'dinner']);
  });
});
