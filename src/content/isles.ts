import { THEMES, type ThemeId } from './english';
import type { FrQuizId } from './french';
import { CP_ZONE, DIV_ZONE, ENG_ZONE, FR_ZONE, OP_SIGN, SERIES, type SeriesId } from './series';

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
  /** Anglais : mot dont le dessin sert de sticker Lieu (thème, mot). */
  word?: readonly [ThemeId, string];
}

type CpSeries = 'add-10' | 'add-c10' | 'add-dbl' | 'add-20' | 'sub-10' | 'sub-20';

const CP_ISLES: Record<CpSeries, Omit<IsleLook, 'fort' | 'clair'>> = {
  'add-10': { name: 'Lagon', decor: 'plage', motif: 1, boss: 'Plouf', sticker: 'Palmier dansant', of: 'du Lagon' },
  'add-c10': { name: 'Atoll', decor: 'jungle', motif: 2, boss: 'Dizou', sticker: 'Étoile de mer', of: "de l'Atoll" },
  'add-dbl': { name: 'Lac miroir', decor: 'desert', motif: 4, boss: 'Jumeau', sticker: 'Jumelles', of: 'du Lac miroir' },
  'add-20': { name: 'Jardin', decor: 'verger', motif: 3, boss: 'Radix', sticker: 'Arbre à pommes', of: 'du Jardin' },
  'sub-10': { name: 'Banquise', decor: 'glace', motif: 5, boss: 'Frimas', sticker: 'Iceberg malin', of: 'de la Banquise' },
  'sub-20': { name: 'Ciel', decor: 'nuages', motif: 9, boss: 'Zéphyr', sticker: 'Ballon volant', of: 'du Ciel' },
};

/* Anglais : l'île porte le titre de la fiche (« Animals »), son gardien un nom anglais ;
   le dessin reprend un motif du CM1 proche du thème, en bleu marine. Le sticker Lieu porte un mot du thème. */
const ENG_ISLES: Record<ThemeId, { motif: IsleId; boss: string; sticker: string; word: readonly [ThemeId, string] }> = {
  hello: { motif: 1, boss: 'Mister Hi', sticker: 'Palette de couleurs', word: ['toys', 'art set'] },
  school: { motif: 5, boss: 'Professor Chalk', sticker: 'Trousse', word: ['school', 'pencil case'] },
  toys: { motif: 6, boss: 'Teddy', sticker: 'Ours en peluche', word: ['toys', 'teddy bear'] },
  family: { motif: 3, boss: 'Granny Bee', sticker: 'Mamie', word: ['family', 'grandma'] },
  home: { motif: 8, boss: 'Mr Key', sticker: 'Petite maison', word: ['home', 'house'] },
  body: { motif: 9, boss: 'Bony', sticker: 'Grand sourire', word: ['body', 'head'] },
  food: { motif: 3, boss: 'Chef Yummy', sticker: 'Banane', word: ['food', 'banana'] },
  actions: { motif: 4, boss: 'Jumpy', sticker: 'Grand saut', word: ['actions', 'jump'] },
  animals: { motif: 2, boss: 'King Leo', sticker: 'Girafe', word: ['animals', 'giraffe'] },
  transport: { motif: 10, boss: 'Captain Wheels', sticker: 'Bus jaune', word: ['transport', 'bus'] },
  pets: { motif: 2, boss: 'Whiskers', sticker: 'Chaton', word: ['pets', 'cat'] },
  clothes: { motif: 5, boss: 'Lady Sock', sticker: 'Chaussettes', word: ['clothes', 'socks'] },
  rooms: { motif: 6, boss: 'Sir Sofa', sticker: 'Lampe', word: ['rooms', 'lamp'] },
  meals: { motif: 7, boss: 'Mrs Pancake', sticker: 'Saucisses', word: ['meals', 'sausages'] },
  activities: { motif: 8, boss: 'Coach Kite', sticker: 'Cerf-volant', word: ['toys', 'kite'] },
  town: { motif: 10, boss: 'Mayor Map', sticker: 'Supermarché', word: ['town', 'supermarket'] },
  farm: { motif: 8, boss: 'Farmer Moo', sticker: 'Mouton', word: ['farm', 'sheep'] },
  classroom: { motif: 4, boss: 'Miss Bell', sticker: 'Tableau', word: ['school', 'board'] },
};

/* Division : chaque table à l'envers a son île, le dessin de la table de même numéro, en violet. */
const DIV_ISLES: Record<IsleId, { name: string; boss: string; sticker: string; of: string }> = {
  1: { name: 'Lagune', boss: 'Crabou', sticker: 'Crabe partageur', of: 'de la Lagune' },
  2: { name: 'Mangrove', boss: 'Caïmo', sticker: 'Caïman rieur', of: 'de la Mangrove' },
  3: { name: 'Potager', boss: 'Radisse', sticker: 'Radis géant', of: 'du Potager' },
  4: { name: 'Oasis', boss: 'Dromo', sticker: 'Dromadaire', of: "de l'Oasis" },
  5: { name: 'Iceberg', boss: 'Phoquo', sticker: 'Phoque farceur', of: "de l'Iceberg" },
  6: { name: 'Caramel', boss: 'Nougate', sticker: 'Nougat doré', of: 'du Caramel' },
  7: { name: 'Geyser', boss: 'Fumerol', sticker: 'Geyser chantant', of: 'du Geyser' },
  8: { name: 'Prairie', boss: 'Brizo', sticker: 'Coquelicot', of: 'de la Prairie' },
  9: { name: 'Orage', boss: 'Tonnerro', sticker: 'Éclair malin', of: "de l'Orage" },
  10: { name: 'Comète', boss: 'Cométo', sticker: 'Comète filante', of: 'de la Comète' },
};

/* Français : une île par paire d'homophones (des mots qui se font écho). */
const FR_ISLES: Record<FrQuizId, Omit<IsleLook, 'fort' | 'clair'>> = {
  a: { name: 'Écho', decor: 'plage', motif: 1, boss: 'Échotin', sticker: 'Coquillage qui parle', of: "de l'Écho" },
  et: { name: 'Brume', decor: 'nuages', motif: 9, boss: 'Brumo', sticker: 'Lanterne', of: 'de la Brume' },
  son: { name: 'Récif', decor: 'glace', motif: 5, boss: 'Récifa', sticker: 'Corail', of: 'du Récif' },
  on: { name: 'Falaise', decor: 'collines', motif: 8, boss: 'Falzor', sticker: 'Mouette', of: 'de la Falaise' },
  // Conjugaison : un lieu par temps.
  pres: { name: 'Cascade', decor: 'jungle', motif: 2, boss: 'Verbix', sticker: 'Plume magique', of: 'de la Cascade' },
  fut: { name: 'Phare', decor: 'espace', motif: 10, boss: 'Futuro', sticker: 'Longue-vue', of: 'du Phare' },
  imp: { name: 'Ruines', decor: 'desert', motif: 4, boss: 'Jadis', sticker: 'Vieux parchemin', of: 'des Ruines' },
  pc: { name: 'Grotte', decor: 'volcan', motif: 7, boss: 'Hiéro', sticker: 'Sablier', of: 'de la Grotte' },
};

/** Pastille d'une île : numéro de la table, signe de l'opération au CP, numéro du thème en anglais. */
export function seriesBadge(id: SeriesId): string {
  const sp = SERIES[id].spec;
  // Division : « ÷7 », pour ne pas confondre avec la table de 7.
  if (sp.kind === 'table' && SERIES[id].op === 'div') return `÷${sp.n}`;
  return sp.kind === 'table' || sp.kind === 'theme' || sp.kind === 'quiz' ? String(sp.n) : OP_SIGN[SERIES[id].op];
}

/** Habillage de l'île d'une série. */
export function lookOf(id: SeriesId): IsleLook {
  if (id.startsWith('mul-')) {
    const n = Number(id.slice(4)) as IsleId, I = ISLES[n];
    return { name: I.name, fort: I.fort, clair: I.clair, decor: I.decor, motif: n, boss: BOSS[n], sticker: STICKER_NAMES[n], of: ofIsle(n) };
  }
  if (id.startsWith('div-')) {
    const n = Number(id.slice(4)) as IsleId, d = DIV_ISLES[n];
    return { ...d, fort: DIV_ZONE.fort, clair: DIV_ZONE.clair, decor: ISLES[n].decor, motif: n };
  }
  const spec = SERIES[id].spec;
  if (spec.kind === 'quiz') return { ...FR_ISLES[spec.quiz], fort: FR_ZONE.fort, clair: FR_ZONE.clair };
  if (spec.kind === 'theme') {
    const t = THEMES[spec.n - 1]!, e = ENG_ISLES[t.id];
    return { name: t.en, fort: ENG_ZONE.fort, clair: ENG_ZONE.clair, decor: ISLES[e.motif].decor, motif: e.motif, boss: e.boss, sticker: e.sticker, of: t.en, word: e.word };
  }
  return { ...CP_ISLES[id as CpSeries], fort: CP_ZONE.fort, clair: CP_ZONE.clair };
}
