/* Stickers de l'album. Portés du prototype à l'identique. */
import { ISLES } from '../content/isles';
import { parseSticker } from '../content/stickers';
import { stageFor } from '../engine/level';
import type { PepinLook } from './house';
import { bossSvg, islandArt } from './islands';
import { mascot } from './mascot';
import { sparkle, svgInner } from './shapes';

export function stickerArt(k: string, p: PepinLook, size: number): string {
  const [n, t] = parseSticker(k), I = ISLES[n];
  if (t === 'lieu') return `<svg width="${size}" height="${size}" viewBox="0 0 180 180" aria-hidden="true"><rect width="180" height="180" fill="#CFEFF5"/><g transform="translate(0 30)">${svgInner(islandArt(n, false))}</g></svg>`;
  if (t === 'gardien') return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="${I.clair}"/><g transform="translate(10 12) scale(.84)">${svgInner(bossSvg(n, 120, false))}</g></svg>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="${I.fort}"/><circle cx="100" cy="210" r="90" fill="${I.clair}"/><g transform="translate(22 30) scale(.78)">${svgInner(mascot({ variant: p.pepin, stage: stageFor(p.level), mood: 'joie', wear: p.pw, noSparkle: true, size: 200 }))}</g>${sparkle(30, 34, 10)}${sparkle(170, 48, 8)}</svg>`;
}
