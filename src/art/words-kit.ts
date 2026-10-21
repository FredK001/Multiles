/* Petits outils de dessin pour les mots d'anglais (viewBox 0 0 100 100) : formes cernées d'encre, trait de 4. */
import { INK } from './shapes';

const edge = (w: number, s: string) => `stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

/** Chemin cerné ; `s` change la couleur du trait (craie, reflets). */
export const p = (d: string, fill = 'none', w = 4, s = INK): string => `<path d="${d}" fill="${fill}" ${edge(w, s)}/>`;
export const r = (x: number, y: number, w: number, h: number, fill: string, rx = 0, sw = 4, s = INK): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${edge(sw, s)}/>`;
export const c = (cx: number, cy: number, rad: number, fill: string, sw = 4, s = INK): string =>
  `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" ${edge(sw, s)}/>`;
export const e = (cx: number, cy: number, rx: number, ry: number, fill: string, sw = 4, s = INK): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${edge(sw, s)}/>`;
/** Membre ou tube : ligne brisée épaisse cernée d'encre (points « x y »). */
export const limb = (pts: readonly (readonly [number, number])[], col: string, w: number): string => {
  const d = 'M' + pts.map(([x, y]) => `${x} ${y}`).join(' L');
  return p(d, 'none', w + 5) + p(d, 'none', w, col);
};
/** Point plein sans contour (yeux, boutons). */
export const dot = (cx: number, cy: number, rad: number, fill = INK): string => `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}"/>`;
/** Groupe tourné autour du centre du dessin. */
export const turn = (deg: number, body: string, cx = 50, cy = 50): string => `<g transform="rotate(${deg} ${cx} ${cy})">${body}</g>`;
/** Groupe déplacé et mis à l'échelle (pour réutiliser un dessin en petit). */
export const place = (x: number, y: number, k: number, body: string): string => `<g transform="translate(${x} ${y}) scale(${k})">${body}</g>`;

export const SKIN = '#F6D2B8';
export const WOOD = '#C08A50';
export const WOOD_DARK = '#8B5A2B';
export const HALO = '#FFE58A';
export const PALE_LINE = '#9AA0AE';

/* Enfant (tête, tee-shirt, pantalon) dans une pose : actions, loisirs, consignes de classe. */
export type Pt = [number, number];
export interface Pose { head: Pt; neck: Pt; hip: Pt; arms: [Pt[], Pt[]]; legs: [Pt[], Pt[]]; shirt?: string; pants?: string }

export function kid({ head, neck, hip, arms, legs, shirt = '#D62828', pants = '#2F6FE4' }: Pose, open = false): string {
  const [hx, hy] = head;
  return limb(arms[0], SKIN, 7) + limb(legs[0], pants, 9) + limb(legs[1], pants, 9) + limb([neck, hip], shirt, 15) + limb(arms[1], SKIN, 7) +
    c(hx, hy, 10, SKIN) + p(`M${hx - 10} ${hy - 1} Q${hx - 10} ${hy - 12} ${hx} ${hy - 12} Q${hx + 10} ${hy - 12} ${hx + 10} ${hy - 1} Q${hx} ${hy - 6} ${hx - 10} ${hy - 1}Z`, '#6B3E1F', 3) +
    dot(hx - 3.5, hy + 1, 1.6) + dot(hx + 3.5, hy + 1, 1.6) +
    (open ? e(hx, hy + 6, 2.6, 3, '#D62828', 1.8) : p(`M${hx - 3} ${hy + 5} Q${hx} ${hy + 8} ${hx + 3} ${hy + 5}`, 'none', 2));
}
/** Note de musique. */
export const NOTE = (x: number, y: number): string => p(`M${x} ${y} L${x} ${y - 14} L${x + 9} ${y - 17} L${x + 9} ${y - 3}`, 'none', 3) + e(x - 3, y, 4, 3, INK, 0) + e(x + 6, y - 3, 4, 3, INK, 0);

