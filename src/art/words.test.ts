import { describe, expect, it } from 'vitest';
import { THEMES } from '../content/english';
import { wordArt } from './words';

describe('dessins des mots d\'anglais', () => {
  it('chaque mot dessinable a son dessin, les autres non', () => {
    const missing = THEMES.flatMap((t) => t.words.filter((w) => w.pic && !wordArt(t.id, w.en)).map((w) => `${t.id}/${w.en}`));
    const extra = THEMES.flatMap((t) => t.words.filter((w) => !w.pic && wordArt(t.id, w.en)).map((w) => `${t.id}/${w.en}`));
    expect(missing).toEqual([]);
    expect(extra).toEqual([]);
  });

  it('les dessins sont des SVG bien formés', () => {
    for (const t of THEMES) for (const w of t.words) {
      const s = wordArt(t.id, w.en);
      if (!s) continue;
      expect(s, `${t.id}/${w.en}`).not.toMatch(/NaN|undefined/);
      expect((s.match(/</g) ?? []).length, `${t.id}/${w.en}`).toBe((s.match(/>/g) ?? []).length);
    }
  });
});
