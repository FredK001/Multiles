/* Dessins des grandeurs (CP) : pièces et billets d'euro stylisés (la valeur écrite en grand, sans copier les vrais
   billets), horloge à aiguilles, moments de la journée. */
import { INK } from './shapes';

const FONT = 'font-family="Fredoka Variable, sans-serif" font-weight="700"';
const GOLD = '#E8B830', SILVER = '#CDD3DC';
/** Billets : gris (5 €), rouge (10 €), bleu (20 €), comme les vrais, en plus clair. */
const BILL: Record<number, string> = { 5: '#C4CFC9', 10: '#F2A9A0', 20: '#A9C2EE' };
const COIN_D = 46, BILL_W = 78, BILL_H = 46, GAP = 8;

/** Pièce de 1 € (centre doré, bord argenté) ou de 2 € (l'inverse), en (x, y) coin haut gauche. */
function coin(v: number, x: number, y: number): string {
  const r = COIN_D / 2, cx = x + r, cy = y + r, [rim, mid] = v === 2 ? [GOLD, SILVER] : [SILVER, GOLD];
  return `<circle cx="${cx}" cy="${cy}" r="${r - 1.5}" fill="${rim}" stroke="${INK}" stroke-width="3"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r - 8}" fill="${mid}" stroke="${INK}" stroke-width="1.5"/>` +
    `<text x="${cx}" y="${cy + 6}" text-anchor="middle" ${FONT} font-size="17" fill="${INK}">${v}€</text>`;
}

/** Billet : rectangle coloré, une arche stylisée, la valeur en grand. */
function bill(v: number, x: number, y: number): string {
  return `<rect x="${x + 1.5}" y="${y + 1.5}" width="${BILL_W - 3}" height="${BILL_H - 3}" rx="5" fill="${BILL[v] ?? '#DDD'}" stroke="${INK}" stroke-width="3"/>` +
    `<path d="M${x + 7} ${y + BILL_H - 8} V${y + 20} Q${x + 13} ${y + 11} ${x + 19} ${y + 20} V${y + BILL_H - 8}" fill="none" stroke="${INK}" stroke-width="1.6" opacity=".55"/>` +
    `<text x="${x + 47}" y="${y + 31}" text-anchor="middle" ${FONT} font-size="21" fill="${INK}">${v} €</text>`;
}

/** Billets puis pièces, du plus grand au plus petit, sur une ou plusieurs rangées de largeur `maxW` au plus. */
export function moneyArt(values: readonly number[], h = 110, maxW = 320): string {
  const sorted = [...values].sort((a, b) => b - a), rows: number[][] = [[]];
  let w = 0;
  for (const v of sorted) {
    const iw = v >= 5 ? BILL_W : COIN_D;
    if (w && w + GAP + iw > maxW) { rows.push([]); w = 0; }
    w += (w ? GAP : 0) + iw;
    rows[rows.length - 1]!.push(v);
  }
  const rowW = (r: number[]) => r.reduce((t, v, i) => t + (i ? GAP : 0) + (v >= 5 ? BILL_W : COIN_D), 0);
  const vw = Math.max(...rows.map(rowW)) + 8, rowH = BILL_H, vh = rows.length * rowH + (rows.length - 1) * GAP + 8;
  let s = '';
  rows.forEach((r, k) => {
    let x = 4 + (vw - 8 - rowW(r)) / 2;
    const y = 4 + k * (rowH + GAP);
    for (const v of r) {
      s += v >= 5 ? bill(v, x, y) : coin(v, x, y + (rowH - COIN_D) / 2);
      x += (v >= 5 ? BILL_W : COIN_D) + GAP;
    }
  });
  return `<svg width="${Math.round((vw * h) / vh)}" height="${h}" viewBox="0 0 ${vw} ${vh}" aria-hidden="true" style="max-width:100%;height:auto">${s}</svg>`;
}

/** Horloge : 12 graduations et les nombres, petite aiguille courte et épaisse, grande aiguille longue et fine (rouge). */
export function clockArt(h: number, m: number, size = 150): string {
  const c = 60, at = (deg: number, r: number) => [c + r * Math.sin((deg * Math.PI) / 180), c - r * Math.cos((deg * Math.PI) / 180)].map((v) => v.toFixed(1));
  let s = `<circle cx="${c}" cy="${c}" r="56" fill="#fff" stroke="${INK}" stroke-width="5"/>`;
  for (let k = 1; k <= 12; k++) {
    const [x1, y1] = at(k * 30, 52), [x2, y2] = at(k * 30, 46), [tx, ty] = at(k * 30, 37);
    s += `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    s += `<text x="${tx}" y="${(Number(ty) + 5).toFixed(1)}" text-anchor="middle" ${FONT} font-size="14" fill="${INK}">${k}</text>`;
  }
  const [hx, hy] = at(((h % 12) + m / 60) * 30, 25), [mx, my] = at(m * 6, 44);
  s += `<path d="M${c} ${c} L${hx} ${hy}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
  s += `<path d="M${c} ${c} L${mx} ${my}" stroke="#D62828" stroke-width="4" stroke-linecap="round"/>`;
  s += `<circle cx="${c}" cy="${c}" r="5" fill="${INK}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">${s}</svg>`;
}

/** Moments de la journée : soleil levant (matin), soleil au plus haut (midi), soleil couchant et lune (soir). */
export function skyArt(when: string, size = 150): string {
  const sky = when === 'soir' ? '#2B3A6B' : when === 'midi' ? '#BFE3FF' : '#FFE3B0';
  const sun = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFC93C" stroke="${INK}" stroke-width="3"/>`;
  const rays = (x: number, y: number) => Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return `<path d="M${(x + 17 * Math.cos(a)).toFixed(1)} ${(y + 17 * Math.sin(a)).toFixed(1)} L${(x + 24 * Math.cos(a)).toFixed(1)} ${(y + 24 * Math.sin(a)).toFixed(1)}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  }).join('');
  let s = `<rect x="2" y="2" width="116" height="86" rx="12" fill="${sky}"/>`;
  if (when === 'midi') s += rays(60, 26) + sun(60, 26, 13);
  if (when === 'matin') s += sun(30, 62, 14) + rays(30, 62);
  if (when === 'soir') {
    s += sun(92, 70, 12);
    s += `<path d="M38 14 A13 13 0 1 0 50 34 A10 10 0 1 1 38 14Z" fill="#FFF3C4" stroke="${INK}" stroke-width="2.5"/>`;
    s += [[70, 18], [88, 30], [22, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#FFF3C4"/>`).join('');
  }
  s += `<path d="M3 72 Q34 54 64 70 T117 66 L117 76 Q117 87 106 87 L14 87 Q3 87 3 76Z" fill="${when === 'soir' ? '#2E6B3A' : '#7BC96F'}" stroke="${INK}" stroke-width="3"/>`;
  // Le cadre par-dessus : la colline ne dépasse pas.
  s += `<rect x="2" y="2" width="116" height="86" rx="12" fill="none" stroke="${INK}" stroke-width="4"/>`;
  return `<svg width="${size}" height="${Math.round((size * 90) / 120)}" viewBox="0 0 120 90" aria-hidden="true">${s}</svg>`;
}
