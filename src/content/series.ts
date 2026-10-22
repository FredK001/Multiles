/* Catalogue des séries. Une série = { opération, table ou plage } : c'est l'unité de progression
   (une île, 3 étapes, un gardien). Ajouter un niveau (CE1…) revient à ajouter ses séries ici
   et à compléter CURRICULUM. L'anglais (« eng ») est rangé comme une opération : une série par thème.
   La division (« div ») reprend les tables à l'envers : la table de 7 donne 7 ÷ 7 à 70 ÷ 7. */
import { BIG_SETS, type BigId } from './bignums';
import { THEMES, type ThemeId } from './english';
import { ALL_QUIZZES, type FrQuizId } from './french';
import { FRAC_SETS, type FracId } from './fractions';
import { MES_SETS, type MesId } from './measures';
import { NUM_SETS, type NumId } from './numbers';
import { READ_SETS, type ReadId } from './reading';
import { GRD_SETS, type GrdId } from './grandeurs';
import { ESP_SETS, type EspId } from './space';

export type Op = 'mul' | 'div' | 'frac' | 'big' | 'mes' | 'add' | 'sub' | 'num' | 'grd' | 'esp' | 'lec' | 'fr' | 'eng';

/** Toutes les opérations, dans l'ordre d'affichage (album, espace parent, sauvegarde). */
export const OPS: readonly Op[] = ['mul', 'div', 'frac', 'big', 'mes', 'add', 'sub', 'num', 'grd', 'esp', 'lec', 'fr', 'eng'];
export type Grade = 'CP' | 'CM1';

export const GRADES: readonly Grade[] = ['CP', 'CM1'];

/** Opérations proposées à chaque niveau, dans l'ordre d'affichage. */
export const CURRICULUM: Record<Grade, readonly Op[]> = { CP: ['add', 'sub', 'num', 'grd', 'esp', 'lec'], CM1: ['mul', 'div', 'frac', 'big', 'mes', 'fr', 'eng'] };

/** Couleur de zone de l'anglais (îles, questions, carte) : bleu marine, 9,6:1 avec le blanc. */
export const ENG_ZONE = { fort: '#23408E', clair: '#DCE3F5' } as const;

/** Couleur d'une opération (pastilles, cartes de choix) ; les tables gardent la couleur de profil. */
export const zoneOf = (op: Op): string => (op === 'eng' ? ENG_ZONE.fort : op === 'mul' ? 'var(--ballon)' : op === 'div' ? DIV_ZONE.fort : op === 'fr' ? FR_ZONE.fort : op === 'lec' ? LEC_ZONE.fort : op === 'num' ? NUM_ZONE.fort : op === 'frac' ? FRAC_ZONE.fort : op === 'big' ? BIG_ZONE.fort : op === 'mes' ? MES_ZONE.fort : op === 'grd' ? GRD_ZONE.fort : op === 'esp' ? ESP_ZONE.fort : CP_ZONE.fort);

/** Couleur de zone des fractions (CM1) : framboise, 6,9:1 avec le blanc. */
export const FRAC_ZONE = { fort: '#9C2F5B', clair: '#F6DDE7' } as const;

/** Couleur de zone des grands nombres (CM1) : caramel, 6,3:1 avec le blanc. */
export const BIG_ZONE = { fort: '#8A5300', clair: '#F6E8CF' } as const;

/** Couleur de zone des mesures (CM1) : brique, 6,5:1 avec le blanc. */
export const MES_ZONE = { fort: '#A33B2B', clair: '#FADDD6' } as const;

/** Couleur de zone des nombres (CP) : bleu canard, 6,2:1 avec le blanc. */
export const NUM_ZONE = { fort: '#0B6E75', clair: '#D3EEF0' } as const;

/** Couleur de zone des grandeurs, monnaie et heure (CP) : bronze, 6,3:1 avec le blanc. */
export const GRD_ZONE = { fort: '#7A5C00', clair: '#F3EBC8' } as const;

/** Couleur de zone de l'espace et des formes (CP) : prune, 7:1 avec le blanc. */
export const ESP_ZONE = { fort: '#7A3E9D', clair: '#EFE2F6' } as const;

/** Couleur de zone de la lecture (CP) : bleu roi, 6,4:1 avec le blanc. */
export const LEC_ZONE = { fort: '#1D5FA8', clair: '#DCE8F7' } as const;

/** Couleur de zone du français : vert sapin, 6,9:1 avec le blanc. */
export const FR_ZONE = { fort: '#0E6B4F', clair: '#D6EFE6' } as const;

/** Couleur de zone de la division : violet, 9,4:1 avec le blanc. */
export const DIV_ZONE = { fort: '#6B2E8F', clair: '#EBDDF3' } as const;

/** Couleur de zone du CP (îles et questions d'addition et de soustraction) : Mandarine, 5,5:1 avec le blanc. */
export const CP_ZONE = { fort: '#B04A00', clair: '#FBE4D3' } as const;

/** Noms au pluriel (espace parent, choix de l'opération). */
export const OP_NAME: Record<Op, string> = { mul: 'Multiplications', div: 'Divisions', frac: 'Fractions', big: 'Grands nombres', mes: 'Mesures', fr: 'Français', lec: 'Lecture', num: 'Nombres', grd: 'Monnaie et heure', esp: 'Formes et espace', add: 'Additions', sub: 'Soustractions', eng: 'Anglais' };

/** Nom d'une opération. */
export const OP_SINGULAR: Record<Op, string> = { mul: 'Multiplication', div: 'Division', frac: 'Fractions', big: 'Grands nombres', mes: 'Mesures', fr: 'Français', lec: 'Lecture', num: 'Nombres', grd: 'Monnaie et heure', esp: 'Formes et espace', add: 'Addition', sub: 'Soustraction', eng: 'Anglais' };

/** Mot court lu et affiché pour un enfant qui lit peu. */
export const OP_WORD: Record<Op, string> = { mul: 'Fois', div: 'Divisé', frac: 'Fractions', big: 'Nombres', mes: 'Mesures', fr: 'Français', lec: 'Lire', num: 'Nombres', grd: 'Mesurer', esp: 'Formes', add: 'Plus', sub: 'Moins', eng: 'Anglais' };

/** Mot lu à voix haute entre les deux nombres. */
export const OP_SPOKEN: Record<Op, string> = { mul: 'fois', div: 'divisé par', frac: '', big: '', mes: '', fr: '', lec: '', num: '', grd: '', esp: '', add: 'plus', sub: 'moins', eng: '' };

/** Ce que propose chaque classe (création de profil, espace parent). */
export const GRADE_DESC: Record<Grade, string> = { CP: 'Additions, soustractions, nombres, monnaie et heure, formes et lecture', CM1: 'Tables de multiplication, divisions, fractions, grands nombres, mesures, français et anglais' };

/** Signe affiché (vrai signe moins, pas le tiret). */
export const OP_SIGN: Record<Op, string> = { mul: '×', div: '÷', frac: '½', big: '1M', mes: 'cm', fr: 'Aa', lec: 'ab', num: '123', grd: '€', esp: '▲', add: '+', sub: '−', eng: 'EN' };

/** Lettre utilisée dans les clés de calcul : « 7x8 », « 56d7 », « 3+4 », « 9-2 », « 4e12 » (thème 4, mot 12) ;
    pour les matières à îles et rangs : « 2g7 », « 3m12 », « 3h5 », « 2s4 »… */
export const OP_KEY: Record<Op, 'x' | 'd' | 'r' | 'g' | 'm' | '+' | '-' | 'n' | 'h' | 's' | 'l' | 'f' | 'e'> = { mul: 'x', div: 'd', frac: 'r', big: 'g', mes: 'm', add: '+', sub: '-', num: 'n', grd: 'h', esp: 's', lec: 'l', fr: 'f', eng: 'e' };

export type SeriesSpec =
  /** Table de n : n × 1 à n × 10 ; en division, n × 1 ÷ n à n × 10 ÷ n (a = dividende, b = n). */
  | { kind: 'table'; n: number }
  /** Plage : le plus grand nombre du calcul (somme, ou nombre de départ) va de `min` à `max`.
      Chaque terme va de 0 (ou 1 si `zero` est faux) à `termMax`. */
  | { kind: 'range'; min: number; max: number; zero: boolean; termMax: number }
  /** Liste fixe de calculs (CP : les amis de 10, les doubles). */
  | { kind: 'list'; facts: readonly { a: number; b: number }[] }
  /** Fractions et décimaux n° `n` (1 à 4) : a = n, b = rang de la question (content/fractions.ts). */
  | { kind: 'frac'; set: FracId; n: number }
  /** Grands nombres n° `n` (1 à 4) : a = n, b = rang de la question (content/bignums.ts). */
  | { kind: 'big'; set: BigId; n: number }
  /** Mesures n° `n` (1 à 4) : a = n, b = rang de la question (content/measures.ts). */
  | { kind: 'mes'; set: MesId; n: number }
  /** Nombres jusqu'à 100 n° `n` (1 à 4) : le sens de a et b dépend de l'île (content/numbers.ts). */
  | { kind: 'num'; set: NumId; n: number }
  /** Grandeurs n° `n` (1 à 4 : pièces, payer, heure, demie) : a = n, b = rang de la question (content/grandeurs.ts). */
  | { kind: 'grd'; set: GrdId; n: number }
  /** Espace et formes n° `n` (1 à 4 : formes, côtés, quadrillage, position) : a = n, b = rang (content/space.ts). */
  | { kind: 'esp'; set: EspId; n: number }
  /** Lecture n° `n` (1 à 9) : a = n, b = n° du son, de la syllabe, du mot, de la phrase ou du mot dicté. */
  | { kind: 'read'; set: ReadId; n: number }
  /** Français n° `n` (1 à 8 : homophones puis temps) : a = n, b = n° de la phrase. */
  | { kind: 'quiz'; quiz: FrQuizId; n: number }
  /** Thème d'anglais n° `n` (1 à 18) : a = n, b = n° du mot (1 à 50) ou 50 + n° de la phrase. */
  | { kind: 'theme'; theme: ThemeId; n: number };

/** Filtre d'une étape ; null = toute la série. */
export interface StepFilter {
  /** Multiplicateurs retenus (tables) ; en division, le quotient. */
  mult?: readonly number[];
  /** Plus grand nombre du calcul (somme pour +, nombre de départ pour −), bornes incluses. */
  top?: readonly [number, number];
  /** Avec (vrai) ou sans (faux) passage de la dizaine. */
  crossTen?: boolean;
  /** Anglais : première (0) ou seconde (1) moitié des mots, sans les phrases ; français : moitié des phrases. */
  half?: 0 | 1;
  /** Liste : seconds termes retenus. */
  bs?: readonly number[];
}

export type TableId = `mul-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;
export type DivId = `div-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;
export type EngId = `eng-${ThemeId}`;
export type FrId = `fr-${FrQuizId}`;
export type LecId = `lec-${ReadId}`;
export type NumSeries = `num-${NumId}`;
export type FracSeries = `frac-${FracId}`;
export type BigSeries = `big-${BigId}`;
export type MesSeries = `mes-${MesId}`;
export type GrdSeries = `grd-${GrdId}`;
export type EspSeries = `esp-${EspId}`;
export type SeriesId = TableId | DivId | 'add-10' | 'add-c10' | 'add-dbl' | 'add-pb' | 'add-20' | 'sub-pb' | 'sub-half' | 'sub-10' | 'sub-20' | NumSeries | GrdSeries | EspSeries | LecId | FracSeries | BigSeries | MesSeries | FrId | EngId;

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
  /** Petits problèmes : le calcul est raconté (content/stories.ts) au lieu d'être écrit. */
  story?: boolean;
  /** Rotation des formats propre à la série (sinon celle de l'opération). */
  formats?: readonly ('pave' | 'qcm' | 'manquant' | 'vf')[];
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

/** Table de n à l'envers : mêmes étapes et mêmes ouvertures que la table de n. */
const divTable = (n: number): SeriesDef => ({
  id: `div-${n}` as DivId,
  op: 'div',
  spec: { kind: 'table', n },
  steps: [{ mult: [1, 2, 3, 4, 5] }, { mult: [6, 7, 8, 9, 10] }, null],
  title: `La table de ${n} à l'envers`,
  stepLabels: [`${n} à ${n * 5}`, `${n * 6} à ${n * 10}`, 'Toute la table'],
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

/** Les amis de 10 : deux nombres qui font 10 (« 3 + ? = 10 », le nombre manquant d'abord). */
const friends10: SeriesDef = {
  id: 'add-c10',
  op: 'add',
  spec: { kind: 'list', facts: Array.from({ length: 11 }, (_, a) => ({ a, b: 10 - a })) },
  steps: [{ bs: [0, 1, 2, 3, 4, 5] }, { bs: [6, 7, 8, 9, 10] }, null],
  title: 'Les amis de 10',
  stepLabels: ['10 + 0 à 5 + 5', '4 + 6 à 0 + 10', 'Tous'],
  need: 1,
  formats: ['manquant', 'qcm', 'manquant', 'vf'],
};

/** Les doubles : 1 + 1 à 10 + 10. */
const doubles: SeriesDef = {
  id: 'add-dbl',
  op: 'add',
  spec: { kind: 'list', facts: Array.from({ length: 10 }, (_, i) => ({ a: i + 1, b: i + 1 })) },
  steps: [{ bs: [1, 2, 3, 4, 5] }, { bs: [6, 7, 8, 9, 10] }, null],
  title: 'Les doubles',
  stepLabels: ['1 + 1 à 5 + 5', '6 + 6 à 10 + 10', 'Tous'],
  need: 1,
};

/** Petits problèmes jusqu'à 10 : une histoire lue, la réponse au pavé ou au choix. Termes de 1 à 9. */
const problems = (op: 'add' | 'sub'): SeriesDef => {
  const facts: { a: number; b: number }[] = [];
  if (op === 'add') for (let a = 1; a <= 9; a++) for (let b = 1; a + b <= 10; b++) facts.push({ a, b });
  else for (let a = 2; a <= 10; a++) for (let b = 1; b < a; b++) facts.push({ a, b });
  return {
    id: `${op}-pb`,
    op,
    spec: { kind: 'list', facts },
    steps: [{ top: [2, 6] }, { top: [7, 10] }, null],
    title: 'Petits problèmes',
    stepLabels: ["Jusqu'à 6", 'De 7 à 10', 'Tout'],
    need: 1,
    story: true,
    formats: ['pave', 'qcm'],
  };
};

/** Les moitiés : partager 2 à 20 en deux parts égales (racontées comme les petits problèmes). */
const halves: SeriesDef = {
  id: 'sub-half',
  op: 'sub',
  spec: { kind: 'list', facts: Array.from({ length: 10 }, (_, i) => ({ a: 2 * (i + 1), b: i + 1 })) },
  steps: [{ bs: [1, 2, 3, 4, 5] }, { bs: [6, 7, 8, 9, 10] }, null],
  title: 'Les moitiés',
  stepLabels: ['De 2 à 10', 'De 12 à 20', 'Tout'],
  need: 1,
  story: true,
  formats: ['pave', 'qcm'],
};

/** Les mots et les phrases d'un thème sont numérotés à partir de là : 51 = première phrase. */
export const DRILL_BASE = 50;

/** Thème d'anglais : Hello, School et Toys sont ouverts au départ, puis chaque trophée ouvre l'île suivante. */
const theme = (id: ThemeId, i: number): SeriesDef => ({
  id: `eng-${id}`,
  op: 'eng',
  spec: { kind: 'theme', theme: id, n: i + 1 },
  steps: [{ half: 0 }, { half: 1 }, null],
  title: THEMES[i]!.fr,
  stepLabels: ['Mots (1)', 'Mots (2)', 'Mots et phrases'],
  need: Math.max(0, i - 2),
});

/** Fractions : lire une fraction ouverte au départ, puis l'unité, les dixièmes, la comparaison. */
const FRAC_NEED: Record<FracId, number> = { lire: 0, unite: 1, dix: 1, comp: 2 };
const fracSet = (id: FracId, i: number): SeriesDef => ({
  id: `frac-${id}`,
  op: 'frac',
  spec: { kind: 'frac', set: id, n: i + 1 },
  steps: [{ half: 0 }, { half: 1 }, null],
  title: FRAC_SETS[i]!.title,
  stepLabels: ['Partie 1', 'Partie 2', 'Tout'],
  need: FRAC_NEED[id],
  formats: ['qcm'],
});

/** Grands nombres : lire les nombres ouvert au départ, puis la valeur des chiffres, le calcul mental, la division avec reste. */
const BIG_NEED: Record<BigId, number> = { lire: 0, chiffre: 1, calc: 1, reste: 2 };
const bigSet = (id: BigId, i: number): SeriesDef => ({
  id: `big-${id}`,
  op: 'big',
  spec: { kind: 'big', set: id, n: i + 1 },
  steps: [{ half: 0 }, { half: 1 }, null],
  title: BIG_SETS[i]!.title,
  stepLabels: ['Partie 1', 'Partie 2', 'Tout'],
  need: BIG_NEED[id],
  formats: ['qcm'],
});

/** Mesures : les longueurs ouvertes au départ, puis masses et contenances, heures et durées, problèmes. */
const MES_NEED: Record<MesId, number> = { long: 0, masse: 1, heure: 1, pb: 2 };
const mesSet = (id: MesId, i: number): SeriesDef => ({
  id: `mes-${id}`,
  op: 'mes',
  spec: { kind: 'mes', set: id, n: i + 1 },
  steps: [{ half: 0 }, { half: 1 }, null],
  title: MES_SETS[i]!.title,
  stepLabels: ['Partie 1', 'Partie 2', 'Tout'],
  need: MES_NEED[id],
  formats: ['qcm'],
});

/** Nombres : dizaines et unités, avant/après ouverts au départ ; comparer puis la droite graduée. */
const NUM_NEED: Record<NumId, number> = { du: 0, suite: 0, comp: 1, droite: 2 };
const numSet = (id: NumId, i: number): SeriesDef => ({
  id: `num-${id}`,
  op: 'num',
  spec: { kind: 'num', set: id, n: i + 1 },
  steps: [{ half: 0 }, { half: 1 }, null],
  title: NUM_SETS[i]!.title,
  stepLabels: ['Petits nombres', 'Grands nombres', 'Tout'],
  need: NUM_NEED[id],
  formats: id === 'comp' ? ['qcm'] : ['pave', 'qcm'],
});

/** Grandeurs : les pièces et l'heure juste ouvertes au départ ; payer et la demie avec un trophée. */
const GRD_NEED: Record<GrdId, number> = { pieces: 0, payer: 1, heure: 0, demie: 1 };
const grdSet = (id: GrdId, i: number): SeriesDef => ({
  id: `grd-${id}`,
  op: 'grd',
  spec: { kind: 'grd', set: id, n: i + 1 },
  steps: [{ half: 0 }, { half: 1 }, null],
  title: GRD_SETS[i]!.title,
  stepLabels: ['Partie 1', 'Partie 2', 'Tout'],
  need: GRD_NEED[id],
  formats: ['qcm'],
});

/** Espace : les formes ouvertes au départ, puis un trophée par île. */
const ESP_NEED: Record<EspId, number> = { formes: 0, cotes: 1, quadri: 2, position: 0 };
const espSet = (id: EspId, i: number): SeriesDef => ({
  id: `esp-${id}`,
  op: 'esp',
  spec: { kind: 'esp', set: id, n: i + 1 },
  steps: [{ half: 0 }, { half: 1 }, null],
  title: ESP_SETS[i]!.title,
  stepLabels: ['Partie 1', 'Partie 2', 'Tout'],
  need: ESP_NEED[id],
  formats: ['qcm'],
});

/** Lecture : les voyelles et les premières syllabes ouvertes au départ, puis un trophée par île ;
    phrases et dictée (ajoutées après les petits mots) quand l'enfant sait déjà lire des syllabes et des sons. */
const LEC_NEED: Record<ReadId, number> = { voy: 0, syl1: 0, syl2: 1, sons: 2, mots: 3, phr1: 4, dict1: 4, phr2: 5, dict2: 6 };
const readSet = (id: ReadId, i: number): SeriesDef => ({
  id: `lec-${id}`,
  op: 'lec',
  spec: { kind: 'read', set: id, n: i + 1 },
  steps: [{ half: 0 }, { half: 1 }, null],
  title: READ_SETS[i]!.title,
  stepLabels: ['Partie 1', 'Partie 2', 'Tout'],
  need: LEC_NEED[id],
});

/** Trophées de français nécessaires : a/à, et/est et le présent ouverts au départ, puis un par île. */
const FR_NEED: Record<FrQuizId, number> = { a: 0, et: 0, son: 1, on: 2, pres: 0, fut: 1, imp: 2, pc: 3 };

/** Une île de français : une paire d'homophones ou un temps de conjugaison. */
const quiz = (id: FrQuizId, i: number): SeriesDef => ({
  id: `fr-${id}`,
  op: 'fr',
  spec: { kind: 'quiz', quiz: id, n: i + 1 },
  steps: [{ half: 0 }, { half: 1 }, null],
  title: ALL_QUIZZES[i]!.title,
  stepLabels: ['Phrases (1)', 'Phrases (2)', 'Toutes'],
  need: FR_NEED[id],
});

export const SERIES: Record<SeriesId, SeriesDef> = {
  'mul-1': table(1), 'mul-2': table(2), 'mul-3': table(3), 'mul-4': table(4), 'mul-5': table(5),
  'mul-6': table(6), 'mul-7': table(7), 'mul-8': table(8), 'mul-9': table(9), 'mul-10': table(10),
  ...(Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => [`div-${n}`, divTable(n)])) as Record<DivId, SeriesDef>),
  'add-10': upTo10('add'), 'add-c10': friends10, 'add-dbl': doubles, 'add-pb': problems('add'), 'add-20': upTo20('add'),
  'sub-10': upTo10('sub'), 'sub-pb': problems('sub'), 'sub-half': halves, 'sub-20': upTo20('sub'),
  ...(Object.fromEntries(FRAC_SETS.map((r, i) => [`frac-${r.id}`, fracSet(r.id, i)])) as Record<FracSeries, SeriesDef>),
  ...(Object.fromEntries(BIG_SETS.map((r, i) => [`big-${r.id}`, bigSet(r.id, i)])) as Record<BigSeries, SeriesDef>),
  ...(Object.fromEntries(MES_SETS.map((r, i) => [`mes-${r.id}`, mesSet(r.id, i)])) as Record<MesSeries, SeriesDef>),
  ...(Object.fromEntries(NUM_SETS.map((r, i) => [`num-${r.id}`, numSet(r.id, i)])) as Record<NumSeries, SeriesDef>),
  ...(Object.fromEntries(GRD_SETS.map((r, i) => [`grd-${r.id}`, grdSet(r.id, i)])) as Record<GrdSeries, SeriesDef>),
  ...(Object.fromEntries(ESP_SETS.map((r, i) => [`esp-${r.id}`, espSet(r.id, i)])) as Record<EspSeries, SeriesDef>),
  ...(Object.fromEntries(READ_SETS.map((r, i) => [`lec-${r.id}`, readSet(r.id, i)])) as Record<LecId, SeriesDef>),
  ...(Object.fromEntries(ALL_QUIZZES.map((q, i) => [`fr-${q.id}`, quiz(q.id, i)])) as Record<FrId, SeriesDef>),
  ...(Object.fromEntries(THEMES.map((t, i) => [`eng-${t.id}`, theme(t.id, i)])) as Record<EngId, SeriesDef>),
};

export const SERIES_IDS = Object.keys(SERIES) as SeriesId[];

/** Séries d'une opération, dans l'ordre de progression. */
export const seriesOf = (op: Op): SeriesDef[] => SERIES_IDS.filter((id) => SERIES[id].op === op).map((id) => SERIES[id]);

export const isSeriesId = (v: unknown): v is SeriesId => typeof v === 'string' && v in SERIES;

/** Série de la table de n (CM1). */
export const tableSeries = (n: number): SeriesDef => SERIES[`mul-${n}` as TableId];
