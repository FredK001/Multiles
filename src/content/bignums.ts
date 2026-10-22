/* Grands nombres (CM1). Une île = une compétence du programme :
   - Lire les nombres : un nombre en lettres → son écriture en chiffres, et l'inverse, jusqu'au million et un peu au-delà.
   - Valeur des chiffres : chiffre des milliers, nombre de centaines, décompositions, comparer et ranger.
   - Calcul mental : × 10, × 100, × 1 000, ÷ 10, compléments à la dizaine, à la centaine, au millier.
   - Division avec reste : 47 ÷ 5 → 9 reste 2.
   Les nombres en lettres suivent l'orthographe rectifiée, référence de l'école (traits d'union partout :
   « quatre-mille-cinq-cent-trente-deux » ; « million » est un nom, sans trait d'union).
   Une question = { île, rang } comme les fractions ; les listes sont rangées des plus simples aux plus difficiles. */
import { fmtNum, thinAll, type WrittenItem } from './written';

export type BigId = 'lire' | 'chiffre' | 'calc' | 'reste';

export interface BigSet {
  id: BigId;
  title: string;
  items: readonly WrittenItem[];
}

const UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

/** 0 à 19. */
const below20 = (n: number): string => (n < 17 ? UNITS[n]! : `dix-${UNITS[n - 10]}`);

/** 0 à 99 ; `last` : rien ne suit (« quatre-vingts », mais « quatre-vingt-mille »). */
function below100(n: number, last: boolean): string {
  if (n < 20) return below20(n);
  const t = Math.floor(n / 10), u = n % 10;
  if (t <= 6) return u === 0 ? TENS[t]! : u === 1 ? `${TENS[t]}-et-un` : `${TENS[t]}-${UNITS[u]}`;
  if (t === 7) return u === 1 ? 'soixante-et-onze' : `soixante-${below20(10 + u)}`;
  if (t === 8) return u === 0 ? (last ? 'quatre-vingts' : 'quatre-vingt') : `quatre-vingt-${UNITS[u]}`;
  return `quatre-vingt-${below20(10 + u)}`;
}

/** 0 à 999 ; « deux-cents », mais « deux-cent-mille » et « deux-cent-trois ». */
function below1000(n: number, last: boolean): string {
  const h = Math.floor(n / 100), r = n % 100;
  if (h === 0) return below100(r, last);
  const head = h === 1 ? 'cent' : `${UNITS[h]}-cent`;
  return r === 0 ? head + (h > 1 && last ? 's' : '') : `${head}-${below100(r, last)}`;
}

/** Un nombre entier en lettres (orthographe rectifiée) : 4532 → « quatre-mille-cinq-cent-trente-deux ». */
export function toWords(n: number): string {
  if (n === 0) return 'zéro';
  const mi = Math.floor(n / 1e6), th = Math.floor(n / 1000) % 1000, rest = n % 1000;
  const low = [th ? (th === 1 ? 'mille' : `${below1000(th, false)}-mille`) : '', rest ? below1000(rest, true) : ''].filter(Boolean).join('-');
  // Million est un nom : « deux millions », « deux-cents millions », séparé du reste par une espace.
  const high = mi ? (mi === 1 ? 'un million' : `${below1000(mi, true)} millions`) : '';
  return [high, low].filter(Boolean).join(' ');
}

/** Valeur de chaque rang, du plus petit au plus grand. */
const PLACES = ['unités', 'dizaines', 'centaines', 'milliers', 'dizaines de mille', 'centaines de mille', 'millions'];
/** Chiffre du rang k (0 = unités). */
const digitAt = (n: number, k: number): number => Math.floor(n / 10 ** k) % 10;

/* ---- Lire et écrire ---- */

/** Les classes d'un nombre, de gauche à droite : « 3 pour les millions, 040 pour les mille, 000 pour les unités ». */
function classesOf(n: number): string {
  const parts = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').split(' '), names = ['unités', 'mille', 'millions'];
  return parts.map((p, i) => `${p} pour les ${names[parts.length - 1 - i]}`).join(', ');
}

/** En lettres → en chiffres. Intrus : un zéro oublié ou ajouté, une classe mal placée. */
const toDigits = (n: number, x1: number, x2: number): WrittenItem => ({
  q: `« ${toWords(n)} » s'écrit…`,
  a: fmtNum(n),
  x: [fmtNum(x1), fmtNum(x2)],
  tip: `${classesOf(n)} : ${fmtNum(n)}. Chaque classe a trois chiffres ; une place vide s'écrit 0.`,
});

/** En chiffres → en lettres. */
const toLetters = (n: number, x1: number, x2: number): WrittenItem => ({
  q: `${fmtNum(n)} s'écrit…`,
  a: toWords(n),
  x: [toWords(x1), toWords(x2)],
  tip: `On lit chaque classe en partant de la gauche, puis son nom : ${fmtNum(n)}, c'est « ${toWords(n)} ».`,
});

const LIRE: WrittenItem[] = [
  toDigits(4532, 40532, 4352), toDigits(3050, 3500, 30050), toDigits(7208, 728, 70208), toDigits(12400, 120400, 12040),
  toDigits(40015, 4015, 400015), toDigits(65090, 65900, 6590), toDigits(80300, 8300, 80003), toDigits(99009, 99900, 9909),
  toLetters(2080, 2800, 20080), toLetters(15600, 15060, 50600), toLetters(70400, 7400, 70040),
  // Au-delà de 100 000, jusqu'au million et un peu plus.
  toDigits(105000, 15000, 100005), toDigits(230450, 23450, 230045), toDigits(700070, 70070, 700700), toDigits(508300, 58300, 500830),
  toDigits(1000000, 100000, 10000000), toDigits(1200000, 120000, 1020000), toDigits(2500000, 250000, 2050000), toDigits(3040000, 3400000, 304000),
  toLetters(300900, 309000, 300090), toLetters(1500000, 1050000, 150000),
];

/* ---- Valeur des chiffres, comparer, ranger ---- */

/** « Dans 47 382, le chiffre des milliers est… » : intrus = les chiffres voisins (tous différents). */
function digitOf(n: number, k: number): WrittenItem {
  const len = String(n).length, d = digitAt(n, k);
  const near = k + 1 < len ? [digitAt(n, k + 1), digitAt(n, k - 1 >= 0 ? k - 1 : k + 2)] : [digitAt(n, k - 1), digitAt(n, k - 2)];
  return {
    q: `Dans ${fmtNum(n)}, le chiffre des ${PLACES[k]} est…`,
    a: String(d),
    x: [String(near[0]), String(near[1])],
    tip: `Depuis la droite : unités, dizaines, centaines, puis milliers, dizaines de mille, centaines de mille. Dans ${fmtNum(n)}, le chiffre des ${PLACES[k]} est ${d}.`,
  };
}

/** « Dans 4 532, le nombre de centaines est… » 45 : on garde tout ce qui est à gauche du rang. Intrus : le seul chiffre, ou un chiffre de trop. */
function countOf(n: number, k: number): WrittenItem {
  const a = Math.floor(n / 10 ** k);
  return {
    q: `Dans ${fmtNum(n)}, le nombre de ${PLACES[k]} est…`,
    a: fmtNum(a),
    x: [String(digitAt(n, k)), fmtNum(Math.floor(n / 10 ** (k - 1)))],
    tip: `Le nombre de ${PLACES[k]}, c'est tout ce qu'on lit jusqu'au chiffre des ${PLACES[k]} : dans ${fmtNum(n)}, il y a ${fmtNum(a)} ${PLACES[k]}.`,
  };
}

/** Décomposition donnée en mots ou en somme : le nombre à retrouver. */
const compose = (q: string, n: number, x1: number, x2: number, tip: string): WrittenItem => ({ q, a: fmtNum(n), x: [fmtNum(x1), fmtNum(x2)], tip });

/** Le plus grand (ou le plus petit) de trois nombres. */
function extreme(big: boolean, nums: readonly [number, number, number]): WrittenItem {
  const s = [...nums].sort((p, q) => (big ? q - p : p - q)), a = s[0]!, b = s[1]!;
  const longer = String(a).length !== String(b).length;
  return {
    q: `Quel est le plus ${big ? 'grand' : 'petit'} nombre ?`,
    a: fmtNum(a),
    x: [fmtNum(s[1]!), fmtNum(s[2]!)],
    tip: longer
      ? `On compte d'abord les chiffres : le nombre qui en a le ${big ? 'plus' : 'moins'} est le plus ${big ? 'grand' : 'petit'}. C'est ${fmtNum(a)}.`
      : `Même nombre de chiffres : on compare chiffre à chiffre en partant de la gauche. Le plus ${big ? 'grand' : 'petit'} est ${fmtNum(a)}.`,
  };
}

/** Ranger trois nombres du plus petit au plus grand ; intrus : deux nombres inversés, ou l'ordre décroissant. */
function order(nums: readonly [number, number, number]): WrittenItem {
  const [p, q, r] = [...nums].sort((u, v) => u - v).map(fmtNum) as [string, string, string];
  return { q: 'Du plus petit au plus grand :', a: `${p} < ${q} < ${r}`, x: [`${q} < ${p} < ${r}`, `${r} < ${q} < ${p}`], tip: `On compare chiffre à chiffre depuis la gauche : ${p} < ${q} < ${r}.` };
}

const CHIFFRE: WrittenItem[] = [
  digitOf(47382, 3), digitOf(25914, 2), countOf(4532, 2), countOf(7290, 1),
  compose('3 milliers et 5 dizaines, c\'est…', 3050, 3500, 350, '3 milliers, c\'est 3 000 ; 5 dizaines, c\'est 50. 3 000 + 50 = 3 050 : 0 centaine.'),
  compose('60 000 + 400 + 7 = ?', 60407, 6047, 60470, 'Chaque chiffre à sa place : 6 dizaines de mille, 0 millier, 4 centaines, 0 dizaine, 7 unités → 60 407.'),
  extreme(true, [102345, 98765, 99999]), extreme(true, [45300, 45030, 45003]), extreme(false, [87645, 87654, 88465]),
  order([12405, 12450, 14205]),
  // Plus grands nombres.
  digitOf(83601, 4), digitOf(506247, 4), digitOf(319852, 5), digitOf(1274093, 3),
  countOf(38615, 3), countOf(152300, 3), countOf(60480, 2),
  compose('4 dizaines de mille et 3 centaines, c\'est…', 40300, 4300, 403000, '4 dizaines de mille, c\'est 40 000 ; 3 centaines, c\'est 300. 40 000 + 300 = 40 300.'),
  compose('7 millions et 5 centaines de mille, c\'est…', 7500000, 7050000, 750000, '7 millions, c\'est 7 000 000 ; 5 centaines de mille, c\'est 500 000. En tout : 7 500 000.'),
  compose('500 000 + 30 000 + 8 = ?', 530008, 530080, 53008, '5 centaines de mille, 3 dizaines de mille, et 8 unités : 530 008. Les places vides s\'écrivent 0.'),
  extreme(true, [700001, 699999, 70100]), extreme(true, [1000000, 999999, 100000]), extreme(false, [305000, 350000, 3050000]),
  order([230500, 203500, 230050]),
];

/* ---- Calcul mental ---- */

/** n × k (k = 10, 100 ou 1 000) : intrus = un zéro de moins, un zéro de trop. */
function times(n: number, k: number): WrittenItem {
  const z = String(k).length - 1;
  return {
    q: `${fmtNum(n)} × ${fmtNum(k)} = ?`,
    a: fmtNum(n * k),
    x: [fmtNum((n * k) / 10), fmtNum(n * k * 10)],
    tip: `Multiplier par ${fmtNum(k)}, c'est rendre chaque chiffre ${fmtNum(k)} fois plus grand : on écrit ${z} zéro${z > 1 ? 's' : ''} à droite. ${fmtNum(n)} × ${fmtNum(k)} = ${fmtNum(n * k)}.`,
  };
}

/** n ÷ 10 (n se termine par 0) : intrus = multiplié au lieu de divisé, ou nombre recopié. */
function tenth(n: number): WrittenItem {
  return {
    q: `${fmtNum(n)} ÷ 10 = ?`,
    a: fmtNum(n / 10),
    x: [fmtNum(n * 10), Number.isInteger(n / 100) ? fmtNum(n / 100) : fmtNum(n)],
    tip: `Diviser par 10, c'est rendre chaque chiffre 10 fois plus petit : on enlève le zéro de droite. ${fmtNum(n)} ÷ 10 = ${fmtNum(n / 10)}.`,
  };
}

/** n + ? = cible : le complément ; les intrus sont des erreurs de retenue. */
function complement(n: number, target: number, x1: number, x2: number): WrittenItem {
  const a = target - n;
  return {
    q: `${fmtNum(n)} + ? = ${fmtNum(target)}`,
    a: fmtNum(a),
    x: [fmtNum(x1), fmtNum(x2)],
    tip: `On vérifie en ajoutant : ${fmtNum(n)} + ${fmtNum(a)} = ${fmtNum(target)}. Pense à la retenue quand les unités dépassent 10.`,
  };
}

const CALC: WrittenItem[] = [
  times(7, 10), times(25, 10), times(34, 100), times(6, 1000), tenth(450), tenth(3700),
  complement(48, 50, 12, 8), complement(75, 100, 35, 15), complement(63, 100, 47, 27), complement(125, 130, 15, 10),
  times(450, 10), times(52, 100), times(120, 100), times(18, 1000), times(305, 10), times(40, 1000),
  tenth(8000), tenth(12600), tenth(2050),
  complement(460, 500, 140, 50), complement(350, 400, 150, 60), complement(82, 100, 28, 8), complement(750, 1000, 350, 150), complement(1380, 1400, 120, 30), complement(2600, 3000, 1400, 500),
];

/* ---- Division avec reste ---- */

/** « 9 reste 2 ». */
const withRest = (q: number, r: number): string => `${q} reste ${r}`;

/** n ÷ b : la bonne réponse, un reste trop grand (quotient − 1), un quotient à ±1. */
function euclid(n: number, b: number, i: number): WrittenItem {
  const q = Math.floor(n / b), r = n % b;
  return {
    q: `${n} ÷ ${b} = ?`,
    a: withRest(q, r),
    x: [withRest(q - 1, r + b), i % 2 ? withRest(q + 1, r) : withRest(q - 1, r)],
    tip: `${b} × ${q} = ${b * q}, et ${n} − ${b * q} = ${r}. Le reste est toujours plus petit que ${b}.`,
  };
}

/** Petit problème : n objets en groupes de b. `what` = les groupes, `rest` = ce qui reste. */
function story(text: string, n: number, b: number, what: string, i: number): WrittenItem {
  const q = Math.floor(n / b), r = n % b, say = (k: number, s: number) => `${k} ${what}, reste ${s}`;
  return {
    q: text,
    a: say(q, r),
    x: [say(q - 1, r + b), i % 2 ? say(q + 1, r) : say(q - 1, r)],
    tip: `${b} × ${q} = ${b * q} et ${n} − ${b * q} = ${r} : ${q} ${what}, et il reste ${r}, moins que ${b}.`,
  };
}

const RESTE: WrittenItem[] = [
  ...([[23, 4], [47, 5], [29, 3], [38, 6], [50, 7], [35, 4], [44, 9]] as const).map(([n, b], i) => euclid(n, b, i)),
  story('38 œufs, rangés par boîtes de 6 : combien de boîtes pleines, et combien d\'œufs en trop ?', 38, 6, 'boîtes', 0),
  story('52 élèves font des équipes de 5 : combien d\'équipes, et combien d\'élèves en trop ?', 52, 5, 'équipes', 1),
  ...([[61, 8], [58, 6], [70, 8], [83, 9], [100, 7], [96, 5]] as const).map(([n, b], i) => euclid(n, b, i + 1)),
  story('45 billes partagées entre 7 enfants : combien chacun, et combien en reste-t-il ?', 45, 7, 'billes chacun', 0),
  story('75 cartes, en paquets de 10 : combien de paquets, et combien de cartes en trop ?', 75, 10, 'paquets', 1),
];

export const BIG_SETS: readonly BigSet[] = [
  { id: 'lire', title: 'Lire les nombres', items: thinAll(LIRE) },
  { id: 'chiffre', title: 'Valeur des chiffres', items: thinAll(CHIFFRE) },
  { id: 'calc', title: 'Calcul mental', items: thinAll(CALC) },
  { id: 'reste', title: 'Division avec reste', items: thinAll(RESTE) },
];

export const bigSetOf = (id: BigId): BigSet => BIG_SETS.find((s) => s.id === id)!;
