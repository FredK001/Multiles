/* Table de correspondance nom → fonction/constante de src/art, pour exécuter les cas d'atelier. */
import * as art from '../art';
import type { ArtCase } from './cases';

const REGISTRY: Record<string, unknown> = { ...art };

export function runCase(c: ArtCase): string {
  const target = REGISTRY[c.fn];
  if (target === undefined) throw new Error(`Illustration inconnue : ${c.fn}`);
  return typeof target === 'function' ? (target as (...a: unknown[]) => string)(...(c.args ?? [])) : String(target);
}
