import { THEMES, type ThemeId } from './english';
import { CP_ZONE, ENG_ZONE, OP_SIGN, SERIES, type SeriesId } from './series';

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

/* ---- Habillage par série : les tables reprennent leur île, le CP réutilise 4 motifs en Mandarine. ---- */

export interface IsleLook {
  name: string;
  fort: string;
  clair: string;
  decor: DecorKind;
  /** Île dont on reprend le dessin (motif et gardien). */
  motif: IsleId;
  boss: string;
  /** Nom du sticker Lieu. */
  sticker: string;
  /** « de la Plage », « du Lagon »… */
  of: string;
}

type CpSeries = 'add-10' | 'add-20' | 'sub-10' | 'sub-20';

const CP_ISLES: Record<CpSeries, Omit<IsleLook, 'fort' | 'clair'>> = {
  'add-10': { name: 'Lagon', decor: 'plage', motif: 1, boss: 'Plouf', sticker: 'Palmier dansant', of: 'du Lagon' },
  'add-20': { name: 'Jardin', decor: 'verger', motif: 3, boss: 'Radix', sticker: 'Arbre à pommes', of: 'du Jardin' },
  'sub-10': { name: 'Banquise', decor: 'glace', motif: 5, boss: 'Frimas', sticker: 'Iceberg malin', of: 'de la Banquise' },
  'sub-20': { name: 'Ciel', decor: 'nuages', motif: 9, boss: 'Zéphyr', sticker: 'Ballon volant', of: 'du Ciel' },
};

/* Anglais : l'île porte le titre de la fiche (« Animals »), son gardien un nom anglais ;
   le dessin reprend un motif du CM1 proche du thème, en bleu marine. Le sticker Lieu porte un mot du thème. */
const ENG_ISLES: Record<ThemeId, { motif: IsleId; boss: string; sticker: string }> = {
  hello: { motif: 1, boss: 'Mister Hi', sticker: 'Palette de couleurs' },
  school: { motif: 5, boss: 'Professor Chalk', sticker: 'Trousse' },
  toys: { motif: 6, boss: 'Teddy', sticker: 'Ours en peluche' },
  family: { motif: 3, boss: 'Granny Bee', sticker: 'Papi et mamie' },
  home: { motif: 8, boss: 'Mr Key', sticker: 'Petite maison' },
  body: { motif: 9, boss: 'Bony', sticker: 'Grand sourire' },
  food: { motif: 3, boss: 'Chef Yummy', sticker: 'Banane' },
  actions: { motif: 4, boss: 'Jumpy', sticker: 'Grand saut' },
  animals: { motif: 2, boss: 'King Leo', sticker: 'Girafe' },
  transport: { motif: 10, boss: 'Captain Wheels', sticker: 'Bus à étage' },
  pets: { motif: 2, boss: 'Whiskers', sticker: 'Chaton' },
  clothes: { motif: 5, boss: 'Lady Sock', sticker: 'Chaussettes' },
  rooms: { motif: 6, boss: 'Sir Sofa', sticker: 'Lampe' },
  meals: { motif: 7, boss: 'Mrs Pancake', sticker: 'Saucisses' },
  activities: { motif: 8, boss: 'Coach Kite', sticker: 'Cerf-volant' },
  town: { motif: 10, boss: 'Mayor Map', sticker: 'Supermarché' },
  farm: { motif: 8, boss: 'Farmer Moo', sticker: 'Mouton' },
  classroom: { motif: 4, boss: 'Miss Bell', sticker: 'Tableau' },
};

/** Pastille d'une île : numéro de la table, signe de l'opération au CP, numéro du thème en anglais. */
export function seriesBadge(id: SeriesId): string {
  const sp = SERIES[id].spec;
  return sp.kind === 'table' ? String(sp.n) : sp.kind === 'theme' ? String(sp.n) : OP_SIGN[SERIES[id].op];
}

/** Habillage de l'île d'une série. */
export function lookOf(id: SeriesId): IsleLook {
  if (id.startsWith('mul-')) {
    const n = Number(id.slice(4)) as IsleId, I = ISLES[n];
    return { name: I.name, fort: I.fort, clair: I.clair, decor: I.decor, motif: n, boss: BOSS[n], sticker: STICKER_NAMES[n], of: ofIsle(n) };
  }
  const spec = SERIES[id].spec;
  if (spec.kind === 'theme') {
    const t = THEMES[spec.n - 1]!, e = ENG_ISLES[t.id];
    return { name: t.en, fort: ENG_ZONE.fort, clair: ENG_ZONE.clair, decor: ISLES[e.motif].decor, motif: e.motif, boss: e.boss, sticker: e.sticker, of: t.en };
  }
  return { ...CP_ISLES[id as CpSeries], fort: CP_ZONE.fort, clair: CP_ZONE.clair };
}
