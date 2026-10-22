/* Horloge à aiguilles (mesures, CM1) : cadran numéroté de 1 à 12, graduations des minutes,
   petite aiguille épaisse (heures, avancée selon les minutes) et grande aiguille fine (minutes). */
import { INK } from './shapes';

/** Point du cadran à l'angle d'une fraction de tour `t` (0 = midi), à la distance `r` du centre. */
const at = (t: number, r: number, c = 60): [string, string] => {
  const a = -Math.PI / 2 + t * 2 * Math.PI;
  return [(c + r * Math.cos(a)).toFixed(2), (c + r * Math.sin(a)).toFixed(2)];
};

export function clockArt(h: number, m: number, size = 150, hand = '#A33B2B'): string {
  let s = `<circle cx="60" cy="60" r="56" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
  for (let i = 0; i < 60; i++) {
    const [x1, y1] = at(i / 60, i % 5 ? 50 : 46), [x2, y2] = at(i / 60, 53);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="${i % 5 ? 1 : 2.5}" stroke-linecap="round"/>`;
  }
  for (let n = 1; n <= 12; n++) {
    const [x, y] = at(n / 12, 37);
    s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="var(--titre, sans-serif)" font-weight="700" font-size="13" fill="${INK}">${n}</text>`;
  }
  // La petite aiguille avance entre deux nombres au fil des minutes (à 3 h 45, elle est presque sur le 4).
  const [hx, hy] = at(((h % 12) + m / 60) / 12, 24), [mx, my] = at(m / 60, 42);
  s += `<line x1="60" y1="60" x2="${hx}" y2="${hy}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  s += `<line x1="60" y1="60" x2="${mx}" y2="${my}" stroke="${hand}" stroke-width="4" stroke-linecap="round"/>`;
  s += `<circle cx="60" cy="60" r="4.5" fill="${INK}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">${s}</svg>`;
}

/** Description de l'horloge pour les lecteurs d'écran, sans donner l'heure toute faite. */
export function clockLabel(h: number, m: number): string {
  const next = (h % 12) + 1;
  const small = m === 0 ? `sur le ${h}` : `entre le ${h} et le ${next}`;
  const big = m === 0 ? 'sur le 12' : m % 5 === 0 ? `sur le ${m / 5}` : `à ${m} minutes`;
  return `Une horloge à aiguilles : la petite aiguille est ${small}, la grande aiguille est ${big}.`;
}
