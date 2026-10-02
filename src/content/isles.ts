export type IsleId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type DecorKind =
  | 'plage' | 'jungle' | 'verger' | 'desert' | 'glace'
  | 'bonbon' | 'volcan' | 'collines' | 'nuages' | 'espace';

export interface Isle {
  name: string;
  fort: string;
  clair: string;
  decor: DecorKind;
}

export const ISLE_IDS: readonly IsleId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const ISLES: Record<IsleId, Isle> = {
  1: { name: 'Plage', fort: '#0A7A80', clair: '#D3F0EE', decor: 'plage' },
  2: { name: 'Jungle', fort: '#2E7A2F', clair: '#DCEFD5', decor: 'jungle' },
  3: { name: 'Verger', fort: '#B0365A', clair: '#F8DCE4', decor: 'verger' },
  4: { name: 'Désert', fort: '#9C5A12', clair: '#F6E5CF', decor: 'desert' },
  5: { name: 'Glace', fort: '#1D6CB0', clair: '#D8E8F7', decor: 'glace' },
  6: { name: 'Bonbon', fort: '#A93A8C', clair: '#F6DCEE', decor: 'bonbon' },
  7: { name: 'Volcan', fort: '#BF3A1A', clair: '#FADCD3', decor: 'volcan' },
  8: { name: 'Collines du vent', fort: '#5F7314', clair: '#E7EDCF', decor: 'collines' },
  9: { name: 'Nuages', fort: '#3550B0', clair: '#DDE2F6', decor: 'nuages' },
  10: { name: 'Espace', fort: '#5B3AA6', clair: '#E5DDF5', decor: 'espace' },
};

/** Gardiens de fin d'île. */
export const BOSS: Record<IsleId, string> = {
  1: 'Coquillo', 2: 'Lianor', 3: 'Pommax', 4: 'Sablor', 5: 'Glaçor',
  6: 'Sucrette', 7: 'Magmo', 8: 'Ventor', 9: 'Nimbo', 10: 'Astro',
};

export const STICKER_NAMES: Record<IsleId, string> = {
  1: 'Palmier farceur', 2: 'Perroquet malin', 3: "Pomme d'or", 4: 'Cactus cool', 5: 'Pingouin glisseur',
  6: 'Sucette géante', 7: 'Volcan fumant', 8: 'Moulin rapide', 9: 'Montgolfière', 10: 'Fusée lunaire',
};

/** Nom de l'île avec son article (« la Plage », « le Volcan »…). Bonbon n'en a pas. */
const ISLE_ART: Record<IsleId, string> = {
  1: 'la Plage', 2: 'la Jungle', 3: 'le Verger', 4: 'le Désert', 5: 'la Glace', 6: '',
  7: 'le Volcan', 8: 'les Collines du vent', 9: 'les Nuages', 10: "l'Espace",
};

/** Complément « de l'île » : « de la Plage », « du Volcan », « des Nuages », « Bonbon ». */
export function ofIsle(n: IsleId): string {
  const a = ISLE_ART[n];
  if (!a) return ISLES[n].name;
  if (a.startsWith('le ')) return 'du ' + a.slice(3);
  if (a.startsWith('les ')) return 'des ' + a.slice(4);
  return 'de ' + a;
}
