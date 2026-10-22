import { describe, expect, it } from 'vitest';
import { tabletScale } from './tablet';

describe('agrandissement tablette', () => {
  it('téléphone : jamais agrandi', () => {
    expect(tabletScale(390, 844)).toBe(1);
    expect(tabletScale(430, 932)).toBe(1);
  });
  it('iPad en portrait : remplit sans dépasser', () => {
    const k = tabletScale(820, 1180);
    expect(k).toBeGreaterThan(1.2);
    expect(600 * k).toBeLessThanOrEqual(820);
    expect(880 * k).toBeLessThanOrEqual(1180 + 1);
  });
  it('paysage : la hauteur décide, plafonné', () => {
    expect(tabletScale(1180, 820)).toBeGreaterThanOrEqual(1);
    expect(tabletScale(2732, 2048)).toBeLessThanOrEqual(1.8);
  });
});
