import { describe, expect, it } from 'vitest';
import { spoken } from './messages';
import { SERIES } from './series';
import { generateQuestion } from '../engine/questions';
import { factsOf } from '../engine/series';
import { storyOf } from './stories';

describe('petits problèmes du CP', () => {
  it('chaque calcul a son histoire, accordée au nombre, avec ses deux nombres et une question', () => {
    for (const s of ['add-pb', 'sub-pb'] as const) for (const f of factsOf(s)) {
      const t = storyOf(SERIES[s].op as 'add' | 'sub', f.a, f.b);
      expect(t, t).toMatch(/\?$/);
      expect(t, t).not.toMatch(/\b1 (billes|bonbons|oiseaux|enfants|pommes|poissons)\b/); // jamais « 1 billes »
      expect(t, t).not.toMatch(/\bun [a-zé]+s\b|\bune [a-zé]+s\b/);
      expect(t.includes(String(f.b)) || f.b === 1, t).toBe(true);
    }
  });

  it('accords : « une bille », « un enfant monte », plusieurs « montent »', () => {
    const all = (['add', 'sub'] as const).flatMap((op) => factsOf(`${op}-pb`).map((f) => storyOf(op, f.a, f.b)));
    expect(all.some((t) => t.includes('une bille') || t.includes('une pomme'))).toBe(true);
    expect(all.some((t) => /Un (enfant|oiseau) (monte|arrive|descend|s'envole)\./.test(t))).toBe(true);
    expect(all.some((t) => /\d (enfants|oiseaux) (montent|arrivent|descendent|s'envolent)\./.test(t))).toBe(true);
  });

  it('la question lue est l’histoire (le calcul n’est pas donné), au pavé ou au choix', () => {
    const q = generateQuestion({ series: 'sub-pb', fact: { a: 7, b: 3 }, fmt: 'pave' });
    expect(spoken(q)).toBe(storyOf('sub', 7, 3));
    expect(q.p).toBe(4);
    expect(SERIES['sub-pb'].formats).toEqual(['pave', 'qcm']);
  });
});
