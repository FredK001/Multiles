import type { IsleId } from '../content/isles';
import { SERIES, seriesOf, type Op, type SeriesId, type TableId } from '../content/series';
import type { IsleProgress } from '../store/schema';

/** Étapes d'une table : ×1 à ×5, ×6 à ×10, toute la table. Le gardien (index 3) porte sur toute la table. */
export const RANGES: readonly (readonly number[] | null)[] = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], null];
export const ALL_MULTIPLIERS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const BOSS_STEP = 3;

/** Progression des îles d'une opération, par série. */
export type SeriesMap = Partial<Record<SeriesId, IsleProgress>>;

/** Série de la table n (île n du CM1) et inversement. */
export const tableId = (n: IsleId | number): TableId => `mul-${n}` as TableId;
export const tableNum = (id: SeriesId): IsleId => Number(id.slice(4)) as IsleId;

export const emptyIsle = (): IsleProgress => ({ steps: 0, trophy: false, stepStars: [0, 0, 0] });
export const isleOf = (m: SeriesMap, id: SeriesId): IsleProgress => m[id] ?? emptyIsle();

export const isleStars = (p: IsleProgress): number => p.stepStars[0] + p.stepStars[1] + p.stepStars[2];

/** Étoiles de toutes les îles d'une opération. */
export const totalStars = (m: SeriesMap): number => Object.values(m).reduce((t, ip) => t + (ip ? isleStars(ip) : 0), 0);

/** Trophées gagnés dans une opération. */
export const trophies = (m: SeriesMap, op: Op): number => seriesOf(op).filter((s) => m[s.id]?.trophy).length;

export const isOpen = (m: SeriesMap, id: SeriesId): boolean => trophies(m, SERIES[id].op) >= SERIES[id].need;

export const openSeries = (m: SeriesMap, op: Op): SeriesId[] => seriesOf(op).filter((s) => isOpen(m, s.id)).map((s) => s.id);

/** Trophées encore nécessaires pour ouvrir l'île (0 si ouverte). */
export const missingTrophies = (m: SeriesMap, id: SeriesId): number => Math.max(0, SERIES[id].need - trophies(m, SERIES[id].op));

/** Une étape s'ouvre quand la précédente est réussie. */
export const stepOpen = (p: IsleProgress, i: number): boolean => i <= p.steps;
export const bossOpen = (p: IsleProgress): boolean => p.steps >= 3;
/** Le défi chrono s'ouvre après l'étape 1. */
export const chronoOpen = (p: IsleProgress): boolean => p.steps >= 1;

/** Étape proposée par défaut (1 à 3), comme `p.step` du prototype. */
export const currentStep = (p: IsleProgress): number => Math.min(3, p.steps + 1);

/** Sélection initiale sur l'écran d'île : prochaine étape, sinon le gardien, sinon la dernière étape. */
export const defaultSelection = (p: IsleProgress): number => (p.steps < 3 ? p.steps : p.trophy ? 2 : 3);
