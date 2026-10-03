/* Table de correspondance nom → fonction/constante de src/art, pour exécuter les cas d'atelier. */
import * as art from '../art';
import type { ArtCase } from './cases';

const REGISTRY: Record<string, unknown> = { ...art };

/** Le prototype nomme les stickers « 7-lieu », l'application « mul-7-lieu ». */
function appArgs(c: ArtCase): unknown[] {
  const a = c.args ?? [];
  return c.fn === 'stickerArt' && /^\d/.test(String(a[0])) ? [`mul-${a[0]}`, ...a.slice(1)] : a;
}

export function runCase(c: ArtCase): string {
  const target = REGISTRY[c.fn];
  if (target === undefined) throw new Error(`Illustration inconnue : ${c.fn}`);
  return typeof target === 'function' ? (target as (...a: unknown[]) => string)(...appArgs(c)) : String(target);
}
