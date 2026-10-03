import { describe, expect, it } from 'vitest';
import { contrast, mix } from './color';
import { ISLES, ISLE_IDS } from '../content/isles';
import { PROFILE_COLORS } from '../content/avatar';
import { CP_ZONE } from '../content/series';

describe('mix', () => {
  it('reproduit les teintes calculées du prototype', () => {
    // --ile-sombre du Volcan déclarée en dur dans le :root du prototype
    expect(mix('#BF3A1A', '#000000', 0.22)).toBe('#952d14');
    expect(mix('#FFFFFF', '#000000', 0)).toBe('#ffffff');
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#ffffff');
  });
});

describe('contrastes WCAG AA avec le texte blanc', () => {
  const strong: [string, string][] = [
    ['ballon', '#2F5BEA'], ['feuille', '#157F45'], ['laiton', '#94660F'], ['ink', '#1E2440'], ['ink-2', '#4D5675'],
    ...ISLE_IDS.map((n): [string, string] => [`île ${n} ${ISLES[n].name}`, ISLES[n].fort]),
    ...PROFILE_COLORS.map(([c, l]): [string, string] => [`profil ${l}`, c]),
    ['zone CP Mandarine', CP_ZONE.fort],
  ];
  it.each(strong)('%s (%s) atteint 5:1 avec le blanc', (_n, c) => {
    expect(contrast(c, '#FFFFFF')).toBeGreaterThanOrEqual(5);
  });
  it("l'encre atteint 4,5:1 sur le miel et le lagon", () => {
    expect(contrast('#1E2440', '#FFE7A0')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#1E2440', '#E6F4F2')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#4D5675', '#E6F4F2')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#1E2440', CP_ZONE.clair)).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#4D5675', CP_ZONE.clair)).toBeGreaterThanOrEqual(4.5);
  });
});
