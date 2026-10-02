/* Icônes portées du prototype. Les chaînes SVG sont identiques au caractère près
   (vérifié par tests/parity/art-parity.spec.ts). */
import { INK, sparkle } from './shapes';

export const icoSay = `<svg width="26" height="24" viewBox="0 0 26 24" aria-hidden="true"><path d="M3 9 H8 L14 4 V20 L8 15 H3Z" fill="#1E2440" stroke="#1E2440" stroke-width="2" stroke-linejoin="round"/><path d="M18 8 Q21 12 18 16 M21 5 Q26 12 21 19" fill="none" stroke="#1E2440" stroke-width="2.5" stroke-linecap="round"/></svg>`;

export function starIcon(s = 30): string {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6.2 : 13;
    p.push((16 + r * Math.cos(a)).toFixed(1) + ' ' + (17 + r * Math.sin(a)).toFixed(1));
  }
  return `<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><path d="M${p.join(' L')}Z" fill="#FFC93C" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/></svg>`;
}

export function coinIcon(s = 20): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="#F4B731" stroke="${INK}" stroke-width="3"/><path d="M12 12 L20 20 M20 12 L12 20" stroke="#C98E12" stroke-width="3" stroke-linecap="round"/></svg>`;
}

export const icoLock = `<svg width="26" height="28" viewBox="0 0 24 26" aria-hidden="true"><rect x="3" y="11" width="18" height="13" rx="4" fill="#1E2440"/><path d="M7 11 V8 a5 5 0 0 1 10 0 V11" fill="none" stroke="#1E2440" stroke-width="3"/></svg>`;
export const icoCheck = `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M5 11 L9.5 15.5 L17 7" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const icoErase = `<svg width="30" height="22" viewBox="0 0 30 22" aria-hidden="true"><path d="M10 2 H27 Q28 2 28 3 V19 Q28 20 27 20 H10 L2 11Z" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M14 7 L22 15 M22 7 L14 15" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></svg>`;
export const icoTrue = `<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#157F45" stroke="${INK}" stroke-width="3"/><path d="M12 21 L18 27 L29 14" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const icoFalse = `<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#4D5675" stroke="${INK}" stroke-width="3"/><path d="M14 14 L26 26 M26 14 L14 26" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></svg>`;
export const icoDice = `<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><rect x="3" y="3" width="20" height="20" rx="6" fill="#fff" stroke="#1E2440" stroke-width="3"/><circle cx="9" cy="9" r="2.2" fill="#1E2440"/><circle cx="17" cy="17" r="2.2" fill="#1E2440"/><circle cx="13" cy="13" r="2.2" fill="#1E2440"/></svg>`;

export const logoMark = (s: number): string => `<svg width="${s}" height="${s}" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#2F5BEA" stroke="${INK}" stroke-width="5"/><path d="M14 78 Q37 70 60 78 T106 78 L106 92 Q60 118 14 92Z" fill="#9FD9E8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M28 80 C34 58 86 58 92 80Z" fill="#FFC93C" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M60 64 C62 50 60 40 58 30" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M60 64 C62 50 60 40 58 30" fill="none" stroke="#9C5A12" stroke-width="4" stroke-linecap="round"/><path d="M58 30 C48 24 36 26 30 34 C40 34 50 34 58 30Z M58 30 C66 22 80 22 88 30 C78 32 66 33 58 30Z" fill="#7CC44E" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></svg>`;

export const icoBuoy = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#fff" stroke="#1E2440" stroke-width="5"/><circle cx="12" cy="12" r="9" fill="none" stroke="#C8371D" stroke-width="3" stroke-dasharray="7 7.1"/></svg>`;

export const icoChest = (open: boolean): string => `<svg width="40" height="36" viewBox="0 0 40 36" aria-hidden="true">${open ? `<path d="M5 14 L9 3 H31 L35 14Z" fill="#94660F" stroke="#1E2440" stroke-width="3" stroke-linejoin="round"/>` : `<path d="M5 15 Q5 4 20 4 Q35 4 35 15Z" fill="#94660F" stroke="#1E2440" stroke-width="3" stroke-linejoin="round"/>`}<rect x="5" y="15" width="30" height="17" rx="3" fill="#94660F" stroke="#1E2440" stroke-width="3"/><path d="M5 21 H35" stroke="#1E2440" stroke-width="2.5"/><rect x="17" y="${open ? 17 : 12}" width="6" height="8" rx="2" fill="#F4B731" stroke="#1E2440" stroke-width="2"/>${open ? sparkle(20, 6, 4) : ''}</svg>`;

export function trophyIcon(s = 24): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><path d="M9 5 H23 V12 Q23 20 16 20 Q9 20 9 12Z" fill="#F4B731" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M9 8 H5 Q5 15 10 15 M23 8 H27 Q27 15 22 15" fill="none" stroke="${INK}" stroke-width="2.4"/><rect x="14" y="20" width="4" height="5" fill="#F4B731" stroke="${INK}" stroke-width="2"/><rect x="9" y="25" width="14" height="4" rx="1.5" fill="#94660F" stroke="${INK}" stroke-width="2.4"/></svg>`;
}

export const icoClock = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="9" fill="#fff" stroke="#1E2440" stroke-width="2.6"/><path d="M12 8 V13 L15 15" fill="none" stroke="#1E2440" stroke-width="2.6" stroke-linecap="round"/><rect x="9" y="1.5" width="6" height="3" rx="1.5" fill="#1E2440"/></svg>`;

export const icoHouse = `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M3 10 L11 3 L19 10 V19 H3Z" fill="currentColor" stroke="#1E2440" stroke-width="2" stroke-linejoin="round" opacity=".9"/></svg>`;

/** Étoile d'étape : pleine si gagnée, grisée sinon. */
export function starSmall(on: boolean): string {
  return on ? starIcon(22) : `<svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">${starIcon(32).match(/<path[^>]+>/)![0].replace('fill="#FFC93C"', 'fill="#DDE3E8"').replace('stroke="#1E2440"', 'stroke="#8A90A8"')}</svg>`;
}

/** Redimensionne une icône dont la taille d'origine est connue (équivalent des `.replace('width=…')` du prototype). */
export const resize = (svg: string, from: [number, number], to: [number, number]): string =>
  svg.replace(`width="${from[0]}" height="${from[1]}"`, `width="${to[0]}" height="${to[1]}"`);

/* ---- Icônes écrites en dur dans le HTML du prototype ---- */

export const icoBack = `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M14 4 L6 11 L14 18" fill="none" stroke="#1E2440" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
/** Croix de « Quitter » (écran de question). */
export const icoQuit = `<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M7 7 L19 19 M19 7 L7 19" stroke="#1E2440" stroke-width="4" stroke-linecap="round"/></svg>`;
/** Croix de « Fermer » (espace parent). */
export const icoClose = `<svg width="22" height="22" viewBox="0 0 26 26" aria-hidden="true"><path d="M7 7 L19 19 M19 7 L7 19" stroke="#1E2440" stroke-width="4" stroke-linecap="round"/></svg>`;
/** Cadenas du bouton « Espace parent ». */
export const icoParentLock = `<svg width="24" height="26" viewBox="0 0 24 26" aria-hidden="true"><rect x="3" y="11" width="18" height="13" rx="4" fill="#1E2440"/><path d="M7 11 V8 a5 5 0 0 1 10 0 V11" fill="none" stroke="#1E2440" stroke-width="3"/></svg>`;
export const icoPlus = `<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><path d="M17 6 V28 M6 17 H28" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`;
export const icoAgain = `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M17 8 A7 7 0 1 0 18 13" fill="none" stroke="#1E2440" stroke-width="3" stroke-linecap="round"/><path d="M18 3 V8 H13" fill="none" stroke="#1E2440" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const icoBulb = `<svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true"><path d="M9 1 a6.5 6.5 0 0 1 4 11.6 V15 H5 V12.6 A6.5 6.5 0 0 1 9 1Z" fill="#FFC93C" stroke="#1E2440" stroke-width="2"/><rect x="6" y="16" width="6" height="3" rx="1" fill="#1E2440"/></svg>`;
export const icoDiscover = `<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><rect x="3" y="3" width="20" height="20" rx="4" fill="#fff" stroke="#1E2440" stroke-width="2.5"/>${[0, 1, 2].map((i) => [0, 1, 2].map((j) => `<circle cx="${8 + i * 5}" cy="${8 + j * 5}" r="1.8" fill="#1E2440"/>`).join('')).join('')}</svg>`;

export const icoTabHome = `<svg width="30" height="28" viewBox="0 0 30 28" aria-hidden="true"><path class="f" d="M4 13 L15 4 L26 13 V25 H4Z" fill="#fff" stroke="#1E2440" stroke-width="3" stroke-linejoin="round"/><rect x="12" y="16" width="6" height="9" fill="#1E2440"/></svg>`;
export const icoTabGrid = `<svg width="30" height="28" viewBox="0 0 30 28" aria-hidden="true"><rect class="f" x="4" y="3" width="22" height="22" rx="4" fill="#fff" stroke="#1E2440" stroke-width="3"/><path d="M11.3 3 V25 M18.6 3 V25 M4 10.3 H26 M4 17.6 H26" stroke="#1E2440" stroke-width="2.5"/></svg>`;
export const icoTabTreasure = `<svg width="30" height="28" viewBox="0 0 30 28" aria-hidden="true"><path class="f" d="M4 12 H26 V24 H4Z" fill="#fff" stroke="#1E2440" stroke-width="3" stroke-linejoin="round"/><path d="M4 12 Q4 4 15 4 Q26 4 26 12" fill="#fff" stroke="#1E2440" stroke-width="3"/><rect x="12" y="10" width="6" height="7" rx="2" fill="#1E2440"/></svg>`;
