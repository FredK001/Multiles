/* Modèle de données persistant de Multîles. Toute modification de forme impose
   d'incrémenter SCHEMA_VERSION et d'ajouter une migration (src/store/migrations.ts). */
import type { AvatarLook } from '../content/avatar';
import type { IsleId } from '../content/isles';
import type { PepinVariant } from '../content/pepins';
import type { PepWear } from '../art/mascot';
import type { DayKey } from '../engine/dates';
import type { MulKey } from '../engine/keys';

export const SCHEMA_VERSION = 2;

/** Progression sur une île. Le prototype stockait [étapes, trophée, total] ; on garde les étoiles par étape. */
export interface IsleProgress {
  /** Nombre d'étapes réussies (0 à 3). */
  steps: number;
  trophy: boolean;
  /** Meilleures étoiles obtenues sur chaque étape (0 à 3). */
  stepStars: [number, number, number];
}

export interface DayStats {
  /** Temps de jeu actif (ms), onglet visible uniquement. */
  ms: number;
  /** Sessions terminées ce jour-là. */
  sessions: number;
}

export interface Streak {
  /** Jours de suite. */
  current: number;
  /** Record, conservé quand la série repart à 0. */
  best: number;
  /** Bouées disponibles (2 au maximum). */
  buoys: number;
  /** Dernier jour couvert par la série (joué ou sauvé par une bouée). */
  lastDay: DayKey | null;
  /** Jours sauvés par une bouée (affichés dans la semaine). */
  buoyDays: DayKey[];
  /** Dernier jour où la série a été vérifiée (évite de consommer deux fois une bouée). */
  checkedDay: DayKey | null;
}

/** Événement de série à annoncer à l'enfant à l'accueil. */
export type StreakEvent =
  | { kind: 'buoy'; streak: number; buoysLeft: number; missed: number }
  | { kind: 'reset'; best: number };

export interface Profile {
  id: string;
  name: string;
  /** Couleur de profil (une des 4 de PROFILE_COLORS). */
  color: string;
  av: AvatarLook;
  pepin: PepinVariant;
  /** Habillage du Pépin. */
  pw: PepWear;
  /** Objets installés dans la maison. */
  house: string[];
  /** Objets achetés en boutique. */
  owned: string[];
  stars: number;
  coins: number;
  level: number;
  xp: number;
  streak: Streak;
  /** Île en cours : dernière île jouée en étape ou gardien. */
  isle: IsleId;
  isl: Partial<Record<IsleId, IsleProgress>>;
  /** Multiplications maîtrisées, dans l'ordre où elles ont été réussies (colore la grille). */
  mastered: MulKey[];
  traps: MulKey[];
  /** Dates des erreurs par multiplication (clé canonique « 7x8 »). */
  trapLog: Record<string, DayKey[]>;
  /** Record du défi chrono par table. */
  records: Partial<Record<IsleId, number>>;
  stickers: string[];
  /** Stickers déjà vus dans l'album (les autres portent « Nouveau »). */
  seen: string[];
  /** Historique de jeu par jour. */
  days: Record<string, DayStats>;
  /** Dernier jour où le défi du jour a été réussi. */
  defiDay: DayKey | null;
  /** Table du défi tirée pour la journée (ne change pas si une île s'ouvre entre-temps). */
  defiPick: { day: DayKey; table: IsleId } | null;
  /** Annonce de série en attente (bouée utilisée ou série remise à zéro). */
  pendingStreak: StreakEvent | null;
  createdAt: number;
}

export type BossTime = 0 | 2 | 3;

/** Réglages de l'espace parent, communs à tous les profils (comme dans le prototype). */
export interface Settings {
  sound: boolean;
  /** Durée du gardien en minutes, 0 = sans chrono. */
  bossTime: BossTime;
}

export interface AppData {
  version: number;
  profiles: Profile[];
  settings: Settings;
  /** navigator.storage.persist() déjà demandé. */
  persistAsked: boolean;
  /** Dernier fichier de sauvegarde enregistré depuis cet appareil (rappel dans l'espace parent). */
  lastBackup: DayKey | null;
}

export const MAX_PROFILES = 4;
/** Valeurs de départ d'un nouveau profil (prototype : 50 pièces, 1 bouée). */
export const START_COINS = 50;
export const START_BUOYS = 1;

export const defaultSettings = (): Settings => ({ sound: true, bossTime: 2 });

export const emptyData = (): AppData => ({ version: SCHEMA_VERSION, profiles: [], settings: defaultSettings(), persistAsked: false, lastBackup: null });
