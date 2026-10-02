/* Pépin, la mascotte : 3 variantes, 4 stades, 4 humeurs, habillage. Porté du prototype à l'identique. */
import { VARIANTS, type PepinDef, type PepinVariant } from '../content/pepins';
import type { PepFace, PepHead, PepNeck } from '../content/shop';
import type { Stage } from '../engine/level';
import { INK, line, sparkle } from './shapes';

export type Mood = 'neutre' | 'joie' | 'encourage' | 'pense';

/** Habillage du Pépin (champ `pw` du profil). */
export interface PepWear {
  head?: PepHead | null;
  face?: PepFace | null;
  neck?: PepNeck | null;
}

export interface MascotOptions {
  variant?: PepinVariant;
  stage?: Stage;
  mood?: Mood;
  size?: number;
  wear?: PepWear | null;
  noSparkle?: boolean;
}

function sproutSvg(v: PepinDef, stage: Stage): string {
  const H = [0, 14, 22, 30, 36][stage]!, t = 64 - H;
  let s = '';
  if (v.sprout === 'leaf') {
    s += line(100, 66, 100, t, v.leaf, 5);
    const leaf = `<path d="M100 ${t + 2} C108 ${t - 14} 128 ${t - 18} 140 ${t - 10} C132 ${t + 4} 112 ${t + 8} 100 ${t + 2}Z" fill="${v.leaf}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
    if (stage === 1) s += `<circle cx="100" cy="${t - 2}" r="7" fill="${v.leaf}" stroke="${INK}" stroke-width="3.5"/>`;
    if (stage >= 2) s += leaf;
    if (stage >= 3) s += `<g transform="translate(200,0) scale(-1,1)">${leaf}</g>`;
  }
  if (v.sprout === 'coral') {
    const L = (a: number, b: number, c: number, d: number) => line(a, b, c, d, v.leaf, 6);
    s += L(100, 66, 100, t);
    if (stage >= 2) s += L(100, 64 - H * 0.5, 116, 64 - H * 0.5 - 13);
    if (stage >= 3) s += L(100, 64 - H * 0.3, 83, 64 - H * 0.3 - 12);
    s += `<circle cx="100" cy="${t - 3}" r="5" fill="${v.leaf}" stroke="${INK}" stroke-width="3"/>`;
  }
  if (v.sprout === 'flame') {
    const h = 16 + stage * 8, w = 7 + stage * 2.6;
    const f = (hh: number, ww: number, col: string) =>
      `<path d="M100 ${66 - hh} C${100 + ww} ${66 - hh * 0.5} ${100 + ww * 0.95} 62 100 68 C${100 - ww * 0.95} 62 ${100 - ww} ${66 - hh * 0.5} 100 ${66 - hh}Z" fill="${col}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
    s += f(h, w, v.leaf);
    if (stage >= 2) s += f(h * 0.55, w * 0.5, v.flower);
  }
  return s;
}

export function mascot(o: MascotOptions = {}): string {
  const v = VARIANTS[o.variant || 'pousse'], stage = o.stage || 3, mood = o.mood || 'neutre', size = o.size || 84;
  let s = `<svg width="${size}" height="${Math.round(size * 1.05)}" viewBox="0 0 200 210" role="img" aria-label="Pépin ${v.name}">`;
  s += `<ellipse cx="100" cy="196" rx="56" ry="6" fill="${INK}" opacity=".12"/>` + sproutSvg(v, stage);
  const arm = (cx: number, cy: number, rot: number) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="11" ry="17" transform="rotate(${rot} ${cx} ${cy})" fill="${v.body}" stroke="${INK}" stroke-width="3.5"/>`;
  if (mood === 'joie') s += arm(30, 112, -58) + arm(170, 112, 58);
  else if (mood === 'encourage') s += arm(38, 142, 22) + arm(170, 112, 58);
  else s += arm(38, 142, 22) + arm(162, 142, -22);
  s += `<ellipse cx="76" cy="184" rx="18" ry="9" fill="${v.body}" stroke="${INK}" stroke-width="3.5"/><ellipse cx="124" cy="184" rx="18" ry="9" fill="${v.body}" stroke="${INK}" stroke-width="3.5"/>`;
  s += `<path d="M100 62 C150 62 168 100 166 132 C164 166 136 182 100 182 C64 182 36 166 34 132 C32 100 50 62 100 62Z" fill="${v.body}" stroke="${INK}" stroke-width="4"/><ellipse cx="100" cy="152" rx="40" ry="24" fill="${v.belly}"/>`;
  s += `<ellipse cx="62" cy="128" rx="9" ry="5.5" fill="#FF8FA3"/><ellipse cx="138" cy="128" rx="9" ry="5.5" fill="#FF8FA3"/>`;
  const openEye = (x: number, lk: [number, number]) =>
    `<circle cx="${x}" cy="108" r="14" fill="#fff" stroke="${INK}" stroke-width="3.5"/><circle cx="${x + lk[0]}" cy="${108 + lk[1]}" r="7.5" fill="${INK}"/><circle cx="${x + lk[0] + 3}" cy="${104 + lk[1]}" r="2.8" fill="#fff"/>`;
  const happyEye = (x: number) => `<path d="M${x - 12} 112 Q${x} 98 ${x + 12} 112" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  if (mood === 'joie') s += happyEye(80) + happyEye(120);
  else {
    const lk: [number, number] = mood === 'pense' ? [3, -4] : [2, 2];
    s += openEye(80, lk) + openEye(120, lk);
  }
  if (mood === 'encourage') s += `<path d="M70 88 Q80 81 90 87" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M110 87 Q120 81 130 88" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  if (mood === 'joie') s += `<path d="M84 127 Q100 148 116 127Z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M92 139 Q100 133 108 139 Q100 146 92 139Z" fill="#FF7A8A"/>` + (o.noSparkle ? '' : sparkle(26, 60, 10) + sparkle(176, 70, 8));
  else if (mood === 'pense') s += `<circle cx="104" cy="134" r="5" fill="${INK}"/>`;
  else s += `<path d="M88 130 Q100 141 112 130" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
  if (o.wear) s += pepWear(o.wear);
  return s + '</svg>';
}

export function pepWear(w: PepWear): string {
  let s = '';
  const o = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"`;
  if (w.neck === 'echarpe') s += `<path d="M46 144 Q100 166 154 144 L157 158 Q100 182 43 158Z" fill="#E2506A" ${o}/><path d="M122 160 L128 190 L144 186 L136 158Z" fill="#E2506A" ${o}/><path d="M60 150 L62 162 M80 156 L81 168 M100 158 V170 M120 156 L119 168 M140 150 L138 162" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
  if (w.neck === 'papillon') s += `<path d="M100 152 L78 140 L78 166Z M100 152 L122 140 L122 166Z" fill="#2F5BEA" ${o}/><circle cx="100" cy="152" r="7" fill="#2F5BEA" ${o}/>`;
  if (w.face === 'soleil') s += `<rect x="62" y="96" width="34" height="24" rx="9" fill="${INK}"/><rect x="104" y="96" width="34" height="24" rx="9" fill="${INK}"/><path d="M96 104 H104 M62 102 L44 96 M138 102 L156 96" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M70 102 L78 102" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M112 102 L120 102" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
  if (w.face === 'lunettes') s += `<circle cx="80" cy="108" r="18" fill="none" stroke="${INK}" stroke-width="5"/><circle cx="120" cy="108" r="18" fill="none" stroke="${INK}" stroke-width="5"/><path d="M98 106 H102" stroke="${INK}" stroke-width="5"/>`;
  if (w.head === 'fete') s += `<g transform="rotate(-24 62 74)"><path d="M44 80 L62 30 L80 80Z" fill="#2F5BEA" ${o}/><circle cx="56" cy="62" r="4" fill="#FFC93C"/><circle cx="66" cy="52" r="3.5" fill="#fff"/><circle cx="68" cy="70" r="4" fill="#FF8FA3"/><circle cx="62" cy="28" r="7" fill="#FFC93C" ${o}/></g>`;
  if (w.head === 'couronne') s += `<g transform="rotate(-18 62 70)"><path d="M40 78 L38 50 L52 62 L62 44 L72 62 L86 50 L84 78Z" fill="#F4B731" ${o}/><circle cx="62" cy="68" r="4.5" fill="#E2506A" stroke="${INK}" stroke-width="2.5"/></g>`;
  if (w.head === 'bob') s += `<path d="M58 80 Q60 54 100 54 Q140 54 142 80Z" fill="#FFC93C" ${o}/><path d="M42 82 Q100 70 158 82 Q100 94 42 82Z" fill="#FFC93C" ${o}/><path d="M60 74 Q100 64 140 74" fill="none" stroke="#E2506A" stroke-width="5"/>`;
  return s;
}
