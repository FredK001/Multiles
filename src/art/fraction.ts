/* Dessin d'une fraction : disque partagé (jusqu'aux sixièmes) ou barre (huitièmes, dixièmes), n parts coloriées sur d. */
import { INK } from './shapes';

export function fractionArt(n: number, d: number, size = 140, fill = '#9C2F5B'): string {
  if (d >= 8) {
    const w = 260, h = 56, part = w / d;
    let s = '';
    for (let i = 0; i < d; i++) s += `<rect x="${8 + i * part}" y="8" width="${part}" height="${h}" fill="${i < n ? fill : '#fff'}" stroke="${INK}" stroke-width="3"/>`;
    return `<svg width="${Math.round(size * 1.9)}" height="${Math.round(size * 0.5)}" viewBox="0 0 ${w + 16} ${h + 16}" aria-hidden="true" style="max-width:100%;height:auto">${s}</svg>`;
  }
  const c = 60, r = 52, pt = (k: number) => {
    const t = -Math.PI / 2 + (k / d) * 2 * Math.PI;
    return `${(c + r * Math.cos(t)).toFixed(2)} ${(c + r * Math.sin(t)).toFixed(2)}`;
  };
  let s = '';
  for (let i = 0; i < d; i++) s += `<path d="M${c} ${c} L${pt(i)} A${r} ${r} 0 0 1 ${pt(i + 1)}Z" fill="${i < n ? fill : '#fff'}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">${s}<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${INK}" stroke-width="4"/></svg>`;
}
