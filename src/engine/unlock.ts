import { ISLE_IDS, type IsleId } from '../content/isles';
import type { IsleProgress } from '../store/schema';

/** Îles ouvertes au départ. */
export const OPEN_START: readonly IsleId[] = [1, 2, 5, 10];

/** Trophées nécessaires pour ouvrir les autres îles. */
export const REQ: Partial<Record<IsleId, number>> = { 3: 2, 4: 2, 6: 4, 7: 4, 8: 6, 9: 6 };

/** Étapes d'une île : ×1 à ×5, ×6 à ×10, toute la table. Le gardien (index 3) porte sur toute la table. */
export const RANGES: readonly (readonly number[] | null)[] = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], null];
export const ALL_MULTIPLIERS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const BOSS_STEP = 3;

export type IsleMap = Partial<Record<IsleId, IsleProgress>>;

export const emptyIsle = (): IsleProgress => ({ steps: 0, trophy: false, stepStars: [0, 0, 0] });
export const isleOf = (isl: IsleMap, n: IsleId): IsleProgress => isl[n] ?? emptyIsle();

export const isleStars = (p: IsleProgress): number => p.stepStars[0] + p.stepStars[1] + p.stepStars[2];

export const trophies = (isl: IsleMap): number => ISLE_IDS.filter((n) => isl[n]?.trophy).length;

export const isOpen = (isl: IsleMap, n: IsleId): boolean => OPEN_START.includes(n) || trophies(isl) >= (REQ[n] ?? 0);

export const openIsles = (isl: IsleMap): IsleId[] => ISLE_IDS.filter((n) => isOpen(isl, n));

/** Trophées encore nécessaires pour ouvrir l'île (0 si ouverte). */
export const missingTrophies = (isl: IsleMap, n: IsleId): number => (isOpen(isl, n) ? 0 : (REQ[n] ?? 0) - trophies(isl));

/** Une étape s'ouvre quand la précédente est réussie. */
export const stepOpen = (p: IsleProgress, i: number): boolean => i <= p.steps;
export const bossOpen = (p: IsleProgress): boolean => p.steps >= 3;
/** Le défi chrono s'ouvre après l'étape 1. */
export const chronoOpen = (p: IsleProgress): boolean => p.steps >= 1;

/** Étape proposée par défaut (1 à 3), comme `p.step` du prototype. */
export const currentStep = (p: IsleProgress): number => Math.min(3, p.steps + 1);

/** Sélection initiale sur l'écran d'île : prochaine étape, sinon le gardien, sinon la dernière étape. */
export const defaultSelection = (p: IsleProgress): number => (p.steps < 3 ? p.steps : p.trophy ? 2 : 3);
