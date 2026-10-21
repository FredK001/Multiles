/* Dessins des mots de la fiche CE1 (sauf Hello, dans words.ts). Une entrée = un mot anglais de src/content/english.ts. */
import { INK, line } from './shapes';
import { c, dot, e, HALO, kid, limb, NOTE, p, PALE_LINE, place, r, SKIN, turn, WOOD, WOOD_DARK } from './words-kit';

const CHALK = '#F4F1E8';

export const SCHOOL: Record<string, string> = {
  board:
    r(6, 14, 88, 62, WOOD_DARK, 6) + r(13, 21, 74, 48, '#2E7D4F', 3) +
    p('M22 36 Q26 28 30 36 Q34 44 38 36', 'none', 3, CHALK) + p('M46 34 L54 34 M50 30 L50 38', 'none', 3, CHALK) + p('M62 36 Q66 28 70 36 Q74 44 78 36', 'none', 3, CHALK) +
    p('M22 56 L60 56', 'none', 3, CHALK) + r(18, 76, 64, 7, WOOD, 3) + r(58, 72, 12, 5, CHALK, 2, 2.5),
  book:
    p('M6 30 L6 84 Q30 78 50 88 Q70 78 94 84 L94 30', '#D62828') +
    p('M50 28 Q32 18 10 24 L10 78 Q32 72 50 82Z', '#fff') + p('M50 28 Q68 18 90 24 L90 78 Q68 72 50 82Z', '#fff') +
    p('M18 38 Q30 34 42 38 M18 50 Q30 46 42 50 M18 62 Q30 58 42 62 M58 38 Q70 34 82 38 M58 50 Q70 46 82 50 M58 62 Q70 58 82 62', 'none', 2.5),
  chair:
    r(26, 10, 8, 50, WOOD_DARK, 3) + r(66, 10, 8, 50, WOOD_DARK, 3) + r(24, 14, 52, 18, '#F28C28', 5) +
    r(22, 62, 7, 32, WOOD_DARK, 3) + r(71, 62, 7, 32, WOOD_DARK, 3) + p('M16 52 L84 52 L80 64 L20 64Z', '#F28C28'),
  desk:
    r(16, 60, 8, 32, WOOD_DARK, 3) + r(76, 60, 8, 32, WOOD_DARK, 3) + r(18, 44, 64, 18, '#A0703A', 3) +
    p('M42 53 L58 53', 'none', 4) + r(6, 34, 88, 11, WOOD, 4) + p('M30 34 L32 26 L56 26 L54 34', '#2F6FE4') + r(64, 28, 18, 6, '#FFD23F', 2, 3),
  door:
    p('M12 94 L88 94') + r(24, 6, 52, 86, WOOD_DARK, 4) + r(32, 14, 36, 30, '#A0703A', 3, 3) + r(32, 52, 36, 32, '#A0703A', 3, 3) + c(64, 50, 4.5, '#FFD23F', 3),
  pen: turn(-40,
    r(14, 43, 72, 14, '#2F6FE4', 5) + p('M14 45 L2 50 L14 55Z', '#C9CEDB') + dot(3, 50, 2) + r(66, 40, 26, 20, '#1E3E8C', 6) + r(70, 35, 20, 6, '#1E3E8C', 3, 3)),
  pencil: turn(-40,
    r(24, 40, 54, 20, '#FFD23F', 2) + p('M24 47 L78 47 M24 53 L78 53', 'none', 2) + r(76, 40, 9, 20, '#B0B6C3', 1) + r(84, 40, 10, 20, '#F48FB1', 4) +
    p('M24 40 L6 50 L24 60Z', '#F2C79A') + p('M12 46.7 L6 50 L12 53.3Z', INK, 3)),
  'pencil case':
    turn(-18, r(26, 14, 8, 30, '#2F6FE4', 2, 3) + p('M26 14 L30 6 L34 14Z', '#F2C79A', 3), 30, 30) + turn(14, r(58, 12, 8, 30, '#D62828', 2, 3) + p('M58 12 L62 4 L66 12Z', '#F2C79A', 3), 62, 28) +
    p('M8 44 Q8 34 20 34 L80 34 Q92 34 92 44 L92 72 Q92 84 80 84 L20 84 Q8 84 8 72Z', '#7B3FB8') +
    p('M14 44 L86 44', 'none', 3) + p('M18 44 L18 40 M26 44 L26 40 M34 44 L34 40 M42 44 L42 40 M50 44 L50 40 M58 44 L58 40 M66 44 L66 40', 'none', 2) + r(72, 40, 8, 16, '#FFD23F', 2, 3),
  rubber:
    p('M10 46 L28 30 L92 30 L74 46Z', '#F8B6CC') + p('M74 46 L92 30 L92 62 L74 78Z', '#D9779A') + r(10, 46, 64, 32, '#F48FB1', 2) +
    p('M10 46 L28 30 L52 30 L34 46Z', '#7FA6EE') + r(10, 46, 24, 32, '#2F6FE4', 2),
  window:
    r(14, 10, 72, 74, '#fff', 4) + r(21, 17, 58, 60, '#BFE3FF', 2, 3) + c(66, 30, 7, '#FFD23F', 3) +
    p('M28 64 Q28 56 36 56 Q40 50 46 56 Q52 56 52 64Z', '#fff', 3) + p('M50 17 L50 77 M21 47 L79 47', 'none', 5) + r(8, 82, 84, 8, WOOD, 3),
};

export const TOYS: Record<string, string> = {
  'art set':
    r(6, 28, 88, 48, '#2F6FE4', 7) + r(12, 34, 76, 36, '#fff', 4, 3) +
    [['#D62828', 24, 44], ['#FFD23F', 44, 44], ['#2E9E44', 64, 44], ['#F28C28', 24, 60], ['#7B3FB8', 44, 60], ['#F48FB1', 64, 60]]
      .map(([f, x, y]) => e(x as number, y as number, 7, 5, f as string, 3)).join('') +
    turn(-30, r(64, 46, 34, 6, WOOD, 3, 3) + p('M64 46 L56 49 L64 52Z', INK, 3), 80, 50),
  ball:
    c(50, 50, 40, '#FFD23F') + p('M50 10 Q28 50 50 90 Q14 84 10 50 Q14 16 50 10Z', '#D62828') + p('M50 10 Q72 50 50 90 Q86 84 90 50 Q86 16 50 10Z', '#2F6FE4') +
    c(50, 50, 40, 'none') + p('M30 28 Q36 22 42 20', 'none', 4, '#fff'),
  bike:
    c(24, 66, 18, '#fff', 5) + c(76, 66, 18, '#fff', 5) + dot(24, 66, 3) + dot(76, 66, 3) +
    line(24, 66, 46, 66, '#D62828', 5) + line(24, 66, 40, 40, '#D62828', 5) + line(40, 40, 46, 66, '#D62828', 5) +
    line(40, 40, 68, 40, '#D62828', 5) + line(68, 40, 46, 66, '#D62828', 5) + line(66, 30, 76, 66, '#D62828', 5) +
    line(60, 28, 72, 28, INK, 3) + e(38, 35, 9, 4, INK, 2),
  camera:
    r(22, 22, 22, 12, '#4A4F63', 3) + r(8, 30, 84, 54, '#4A4F63', 9) + r(66, 22, 14, 8, '#C9CEDB', 2, 3) +
    c(50, 57, 20, '#C9CEDB') + c(50, 57, 11, '#1E3E8C') + dot(45, 52, 3.5, '#fff') + r(72, 38, 12, 8, '#FFD23F', 2, 3),
  computer:
    r(10, 12, 80, 56, '#9AA0AE', 7) + r(17, 19, 66, 42, '#2F6FE4', 3, 3) + p('M24 30 L44 30 M24 38 L54 38 M24 46 L38 46', 'none', 3, '#BFE3FF') +
    r(42, 68, 16, 10, '#9AA0AE', 0, 3) + r(24, 78, 52, 9, '#9AA0AE', 4),
  'computer game':
    p('M24 30 L76 30 Q94 30 95 54 Q96 80 80 78 Q70 76 65 62 L35 62 Q30 76 20 78 Q4 80 5 54 Q6 30 24 30Z', '#7B3FB8') +
    `<path d="M20 45 h6 v-6 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6z" fill="${INK}"/>` +
    c(72, 40, 4.5, '#D62828', 2.5) + c(81, 48, 4.5, '#2E9E44', 2.5) + c(63, 48, 4.5, '#FFD23F', 2.5) + c(72, 56, 4.5, '#2F6FE4', 2.5),
  doll:
    c(34, 34, 7, '#F2A93B', 3) + c(66, 34, 7, '#F2A93B', 3) + line(40, 56, 26, 70, '#F6D2B8', 6) + line(60, 56, 74, 70, '#F6D2B8', 6) +
    line(43, 82, 43, 94, '#F6D2B8', 6) + line(57, 82, 57, 94, '#F6D2B8', 6) + p('M50 46 L26 86 L74 86Z', '#F48FB1') +
    c(50, 30, 16, '#F6D2B8') + p('M34 30 Q34 12 50 12 Q66 12 66 30 Q60 20 50 20 Q40 20 34 30Z', '#F2A93B', 3) +
    dot(44, 31, 2.5) + dot(56, 31, 2.5) + p('M45 38 Q50 42 55 38', 'none', 2.5),
  kite:
    p('M50 68 Q44 80 60 82 Q78 84 72 96', 'none', 3) + p('M52 80 L46 74 L46 86Z M70 86 L76 80 L78 92Z', '#FFD23F', 2.5) +
    p('M50 4 L80 34 L50 68 L20 34Z', '#D62828') + p('M50 4 L50 68 L20 34Z', '#FFD23F') + p('M50 4 L80 34 L50 68 L20 34Z') + p('M20 34 L80 34', 'none', 3),
  robot:
    line(50, 12, 50, 4, INK, 2) + c(50, 5, 4, '#D62828', 3) + r(30, 12, 40, 28, '#9AA0AE', 6) + c(41, 25, 5, '#FFD23F', 3) + c(59, 25, 5, '#FFD23F', 3) +
    r(42, 32, 16, 4, INK, 1, 1) + r(44, 40, 12, 6, '#9AA0AE', 0, 3) + r(10, 50, 12, 26, '#9AA0AE', 5) + r(78, 50, 12, 26, '#9AA0AE', 5) +
    r(32, 78, 12, 16, '#9AA0AE', 3) + r(56, 78, 12, 16, '#9AA0AE', 3) + r(22, 46, 56, 34, '#2F6FE4', 7) + c(50, 60, 7, '#FFD23F', 3) + dot(36, 70, 3, '#D62828') + dot(64, 70, 3, '#2E9E44'),
  'teddy bear':
    c(30, 18, 9, '#B5793F') + c(70, 18, 9, '#B5793F') + e(50, 72, 24, 22, '#B5793F') + e(50, 74, 13, 12, '#E8C39E', 3) +
    c(24, 62, 9, '#B5793F') + c(76, 62, 9, '#B5793F') + c(34, 90, 9, '#B5793F') + c(66, 90, 9, '#B5793F') +
    c(50, 34, 20, '#B5793F') + e(50, 41, 9, 7, '#E8C39E', 3) + e(50, 38, 3.5, 2.5, INK, 1) + dot(43, 30, 2.5) + dot(57, 30, 2.5),
};

/* Famille : un petit arbre où « moi » est en jaune et la personne demandée en couleur, dans un halo. */
const PALE = '#E6E9F0';
type Kin = 'grandpa' | 'grandma' | 'aunt' | 'uncle' | 'dad' | 'mum' | 'cousin' | 'me' | 'brother' | 'sister';
const TREE: readonly { who: Kin; x: number; y: number; k: number; girl: boolean; old?: boolean }[] = [
  { who: 'grandpa', x: 40, y: 10, k: 1, girl: false, old: true }, { who: 'grandma', x: 60, y: 10, k: 1, girl: true, old: true },
  { who: 'aunt', x: 11, y: 41, k: 1, girl: true }, { who: 'uncle', x: 29, y: 41, k: 1, girl: false },
  { who: 'dad', x: 68, y: 41, k: 1, girl: false }, { who: 'mum', x: 86, y: 41, k: 1, girl: true },
  { who: 'cousin', x: 20, y: 73, k: 0.85, girl: false }, { who: 'me', x: 52, y: 73, k: 0.85, girl: false },
  { who: 'brother', x: 70, y: 73, k: 0.85, girl: false }, { who: 'sister', x: 88, y: 73, k: 0.85, girl: true },
];

function kin(f: (typeof TREE)[number], target: Kin): string {
  const { x, y, k, girl, old } = f, on = f.who === target || f.who === 'me', s = on ? INK : PALE_LINE, sw = on ? 3 : 2.5;
  const hair = !on ? '#D5D9E3' : old ? '#C9CEDB' : girl ? '#B5651D' : '#6B3E1F';
  const cloth = !on ? PALE : f.who === 'me' ? '#FFD23F' : girl ? '#D62828' : '#2F6FE4';
  const hr = 6.5 * k, top = y + 7 * k, bot = y + 19 * k, wd = 8.5 * k;
  return (f.who === target ? c(x, y + 6 * k, 15 * k, HALO, 0, HALO) : '') +
    (girl ? p(`M${x - 7.5 * k} ${y + 5 * k} Q${x - 8 * k} ${y - 8.5 * k} ${x} ${y - 8.5 * k} Q${x + 8 * k} ${y - 8.5 * k} ${x + 7.5 * k} ${y + 5 * k}Z`, hair, sw, s) : '') +
    (girl ? p(`M${x} ${top} L${x - wd} ${bot} L${x + wd} ${bot}Z`, cloth, sw, s)
      : p(`M${x - wd} ${bot} L${x - wd} ${top + 5 * k} Q${x - wd} ${top} ${x} ${top} Q${x + wd} ${top} ${x + wd} ${top + 5 * k} L${x + wd} ${bot}Z`, cloth, sw, s)) +
    c(x, y, hr, on ? SKIN : '#F3F4F8', sw, s) +
    (girl ? '' : p(`M${x - hr} ${y - 1 * k} Q${x - hr} ${y - 8 * k} ${x} ${y - 8 * k} Q${x + hr} ${y - 8 * k} ${x + hr} ${y - 1 * k} Q${x} ${y - 4.5 * k} ${x - hr} ${y - 1 * k}Z`, hair, sw, s)) +
    (on ? dot(x - 2.4 * k, y + 1 * k, 1.1) + dot(x + 2.4 * k, y + 1 * k, 1.1) : '');
}

const family = (target: Kin): string =>
  p('M50 30 L50 34 M29 34 L68 34 M29 34 L29 35 M68 34 L68 35 M20 60 L20 66 M77 60 L77 63 M52 63 L88 63 M52 63 L52 66 M70 63 L70 66 M88 63 L88 66', 'none', 3, '#8D94A6') +
  TREE.map((f) => kin(f, target)).join('') +
  `<text x="52" y="99.5" text-anchor="middle" font-family="Nunito Variable, sans-serif" font-weight="800" font-size="9" fill="${INK}">moi</text>`;

export const FAMILY: Record<string, string> = Object.fromEntries(
  (['aunt', 'brother', 'cousin', 'dad', 'grandpa', 'grandma', 'mum', 'sister', 'uncle'] as const).map((k) => [k, family(k)]),
);

const SKY = '#BFE3FF', WALL = '#FFE3B0', GRASS = '#7BC96F';
const flower = (x: number, y: number, col: string): string =>
  p(`M${x} ${y} L${x} ${y + 16}`, 'none', 3) + c(x, y, 5, col, 3) + dot(x, y, 2, '#FFD23F');

export const HOME: Record<string, string> = {
  balcony:
    r(6, 6, 88, 88, WALL, 4) + r(34, 14, 32, 50, SKY, 3) + p('M50 14 L50 64', 'none', 3) +
    r(72, 46, 12, 12, '#D62828', 2, 3) + c(78, 40, 6, '#2E9E44', 3) +
    r(12, 62, 76, 7, '#C9CEDB', 2) + p('M14 44 L86 44 M20 44 L20 62 M30 44 L30 62 M40 44 L40 62 M50 44 L50 62 M60 44 L60 62 M70 44 L70 62 M80 44 L80 62', 'none', 3.5),
  bathroom:
    p('M84 50 L84 22 Q84 12 74 12 L64 12', 'none', 5) + p('M56 12 L72 12 L68 20 L60 20Z', '#C9CEDB', 3) + p('M60 26 L58 32 M64 26 L64 32 M68 26 L70 32', 'none', 2.5, '#2F6FE4') +
    c(30, 46, 7, '#fff', 3) + c(42, 42, 9, '#fff', 3) + c(54, 46, 6, '#fff', 3) +
    r(20, 86, 6, 8, INK, 1, 2) + r(74, 86, 6, 8, INK, 1, 2) + p('M10 54 L90 54 L84 80 Q82 88 74 88 L26 88 Q18 88 16 80Z', '#fff') + r(6, 50, 88, 8, '#fff', 4),
  bedroom:
    p('M64 12 Q56 22 64 32 Q72 36 80 30 Q68 30 64 12Z', '#FFD23F', 3) +
    r(8, 34, 12, 58, WOOD_DARK, 3) + r(84, 54, 10, 38, WOOD_DARK, 3) + r(20, 58, 64, 10, '#fff', 2) + e(33, 52, 12, 7, '#fff', 3) +
    p('M44 52 L84 52 L84 76 L44 76Z', '#2F6FE4') + p('M52 52 L52 76 M64 52 L64 76', 'none', 2, '#1E3E8C') + r(20, 68, 64, 8, WOOD, 2, 3),
  'dining room':
    r(8, 32, 5, 60, WOOD_DARK, 2, 3) + r(8, 64, 18, 5, WOOD_DARK, 2, 3) + r(21, 66, 5, 26, WOOD_DARK, 2, 3) +
    r(87, 32, 5, 60, WOOD_DARK, 2, 3) + r(74, 64, 18, 5, WOOD_DARK, 2, 3) + r(74, 66, 5, 26, WOOD_DARK, 2, 3) +
    r(32, 56, 5, 36, WOOD, 2, 3) + r(63, 56, 5, 36, WOOD, 2, 3) + r(24, 50, 52, 7, WOOD, 2) +
    e(37, 47, 9, 3, '#fff', 3) + e(63, 47, 9, 3, '#fff', 3) + r(48, 34, 4, 12, '#fff', 1, 2.5) + p('M50 26 Q46 31 50 34 Q54 31 50 26Z', '#F28C28', 2),
  flat:
    r(20, 6, 60, 88, '#C9CEDB', 3) +
    [16, 30, 44, 58].map((y) => [28, 45, 62].map((x) => r(x, y, 10, 9, SKY, 1, 2.5)).join('')).join('') + r(43, 74, 14, 20, WOOD_DARK, 1, 3) + p('M8 94 L92 94'),
  garden:
    c(80, 16, 8, '#FFD23F', 3) + p('M4 56 L96 56 M4 66 L96 66', 'none', 3) +
    [10, 24, 38, 52, 66, 80, 94].map((x) => p(`M${x - 4} 72 L${x - 4} 50 L${x} 44 L${x + 4} 50 L${x + 4} 72Z`, '#fff', 3)).join('') +
    r(20, 44, 8, 30, WOOD_DARK, 2, 3) + c(24, 32, 18, '#2E9E44') + p('M0 74 Q25 68 50 74 T100 74 L100 100 L0 100Z', GRASS) +
    flower(46, 70, '#D62828') + flower(62, 74, '#F48FB1') + flower(78, 70, '#7B3FB8'),
  house:
    r(64, 16, 10, 22, WOOD_DARK, 1, 3) + p('M10 48 L50 12 L90 48Z', '#D62828') + r(20, 46, 60, 46, WALL, 0) +
    r(43, 64, 14, 28, WOOD_DARK, 2, 3) + r(27, 56, 12, 12, SKY, 1, 3) + r(61, 56, 12, 12, SKY, 1, 3) + p('M6 92 L94 92'),
  kitchen:
    p('M30 22 Q26 16 30 10 M40 22 Q36 16 40 10', 'none', 3, '#9AA0AE') + p('M20 34 L20 26 L50 26 L50 34', '#4A4F63', 3) + r(50, 27, 24, 5, '#4A4F63', 2, 3) +
    r(16, 40, 68, 54, '#fff', 4) + r(12, 34, 76, 8, '#9AA0AE', 3, 3) + r(26, 58, 48, 28, '#4A4F63', 4, 3) + r(32, 64, 36, 16, '#F28C28', 2, 2.5) +
    dot(28, 49, 3) + dot(40, 49, 3) + dot(60, 49, 3) + dot(72, 49, 3),
  'living room':
    r(36, 8, 28, 20, WOOD, 2, 3) + r(40, 12, 20, 12, SKY, 0, 2) + p('M40 24 L46 16 L52 24 M48 24 L54 18 L60 24', '#2E9E44', 2) +
    r(18, 84, 5, 8, INK, 1, 2) + r(77, 84, 5, 8, INK, 1, 2) + r(14, 40, 72, 30, '#2E9E44', 9) + r(10, 62, 80, 22, '#3BB55A', 6) +
    r(4, 52, 16, 34, '#2E9E44', 7) + r(80, 52, 16, 34, '#2E9E44', 7) + p('M50 62 L50 84', 'none', 3),
};

/* Corps : la partie demandée en couleur (halo jaune), le reste en gris pâle. */
type Part = 'arms' | 'ears' | 'eyes' | 'head' | 'hair' | 'hands' | 'legs' | 'mouth' | 'nose';
const tone = (on: boolean, fill: string): [string, string] => (on ? [fill, INK] : ['#F3F4F8', PALE_LINE]);

function face(part: Part): string {
  const all = part === 'head', is = (q: Part) => all || part === q;
  const [hf, hs] = tone(is('hair'), '#6B3E1F'), [ef, es] = tone(is('ears'), SKIN);
  const [yf, ys] = tone(is('eyes'), '#fff'), [nf, ns] = tone(is('nose'), '#EDB596'), [mf, ms] = tone(is('mouth'), '#D62828');
  const halo = part === 'eyes' ? e(50, 50, 28, 12, HALO, 0, HALO) : part === 'nose' ? c(50, 61, 12, HALO, 0, HALO) : part === 'mouth' ? e(50, 79, 19, 10, HALO, 0, HALO) : '';
  const earHalo = part === 'ears' ? c(14, 56, 13, HALO, 0, HALO) + c(86, 56, 13, HALO, 0, HALO) : '';
  return earHalo + e(16, 56, 7, 10, ef, 4, es) + e(84, 56, 7, 10, ef, 4, es) + c(50, 56, 34, part === 'head' ? SKIN : '#F3F4F8', 4, all ? INK : PALE_LINE) + halo +
    p('M16 54 Q12 14 50 14 Q88 14 84 54 Q78 32 50 32 Q22 32 16 54Z', hf, 4, hs) +
    e(38, 50, 6, 7, yf, 3, ys) + e(62, 50, 6, 7, yf, 3, ys) + dot(39, 51, 3, is('eyes') ? '#2F6FE4' : PALE_LINE) + dot(63, 51, 3, is('eyes') ? '#2F6FE4' : PALE_LINE) +
    p('M50 54 Q43 68 50 68 Q55 68 55 64', nf, 3, ns) + p('M37 76 Q50 90 63 76 Q50 81 37 76Z', mf, 3, ms);
}

function figure(part: Part): string {
  const [af, as] = tone(part === 'arms', SKIN), [hf, hs] = tone(part === 'hands', SKIN), [lf, ls] = tone(part === 'legs', SKIN);
  const arm = (pts: [number, number][]) => p('M' + pts.map(([x, y]) => `${x} ${y}`).join(' L'), 'none', 12, as) + p('M' + pts.map(([x, y]) => `${x} ${y}`).join(' L'), 'none', 7, af);
  const leg = (pts: [number, number][]) => p('M' + pts.map(([x, y]) => `${x} ${y}`).join(' L'), 'none', 14, ls) + p('M' + pts.map(([x, y]) => `${x} ${y}`).join(' L'), 'none', 9, lf);
  const glow = (d: string) => p(d, 'none', 24, HALO);
  const halo = part === 'hands' ? c(18, 70, 12, HALO, 0, HALO) + c(82, 70, 12, HALO, 0, HALO)
    : part === 'arms' ? glow('M38 34 L26 50 L19 66') + glow('M62 34 L74 50 L81 66')
    : part === 'legs' ? glow('M43 62 L42 92') + glow('M57 62 L58 92') : '';
  return halo + leg([[43, 62], [42, 92]]) + leg([[57, 62], [58, 92]]) + arm([[38, 34], [26, 50], [19, 66]]) + arm([[62, 34], [74, 50], [81, 66]]) +
    c(18, 70, 6.5, hf, 3.5, hs) + c(82, 70, 6.5, hf, 3.5, hs) + r(35, 28, 30, 36, '#F3F4F8', 9, 4, PALE_LINE) + c(50, 16, 11, '#F3F4F8', 4, PALE_LINE);
}

export const BODY: Record<string, string> = Object.fromEntries(
  (['arms', 'ears', 'eyes', 'head', 'hair', 'hands', 'legs', 'mouth', 'nose'] as const).map((k) => [k, k === 'arms' || k === 'hands' || k === 'legs' ? figure(k) : face(k)]),
);

export const FOOD: Record<string, string> = {
  apple:
    p('M50 30 Q30 16 17 36 Q6 62 30 84 Q40 92 50 86 Q60 92 70 84 Q94 62 83 36 Q70 16 50 30Z', '#D62828') + p('M50 30 Q50 18 56 10', 'none', 4) +
    p('M54 20 Q66 8 78 16 Q66 26 54 20Z', '#2E9E44', 3) + p('M28 44 Q30 36 36 34', 'none', 4, '#fff'),
  banana:
    p('M16 26 Q18 76 76 82 Q90 82 90 74 Q44 72 28 26 Q24 18 16 26Z', '#FFD23F') + p('M28 30 Q36 62 76 74', 'none', 2.5, '#E0A800') + p('M16 26 L14 20 L20 18 L24 22', '#8B5A2B', 3),
  bread:
    p('M10 58 Q10 30 50 30 Q90 30 90 58 L88 80 Q88 86 82 86 L18 86 Q12 86 12 80Z', '#E3A857') + p('M30 42 Q36 50 32 60 M48 40 Q54 48 50 58 M66 42 Q72 50 68 60', 'none', 3, '#B5793F'),
  cheese:
    p('M8 46 L76 22 L92 46Z', '#FFE28A') + r(8, 46, 84, 34, '#FFD23F', 2) +
    e(28, 60, 6, 5, '#F2B92B', 2.5) + e(50, 70, 5, 4, '#F2B92B', 2.5) + e(72, 58, 7, 5, '#F2B92B', 2.5) + e(56, 38, 5, 3, '#F2D46B', 2.5),
  chicken:
    p('M54 56 L28 80', 'none', 15) + c(22, 78, 7, '#fff') + c(28, 88, 7, '#fff') + p('M54 56 L26 82', 'none', 10, '#fff') +
    p('M44 52 Q28 32 42 16 Q60 2 80 16 Q96 32 84 52 Q72 66 54 60Z', '#D98A3D') + p('M58 22 Q66 18 74 22', 'none', 3, '#F2C08A'),
  egg: e(50, 44, 22, 28, '#FFF4E0') + p('M26 60 Q26 84 50 84 Q74 84 74 60Z', '#2F6FE4') + r(38, 84, 24, 7, '#2F6FE4', 3, 3),
  juice:
    limb([[56, 40], [72, 6]], '#D62828', 4) + p('M28 20 L72 20 L66 90 L34 90Z', '#fff') + p('M29.5 38 L70.5 38 L66 90 L34 90Z', '#F7A23B', 3) + p('M28 20 L72 20 L66 90 L34 90Z'),
  milk:
    p('M62 34 L80 24 L80 84 L62 94Z', '#C9CEDB') + p('M22 34 L40 14 L80 24 L62 34Z', '#E6E9F0') + r(22, 34, 40, 60, '#fff', 0) + r(22, 54, 40, 20, '#2F6FE4', 0, 3) +
    p('M42 57 Q36 65 42 70 Q48 65 42 57Z', '#fff', 2),
  orange: c(50, 56, 34, '#F28C28') + dot(38, 50, 1.6, '#C96A12') + dot(60, 66, 1.6, '#C96A12') + dot(56, 44, 1.6, '#C96A12') + dot(40, 70, 1.6, '#C96A12') +
    p('M50 22 Q60 8 74 12 Q66 24 50 22Z', '#2E9E44', 3) + dot(50, 22, 3),
  water:
    r(40, 8, 20, 12, '#2F6FE4', 3) + p('M38 20 L62 20 L62 30 Q74 36 74 48 L74 88 Q74 94 68 94 L32 94 Q26 94 26 88 L26 48 Q26 36 38 30Z', SKY) +
    r(26, 54, 48, 20, '#2F6FE4', 0, 3) + p('M32 64 Q38 58 44 64 T56 64 T68 64', 'none', 3, '#fff'),
};

/* Actions : un enfant dans la pose du verbe (voir kid). */
export const ACTIONS: Record<string, string> = {
  climb:
    r(64, 0, 36, 100, '#C9CEDB', 0, 4) + c(70, 14, 4, '#D62828', 2.5) + c(74, 40, 4, '#2E9E44', 2.5) + c(70, 72, 4, '#FFD23F', 2.5) + c(84, 56, 4, '#2F6FE4', 2.5) + c(86, 24, 4, '#F28C28', 2.5) +
    kid({ head: [44, 28], neck: [47, 40], hip: [45, 64], arms: [[[47, 42], [56, 30], [67, 15]], [[47, 42], [60, 46], [71, 40]]], legs: [[[45, 64], [58, 72], [68, 72]], [[45, 64], [44, 80], [52, 92]]] }),
  dance:
    NOTE(82, 22) + NOTE(10, 54) +
    kid({ head: [50, 18], neck: [50, 30], hip: [52, 56], arms: [[[50, 32], [36, 28], [28, 14]], [[50, 32], [66, 40], [78, 32]]], legs: [[[52, 56], [46, 72], [44, 90]], [[52, 56], [68, 64], [64, 80]]] }),
  draw:
    turn(-6, r(10, 14, 64, 76, '#fff', 3)) + p('M22 70 L22 52 L36 40 L50 52 L50 70Z', 'none', 3, '#2F6FE4') + c(56, 30, 7, 'none', 3, '#F28C28') + p('M18 76 L64 72', 'none', 3, '#2E9E44') +
    place(30, 30, 0.7, turn(-40,
      r(24, 40, 54, 20, '#FFD23F', 2) + r(76, 40, 9, 20, '#B0B6C3', 1) + r(84, 40, 10, 20, '#F48FB1', 4) + p('M24 40 L6 50 L24 60Z', '#F2C79A') + p('M12 46.7 L6 50 L12 53.3Z', INK, 3))),
  jump:
    e(50, 94, 20, 4, '#C9CEDB', 0, '#C9CEDB') + p('M36 82 L32 88 M50 84 L50 90 M64 82 L68 88', 'none', 3) +
    kid({ head: [50, 14], neck: [50, 26], hip: [50, 50], arms: [[[50, 28], [36, 22], [28, 8]], [[50, 28], [64, 22], [72, 8]]], legs: [[[50, 50], [38, 62], [44, 74]], [[50, 50], [62, 62], [56, 74]]] }),
  paint:
    limb([[30, 50], [16, 96]], WOOD_DARK, 4) + limb([[70, 50], [84, 96]], WOOD_DARK, 4) + limb([[50, 50], [50, 92]], WOOD_DARK, 4) +
    r(18, 8, 64, 56, '#fff', 2) + p('M28 46 Q30 22 46 28 Q60 34 54 50Z', '#2F6FE4', 3) + c(64, 24, 7, '#FFD23F', 3) + p('M30 54 L72 54', 'none', 4, '#2E9E44') +
    turn(30, r(64, 60, 34, 6, WOOD, 3, 3) + p('M64 60 L56 63 L64 66Z', '#D62828', 3), 80, 63),
  'play football':
    c(80, 82, 11, '#fff') + p('M80 76 L85 80 L83 86 L77 86 L75 80Z', INK, 0) +
    kid({ head: [40, 16], neck: [40, 28], hip: [40, 54], arms: [[[40, 30], [28, 38], [18, 34]], [[40, 30], [52, 36], [60, 30]]], legs: [[[40, 54], [36, 72], [34, 90]], [[40, 54], [54, 64], [66, 74]]] }),
  'ride a bike':
    c(22, 74, 16, '#fff', 5) + c(78, 74, 16, '#fff', 5) + limb([[22, 74], [46, 74], [38, 52], [22, 74]], '#2E9E44', 4) + limb([[38, 52], [68, 52], [46, 74]], '#2E9E44', 4) + limb([[66, 42], [78, 74]], '#2E9E44', 4) +
    kid({ head: [52, 14], neck: [48, 26], hip: [38, 46], arms: [[[48, 28], [58, 36], [67, 40]], [[48, 28], [58, 36], [67, 40]]], legs: [[[38, 46], [52, 56], [46, 74]], [[38, 46], [52, 56], [46, 74]]] }),
  run:
    p('M6 30 L20 30 M2 42 L16 42 M8 54 L18 54', 'none', 3) +
    kid({ head: [54, 16], neck: [51, 28], hip: [46, 54], arms: [[[51, 30], [38, 38], [30, 48]], [[51, 30], [62, 38], [70, 28]]], legs: [[[46, 54], [36, 68], [22, 76]], [[46, 54], [62, 66], [58, 86]]] }),
  sing:
    NOTE(78, 26) + NOTE(86, 56) + limb([[44, 52], [44, 98]], '#D62828', 26) + limb([[54, 62], [70, 72], [62, 56]], SKIN, 7) +
    r(55, 46, 8, 16, '#4A4F63', 3, 3) + c(59, 44, 6.5, '#9AA0AE', 3) +
    c(40, 32, 18, SKIN) + p('M22 30 Q22 12 40 12 Q58 12 58 30 Q40 22 22 30Z', '#6B3E1F', 3) + dot(34, 32, 2) + dot(46, 32, 2) + e(40, 42, 4.5, 5, '#D62828', 2.5),
  swim:
    c(40, 50, 10, SKIN) + p('M30 49 Q30 38 40 38 Q50 38 50 49 Q40 44 30 49Z', '#6B3E1F', 3) + dot(37, 51, 1.6) + dot(44, 51, 1.6) +
    limb([[52, 60], [64, 40], [80, 46]], SKIN, 7) +
    p('M0 58 Q12 50 25 58 T50 58 T75 58 T100 58 L100 100 L0 100Z', '#5FB0F0') + p('M10 76 Q20 70 30 76 M56 84 Q66 78 76 84', 'none', 3, '#fff') + c(20, 46, 3, '#fff', 2) + c(14, 38, 2, '#fff', 2),
};

/** Crinière de lion : couronne de festons autour du centre. */
function mane(cx: number, cy: number, r1: number, r2: number, n: number): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 0.5) / n) * 2 * Math.PI, a2 = ((i + 1) / n) * 2 * Math.PI;
    const pt = (a: number, rr: number) => `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    d += (i ? ' ' : 'M' + pt(a0, r1)) + ` Q${pt(a1, r2)} ${pt(a2, r1)}`;
  }
  return p(d + 'Z', '#B5651D');
}

export const ANIMALS: Record<string, string> = {
  bird:
    limb([[44, 74], [42, 90]], '#F28C28', 2) + limb([[56, 74], [58, 90]], '#F28C28', 2) + p('M26 52 L6 42 L10 64Z', '#1E3E8C') + e(46, 58, 26, 20, '#2F6FE4') +
    c(70, 40, 14, '#2F6FE4') + p('M82 37 L95 42 L82 47Z', '#F28C28', 3) + dot(73, 37, 2.6) + p('M28 54 Q46 40 58 56 Q44 68 28 54Z', '#1E3E8C', 3),
  crocodile:
    r(24, 64, 9, 18, '#2E9E44', 3) + r(52, 64, 9, 18, '#2E9E44', 3) + p('M28 50 L32 42 L36 50 L40 42 L44 50 L48 42 L52 50', '#1F7A35', 3) +
    p('M4 50 Q16 62 26 56', 'none', 10) + p('M4 50 Q16 62 26 56', 'none', 5, '#2E9E44') +
    e(40, 60, 30, 13, '#2E9E44') + r(58, 50, 38, 13, '#2E9E44', 6) + p('M64 63 L67 68 L70 63 L73 68 L76 63 L79 68 L82 63 L85 68 L88 63', '#fff', 2.5) +
    c(66, 46, 6, '#2E9E44', 3) + dot(67, 45, 2.2) + dot(91, 54, 1.5),
  elephant:
    r(24, 62, 13, 28, '#9AA0AE', 3) + r(52, 62, 13, 28, '#9AA0AE', 3) + p('M17 52 Q8 62 12 70', 'none', 3) + e(44, 56, 30, 22, '#9AA0AE') +
    p('M84 50 Q96 70 88 88 Q84 92 80 86 Q88 70 78 56Z', '#9AA0AE') + c(74, 42, 18, '#9AA0AE') + e(64, 46, 12, 16, '#C9CEDB', 3) + dot(80, 38, 2.6) + p('M78 56 Q74 64 66 64', '#fff', 3),
  giraffe:
    [22, 32, 46, 56].map((x) => r(x, 68, 6, 26, '#F2B92B', 2, 3)).join('') + p('M16 60 L8 72', 'none', 3) + e(40, 62, 26, 14, '#F2B92B') +
    p('M52 56 L66 16 L78 18 L66 62Z', '#F2B92B') + p('M70 8 L68 2 M78 9 L80 3', 'none', 3) + dot(68, 2, 2.5) + dot(80, 3, 2.5) + e(76, 14, 13, 8, '#F2B92B') + dot(80, 12, 2.2) +
    [[30, 58], [44, 64], [52, 56], [36, 68], [62, 36], [66, 26], [60, 48]].map(([x, y]) => e(x!, y!, 3.5, 3, '#B5651D', 0, '#B5651D')).join(''),
  lion:
    mane(50, 50, 34, 46, 14) + c(34, 30, 7, '#F2B92B', 3) + c(66, 30, 7, '#F2B92B', 3) + c(50, 52, 26, '#F2B92B') + e(50, 64, 11, 8, '#FFE3B0', 3) +
    p('M45 57 L55 57 L50 63Z', INK, 2) + dot(41, 46, 3) + dot(59, 46, 3) + p('M44 68 Q50 72 56 68', 'none', 2.5),
  monkey:
    p('M70 88 Q92 86 88 66 Q86 56 78 60', 'none', 10) + p('M70 88 Q92 86 88 66 Q86 56 78 60', 'none', 5, '#8B5A2B') + e(50, 84, 18, 14, '#8B5A2B') +
    c(22, 44, 10, '#E8C39E') + c(78, 44, 10, '#E8C39E') + c(50, 44, 28, '#8B5A2B') + e(50, 52, 19, 16, '#E8C39E', 3) + e(42, 38, 9, 9, '#E8C39E', 0, '#E8C39E') + e(58, 38, 9, 9, '#E8C39E', 0, '#E8C39E') +
    dot(43, 40, 3) + dot(57, 40, 3) + dot(47, 51, 1.4) + dot(53, 51, 1.4) + p('M42 58 Q50 64 58 58', 'none', 2.5),
  snake:
    p('M18 88 Q6 72 28 68 L64 64 Q88 60 80 42 Q74 30 52 34 Q36 36 40 22', 'none', 18) + p('M18 88 Q6 72 28 68 L64 64 Q88 60 80 42 Q74 30 52 34 Q36 36 40 22', 'none', 12, '#2E9E44') +
    dot(30, 68, 2.5, '#FFD23F') + dot(48, 66, 2.5, '#FFD23F') + dot(66, 63, 2.5, '#FFD23F') + dot(80, 48, 2.5, '#FFD23F') + dot(62, 34, 2.5, '#FFD23F') +
    p('M30 16 L20 14 M30 16 L22 20', 'none', 2.5, '#D62828') + e(40, 18, 12, 9, '#2E9E44') + dot(40, 15, 2.2) + dot(46, 15, 2.2),
  spider:
    p('M50 0 L50 26', 'none', 2) +
    [-1, 1].map((sd) => [[-10, -16], [0, -8], [10, 0], [20, 8]].map(([dy, ky]) =>
      p(`M${50 + sd * 10} ${58 + dy! / 2} L${50 + sd * 30} ${48 + ky!} L${50 + sd * 42} ${70 + ky! + dy! / 3}`, 'none', 4)).join('')).join('') +
    c(50, 60, 18, '#4A4F63') + c(50, 36, 11, '#4A4F63') + c(46, 35, 3.5, '#fff', 2) + c(54, 35, 3.5, '#fff', 2) + dot(46, 36, 1.5) + dot(54, 36, 1.5),
  zebra:
    [20, 30, 50, 60].map((x) => r(x, 64, 7, 28, '#fff', 2, 3) + p(`M${x} 74 L${x + 7} 74 M${x} 82 L${x + 7} 82`, 'none', 3)).join('') + p('M14 52 L6 66', 'none', 3) +
    e(40, 56, 28, 16, '#fff') + p('M28 41 Q32 56 26 70 M40 40 Q44 56 38 72 M52 42 Q54 54 50 70', 'none', 4) +
    p('M56 50 L68 16 L80 22 L72 58Z', '#fff') + p('M62 30 L74 34 M60 40 L72 44', 'none', 4) + p('M58 46 L66 14 L62 12', 'none', 5) +
    p('M70 12 L70 3 L77 10', '#fff', 3) + turn(35, e(82, 24, 16, 9, '#fff'), 82, 24) + p('M80 18 L76 26', 'none', 3) + dot(80, 17, 2.4) + dot(91, 32, 1.6),
};
