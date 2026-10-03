/* Fichier de sauvegarde : toute la progression de l'appareil, pour la retrouver ailleurs
   (autre navigateur, autre raccourci d'écran d'accueil, autre téléphone). */
import { dayKey } from '../engine/dates';
import { migrate } from './migrations';
import type { AppData } from './schema';

const MARK = 'multiles-sauvegarde';

export class BackupError extends Error {}

/** Contenu et nom du fichier à enregistrer. */
export function makeBackup(data: AppData, now = new Date()): { name: string; text: string } {
  return {
    name: `multiles-sauvegarde-${dayKey(now)}.json`,
    text: JSON.stringify({ app: MARK, savedAt: now.toISOString(), data }),
  };
}

/** Relit un fichier de sauvegarde ; lève BackupError s'il n'en est pas un. */
export function readBackup(text: string): AppData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupError("Ce fichier n'est pas une sauvegarde Multîles.");
  }
  const o = raw as { app?: unknown; data?: unknown } | null;
  if (!o || o.app !== MARK || typeof o.data !== 'object' || o.data === null) {
    throw new BackupError("Ce fichier n'est pas une sauvegarde Multîles.");
  }
  // Une sauvegarde venant d'une version plus récente lève FutureVersionError : rien n'est écrasé.
  return migrate(o.data);
}
