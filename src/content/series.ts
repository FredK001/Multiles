/* Catalogue des séries. Une série = { opération, table ou plage } : c'est l'unité de progression
   (une île, 3 étapes, un gardien). Ajouter un niveau (CE1…) revient à ajouter ses séries ici
   et à compléter CURRICULUM. */

export type Op = 'mul' | 'add' | 'sub';
export type Grade = 'CP' | 'CM1';

export const GRADES: readonly Grade[] = ['CP', 'CM1'];

/** Opérations proposées à chaque niveau, dans l'ordre d'affichage. */
export const CURRICULUM: Record<Grade, readonly Op[]> = { CP: ['add', 'sub'], CM1: ['mul'] };

/** Couleur de zone du CP (îles et questions d'addition et de soustraction) : Mandarine, 5,5:1 avec le blanc. */
export const CP_ZONE = { fort: '#B04A00', clair: '#FBE4D3' } as const;

/** Noms au pluriel (espace parent, choix de l'opération). */
export const OP_NAME: Record<Op, string> = { mul: 'Multiplications', add: 'Additions', sub: 'Soustractions' };

/** Nom d'une opération. */
export const OP_SINGULAR: Record<Op, string> = { mul: 'Multiplication', add: 'Addition', sub: 'Soustraction' };

/** Mot court lu et affiché pour un enfant qui lit peu. */
export const OP_WORD: Record<Op, string> = { mul: 'Fois', add: 'Plus', sub: 'Moins' };

/** Mot lu à voix haute entre les deux nombres. */
export const OP_SPOKEN: Record<Op, string> = { mul: 'fois', add: 'plus', sub: 'moins' };

/** Ce que propose chaque classe (création de profil, espace parent). */
export const GRADE_DESC: Record<Grade, string> = { CP: 'Additions et soustractions', CM1: 'Tables de multiplication' };

/** Signe affiché (vrai signe moins, pas le tiret). */
export const OP_SIGN: Record<Op, string> = { mul: '×', add: '+', sub: '−' };

/** Lettre utilisée dans les clés de calcul : « 7x8 », « 3+4 », « 9-2 ». */
export const OP_KEY: Record<Op, 'x' | '+' | '-'> = { mul: 'x', add: '+', sub: '-' };

export type SeriesSpec =
  /** Table de n : n × 1 à n × 10. */
  | { kind: 'table'; n: number }
  /** Plage : le plus grand nombre du calcul (somme, ou nombre de départ) va de `min` à `max`.
      Chaque terme va de 0 (ou 1 si `zero` est faux) à `termMax`. */
  | { kind: 'range'; min: number; max: number; zero: boolean; termMax: number };

/** Filtre d'une étape ; null = toute la série. */
export interface StepFilter {
  /** Multiplicateurs retenus (tables). */
  mult?: readonly number[];
  /** Plus grand nombre du calcul (somme pour +, nombre de départ pour −), bornes incluses. */
  top?: readonly [number, number];
  /** Avec (vrai) ou sans (faux) passage de la dizaine. */
  crossTen?: boolean;
}

export type TableId = `mul-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;
export type SeriesId = TableId | 'add-10' | 'add-20' | 'sub-10' | 'sub-20';

export interface SeriesDef {
  id: SeriesId;
  op: Op;
  spec: SeriesSpec;
  /** Étapes 1 à 3 (la 3e et le gardien portent sur toute la série). */
  steps: readonly [StepFilter, StepFilter, null];
  /** « La table de 7 », « Jusqu'à 10 ». */
  title: string;
  /** Libellé court de chaque étape. */
  stepLabels: readonly [string, string, string];
  /** Trophées de la même opération nécessaires pour ouvrir l'île (0 = ouverte au départ). */
  need: number;
}

/** Trophées nécessaires pour ouvrir les tables (les îles 1, 2, 5 et 10 sont ouvertes au départ). */
const TABLE_NEED: Record<number, number> = { 3: 2, 4: 2, 6: 4, 7: 4, 8: 6, 9: 6 };

const table = (n: number): SeriesDef => ({
  id: `mul-${n}` as TableId,
  op: 'mul',
  spec: { kind: 'table', n },
  steps: [{ mult: [1, 2, 3, 4, 5] }, { mult: [6, 7, 8, 9, 10] }, null],
  title: `La table de ${n}`,
  stepLabels: ['×1 à ×5', '×6 à ×10', 'Toute la table'],
  need: TABLE_NEED[n] ?? 0,
});

/** Jusqu'à 10 : deux termes de 0 à 10, le plus grand nombre ne dépasse pas 10. */
const upTo10 = (op: 'add' | 'sub'): SeriesDef => ({
  id: `${op}-10`,
  op,
  spec: { kind: 'range', min: 0, max: 10, zero: true, termMax: 10 },
  steps: [{ top: [0, 5] }, { top: [6, 10] }, null],
  title: "Jusqu'à 10",
  stepLabels: ["Jusqu'à 5", 'De 6 à 10', 'Tout'],
  need: 0,
});

/** Jusqu'à 20 : le plus grand nombre va de 11 à 20 (en dessous, c'est la série jusqu'à 10).
    Addition : termes de 1 à 19. Soustraction : on enlève de 1 à 10. */
const upTo20 = (op: 'add' | 'sub'): SeriesDef => ({
  id: `${op}-20`,
  op,
  spec: { kind: 'range', min: 11, max: 20, zero: false, termMax: op === 'add' ? 19 : 10 },
  steps: [{ crossTen: false }, { crossTen: true }, null],
  title: "Jusqu'à 20",
  stepLabels: ['Sans passer 10', 'En passant 10', 'Tout'],
  /** S'ouvre avec le trophée de la série jusqu'à 10. */
  need: 1,
});

export const SERIES: Record<SeriesId, SeriesDef> = {
  'mul-1': table(1), 'mul-2': table(2), 'mul-3': table(3), 'mul-4': table(4), 'mul-5': table(5),
  'mul-6': table(6), 'mul-7': table(7), 'mul-8': table(8), 'mul-9': table(9), 'mul-10': table(10),
  'add-10': upTo10('add'), 'add-20': upTo20('add'),
  'sub-10': upTo10('sub'), 'sub-20': upTo20('sub'),
};

export const SERIES_IDS = Object.keys(SERIES) as SeriesId[];

/** Séries d'une opération, dans l'ordre de progression. */
export const seriesOf = (op: Op): SeriesDef[] => SERIES_IDS.filter((id) => SERIES[id].op === op).map((id) => SERIES[id]);

export const isSeriesId = (v: unknown): v is SeriesId => typeof v === 'string' && v in SERIES;

/** Série de la table de n (CM1). */
export const tableSeries = (n: number): SeriesDef => SERIES[`mul-${n}` as TableId];
