/* Dessins de l'espace (CP) : formes pleines cernées d'encre, quadrillage repéré A1…D4, le chat et la boîte
   (le chat des prépositions anglaises, src/art/words-ce2.ts) ou la table. */
import type { ShapeKind } from '../content/picquiz';
import { INK } from './shapes';
import { CAT } from './words-ce2';
import { p, place, r, WOOD, WOOD_DARK } from './words-kit';

const FONT = 'font-family="Fredoka Variable, sans-serif" font-weight="700"';
export const SHAPE_COLORS = ['#2F6FE4', '#D62828', '#2E9E44', '#FFC93C'] as const;

type Pt = readonly [number, number];
/** Sommets de chaque forme (viewBox 0 0 100 100) ; le cercle n'en a pas. */
const POINTS: Record<Exclude<ShapeKind, 'cercle'>, readonly Pt[]> = {
  carre: [[18, 18], [82, 18], [82, 82], [18, 82]],
  rectangle: [[6, 27], [94, 27], [94, 73], [6, 73]],
  triangle: [[50, 12], [92, 84], [8, 84]],
  losange: [[50, 6], [80, 50], [50, 94], [20, 50]],
  pentagone: [[50, 10], [88, 42], [88, 90], [12, 90], [12, 42]],
  hexagone: Array.from({ length: 6 }, (_, i) => [50 + 42 * Math.cos((i * Math.PI) / 3), 50 + 42 * Math.sin((i * Math.PI) / 3)] as const),
};

const turn = ([x, y]: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180, dx = x - 50, dy = y - 50;
  return [50 + dx * Math.cos(a) - dy * Math.sin(a), 50 + dx * Math.sin(a) + dy * Math.cos(a)];
};

/** Forme tournée de `rot` degrés ; `marks` numérote les coins (aide : compter les sommets). */
export function shapeArt(k: ShapeKind, rot = 0, col = 0, size = 130, marks = false): string {
  const fill = SHAPE_COLORS[col % SHAPE_COLORS.length];
  let s: string;
  if (k === 'cercle') s = `<circle cx="50" cy="50" r="40" fill="${fill}" stroke="${INK}" stroke-width="4"/>`;
  else {
    const pts = POINTS[k].map((q) => turn(q, rot));
    s = `<path d="M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}Z" fill="${fill}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
    if (marks) s += pts.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" ${FONT} font-size="11" fill="${INK}">${i + 1}</text>`).join('');
  }
  return `<svg width="${size}" height="${size}" viewBox="-8 -8 116 116" aria-hidden="true">${s}</svg>`;
}

/** Quadrillage 4 × 4 : colonnes A à D en haut, lignes 1 à 4 à gauche, une étoile dans la case `cell` ;
    `guide` colore la colonne et la ligne de l'étoile (aide). */
export function gridArt(cell: string, size = 200, guide = false): string {
  const c = 'ABCD'.indexOf(cell[0]!), row = Number(cell[1]) - 1, o = 30, k = 40;
  let s = '';
  if (guide) s += `<rect x="${o + c * k}" y="0" width="${k}" height="${o + 4 * k}" fill="#FFE7A0"/><rect x="0" y="${o + row * k}" width="${o + 4 * k}" height="${k}" fill="#FFE7A0"/>`;
  s += `<rect x="${o}" y="${o}" width="${4 * k}" height="${4 * k}" fill="${guide ? 'none' : '#fff'}" stroke="${INK}" stroke-width="3"/>`;
  for (let i = 1; i < 4; i++) s += `<path d="M${o + i * k} ${o} V${o + 4 * k} M${o} ${o + i * k} H${o + 4 * k}" stroke="${INK}" stroke-width="2"/>`;
  for (let i = 0; i < 4; i++) {
    s += `<text x="${o + i * k + k / 2}" y="22" text-anchor="middle" ${FONT} font-size="20" fill="${INK}">${'ABCD'[i]}</text>`;
    s += `<text x="14" y="${o + i * k + k / 2 + 7}" text-anchor="middle" ${FONT} font-size="20" fill="${INK}">${i + 1}</text>`;
  }
  const cx = o + c * k + k / 2, cy = o + row * k + k / 2;
  const star = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? 7 : 16;
    return `${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`;
  });
  s += `<path d="M${star.join(' L')}Z" fill="#FFC93C" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  const vb = o + 4 * k + 4;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${vb} ${vb}" aria-hidden="true">${s}</svg>`;
}

/* Le chat et la boîte, ou la table (viewBox 0 0 100 100). */
const BOX = '#C9965B';
/** Boîte en carton posée au sol (bas à y = 94), ouverte si `flaps`. */
const box = (x: number, w = 40, h = 42, flaps = false): string => {
  const y = 94 - h;
  return (flaps ? p(`M${x} ${y} L${x - 10} ${y - 12} L${x} ${y - 6}Z M${x + w} ${y} L${x + w + 10} ${y - 12} L${x + w} ${y - 6}Z`, BOX, 3) : '') +
    r(x, y, w, h, BOX, 2) + p(`M${x + w / 2 - 6} ${y} L${x + w / 2 - 6} ${y + 10} M${x + w / 2 + 6} ${y} L${x + w / 2 + 6} ${y + 10}`, 'none', 2.5);
};
const table = (x: number, w: number): string => r(x + 6, 54, 6, 40, WOOD_DARK, 2, 3) + r(x + w - 12, 54, 6, 40, WOOD_DARK, 2, 3) + r(x, 46, w, 8, WOOD, 2, 3);
const cat = (x: number, y: number, k: number): string => place(x, y, k, CAT);
const floor = p('M4 94 L96 94', 'none', 4);

const SCENES: Record<string, string> = {
  'table-on': table(10, 80) + cat(28, 3, 0.48) + floor,
  'table-under': table(10, 80) + cat(30, 52, 0.46) + floor,
  'table-beside': table(4, 58) + cat(56, 52, 0.46) + floor,
  // Dans : la boîte est ouverte ; derrière : la boîte, fermée et large, cache le bas du chat ; devant : le chat cache la boîte.
  in: cat(29, 18, 0.42) + box(30, 40, 42, true) + floor,
  behind: cat(30, 6, 0.55) + box(20, 60, 48) + floor,
  front: box(22, 56, 64) + cat(24, 48, 0.5) + floor,
  left: cat(-4, 52, 0.46) + box(54) + floor,
  right: box(6) + cat(48, 52, 0.46) + floor,
};

export const placeArt = (pl: string, size = 130): string => `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">${SCENES[pl] ?? ''}</svg>`;
