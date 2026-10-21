/* Dessins des mots de la fiche CE2. Une entrée = un mot anglais de src/content/english.ts. */
import { INK } from './shapes';
import { c, dot, e, kid, limb, p, place, r, SKIN, turn, WOOD, WOOD_DARK } from './words-kit';
import { TOYS } from './words-ce1';

const SKY = '#BFE3FF', WALL = '#FFE3B0', GRASS = '#7BC96F', WATER = '#5FB0F0';
const wheel = (x: number, y: number, rad: number): string => c(x, y, rad, '#4A4F63') + c(x, y, rad * 0.4, '#C9CEDB', 3);

export const TRANSPORT: Record<string, string> = {
  boat:
    p('M0 84 Q12 78 25 84 T50 84 T75 84 T100 84 L100 100 L0 100Z', WATER) + limb([[50, 66], [50, 8]], WOOD_DARK, 3) +
    p('M55 12 L55 58 L86 58Z', '#fff') + p('M45 18 L45 58 L18 58Z', '#FFD23F') + p('M8 64 L92 64 L80 84 L20 84Z', '#D62828'),
  bus:
    r(6, 24, 88, 50, '#FFD23F', 8) + [12, 30, 48].map((x) => r(x, 32, 14, 16, SKY, 2, 3)).join('') + r(68, 32, 20, 38, SKY, 2, 3) +
    p('M78 32 L78 70', 'none', 3) + p('M6 56 L66 56', 'none', 3) + wheel(24, 74, 10) + wheel(74, 74, 10),
  car:
    p('M8 70 L8 56 Q8 48 16 48 L26 48 L36 32 L66 32 L78 48 L88 48 Q94 48 94 56 L94 70Z', '#D62828') +
    p('M40 37 L50 37 L50 47 L32 47Z', SKY, 3) + p('M55 37 L64 37 L72 47 L55 47Z', SKY, 3) + r(86, 54, 8, 6, '#FFD23F', 2, 2.5) +
    wheel(28, 70, 11) + wheel(74, 70, 11),
  helicopter:
    limb([[64, 52], [92, 42]], '#F28C28', 6) + c(92, 42, 7, 'none', 3) + p('M86 42 L98 42', 'none', 3) +
    p('M24 84 L70 84 M34 72 L32 84 M60 72 L62 84', 'none', 4) + r(44, 26, 5, 12, INK, 1, 2) + p('M10 26 L84 26', 'none', 4) +
    e(44, 56, 26, 18, '#F28C28') + p('M24 46 Q30 40 40 40 L40 58 L20 58 Q18 52 24 46Z', SKY, 3),
  lorry:
    r(6, 20, 60, 50, '#F28C28', 3) + r(66, 34, 28, 36, '#2E9E44', 5) + r(74, 40, 14, 12, SKY, 2, 3) + r(6, 68, 88, 6, '#4A4F63', 2, 3) +
    wheel(22, 76, 9) + wheel(44, 76, 9) + wheel(80, 76, 9),
  motorbike:
    c(20, 70, 15, '#fff', 5) + c(80, 70, 15, '#fff', 5) + dot(20, 70, 3) + dot(80, 70, 3) + limb([[72, 40], [80, 70]], '#9AA0AE', 3) +
    r(38, 58, 18, 12, '#9AA0AE', 3, 3) + p('M24 58 L48 54 L58 44 L74 44 L80 56 L58 64 L28 64Z', '#D62828') + p('M28 52 L54 50 L54 44 L36 44Z', INK, 3) +
    limb([[70, 40], [64, 30]], INK, 3) + c(82, 44, 4.5, '#FFD23F', 3),
  plane:
    p('M44 50 L36 22 L46 22 L60 50Z', '#1E3E8C') + p('M10 50 L4 28 L16 28 L28 46Z', '#2F6FE4') + e(50, 52, 44, 11, '#fff') +
    p('M86 46 Q92 48 93 52 L84 52Z', SKY, 2.5) + [30, 40, 50, 60, 70].map((x) => c(x, 50, 2.6, SKY, 2)).join('') + p('M42 56 L28 84 L42 84 L62 56Z', '#2F6FE4'),
  tractor:
    r(70, 22, 6, 24, '#4A4F63', 1, 3) + r(28, 44, 60, 24, '#2E9E44', 4) + r(22, 18, 32, 34, SKY, 3) + r(18, 12, 40, 7, '#2E9E44', 3) + p('M38 18 L38 52', 'none', 3) +
    c(32, 68, 22, '#4A4F63') + c(32, 68, 9, '#FFD23F', 3) + c(80, 76, 12, '#4A4F63') + c(80, 76, 5, '#FFD23F', 3),
  train:
    c(70, 10, 6, '#E6E9F0', 3) + c(80, 6, 4, '#E6E9F0', 3) + r(62, 18, 12, 24, '#4A4F63', 2, 3) + r(58, 14, 20, 6, '#4A4F63', 2, 3) +
    r(36, 38, 50, 34, '#D62828', 6) + r(8, 22, 32, 50, '#D62828', 4) + r(14, 28, 20, 16, SKY, 2, 3) + r(84, 58, 10, 10, '#4A4F63', 2, 3) +
    p('M2 88 L98 88', 'none', 4) + wheel(22, 76, 10) + wheel(48, 76, 10) + wheel(72, 76, 10),
};

/* Personnes : debout, de face ; les adultes sont grands (barbe pour l'homme), les enfants petits. */
interface Who { adult: boolean; long: boolean; shirt: string; legs: string; dress?: boolean; beard?: boolean; tails?: boolean }
function person({ adult, long, shirt, legs, dress, beard, tails }: Who): string {
  const y0 = adult ? 0 : 22, k = adult ? 1 : 0.78, Y = (v: number) => y0 + v * k;
  const hx = 50, hy = Y(16), hr = 11 * k;
  const body = dress ? p(`M50 ${Y(28)} L${50 - 20 * k} ${Y(72)} L${50 + 20 * k} ${Y(72)}Z`, shirt) : r(50 - 13 * k, Y(28), 26 * k, 34 * k, shirt, 7 * k);
  const legDraw = dress ? limb([[44, Y(70)], [44, Y(96)]], SKIN, 6) + limb([[56, Y(70)], [56, Y(96)]], SKIN, 6)
    : limb([[44, Y(58)], [43, Y(96)]], legs, 10 * k) + limb([[56, Y(58)], [57, Y(96)]], legs, 10 * k);
  const hair = long
    ? p(`M${hx - hr - 2} ${hy + 14 * k} Q${hx - hr - 4} ${hy - hr - 3} ${hx} ${hy - hr - 3} Q${hx + hr + 4} ${hy - hr - 3} ${hx + hr + 2} ${hy + 14 * k}Z`, '#B5651D')
    : '';
  const cap = p(`M${hx - hr} ${hy - 1} Q${hx - hr} ${hy - hr - 2} ${hx} ${hy - hr - 2} Q${hx + hr} ${hy - hr - 2} ${hx + hr} ${hy - 1} Q${hx} ${hy - hr / 2} ${hx - hr} ${hy - 1}Z`, long ? '#B5651D' : '#6B3E1F', 3);
  return (tails ? c(hx - hr - 3, hy - 2, 5, '#B5651D', 3) + c(hx + hr + 3, hy - 2, 5, '#B5651D', 3) : '') + hair + legDraw +
    limb([[50 - 12 * k, Y(32)], [50 - 18 * k, Y(62)]], SKIN, 6 * k) + limb([[50 + 12 * k, Y(32)], [50 + 18 * k, Y(62)]], SKIN, 6 * k) + body +
    c(hx, hy, hr, SKIN) + cap + dot(hx - 4 * k, hy + 1, 1.8) + dot(hx + 4 * k, hy + 1, 1.8) +
    (beard ? p(`M${hx - hr + 1} ${hy + 2} Q${hx - hr + 2} ${hy + hr + 6} ${hx} ${hy + hr + 6} Q${hx + hr - 2} ${hy + hr + 6} ${hx + hr - 1} ${hy + 2} Q${hx} ${hy + 9} ${hx - hr + 1} ${hy + 2}Z`, '#6B3E1F', 3)
      : p(`M${hx - 3.5 * k} ${hy + 5 * k} Q${hx} ${hy + 8 * k} ${hx + 3.5 * k} ${hy + 5 * k}`, 'none', 2.2));
}

/** Chat assis, réutilisé pour les prépositions (in, on, under…). */
export const CAT =
  p('M66 84 Q88 84 86 64 Q84 56 78 58', 'none', 9) + p('M66 84 Q88 84 86 64 Q84 56 78 58', 'none', 4.5, '#F28C28') +
  e(50, 72, 22, 20, '#F28C28') + p('M36 32 L34 12 L48 24Z', '#F28C28') + p('M64 32 L66 12 L52 24Z', '#F28C28') + c(50, 40, 18, '#F28C28') +
  dot(43, 38, 2.6) + dot(57, 38, 2.6) + p('M47 45 L53 45 L50 48Z', '#F48FB1', 2) + p('M30 44 L42 46 M30 50 L42 49 M70 44 L58 46 M70 50 L58 49', 'none', 1.8) +
  p('M40 80 L40 90 M60 80 L60 90', 'none', 3);

/** Chat endormi en boule, avec des « z ». */
export const CAT_ASLEEP =
  e(50, 72, 34, 18, '#F28C28') + p('M80 76 Q92 70 86 60', 'none', 9) + p('M80 76 Q92 70 86 60', 'none', 4.5, '#F28C28') +
  p('M22 62 L20 46 L32 56Z M40 58 L44 44 L50 56Z', '#F28C28') + c(34, 66, 15, '#F28C28') +
  p('M26 66 Q29 69 32 66 M37 66 Q40 69 43 66', 'none', 2.5) + dot(34, 72, 1.6, '#F48FB1') +
  `<text x="60" y="38" font-family="Fredoka Variable, sans-serif" font-weight="700" font-size="16" fill="${INK}">z</text>` +
  `<text x="72" y="26" font-family="Fredoka Variable, sans-serif" font-weight="700" font-size="22" fill="${INK}">Z</text>` +
  p('M8 92 L92 92', 'none', 4);

export const PETS: Record<string, string> = {
  baby:
    e(50, 80, 26, 18, '#F48FB1') + r(38, 62, 24, 10, '#fff', 4, 3) + c(50, 42, 24, SKIN) + p('M48 18 Q52 12 56 18', 'none', 3) +
    p('M40 40 Q42 37 44 40 M56 40 Q58 37 60 40', 'none', 2.5) + c(50, 52, 4.5, '#2F6FE4', 2.5) + c(30, 48, 3.5, '#F7B0B0', 0) + c(70, 48, 3.5, '#F7B0B0', 0),
  boy: person({ adult: false, long: false, shirt: '#2E9E44', legs: '#2F6FE4' }),
  cat: CAT,
  dog:
    e(50, 76, 20, 16, '#C08A50') + r(38, 60, 24, 6, '#D62828', 3, 3) + e(30, 40, 7, 15, '#8B5A2B') + e(70, 40, 7, 15, '#8B5A2B') +
    c(50, 38, 18, '#C08A50') + e(50, 48, 10, 7, '#F2D3A8', 3) + e(50, 44, 4, 3, INK, 0) + dot(43, 34, 2.6) + dot(57, 34, 2.6) +
    p('M46 52 Q50 56 54 52', 'none', 2.5) + p('M40 88 L40 92 M60 88 L60 92', 'none', 4),
  fish:
    c(14, 28, 4, SKY, 2.5) + c(22, 18, 3, SKY, 2.5) + p('M72 50 L94 32 L92 68Z', '#F28C28') + e(46, 50, 30, 20, '#F28C28') +
    p('M40 30 Q50 22 58 32', '#F28C28', 3) + p('M40 32 Q36 50 40 68 M54 32 Q50 50 54 68', 'none', 3, '#fff') + c(28, 46, 4, '#fff', 2.5) + dot(28, 46, 2),
  girl: person({ adult: false, long: false, shirt: '#F48FB1', legs: '#F48FB1', dress: true, tails: true }),
  man: person({ adult: true, long: false, shirt: '#2F6FE4', legs: '#4A4F63', beard: true }),
  mouse:
    p('M18 68 Q4 60 8 46 Q12 38 20 42', 'none', 3) + e(44, 66, 26, 17, '#9AA0AE') + c(62, 38, 10, '#C9CEDB') + c(62, 38, 5, '#F4B6C8', 0) +
    p('M60 46 Q76 42 88 58 Q78 66 64 64Z', '#9AA0AE') + dot(88, 58, 3, '#F48FB1') + dot(72, 52, 2.4) + p('M84 62 L94 66 M84 60 L94 58', 'none', 1.8),
  woman: person({ adult: true, long: true, shirt: '#7B3FB8', legs: '#7B3FB8', dress: true }),
};

export const CLOTHES: Record<string, string> = {
  dress: p('M40 8 L40 22 M60 8 L60 22', 'none', 4) + p('M36 22 L64 22 L62 40 L84 90 L16 90 L38 40Z', '#F48FB1') + r(36, 38, 28, 6, '#D62828', 2, 3),
  jacket:
    p('M30 10 L42 6 L50 16 L58 6 L70 10 L86 24 L94 84 L80 86 L72 42 L72 92 L28 92 L28 42 L20 86 L6 84 L14 24Z', '#D62828') +
    p('M50 16 L50 92', 'none', 3) + r(32, 64, 12, 10, '#B01E1E', 2, 3) + r(56, 64, 12, 10, '#B01E1E', 2, 3) + p('M42 6 Q50 0 58 6', 'none', 4),
  jeans:
    p('M26 8 L74 8 L80 94 L56 94 L50 34 L44 94 L20 94Z', '#2F6FE4') + r(26, 8, 48, 8, '#1E3E8C', 0, 3) +
    p('M30 18 Q34 30 44 26 M70 18 Q66 30 56 26 M50 16 L50 34', 'none', 2.5, '#FFB347') + dot(50, 12, 2.2, '#FFD23F'),
  shirt:
    p('M32 12 L44 8 L50 18 L56 8 L68 12 L84 24 L92 84 L80 86 L72 42 L72 92 L28 92 L28 42 L20 86 L8 84 L16 24Z', '#fff') +
    p('M44 8 L50 18 L40 22Z M56 8 L50 18 L60 22Z', '#C9CEDB', 3) + p('M50 18 L50 92', 'none', 2.5) + dot(54, 34, 2) + dot(54, 50, 2) + dot(54, 66, 2) + dot(54, 82, 2),
  shoes:
    p('M6 70 L6 52 Q6 44 16 46 L30 50 Q40 54 48 62 L48 70Z', '#2F6FE4') + r(4, 70, 46, 7, '#fff', 3, 3) +
    p('M50 80 L50 62 Q50 54 60 56 L74 60 Q84 64 92 72 L92 80Z', '#2F6FE4') + r(48, 80, 46, 7, '#fff', 3, 3) +
    p('M18 50 L22 56 M24 52 L28 58 M62 60 L66 66 M68 62 L72 68', 'none', 2.5, '#fff'),
  skirt: r(28, 22, 44, 9, '#5A2D8C', 2) + p('M28 31 L72 31 L88 84 L12 84Z', '#7B3FB8') + p('M38 31 L30 84 M50 31 L50 84 M62 31 L70 84', 'none', 2.5),
  socks:
    p('M14 8 L32 8 L32 56 Q32 66 44 66 L48 66 Q56 66 56 74 Q56 82 46 82 L30 82 Q14 82 14 64Z', '#D62828') + p('M14 18 L32 18 M14 26 L32 26', 'none', 3, '#fff') +
    p('M50 14 L68 14 L68 62 Q68 72 80 72 L84 72 Q92 72 92 80 Q92 88 82 88 L66 88 Q50 88 50 70Z', '#D62828') + p('M50 24 L68 24 M50 32 L68 32', 'none', 3, '#fff'),
  trousers: p('M26 8 L74 8 L80 94 L56 94 L50 32 L44 94 L20 94Z', '#8B5A2B') + r(26, 8, 48, 8, '#6B3E1F', 0, 3) + p('M50 16 L50 32', 'none', 2.5),
  'T-shirt': p('M30 14 L42 10 Q50 20 58 10 L70 14 L92 32 L80 46 L72 40 L72 90 L28 90 L28 40 L20 46 L8 32Z', '#2E9E44'),
};

/* Prépositions : le chat et une boîte en carton. */
const BOX = '#C9965B';
const box = (x: number, y: number, w: number, h: number): string => r(x, y, w, h, BOX, 2) + p(`M${x + w / 2 - 6} ${y} L${x + w / 2 - 6} ${y + 10} M${x + w / 2 + 6} ${y} L${x + w / 2 + 6} ${y + 10}`, 'none', 2.5);
const cat = (x: number, y: number, k: number): string => place(x, y, k, CAT);
const floor = p('M4 94 L96 94', 'none', 4);

export const PLACES: Record<string, string> = {
  in: cat(20, 14, 0.6) + p('M18 56 L6 44 L18 50Z M82 56 L94 44 L82 50Z', BOX, 3) + box(18, 56, 64, 38) + floor,
  on: cat(22, 8, 0.55) + box(22, 58, 56, 36) + floor,
  under: r(16, 30, 6, 64, WOOD_DARK, 2, 3) + r(78, 30, 6, 64, WOOD_DARK, 2, 3) + box(12, 8, 76, 26) + cat(22, 42, 0.55) + floor,
  'next to': box(4, 40, 50, 54) + cat(44, 38, 0.6) + floor,
  behind: cat(40, 16, 0.6) + box(10, 48, 80, 46) + floor,
  'in front of': box(8, 6, 84, 70) + cat(19, 36, 0.62) + floor,
  between: box(2, 44, 28, 50) + box(70, 44, 28, 50) + cat(25, 46, 0.5) + floor,
};

export const ROOMS: Record<string, string> = {
  bookcase:
    r(16, 6, 68, 88, WOOD_DARK, 2) + [18, 46, 74].map((y) => r(22, y - 6, 56, 3, WOOD_DARK, 0, 0)).join('') +
    [[24, 12, '#D62828'], [32, 16, '#2F6FE4'], [40, 10, '#2E9E44'], [52, 14, '#FFD23F'], [24, 40, '#7B3FB8'], [34, 42, '#F28C28'], [46, 38, '#2F6FE4'], [60, 40, '#D62828'], [26, 68, '#2E9E44'], [38, 66, '#FFD23F'], [56, 70, '#F48FB1']]
      .map(([x, y, f]) => r(x as number, y as number, 9, 24 - ((y as number) % 10), f as string, 1, 3)).join('') +
    p('M22 36 L78 36 M22 64 L78 64 M22 90 L78 90', 'none', 4),
  cupboard:
    r(30, 14, 12, 12, '#fff', 2, 3) + p('M58 26 Q58 14 66 14 Q74 14 74 26Z', '#F48FB1', 3) +
    r(10, 26, 80, 62, WOOD, 4) + p('M50 26 L50 88', 'none', 4) + dot(44, 56, 3.5) + dot(56, 56, 3.5) + r(14, 88, 8, 6, INK, 1, 2) + r(78, 88, 8, 6, INK, 1, 2),
  lamp:
    p('M24 14 L18 8 M76 14 L82 8 M50 6 L50 0', 'none', 3, '#F2B92B') + r(46, 50, 8, 32, '#9AA0AE', 2, 3) + e(50, 86, 22, 6, '#4A4F63') + p('M30 18 L70 18 L82 50 L18 50Z', '#FFD23F'),
  mirror: r(46, 82, 8, 10, WOOD, 1, 3) + e(50, 92, 18, 4, WOOD, 3) + e(50, 46, 30, 40, '#F2B92B', 4) + e(50, 46, 22, 32, SKY, 3) + p('M36 30 L48 18 M38 42 L56 24', 'none', 3, '#fff'),
  phone: r(28, 6, 44, 88, '#4A4F63', 9) + r(33, 15, 34, 64, SKY, 3, 3) + c(50, 86, 3.5, '#C9CEDB', 2.5) + [24, 36, 48].map((y) => r(38, y, 8, 8, '#2F6FE4', 2, 2) + r(54, y, 8, 8, '#2E9E44', 2, 2)).join(''),
  sofa: r(18, 84, 5, 8, INK, 1, 2) + r(77, 84, 5, 8, INK, 1, 2) + r(14, 34, 72, 34, '#2F6FE4', 9) + r(10, 60, 80, 24, '#4D86EC', 6) + r(4, 50, 16, 36, '#2F6FE4', 7) + r(80, 50, 16, 36, '#2F6FE4', 7) + p('M50 60 L50 84', 'none', 3),
  table:
    r(18, 52, 6, 40, WOOD_DARK, 2, 3) + r(76, 52, 6, 40, WOOD_DARK, 2, 3) + p('M8 46 L92 46 L88 66 L12 66Z', '#D62828') + p('M8 46 L92 46', 'none', 4) +
    [20, 36, 52, 68, 82].map((x) => dot(x, 56, 2.4, '#fff')).join('') + p('M44 46 L44 32 Q50 28 56 32 L56 46', '#2F6FE4', 3) + c(50, 22, 6, '#FFD23F', 3),
  TV: p('M38 4 L50 18 L62 4', 'none', 3) + r(8, 18, 84, 58, '#4A4F63', 7) + r(15, 25, 70, 44, WATER, 3, 3) + p('M15 58 Q30 46 44 58 Q60 44 85 56 L85 69 L15 69Z', GRASS, 3) + c(68, 36, 6, '#FFD23F', 2.5) + r(40, 76, 20, 6, '#4A4F63', 0, 3) + r(28, 82, 44, 8, '#4A4F63', 4),
  wardrobe:
    r(16, 4, 68, 88, WOOD_DARK, 3) + r(22, 10, 28, 76, '#3A2A1E', 2, 3) + p('M22 18 L50 18', 'none', 3) +
    p('M26 18 L26 50 L34 54 L34 18 M36 18 L36 60 L46 60 L46 18', '#2F6FE4', 3) + p('M50 10 L72 4 L72 92 L50 86Z', WOOD, 4) + dot(56, 48, 3) + r(18, 92, 6, 5, INK, 1, 2) + r(76, 92, 6, 5, INK, 1, 2),
  in: PLACES.in!, on: PLACES.on!, under: PLACES.under!, 'next to': PLACES['next to']!,
};

const plate = (food: string): string => e(50, 66, 44, 20, '#fff') + e(50, 64, 32, 13, '#F3F4F8', 2.5) + food;

export const MEALS: Record<string, string> = {
  beans: plate([[30, 58, -20], [44, 66, 10], [56, 56, -5], [66, 66, 25], [40, 54, 30]].map(([x, y, a]) => turn(a!, p(`M${x! - 12} ${y} Q${x} ${y! - 6} ${x! + 12} ${y}`, 'none', 9) + p(`M${x! - 12} ${y} Q${x} ${y! - 6} ${x! + 12} ${y}`, 'none', 5, '#4CAF50'), x, y)).join('')),
  carrots: [[-20, 36], [15, 62]].map(([a, x]) => turn(a!,
    p(`M${x! - 8} 30 L${x! + 8} 30 L${x} 92Z`, '#F28C28') + p(`M${x! - 4} 46 L${x! + 2} 46 M${x! - 2} 62 L${x! + 3} 62`, 'none', 2.5) +
    p(`M${x} 30 Q${x! - 10} 14 ${x! - 6} 8 M${x} 30 Q${x} 12 ${x! + 2} 6 M${x} 30 Q${x! + 10} 14 ${x! + 10} 10`, 'none', 4, '#2E9E44'), x, 50)).join(''),
  cereal:
    turn(-20, r(56, 14, 8, 40, '#C9CEDB', 4, 3), 60, 34) + p('M10 50 Q10 88 50 88 Q90 88 90 50Z', '#2F6FE4') + e(50, 50, 40, 10, '#fff') +
    [[30, 48], [42, 52], [54, 47], [66, 51], [38, 44], [60, 44]].map(([x, y]) => c(x!, y!, 4, '#E3A857', 2.5)).join(''),
  fish:
    plate(p('M68 64 L84 54 L84 74Z', '#E3A857', 3) + e(48, 64, 22, 10, '#E3A857', 3) + dot(34, 62, 1.8) + p('M46 58 L50 70 M54 58 L58 70', 'none', 2) + c(78, 50, 7, '#FFE066', 2.5)),
  meat: plate(p('M24 62 Q24 50 40 52 Q52 46 66 52 Q80 56 74 70 Q66 78 46 76 Q28 76 24 62Z', '#A0522D', 3) + p('M36 62 Q46 58 56 64', 'none', 2.5, '#F2C08A') + c(70, 62, 5, '#fff', 2.5)),
  peas: plate([[34, 60], [42, 66], [50, 58], [58, 66], [66, 60], [46, 72], [56, 54], [38, 54], [62, 72]].map(([x, y]) => c(x!, y!, 4.5, '#6BBF3B', 2.5)).join('')),
  potatoes: [[30, 64, 18, 13], [66, 66, 20, 14], [48, 44, 17, 12]].map(([x, y, rx, ry]) => e(x!, y!, rx!, ry!, '#D9A95B') + dot(x! - 5, y! - 3, 1.8, '#8B5A2B') + dot(x! + 6, y! + 3, 1.8, '#8B5A2B')).join(''),
  rice:
    p('M12 52 Q12 88 50 88 Q88 88 88 52Z', '#fff') + p('M14 52 Q20 36 34 40 Q42 30 54 36 Q66 30 74 40 Q86 40 86 52Z', '#fff', 3) +
    p('M30 44 L33 44 M46 40 L49 41 M60 42 L63 42 M40 48 L43 48 M70 47 L73 46', 'none', 2.5, '#C9CEDB') + p('M10 52 L90 52', 'none', 4) + p('M30 66 Q50 74 70 66', 'none', 3, '#2F6FE4') +
    limb([[66, 34], [92, 10]], WOOD, 3) + limb([[70, 36], [96, 16]], WOOD, 3),
  sausages: plate(r(22, 52, 44, 12, '#C0563C', 6, 3) + r(34, 64, 44, 12, '#C0563C', 6, 3) + p('M28 56 Q32 54 36 56 M40 68 Q44 66 48 68', 'none', 2, '#F2C08A')),
  toast:
    p('M18 34 Q14 14 34 14 Q42 6 50 10 Q58 6 66 14 Q86 14 82 34 L82 88 L18 88Z', '#C77B30') + p('M26 36 Q24 22 38 22 Q50 14 62 22 Q76 22 74 36 L74 80 L26 80Z', '#F2C88A', 3) +
    r(40, 44, 20, 14, '#FFE066', 3, 3),
};

/** Cheval de profil (ferme, et « ride a horse »). */
export const HORSE =
  [22, 32, 54, 64].map((x) => r(x, 62, 7, 30, '#A0623A', 2, 3)).join('') + p('M14 50 Q4 62 8 76', 'none', 6) + p('M14 50 Q4 62 8 76', 'none', 3, '#6B3E1F') +
  e(44, 56, 30, 16, '#A0623A') + p('M60 50 L70 18 L82 22 L74 58Z', '#A0623A') + turn(35, e(82, 24, 16, 9, '#A0623A'), 82, 24) +
  p('M70 14 L68 6 L76 12', '#A0623A', 3) + p('M58 50 L64 26 L68 14', 'none', 6, '#4A2A14') + dot(80, 18, 2.4) + dot(91, 32, 1.6);

export const ACTIVITIES: Record<string, string> = {
  'fly a kite':
    p('M30 34 Q60 30 70 16', 'none', 2) + turn(20, p('M76 2 L92 18 L76 34 L60 18Z', '#D62828') + p('M76 2 L76 34 L60 18Z', '#FFD23F') + p('M76 2 L92 18 L76 34 L60 18Z'), 76, 18) +
    kid({ head: [24, 32], neck: [24, 44], hip: [24, 68], arms: [[[24, 46], [16, 56], [12, 66]], [[24, 46], [30, 40], [30, 34]]], legs: [[[24, 68], [18, 82], [16, 94]], [[24, 68], [30, 82], [32, 94]]] }) + p('M0 96 L100 96', 'none', 3),
  'take photos':
    p('M70 16 L80 8 M74 22 L88 20 M66 12 L68 2', 'none', 3, '#F2B92B') +
    kid({ head: [44, 26], neck: [44, 40], hip: [44, 66], arms: [[[44, 42], [36, 50], [46, 34]], [[44, 42], [62, 48], [58, 32]]], legs: [[[44, 66], [38, 82], [36, 96]], [[44, 66], [50, 82], [52, 96]]] }) +
    r(42, 20, 26, 18, '#4A4F63', 4, 3) + c(60, 29, 6, '#C9CEDB', 2.5) + r(46, 16, 8, 5, '#4A4F63', 1, 2.5),
  rollerskate:
    p('M4 40 L16 40 M2 52 L14 52', 'none', 3) +
    kid({ head: [52, 14], neck: [50, 26], hip: [46, 52], arms: [[[50, 28], [36, 26], [24, 32]], [[50, 28], [64, 34], [76, 30]]], legs: [[[46, 52], [36, 66], [26, 74]], [[46, 52], [54, 68], [56, 82]]] }) +
    r(48, 80, 16, 6, '#D62828', 2, 3) + c(51, 90, 3, '#FFD23F', 2) + c(61, 90, 3, '#FFD23F', 2) + turn(30, r(18, 72, 16, 6, '#D62828', 2, 3) + c(21, 82, 3, '#FFD23F', 2) + c(31, 82, 3, '#FFD23F', 2), 26, 78),
  'ride a horse':
    HORSE + kid({ head: [44, 18], neck: [44, 30], hip: [42, 48], arms: [[[44, 32], [54, 40], [64, 38]], [[44, 32], [54, 40], [64, 38]]], legs: [[[42, 48], [48, 58], [44, 70]], [[42, 48], [48, 58], [44, 70]]], shirt: '#2E9E44' }),
  'play basketball':
    r(76, 10, 20, 16, '#fff', 2, 3) + r(64, 24, 20, 4, '#F28C28', 2, 3) + p('M66 28 L70 40 L78 40 L82 28 M72 28 L74 40 M76 28 L76 40', 'none', 2) +
    c(46, 14, 9, '#F28C28', 3) + p('M37 14 L55 14 M46 5 L46 23', 'none', 2) +
    kid({ head: [34, 36], neck: [34, 48], hip: [34, 72], arms: [[[34, 50], [26, 56], [24, 66]], [[34, 50], [42, 36], [44, 24]]], legs: [[[34, 72], [28, 84], [26, 96]], [[34, 72], [40, 84], [42, 96]]], shirt: '#7B3FB8' }),
  'play baseball':
    c(86, 22, 5, '#fff', 2.5) + p('M90 18 Q86 22 90 26', 'none', 1.5, '#D62828') + limb([[44, 34], [74, 10]], WOOD, 5) +
    kid({ head: [34, 30], neck: [34, 42], hip: [34, 66], arms: [[[34, 44], [40, 46], [44, 36]], [[34, 44], [42, 40], [44, 34]]], legs: [[[34, 66], [26, 80], [22, 94]], [[34, 66], [42, 80], [46, 94]]], shirt: '#2F6FE4', pants: '#9AA0AE' }) +
    p('M24 22 Q34 14 44 22', '#2F6FE4', 3),
  'play tennis':
    c(84, 16, 5, '#D7E84B', 2.5) + turn(-35, limb([[60, 40], [60, 56]], INK, 3) + e(60, 28, 9, 13, 'none', 4) + e(60, 28, 7, 11, '#fff', 0, '#fff') + p('M54 22 L66 22 M54 28 L66 28 M54 34 L66 34 M57 17 L57 39 M60 15 L60 41 M63 17 L63 39', 'none', 1), 60, 40) +
    kid({ head: [34, 26], neck: [34, 38], hip: [34, 62], arms: [[[34, 40], [26, 48], [22, 58]], [[34, 40], [46, 44], [56, 40]]], legs: [[[34, 62], [26, 78], [24, 94]], [[34, 62], [42, 78], [46, 94]]], shirt: '#fff' }),
  'play hockey':
    c(80, 90, 4, '#F28C28', 2.5) +
    kid({ head: [38, 18], neck: [38, 30], hip: [40, 56], arms: [[[38, 32], [48, 42], [56, 50]], [[38, 32], [50, 38], [58, 40]]], legs: [[[40, 56], [32, 74], [28, 92]], [[40, 56], [50, 72], [54, 92]]], shirt: '#2E9E44' }) +
    limb([[56, 38], [66, 88], [74, 90]], WOOD_DARK, 4),
};

/** Façade de boutique : auvent rayé, vitrine avec un objet, porte. */
function shop(awning: string, item: string): string {
  const stripes = [0, 1, 2, 3, 4, 5].map((i) => p(`M${10 + i * 13.3} 34 L${23.3 + i * 13.3} 34 L${23.3 + i * 13.3} 42 Q${16.7 + i * 13.3} 48 ${10 + i * 13.3} 42Z`, i % 2 ? '#fff' : awning, 3)).join('');
  return r(10, 14, 80, 80, WALL, 2) + r(10, 14, 80, 20, awning, 2) + stripes + r(16, 52, 42, 36, SKY, 2, 3) + item + r(64, 54, 20, 40, WOOD_DARK, 2, 3) + dot(80, 74, 2, '#FFD23F');
}

export const TOWN: Record<string, string> = {
  'book shop': shop('#2E9E44', p('M37 64 Q28 60 20 62 L20 82 Q28 80 37 84Z M37 64 Q46 60 54 62 L54 82 Q46 80 37 84Z', '#fff', 3)),
  'café':
    shop('#D62828', p('M26 66 L48 66 L46 84 L28 84Z', '#fff', 3) + p('M48 70 Q54 70 54 75 Q54 80 47 80', 'none', 3) + p('M32 62 Q30 58 32 54 M40 62 Q38 58 40 54', 'none', 2.5, '#9AA0AE')),
  cinema:
    r(8, 22, 84, 72, '#7B3FB8', 2) + r(16, 8, 68, 22, '#D62828', 3) + [22, 34, 46, 58, 70, 80].map((x) => dot(x, 19, 3, '#FFD23F')).join('') +
    r(18, 40, 64, 26, INK, 3, 3) + [24, 38, 52, 66].map((x) => r(x, 46, 10, 14, SKY, 1, 2)).join('') + r(38, 72, 24, 22, '#4A2D6E', 2, 3),
  'clothes shop': shop('#7B3FB8', place(23, 54, 0.3, CLOTHES['T-shirt']!)),
  park:
    p('M0 70 L100 70 L100 100 L0 100Z', GRASS) + r(20, 44, 7, 28, WOOD_DARK, 2, 3) + c(23, 32, 16, '#2E9E44') + r(70, 50, 6, 22, WOOD_DARK, 2, 3) + c(73, 40, 12, '#3BB55A') +
    p('M40 100 Q50 84 46 70 L54 70 Q60 84 62 100Z', '#E8D3A2', 3) + r(30, 76, 26, 4, WOOD, 1, 3) + r(30, 70, 26, 4, WOOD, 1, 3) + p('M33 80 L33 88 M53 80 L53 88', 'none', 3) + c(86, 14, 7, '#FFD23F', 3),
  playground:
    p('M0 92 L100 92', 'none', 4) + limb([[10, 92], [22, 20], [34, 92]], '#D62828', 4) + limb([[16, 20], [52, 20]], '#D62828', 4) + limb([[46, 20], [46, 92]], '#D62828', 4) +
    p('M26 20 L26 56 M38 20 L38 56', 'none', 2.5) + r(22, 56, 20, 5, '#FFD23F', 1, 3) +
    p('M58 92 L58 36 L68 36 L68 92 M58 50 L68 50 M58 64 L68 64 M58 78 L68 78', 'none', 4) + p('M68 36 Q74 36 84 66 Q90 86 98 90 L98 94 Q86 92 80 72 Q72 46 68 44Z', '#2F6FE4', 3),
  school:
    r(8, 40, 84, 54, '#FFB4A2', 2) + p('M30 40 L50 20 L70 40Z', '#D62828') + r(38, 34, 24, 18, '#FFB4A2', 0, 0) + c(50, 34, 7, '#fff', 3) + p('M50 30 L50 34 L53 36', 'none', 2) +
    limb([[50, 20], [50, 4]], INK, 2) + p('M52 4 L66 8 L52 12Z', '#2F6FE4', 2.5) +
    [16, 30, 62, 76].map((x) => r(x, 52, 10, 12, SKY, 1, 3)).join('') + r(42, 64, 16, 30, '#2F6FE4', 2, 3) + p('M0 94 L100 94', 'none', 4),
  street:
    p('M0 60 L100 60 L100 100 L0 100Z', '#7A8194') + p('M0 60 L100 60', 'none', 4) + p('M0 56 L100 56', 'none', 3) +
    p('M6 80 L20 80 M32 80 L46 80 M58 80 L72 80 M84 80 L98 80', 'none', 4, '#fff') +
    r(14, 14, 18, 42, '#FFB4A2', 0, 3) + r(32, 24, 22, 32, WALL, 0, 3) + r(54, 8, 18, 48, '#C9CEDB', 0, 3) +
    r(18, 20, 6, 6, SKY, 0, 2) + r(38, 30, 6, 6, SKY, 0, 2) + r(58, 14, 6, 6, SKY, 0, 2) + r(58, 30, 6, 6, SKY, 0, 2) +
    limb([[86, 56], [86, 16], [78, 16]], '#4A4F63', 3) + c(78, 20, 4, '#FFD23F', 2.5),
  supermarket:
    r(4, 22, 92, 72, '#E6E9F0', 2) + r(4, 22, 92, 16, '#2E9E44', 2) + r(10, 46, 34, 40, SKY, 2, 3) + r(56, 46, 34, 48, SKY, 2, 3) + p('M73 46 L73 94', 'none', 3) +
    p('M14 56 L18 56 L22 72 L38 72 L40 62 L20 62', 'none', 3) + dot(25, 78, 2.5) + dot(36, 78, 2.5),
  'toy shop': shop('#F28C28', place(22, 50, 0.38, TOYS['teddy bear']!)),
  behind: PLACES.behind!,
  'in front of': PLACES['in front of']!,
  between: PLACES.between!,
};

export const FARM: Record<string, string> = {
  barn:
    p('M8 44 L24 18 L76 18 L92 44Z', '#8B1E1E') + r(10, 42, 80, 52, '#C0392B', 2) + r(34, 58, 32, 36, '#fff', 0, 3) + p('M34 58 L66 94 M66 58 L34 94', 'none', 3) +
    r(42, 26, 16, 12, '#fff', 0, 3) + p('M0 94 L100 94', 'none', 4),
  cow:
    [22, 32, 54, 64].map((x) => r(x, 62, 7, 28, '#fff', 2, 3)).join('') + p('M14 50 Q6 62 8 72', 'none', 3) + e(44, 56, 30, 18, '#fff') +
    p('M28 44 Q36 40 40 48 Q38 58 28 56 Q22 50 28 44Z M50 58 Q58 54 62 62 Q56 70 48 66Z', INK, 0) + e(46, 74, 7, 4, '#F48FB1', 2.5) +
    p('M70 26 L66 18 M84 26 L88 18', 'none', 3) + c(77, 38, 14, '#fff') + e(77, 48, 11, 7, '#F48FB1', 3) + dot(73, 48, 1.6) + dot(81, 48, 1.6) + dot(71, 34, 2.2) + dot(83, 34, 2.2) + p('M62 32 L56 28 L60 38Z M92 32 L98 28 L94 38Z', '#fff', 3),
  donkey:
    [22, 32, 54, 64].map((x) => r(x, 62, 7, 28, '#9AA0AE', 2, 3)).join('') + p('M14 50 Q6 62 8 72', 'none', 3) + e(44, 56, 28, 16, '#9AA0AE') +
    p('M60 50 L70 24 L82 28 L74 58Z', '#9AA0AE') + p('M70 22 L60 2 L74 18Z M78 22 L80 2 L84 22Z', '#9AA0AE', 3) + turn(35, e(82, 30, 15, 9, '#9AA0AE'), 82, 30) +
    turn(35, e(91, 33, 6, 5, '#E6E9F0', 2.5), 91, 33) + dot(78, 24, 2.4),
  duck:
    p('M0 80 Q12 74 25 80 T50 80 T75 80 T100 80 L100 100 L0 100Z', WATER) + p('M14 56 Q16 80 46 80 Q76 80 78 62 Q60 66 52 52 Z', '#fff') + p('M14 56 L6 48 L18 52Z', '#fff', 3) +
    c(66, 38, 14, '#fff') + p('M78 38 L94 42 L78 46Z', '#F28C28', 3) + dot(70, 34, 2.4) + p('M34 64 Q46 56 56 66', 'none', 3) + p('M0 80 Q12 74 25 80 T50 80 T75 80 T100 80', 'none', 4),
  field:
    c(78, 16, 8, '#FFD23F', 3) + p('M0 40 Q30 26 60 38 T100 34 L100 100 L0 100Z', '#9CCB5B') + p('M0 56 Q50 46 100 54 L100 100 L0 100Z', '#E3B94F') +
    p('M8 66 Q50 58 94 64 M4 78 Q50 70 98 76 M2 92 Q50 84 100 90', 'none', 3, '#B88A2B') + p('M0 56 Q50 46 100 54', 'none', 4),
  goat:
    [24, 32, 52, 60].map((x) => r(x, 60, 6, 28, '#F3E6CF', 2, 3)).join('') + e(42, 54, 26, 15, '#F3E6CF') + p('M16 46 L8 40 L14 52Z', '#F3E6CF', 3) +
    p('M58 48 L66 24 L78 26 L72 56Z', '#F3E6CF') + p('M68 22 Q62 6 54 10 M74 22 Q76 6 84 8', 'none', 4) + turn(30, e(78, 30, 13, 8, '#F3E6CF'), 78, 30) +
    p('M82 38 L82 50 L88 42Z', '#F3E6CF', 3) + dot(76, 26, 2.4) + p('M62 30 L54 32 L62 36Z', '#F3E6CF', 3),
  horse: HORSE,
  pond:
    e(50, 64, 44, 24, WATER) + e(36, 64, 9, 5, '#2E9E44', 3) + p('M36 64 L42 62', 'none', 2) + c(62, 58, 4, '#F48FB1', 2.5) +
    p('M80 54 L84 24 M88 56 L94 30 M76 56 L72 34', 'none', 3, '#2E7D4F') + e(84, 24, 2.5, 7, '#8B5A2B', 2) + e(94, 30, 2.5, 7, '#8B5A2B', 2) + p('M56 72 Q64 68 72 72', 'none', 2.5, '#fff'),
  sheep:
    [28, 38, 54, 64].map((x) => r(x, 64, 6, 26, INK, 2, 3)).join('') +
    p('M22 56 Q16 44 28 40 Q32 30 44 34 Q52 26 62 34 Q74 32 76 44 Q86 52 78 62 Q78 72 66 70 Q58 78 48 72 Q38 78 30 70 Q18 68 22 56Z', '#fff') +
    e(82, 42, 10, 12, '#4A4F63') + e(74, 34, 6, 3, '#4A4F63', 3) + dot(85, 40, 2.2, '#fff'),
};

/* Consignes de classe : l'enfant, le tableau, la porte… et une flèche verte pour le mouvement. */
const GO = '#157F45';
/** Flèche droite de (x1, y1) à (x2, y2). */
function arrow(x1: number, y1: number, x2: number, y2: number): string {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 10, w = 0.55;
  const pt = (da: number) => `${(x2 - h * Math.cos(a + da)).toFixed(1)} ${(y2 - h * Math.sin(a + da)).toFixed(1)}`;
  const bx = x2 - 6 * Math.cos(a), by = y2 - 6 * Math.sin(a);
  return limb([[x1, y1], [bx, by]], GO, 5) + p(`M${x2} ${y2} L${pt(w)} L${pt(-w)}Z`, GO, 3);
}
const board = (x: number, y: number, w: number, h: number, chalk = true): string =>
  r(x, y, w, h, WOOD_DARK, 4) + r(x + 5, y + 5, w - 10, h - 10, '#2E7D4F', 2, 3) +
  (chalk ? p(`M${x + 12} ${y + h / 2 - 4} L${x + w / 2} ${y + h / 2 - 4} M${x + 12} ${y + h / 2 + 6} L${x + w - 14} ${y + h / 2 + 6}`, 'none', 3, '#F4F1E8') : '');
const xbook = (x: number, y: number, k = 1): string =>
  r(x, y, 30 * k, 38 * k, '#2F6FE4', 3) + r(x + 6 * k, y + 8 * k, 18 * k, 8 * k, '#fff', 1, 2.5) + p(`M${x + 5 * k} ${y} L${x + 5 * k} ${y + 38 * k}`, 'none', 2.5);
const openBook = (y: number): string =>
  p(`M50 ${y + 6} Q32 ${y - 4} 10 ${y + 2} L10 ${y + 50} Q32 ${y + 44} 50 ${y + 54}Z`, '#fff') + p(`M50 ${y + 6} Q68 ${y - 4} 90 ${y + 2} L90 ${y + 50} Q68 ${y + 44} 50 ${y + 54}Z`, '#fff') +
  p(`M18 ${y + 16} Q30 ${y + 12} 42 ${y + 16} M18 ${y + 28} Q30 ${y + 24} 42 ${y + 28} M58 ${y + 16} Q70 ${y + 12} 82 ${y + 16} M58 ${y + 28} Q70 ${y + 24} 82 ${y + 28}`, 'none', 2.5);
const chair = (x: number): string => r(x, 40, 6, 54, WOOD_DARK, 2, 3) + r(x, 64, 26, 6, '#F28C28', 2, 3) + r(x + 20, 68, 6, 26, WOOD_DARK, 2, 3);
const ground = p('M0 96 L100 96', 'none', 3);
const standing = (x: number, shirt = '#D62828'): string =>
  kid({ head: [x, 20], neck: [x, 32], hip: [x, 58], arms: [[[x - 5, 34], [x - 11, 46], [x - 13, 58]], [[x + 5, 34], [x + 11, 46], [x + 13, 58]]], legs: [[[x, 58], [x - 5, 76], [x - 6, 94]], [[x, 58], [x + 5, 76], [x + 6, 94]]], shirt });
/** Main ouverte (paume vers soi), doigts vers le haut. */
const hand = (x: number, y: number): string =>
  [-9, -3, 3, 9].map((dx) => r(x + dx - 2.5, y - 16 + Math.abs(dx) / 2, 5.5, 16, SKIN, 2.75, 3)).join('') + p(`M${x - 12} ${y + 2} L${x - 20} ${y - 6}`, 'none', 9) + p(`M${x - 12} ${y + 2} L${x - 20} ${y - 6}`, 'none', 5, SKIN) + r(x - 12, y - 4, 24, 20, SKIN, 7, 3);

export const CLASSROOM: Record<string, string> = {
  'stand up': chair(10) + standing(52) + arrow(82, 70, 82, 16) + ground,
  'sit down':
    arrow(80, 16, 80, 64) + r(34, 40, 6, 54, WOOD_DARK, 2, 3) + r(68, 68, 6, 26, WOOD_DARK, 2, 3) +
    kid({ head: [44, 30], neck: [44, 42], hip: [46, 64], arms: [[[44, 44], [50, 54], [58, 58]], [[44, 44], [52, 54], [60, 58]]], legs: [[[46, 64], [64, 66], [64, 92]], [[46, 64], [62, 68], [62, 92]]] }) +
    r(34, 64, 40, 6, '#F28C28', 2, 3) + ground,
  'come up to the board':
    board(60, 14, 38, 34) + kid({ head: [22, 20], neck: [22, 32], hip: [20, 58], arms: [[[22, 34], [14, 44], [10, 54]], [[22, 34], [30, 44], [34, 52]]], legs: [[[20, 58], [12, 76], [8, 94]], [[20, 58], [28, 76], [32, 94]]] }) +
    arrow(40, 74, 76, 74) + ground,
  'look at the board':
    board(44, 8, 52, 40) + p('M30 28 L48 28 M30 34 L48 40', 'none', 3, GO) + standing(22, '#2F6FE4') + ground,
  'close the door':
    r(16, 8, 52, 88, '#3A2A1E', 2, 3) + p('M16 8 L44 18 L44 92 L16 96Z', WOOD, 4) + dot(38, 54, 3) + p('M58 40 Q60 20 76 22', 'none', 0) +
    p('M84 72 Q84 40 52 38', 'none', 10) + p('M84 72 Q84 40 52 38', 'none', 5, GO) + p('M44 38 L56 31 L56 45Z', GO, 3),
  'open the window':
    r(10, 10, 70, 74, '#fff', 4) + r(16, 16, 58, 62, SKY, 2, 3) + p('M45 16 L45 78', 'none', 4) + p('M45 16 L66 8 L66 86 L45 78Z', '#fff', 4) + p('M50 20 L62 16 L62 78 L50 76Z', '#DDEFFF', 2.5) +
    r(4, 84, 82, 7, WOOD, 3, 3) + p('M84 60 Q96 36 74 20', 'none', 10) + p('M84 60 Q96 36 74 20', 'none', 5, GO) + p('M68 16 L80 14 L76 26Z', GO, 3),
  'take your exercise book':
    hand(56, 80) + xbook(38, 22, 1.1) + arrow(22, 88, 22, 52),
  'be quiet':
    c(50, 50, 32, SKIN) + p('M18 46 Q16 14 50 14 Q84 14 82 46 Q76 28 50 28 Q24 28 18 46Z', '#6B3E1F', 3) + dot(38, 46, 3) + dot(62, 46, 3) + p('M42 68 L58 68', 'none', 3) +
    r(46, 54, 8, 40, SKIN, 4, 3) + r(40, 76, 20, 20, SKIN, 7, 3),
  'open your book': openBook(26) + arrow(30, 16, 10, 16) + arrow(70, 16, 90, 16),
  'close your book': r(28, 22, 44, 58, '#D62828', 4) + r(34, 30, 32, 10, '#fff', 1, 2.5) + p('M34 22 L34 80', 'none', 3) + arrow(2, 50, 22, 50) + arrow(98, 50, 78, 50),
  read:
    kid({ head: [50, 18], neck: [50, 30], hip: [50, 58], arms: [[[50, 32], [36, 44], [34, 52]], [[50, 32], [64, 44], [66, 52]]], legs: [[[50, 58], [44, 76], [42, 94]], [[50, 58], [56, 76], [58, 94]]], shirt: '#2E9E44' }) +
    p('M50 46 Q40 40 28 44 L28 64 Q40 60 50 66Z', '#fff', 3) + p('M50 46 Q60 40 72 44 L72 64 Q60 60 50 66Z', '#fff', 3) + p('M34 50 L44 50 M34 56 L44 56 M56 50 L66 50 M56 56 L66 56', 'none', 2) + ground,
  draw:
    turn(-6, r(10, 14, 64, 76, '#fff', 3)) + p('M22 70 L22 52 L36 40 L50 52 L50 70Z', 'none', 3, '#2F6FE4') + c(56, 30, 7, 'none', 3, '#F28C28') + p('M18 76 L64 72', 'none', 3, '#2E9E44') +
    place(30, 30, 0.7, turn(-40, r(24, 40, 54, 20, '#FFD23F', 2) + r(76, 40, 9, 20, '#B0B6C3', 1) + r(84, 40, 10, 20, '#F48FB1', 4) + p('M24 40 L6 50 L24 60Z', '#F2C79A') + p('M12 46.7 L6 50 L12 53.3Z', INK, 3))),
  'take your pencil':
    hand(54, 80) + place(14, 26, 0.7, turn(-40, r(24, 40, 54, 20, '#FFD23F', 2) + r(76, 40, 9, 20, '#B0B6C3', 1) + r(84, 40, 10, 20, '#F48FB1', 4) + p('M24 40 L6 50 L24 60Z', '#F2C79A') + p('M12 46.7 L6 50 L12 53.3Z', INK, 3))) +
    arrow(86, 88, 86, 50),
  write:
    r(14, 8, 66, 84, '#fff', 3) + p('M14 22 L80 22', 'none', 2, '#D62828') +
    p('M22 36 Q26 28 30 36 Q34 44 38 36 Q42 28 46 36 Q50 44 54 36 M22 52 Q26 44 30 52 Q34 60 38 52 Q42 44 46 52', 'none', 3, '#1E3E8C') + p('M22 68 L34 68', 'none', 3, '#1E3E8C') +
    place(30, 36, 0.62, turn(-40, r(24, 40, 54, 20, '#2F6FE4', 5) + p('M24 44 L10 50 L24 56Z', '#C9CEDB') + r(64, 37, 26, 26, '#1E3E8C', 6))),
  listen:
    p('M62 50 Q62 24 40 24 Q18 24 18 48 Q18 62 30 66 Q36 70 34 80 Q32 90 44 90 Q54 90 56 78 Q58 66 62 50Z', SKIN) + p('M30 48 Q30 34 40 34 Q50 34 50 46 Q50 56 42 58 Q38 60 40 66', 'none', 3.5) +
    p('M72 34 Q78 44 72 54 M80 26 Q90 44 80 62 M88 18 Q102 44 88 70', 'none', 4, GO),
  'raise your hands':
    kid({ head: [28, 30], neck: [28, 42], hip: [28, 66], arms: [[[28, 44], [20, 54], [18, 64]], [[28, 44], [36, 30], [38, 14]]], legs: [[[28, 66], [24, 80], [22, 96]], [[28, 66], [32, 80], [34, 96]]], shirt: '#2F6FE4' }) +
    kid({ head: [72, 30], neck: [72, 42], hip: [72, 66], arms: [[[72, 44], [80, 54], [82, 64]], [[72, 44], [64, 30], [62, 14]]], legs: [[[72, 66], [68, 80], [66, 96]], [[72, 66], [76, 80], [78, 96]]], shirt: '#D62828' }),
  'erase the board':
    board(4, 14, 92, 58, false) + p('M18 30 L46 30 M18 42 L40 42', 'none', 3, '#F4F1E8') + p('M50 26 Q60 36 52 46 Q62 52 54 62', 'none', 6, '#4E9A6A') +
    r(60, 30, 26, 14, '#F2C14E', 3, 3) + r(60, 40, 26, 6, '#4A4F63', 2, 3) + r(28, 72, 44, 6, WOOD, 2, 3),
};
