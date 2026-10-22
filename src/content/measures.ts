/* Mesures (CM1). Une île = une grandeur du programme :
   - Longueurs : km, m, cm, mm (« 3 m = ? cm »).
   - Masses et contenances : kg, g ; L, cL, mL.
   - Heures et durées : lire l'heure sur une horloge à aiguilles, 1 h = 60 min, durée entre deux heures.
   - Problèmes de mesure : l'unité qui convient (un crayon mesure 15 cm, pas 15 m), comparer, petits calculs.
   Une question = { île, rang } comme les fractions ; les listes sont rangées des plus simples aux plus difficiles. */
import { fmtHour, fmtNum, thinAll, type WrittenItem } from './written';

export type MesId = 'long' | 'masse' | 'heure' | 'pb';

export interface MesSet {
  id: MesId;
  title: string;
  items: readonly WrittenItem[];
}

/** Unités et leur valeur dans l'unité de base de leur grandeur (mm, g, mL, s). */
export const UNIT_VALUE: Record<string, number> = { km: 1e6, m: 1000, cm: 10, mm: 1, kg: 1000, g: 1, L: 1000, cL: 10, mL: 1, h: 3600, min: 60, s: 1 };

/** Ce qu'on retient pour passer d'une unité à l'autre. */
const RULE: Record<string, string> = {
  'km-m': '1 km = 1 000 m', 'm-cm': '1 m = 100 cm', 'cm-mm': '1 cm = 10 mm', 'm-mm': '1 m = 1 000 mm',
  'kg-g': '1 kg = 1 000 g', 'L-cL': '1 L = 100 cL', 'L-mL': '1 L = 1 000 mL', 'cL-mL': '1 cL = 10 mL',
};
const ruleOf = (u: string, v: string): string => RULE[`${u}-${v}`] ?? RULE[`${v}-${u}`]!;

/** « 3 m = ? cm » : la bonne réponse, et le même nombre avec un zéro de trop ou de moins. */
function conv(v: number, from: string, to: string): WrittenItem {
  const r = (v * UNIT_VALUE[from]!) / UNIT_VALUE[to]!;
  const lo = Number.isInteger(r / 10) ? r / 10 : r * 100;
  return {
    q: `${fmtNum(v)} ${from} = ? ${to}`,
    a: `${fmtNum(r)} ${to}`,
    x: [`${fmtNum(r * 10)} ${to}`, `${fmtNum(lo)} ${to}`],
    tip: `${ruleOf(from, to)}. Donc ${fmtNum(v)} ${from} = ${fmtNum(r)} ${to}.`,
  };
}

/** Mesure en deux unités (« 2 m 35 cm = ? cm ») ; intrus écrits à la main. */
const mixed = (q: string, a: string, x1: string, x2: string, tip: string): WrittenItem => ({ q, a, x: [x1, x2], tip });

const LONG: WrittenItem[] = [
  conv(3, 'm', 'cm'), conv(5, 'cm', 'mm'), conv(2, 'km', 'm'), conv(400, 'cm', 'm'), conv(70, 'mm', 'cm'), conv(12, 'm', 'cm'),
  conv(9, 'km', 'm'), conv(25, 'cm', 'mm'), conv(4, 'm', 'mm'), conv(6000, 'm', 'km'), conv(3000, 'mm', 'm'),
  mixed('2 m 35 cm = ? cm', '235 cm', '2 035 cm', '2 350 cm', '2 m = 200 cm, et 200 cm + 35 cm = 235 cm.'),
  mixed('1 km 500 m = ? m', '1 500 m', '1 050 m', '150 m', '1 km = 1 000 m, et 1 000 m + 500 m = 1 500 m.'),
  mixed('3 cm 4 mm = ? mm', '34 mm', '304 mm', '7 mm', '3 cm = 30 mm, et 30 mm + 4 mm = 34 mm.'),
];

const MASSE: WrittenItem[] = [
  conv(3, 'kg', 'g'), conv(2, 'L', 'cL'), conv(7, 'cL', 'mL'), conv(5000, 'g', 'kg'), conv(4, 'L', 'mL'),
  mixed('La moitié de 1 kg = ? g', '500 g', '50 g', '5 000 g', '1 kg = 1 000 g ; la moitié de 1 000 g, c\'est 500 g.'),
  conv(300, 'cL', 'L'), conv(80, 'mL', 'cL'), conv(10, 'kg', 'g'), conv(2000, 'mL', 'L'),
  mixed('1 kg 200 g = ? g', '1 200 g', '1 020 g', '120 g', '1 kg = 1 000 g, et 1 000 g + 200 g = 1 200 g.'),
  mixed('Un demi-litre = ? cL', '50 cL', '5 cL', '500 cL', '1 L = 100 cL ; la moitié de 100 cL, c\'est 50 cL.'),
];

/* ---- Heures et durées ---- */

/** Heure d'une horloge à aiguilles ; intrus : aiguilles inversées, ou l'heure d'après (petite aiguille presque sur la suivante). */
function readClock(h: number, m: number): WrittenItem {
  const swapped = fmtHour(m === 0 ? 12 : m / 5, (h % 12) * 5);
  const next = m >= 30 ? fmtHour((h % 12) + 1, m) : fmtHour(h === 1 ? 12 : h - 1, m);
  return {
    q: 'Quelle heure indique l\'horloge ?',
    a: fmtHour(h, m),
    x: [swapped, next],
    tip: m === 0
      ? `La grande aiguille est sur le 12 : c'est l'heure pile. La petite aiguille montre ${h} : ${fmtHour(h, 0)}.`
      : `La petite aiguille montre les heures : elle a passé le ${h}. La grande montre les minutes, de 5 en 5 : ${m} minutes. Il est ${fmtHour(h, m)}.`,
    clock: { h, m },
  };
}

/** Durée, ou heure d'arrivée : la bonne réponse et deux erreurs classiques (compter 100 minutes dans une heure…). */
const timeQ = (q: string, a: string, x1: string, x2: string, tip: string): WrittenItem => ({ q, a, x: [x1, x2], tip });

const HEURE: WrittenItem[] = [
  readClock(3, 0), readClock(10, 30), readClock(2, 15), readClock(7, 45),
  timeQ('1 h = ? min', '60 min', '100 min', '10 min', 'Une heure, c\'est 60 minutes : la grande aiguille fait un tour complet.'),
  timeQ('2 h = ? min', '120 min', '200 min', '60 min', '1 h = 60 min, donc 2 h = 60 + 60 = 120 min.'),
  timeQ('1 min = ? s', '60 s', '100 s', '10 s', 'Une minute, c\'est 60 secondes.'),
  readClock(8, 50), readClock(11, 5),
  timeQ('De 8 h à 10 h 30, il s\'écoule…', '2 h 30 min', '3 h 30 min', '2 h', 'De 8 h à 10 h : 2 h. De 10 h à 10 h 30 : 30 min. En tout : 2 h 30 min.'),
  readClock(6, 20), readClock(1, 40), readClock(4, 35),
  timeQ('1 h 15 min = ? min', '75 min', '115 min', '65 min', '1 h = 60 min, et 60 min + 15 min = 75 min.'),
  timeQ('90 min, c\'est…', '1 h 30 min', '9 h', '1 h 50 min', '90 min = 60 min + 30 min, donc 1 h 30 min.'),
  timeQ('De 9 h 45 à 11 h 10, il s\'écoule…', '1 h 25 min', '1 h 65 min', '2 h 25 min', 'De 9 h 45 à 10 h : 15 min. De 10 h à 11 h 10 : 1 h 10 min. En tout : 1 h 25 min.'),
  timeQ('De 14 h 20 à 15 h 05, il s\'écoule…', '45 min', '85 min', '1 h 45 min', 'De 14 h 20 à 15 h : 40 min. De 15 h à 15 h 05 : 5 min. En tout : 45 min.'),
  timeQ('Il est 8 h 50. Dans 20 min, il sera…', '9 h 10', '8 h 70', '9 h 20', '8 h 50 + 10 min = 9 h, puis encore 10 min : 9 h 10.'),
  timeQ('Il est 16 h 40. Dans 35 min, il sera…', '17 h 15', '16 h 75', '17 h 25', '16 h 40 + 20 min = 17 h, puis encore 15 min : 17 h 15.'),
];

/* ---- Problèmes ---- */

/** L'unité qui convient : une seule mesure est vraisemblable. */
const guess = (q: string, a: string, x1: string, x2: string, tip: string): WrittenItem => ({ q, a, x: [x1, x2], tip });

/** Le plus long (lourd…) de deux mesures en unités différentes, ou « c'est pareil ». */
function compare(word: string, p: string, q: string, a: string, tip: string): WrittenItem {
  return { q: `${word} : ${p} ou ${q} ?`, a, x: (a === 'c\'est pareil' ? [p, q] : [a === p ? q : p, 'c\'est pareil']) as [string, string], tip };
}

const PB: WrittenItem[] = [
  guess('Un crayon mesure environ…', '15 cm', '15 m', '15 mm', 'Un crayon tient dans la main : environ 15 cm. 15 m, c\'est plus long qu\'une classe !'),
  guess('Une porte mesure environ…', '2 m', '2 cm', '2 km', 'Une porte est un peu plus haute qu\'un adulte : environ 2 m.'),
  guess('Un chat pèse environ…', '4 kg', '4 g', '400 kg', 'Un chat se porte dans les bras : environ 4 kg. 4 g, c\'est le poids d\'une petite pièce !'),
  guess('Une récréation dure…', '15 min', '15 h', '15 s', 'Une récréation, c\'est un quart d\'heure : 15 min.'),
  compare('Le plus long', '1 km', '800 m', '1 km', '1 km = 1 000 m, et 1 000 m > 800 m.'),
  compare('Le plus lourd', '1 500 g', '2 kg', '2 kg', '2 kg = 2 000 g, et 2 000 g > 1 500 g.'),
  compare('Le plus long', '3 m', '300 cm', 'c\'est pareil', '1 m = 100 cm, donc 3 m = 300 cm : c\'est pareil.'),
  guess('Une grande bouteille d\'eau contient…', '1 L', '1 mL', '100 L', 'Une grande bouteille d\'eau contient 1 L. 1 mL, c\'est une goutte ; 100 L, une baignoire !'),
  guess('Une cuillère à café contient environ…', '5 mL', '5 L', '50 L', 'Une cuillère à café contient très peu : environ 5 mL.'),
  guess('Une pomme pèse environ…', '150 g', '150 kg', '15 kg', 'Une pomme tient dans la main : environ 150 g.'),
  compare('Qui contient le plus', '250 cL', '2 L', '250 cL', '2 L = 200 cL, et 250 cL > 200 cL.'),
  compare('Le plus long', '45 mm', '5 cm', '5 cm', '5 cm = 50 mm, et 50 mm > 45 mm.'),
  compare('Le plus long', '1 h 30 min', '100 min', '100 min', '1 h 30 min = 60 min + 30 min = 90 min, et 100 min > 90 min.'),
  compare('Le plus lourd', '1 kg', '1 000 g', 'c\'est pareil', '1 kg = 1 000 g : c\'est pareil.'),
  guess('Léa a une ficelle de 2 m. Elle en coupe 50 cm. Il reste…', '150 cm', '250 cm', '48 cm', 'On met tout en centimètres : 2 m = 200 cm, et 200 cm − 50 cm = 150 cm.'),
  guess('Un sac de 500 g et un sac de 1 kg. En tout…', '1 500 g', '501 g', '600 g', 'On met tout en grammes : 1 kg = 1 000 g, et 1 000 g + 500 g = 1 500 g.'),
  guess('Un film commence à 14 h 30 et dure 1 h 45 min. Il finit à…', '16 h 15', '15 h 75', '15 h 15', '14 h 30 + 1 h = 15 h 30, puis + 30 min = 16 h, puis + 15 min = 16 h 15.'),
  guess('Une bouteille de 1 L. On verse 3 verres de 20 cL. Il reste…', '40 cL', '60 cL', '80 cL', '3 verres de 20 cL font 60 cL. 1 L = 100 cL, et 100 cL − 60 cL = 40 cL.'),
];

export const MES_SETS: readonly MesSet[] = [
  { id: 'long', title: 'Longueurs', items: thinAll(LONG) },
  { id: 'masse', title: 'Masses et contenances', items: thinAll(MASSE) },
  { id: 'heure', title: 'Heures et durées', items: thinAll(HEURE) },
  { id: 'pb', title: 'Problèmes de mesure', items: thinAll(PB) },
];

export const mesSetOf = (id: MesId): MesSet => MES_SETS.find((s) => s.id === id)!;
