/* Avatar de l'enfant : visage, coiffure, peau, cheveux, accessoire, tenue. Porté du prototype à l'identique. */
import type { AvatarLook } from '../content/avatar';
import { darken } from '../design/color';
import { INK, sparkle } from './shapes';

export interface AvatarOptions extends AvatarLook {
  /** Couleur de profil (t-shirt). */
  color: string;
  size?: number;
}

/** Compteur d'identifiants de clipPath : chaque avatar affiché doit avoir le sien. */
let CLIPN = 0;

export function avatar(o: AvatarOptions): string {
  const cx = 80, cy = 80, { face, skin, hair, hairColor: hc, acc } = o, shirt = o.color, size = o.size || 160;
  const G = { rond: { w: 44, top: cy - 44 }, ovale: { w: 40, top: cy - 48 }, doux: { w: 42, top: cy - 46 } }[face];
  const w = G.w, top = G.top, sw = 3.5;
  let s = `<svg width="${size}" height="${Math.round(size * 1.0625)}" viewBox="0 0 160 170" aria-hidden="true">`;
  const capPath = (fringeMid: number, side: number, extra = 3) => {
    const x1 = cx - w - extra, x2 = cx + w + extra, y0 = cy - side;
    const c = ((top - 4) - 0.25 * y0) / 0.75;
    return `<path d="M${x1} ${y0} C${x1} ${c} ${x2} ${c} ${x2} ${y0} C${x2 - 6} ${fringeMid + 4} ${x1 + 34} ${fringeMid - 8} ${x1} ${y0}Z" fill="${hc}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  };
  if (hair === 'milong') s += `<path d="M${cx - w - 7} ${cy} C${cx - w - 7} ${top - 12} ${cx + w + 7} ${top - 12} ${cx + w + 7} ${cy} V${cy + 44} Q${cx + w + 7} ${cy + 52} ${cx + w - 1} ${cy + 52} H${cx - w + 1} Q${cx - w - 7} ${cy + 52} ${cx - w - 7} ${cy + 44}Z" fill="${hc}" stroke="${INK}" stroke-width="${sw}"/>`;
  if (hair === 'chignon') s += `<circle cx="${cx}" cy="${top - 6}" r="16" fill="${hc}" stroke="${INK}" stroke-width="${sw}"/>`;
  if (hair === 'boucle') {
    for (let a = 160; a <= 380; a += 22) {
      const r = a * Math.PI / 180;
      s += `<circle cx="${(cx + (w + 5) * Math.cos(r)).toFixed(1)}" cy="${(cy - 4 + (w + 6) * Math.sin(r)).toFixed(1)}" r="15" fill="${hc}" stroke="${INK}" stroke-width="${sw}"/>`;
    }
  }
  const torso = 'M26 170 C26 136 50 124 80 124 C110 124 134 136 134 170Z', ot = o.outfit || '', cid = 't' + (++CLIPN);
  if (ot === 'cape') s += `<path d="M30 132 Q20 160 14 170 H146 Q140 160 130 132Z" fill="#E2506A" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  s += `<defs><clipPath id="${cid}"><path d="${torso}"/></clipPath></defs><path d="${torso}" fill="${ot === 'astro' ? '#F2F5F8' : shirt}"/>`;
  if (ot === 'raye') s += `<g clip-path="url(#${cid})">${[134, 146, 158].map((y) => `<rect x="20" y="${y}" width="120" height="6" fill="#fff"/>`).join('')}</g>`;
  if (ot === 'etoiles') s += `<g clip-path="url(#${cid})">${sparkle(52, 150, 7, '#FFC93C') + sparkle(80, 160, 6, '#FFC93C') + sparkle(108, 148, 7, '#FFC93C')}</g>`;
  if (ot === 'astro') s += `<g clip-path="url(#${cid})"><rect x="68" y="140" width="24" height="18" rx="4" fill="#2F5BEA" stroke="${INK}" stroke-width="2.5"/><circle cx="74" cy="149" r="2.5" fill="#FFC93C"/><circle cx="86" cy="149" r="2.5" fill="#E2506A"/><rect x="26" y="150" width="14" height="20" fill="${shirt}"/><rect x="120" y="150" width="14" height="20" fill="${shirt}"/></g>`;
  s += `<path d="${torso}" fill="none" stroke="${INK}" stroke-width="${sw}"/><path d="M66 124 Q80 136 94 124" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  if (ot === 'astro') s += `<path d="M58 126 Q80 140 102 126" fill="none" stroke="#9AA2B6" stroke-width="7" stroke-linecap="round"/>`;
  if (ot === 'cape') s += `<path d="M28 170 Q30 142 58 128 L62 170Z M132 170 Q130 142 102 128 L98 170Z" fill="#E2506A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  if (ot === 'cape') s += `<circle cx="66" cy="130" r="5" fill="#FFC93C" stroke="${INK}" stroke-width="2.5"/><circle cx="94" cy="130" r="5" fill="#FFC93C" stroke="${INK}" stroke-width="2.5"/>`;
  s += `<rect x="70" y="${cy + 26}" width="20" height="20" fill="${skin}" stroke="${INK}" stroke-width="${sw}"/>`;
  s += `<circle cx="${cx - w}" cy="${cy + 8}" r="8" fill="${skin}" stroke="${INK}" stroke-width="${sw}"/><circle cx="${cx + w}" cy="${cy + 8}" r="8" fill="${skin}" stroke="${INK}" stroke-width="${sw}"/>`;
  if (face === 'rond') s += `<circle cx="${cx}" cy="${cy}" r="44" fill="${skin}" stroke="${INK}" stroke-width="${sw}"/>`;
  if (face === 'ovale') s += `<ellipse cx="${cx}" cy="${cy}" rx="40" ry="48" fill="${skin}" stroke="${INK}" stroke-width="${sw}"/>`;
  if (face === 'doux') s += `<rect x="${cx - 42}" y="${cy - 46}" width="84" height="92" rx="30" fill="${skin}" stroke="${INK}" stroke-width="${sw}"/>`;
  s += `<ellipse cx="${cx - 24}" cy="${cy + 20}" rx="7" ry="4.5" fill="#F07C8A" opacity=".55"/><ellipse cx="${cx + 24}" cy="${cy + 20}" rx="7" ry="4.5" fill="#F07C8A" opacity=".55"/>`;
  s += `<circle cx="${cx - 14}" cy="${cy + 8}" r="5" fill="${INK}"/><circle cx="${cx + 14}" cy="${cy + 8}" r="5" fill="${INK}"/><circle cx="${cx - 12.5}" cy="${cy + 6.2}" r="1.7" fill="#fff"/><circle cx="${cx + 15.5}" cy="${cy + 6.2}" r="1.7" fill="#fff"/>`;
  s += `<path d="M${cx - 10} ${cy + 23} Q${cx} ${cy + 32} ${cx + 10} ${cy + 23}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
  if (['court', 'milong', 'chignon', 'couettes'].includes(hair)) s += capPath(cy - 14, 2);
  if (hair === 'ras') s += capPath(cy - 30, 16, 1);
  if (hair === 'boucle') {
    for (let x = cx - 28; x <= cx + 28; x += 14) {
      s += `<circle cx="${x}" cy="${top + 10 + (Math.abs(x - cx) > 20 ? 6 : 0)}" r="13" fill="${hc}" stroke="${INK}" stroke-width="${sw}"/>`;
    }
  }
  if (hair === 'couettes') {
    [-1, 1].forEach((d) => {
      s += `<circle cx="${cx + d * (w + 13)}" cy="${cy + 6}" r="15" fill="${hc}" stroke="${INK}" stroke-width="${sw}"/><circle cx="${cx + d * (w + 1)}" cy="${cy - 2}" r="5" fill="${shirt}" stroke="${INK}" stroke-width="3"/>`;
    });
  }
  if (acc === 'lunettes') s += `<circle cx="${cx - 14}" cy="${cy + 8}" r="11" fill="#fff" fill-opacity=".25" stroke="${INK}" stroke-width="3.5"/><circle cx="${cx + 14}" cy="${cy + 8}" r="11" fill="#fff" fill-opacity=".25" stroke="${INK}" stroke-width="3.5"/><path d="M${cx - 3} ${cy + 8} H${cx + 3}" stroke="${INK}" stroke-width="3.5"/>`;
  if (acc === 'casquette') {
    const c = ((top - 12) - 0.25 * (cy - 12)) / 0.75;
    s += `<path d="M${cx - w - 5} ${cy - 12} C${cx - w - 5} ${c} ${cx + w + 5} ${c} ${cx + w + 5} ${cy - 12}Z" fill="${shirt}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M${cx - w - 5} ${cy - 12} Q${cx + 6} ${cy - 2} ${cx + w + 22} ${cy - 14} Q${cx + 6} ${cy - 22} ${cx - w - 5} ${cy - 12}Z" fill="${darken(shirt)}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  }
  if (acc === 'bandeau') s += `<rect x="${cx - w + 2}" y="${cy - 20}" width="${2 * w - 4}" height="10" rx="5" fill="#2F5BEA" stroke="${INK}" stroke-width="3"/>`;
  if (acc === 'noeud') {
    const bx = cx + w - 8, by = top + 14;
    s += `<path d="M${bx} ${by} L${bx - 14} ${by - 10} L${bx - 14} ${by + 10}Z M${bx} ${by} L${bx + 14} ${by - 10} L${bx + 14} ${by + 10}Z" fill="#E2506A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="${bx}" cy="${by}" r="5" fill="#E2506A" stroke="${INK}" stroke-width="3"/>`;
  }
  if (acc === 'etoile') {
    const p: string[] = [];
    const bx = cx - w + 12, by = top + 18;
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4.5 : 10;
      p.push((bx + r * Math.cos(a)).toFixed(1) + ' ' + (by + r * Math.sin(a)).toFixed(1));
    }
    s += `<path d="M${p.join(' L')}Z" fill="#FFC93C" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  }
  if (acc === 'ecouteurs') {
    s += `<path d="M${cx - w - 4} ${cy + 2} C${cx - w - 4} ${top - 20} ${cx + w + 4} ${top - 20} ${cx + w + 4} ${cy + 2}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M${cx - w - 4} ${cy + 2} C${cx - w - 4} ${top - 20} ${cx + w + 4} ${top - 20} ${cx + w + 4} ${cy + 2}" fill="none" stroke="#2F5BEA" stroke-width="4.5" stroke-linecap="round"/>`;
    [-1, 1].forEach((d) => {
      s += `<rect x="${cx + d * (w + 3) - 8}" y="${cy - 6}" width="16" height="26" rx="7" fill="#2F5BEA" stroke="${INK}" stroke-width="3.5"/>`;
    });
  }
  if (acc === 'bob') {
    const c = ((top - 10) - 0.25 * (cy - 14)) / 0.75;
    s += `<path d="M${cx - w + 2} ${cy - 14} C${cx - w + 2} ${c} ${cx + w - 2} ${c} ${cx + w - 2} ${cy - 14}Z" fill="#FFC93C" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M${cx - w - 12} ${cy - 12} Q${cx} ${cy - 24} ${cx + w + 12} ${cy - 12} Q${cx} ${cy - 2} ${cx - w - 12} ${cy - 12}Z" fill="#FFC93C" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M${cx - w + 6} ${cy - 22} Q${cx} ${cy - 30} ${cx + w - 6} ${cy - 22}" fill="none" stroke="#E2506A" stroke-width="5"/>`;
  }
  if (acc === 'couronne') {
    const t = top - 2;
    s += `<path d="M${cx - 24} ${t + 8} L${cx - 26} ${t - 14} L${cx - 12} ${t - 2} L${cx} ${t - 20} L${cx + 12} ${t - 2} L${cx + 26} ${t - 14} L${cx + 24} ${t + 8}Z" fill="#F4B731" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="${cx}" cy="${t + 1}" r="4" fill="#E2506A" stroke="${INK}" stroke-width="2.5"/>`;
  }
  return s + '</svg>';
}
