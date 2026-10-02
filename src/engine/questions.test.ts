import { describe, expect, it } from 'vitest';
import { expected, FORMAT_ORDER, isCorrect, makeQ, typeDigit } from './questions';
import { seeded } from './random';

describe('makeQ', () => {
  const rng = seeded(42);
  it('QCM : 3 propositions distinctes et positives, dont la bonne', () => {
    for (let a = 1; a <= 10; a++)
      for (let b = 1; b <= 10; b++) {
        const q = makeQ(a, b, 'qcm', rng);
        expect(q.choices).toHaveLength(3);
        expect(new Set(q.choices).size).toBe(3);
        expect(q.choices).toContain(a * b);
        expect(q.choices!.every((c) => c > 0)).toBe(true);
      }
  });
  it('vrai/faux : un résultat juste, ou faux et positif', () => {
    let vrais = 0;
    for (let i = 0; i < 400; i++) {
      const a = 1 + (i % 10), b = 1 + ((i * 7) % 10), q = makeQ(a, b, 'vf', rng);
      if (q.truth) { vrais++; expect(q.shown).toBe(a * b); } else { expect(q.shown).not.toBe(a * b); expect(q.shown).toBeGreaterThan(0); }
    }
    expect(vrais).toBeGreaterThan(150);
    expect(vrais).toBeLessThan(250);
  });
  it('facteur manquant : on attend le second facteur', () => {
    const q = makeQ(7, 8, 'manquant', rng);
    expect(expected(q)).toBe(8);
    expect(isCorrect(q, 8)).toBe(true);
    expect(isCorrect(q, 56)).toBe(false);
  });
  it('pavé : on attend le produit', () => {
    const q = makeQ(7, 8, 'pave', rng);
    expect(isCorrect(q, 56)).toBe(true);
    expect(isCorrect(q, 54)).toBe(false);
  });
  it('rotation des 4 formats', () => {
    expect(FORMAT_ORDER).toEqual(['pave', 'qcm', 'manquant', 'vf']);
  });
});

describe('saisie au pavé', () => {
  it('3 chiffres au plus, pas de zéro en tête', () => {
    expect(typeDigit('', '0')).toBe('0');
    expect(typeDigit('0', '5')).toBe('5');
    expect(typeDigit('10', '0')).toBe('100');
    expect(typeDigit('100', '1')).toBe('100');
  });
});
