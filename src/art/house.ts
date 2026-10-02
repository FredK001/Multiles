/* Maison du Pépin et ses objets. Portés du prototype à l'identique. */
import type { HouseItemId } from '../content/shop';
import { stageFor } from '../engine/level';
import { mascot, type PepWear } from './mascot';
import type { PepinVariant } from '../content/pepins';
import { INK } from './shapes';

/** Ce qu'il faut savoir d'un profil pour dessiner son Pépin. */
export interface PepinLook {
  pepin: PepinVariant;
  level: number;
  pw?: PepWear | null;
}

/** Cadrage (viewBox) de chaque objet pour sa vignette en boutique. */
export const HB: Record<HouseItemId, string> = {
  'h-tapis': '60 140 220 46', 'h-plante': '12 64 64 92', 'h-lampion': '246 0 52 84',
  'h-cadre': '46 22 72 58', 'h-hamac': '222 74 118 70', 'h-aquarium': '266 84 74 76',
};

export function houseItem(id: string): string {
  const o = `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"`;
  if (id === 'h-tapis') return `<ellipse cx="170" cy="164" rx="100" ry="15" fill="#2F5BEA" ${o}/><ellipse cx="170" cy="164" rx="70" ry="9" fill="none" stroke="#FFC93C" stroke-width="3"/>`;
  if (id === 'h-plante') return `<path d="M30 124 H60 L55 152 H35Z" fill="#C8642A" ${o}/><ellipse cx="34" cy="100" rx="9" ry="24" transform="rotate(-25 34 100)" fill="#3F9A3A" ${o}/><ellipse cx="46" cy="92" rx="9" ry="28" fill="#5DB84A" ${o}/><ellipse cx="58" cy="102" rx="9" ry="22" transform="rotate(28 58 102)" fill="#3F9A3A" ${o}/>`;
  if (id === 'h-lampion') return `<path d="M272 0 V20" stroke="${INK}" stroke-width="2.5"/><rect x="262" y="18" width="20" height="6" rx="2" fill="${INK}"/><ellipse cx="272" cy="46" rx="20" ry="24" fill="#E2506A" ${o}/><path d="M256 38 Q272 34 288 38 M254 50 Q272 46 290 50" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="262" y="68" width="20" height="6" rx="2" fill="${INK}"/>`;
  if (id === 'h-cadre') return `<rect x="52" y="28" width="60" height="46" rx="4" fill="#94660F" ${o}/><rect x="58" y="34" width="48" height="34" fill="#CFEFF5"/><path d="M60 60 Q82 46 104 60 V68 H60Z" fill="#7CC44E"/><circle cx="96" cy="42" r="5" fill="#FFC93C"/>`;
  if (id === 'h-hamac') return `<path d="M232 84 V138 M330 84 V138" stroke="#8A5A2B" stroke-width="7" stroke-linecap="round"/><path d="M234 96 Q281 140 328 96" fill="none" stroke="${INK}" stroke-width="2.5"/><path d="M238 100 Q281 146 324 100 Q281 128 238 100Z" fill="#FFC93C" ${o}/><path d="M256 112 L260 120 M281 118 V128 M306 112 L302 120" stroke="#E2506A" stroke-width="3" stroke-linecap="round"/>`;
  if (id === 'h-aquarium') return `<rect x="282" y="132" width="44" height="24" fill="#8A5A2B" ${o}/><rect x="272" y="92" width="64" height="42" rx="6" fill="#9FD9E8" ${o}/><path d="M276 104 H332" stroke="#fff" stroke-width="2"/><path d="M292 116 q8 -8 16 0 q-8 8 -16 0Z" fill="#FF9A2E" ${o}/><path d="M308 116 L314 110 V122Z" fill="#FF9A2E" ${o}/><circle cx="322" cy="104" r="3" fill="#fff"/>`;
  return '';
}

/** Maison du Pépin avec les objets installés (+ un objet à l'essai éventuel). */
export function houseSvg(p: PepinLook & { house: readonly string[] }, extra?: string | null): string {
  const items = [...p.house];
  if (extra && !items.includes(extra)) items.push(extra);
  const pep = mascot({ variant: p.pepin, stage: stageFor(p.level), wear: p.pw, size: 96 }).replace('<svg ', '<svg x="122" y="70" ');
  const back = items.filter((i) => i !== 'h-tapis'), rug = items.includes('h-tapis') ? houseItem('h-tapis') : '';
  return `<svg viewBox="0 0 340 190" preserveAspectRatio="xMidYMid slice" role="img" aria-label="La maison de ton Pépin">
    <rect width="340" height="190" fill="#FFF1D6"/><rect y="146" width="340" height="44" fill="#E8C9A0"/><path d="M0 146 H340" stroke="${INK}" stroke-width="3"/>
    <rect x="132" y="20" width="76" height="58" rx="6" fill="#CFEFF5" stroke="${INK}" stroke-width="3"/><path d="M134 58 Q170 50 206 58 V76 H134Z" fill="#7FC6D3"/><path d="M160 58 Q170 46 182 58Z" fill="#F3DDA6" stroke="${INK}" stroke-width="2"/><path d="M170 20 V78 M132 46 H208" stroke="${INK}" stroke-width="3"/>
    ${rug}${back.map(houseItem).join('')}${pep}</svg>`;
}
