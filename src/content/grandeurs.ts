/* Grandeurs au CP : la monnaie et l'heure (programme du CP : connaître les pièces et billets, payer une petite somme ;
   lire l'heure juste et la demie sur une horloge à aiguilles, se repérer dans la journée). Quatre îles :
   - Pièces et billets : reconnaître 1 €, 2 €, 5 €, 10 € ; compter une petite somme de pièces (jusqu'à 10 €).
   - Payer : compter billets et pièces jusqu'à 20 € ; choisir le porte-monnaie qui fait la somme.
   - L'heure juste : l'horloge montre « 3 heures » (la grande aiguille sur le 12).
   - Et demie : « 7 heures et demie » (la grande aiguille sur le 6) ; le matin, midi, le soir.
   Une question = { île, rang } ; les intrus sont les erreurs du CP : compter les pièces au lieu de leur valeur,
   oublier une pièce, confondre les deux aiguilles, lire le nombre suivant pour la demie. */
import { clock, euros, hourText, money, moneyOf, sum, type PicItem, type PicSet } from './picquiz';

export type GrdId = 'pieces' | 'payer' | 'heure' | 'demie';

/** « Touche la pièce de 2 € » : la bonne et deux autres valeurs. */
const touch = (v: number, x1: number, x2: number): PicItem => ({
  q: `Touche ${v < 5 ? 'la pièce' : 'le billet'} de ${euros(v)}.`,
  a: money(v), x: [money(x1), money(x2)], pics: true, big: euros(v),
  tip: `Regarde le nombre écrit dessus : ${euros(v)}. ${v < 5 ? 'Les pièces sont rondes' : 'Les billets sont en papier'}.`,
});

/** « Combien d'euros ? » : intrus = le nombre de pièces (erreur classique), ou la somme sans la plus petite pièce. */
function count(...v: number[]): PicItem {
  const total = sum(v), n = v.length, forgot = total - Math.min(...v);
  const cands = [n, forgot, total + 1, total - 1, total + 2].filter((c, i, all) => c > 0 && c !== total && all.indexOf(c) === i);
  const steps = [...v].sort((a, b) => b - a).reduce<number[]>((acc, x) => [...acc, (acc[acc.length - 1] ?? 0) + x], []);
  return {
    q: "Combien d'euros ?", pic: money(...v), a: euros(total), x: [euros(cands[0]!), euros(cands[1]!)],
    tip: `Compte la valeur, pas le nombre de ${v.some((x) => x >= 5) ? 'billets et de pièces' : 'pièces'}. Commence par le plus grand : ${steps.map((s) => euros(s)).join(', ')}.`,
  };
}

/** « Touche ce qui fait 7 € » : un seul porte-monnaie fait la somme. */
function pay(total: number, a: readonly number[], x1: readonly number[], x2: readonly number[]): PicItem {
  return {
    q: `Touche ce qui fait ${euros(total)}.`, big: euros(total), a: money(...a), x: [money(...x1), money(...x2)], pics: true,
    tip: `${a.map((v) => euros(v)).join(' + ')} = ${euros(total)}.`,
  };
}

/** Pièces et billets jusqu'à 10 € : reconnaître d'abord, puis compter. */
const PIECES: PicItem[] = [
  touch(1, 2, 5), touch(2, 1, 10), touch(5, 2, 10), touch(10, 5, 1),
  { q: 'Touche la pièce.', a: money(2), x: [money(5), money(10)], pics: true, big: 'une pièce', tip: 'Les pièces sont rondes et en métal ; les billets sont des rectangles de papier.' },
  { q: 'Touche le billet.', a: money(5), x: [money(1), money(2)], pics: true, big: 'un billet', tip: 'Les billets sont des rectangles de papier ; les pièces sont rondes.' },
  { q: 'Touche ce qui vaut le plus.', a: money(10), x: [money(5), money(2)], pics: true, tip: 'Regarde les nombres : 10 est plus grand que 5 et que 2.' },
  { q: 'Touche ce qui vaut le moins.', a: money(1), x: [money(2), money(5)], pics: true, tip: 'Regarde les nombres : 1 est plus petit que 2 et que 5.' },
  pay(2, [1, 1], [1], [2, 1]),
  count(1, 1), count(2, 1), count(2, 2), count(2, 1, 1), count(2, 2, 1), count(2, 2, 2), count(2, 2, 1, 1), count(2, 2, 2, 1), count(5, 2, 2, 1),
];

/** Payer jusqu'à 20 € : billets de 5 € et 10 €, et des pièces. */
const PAYER: PicItem[] = [
  count(5, 5), count(10, 5), count(10, 2), count(5, 2, 1), count(10, 1, 1), count(10, 10),
  pay(7, [5, 2], [5, 1], [2, 2, 2]), pay(12, [10, 2], [10, 1], [5, 5, 1]), pay(15, [10, 5], [10, 2], [5, 5, 2]),
  count(10, 5, 2), count(5, 5, 5), count(10, 5, 1), count(5, 5, 2, 1), count(10, 5, 2, 2), count(10, 5, 5),
  pay(20, [10, 10], [10, 5, 2], [5, 5, 5]), pay(9, [5, 2, 2], [5, 2, 1], [2, 2, 2]),
];

/** L'heure juste : la grande aiguille sur le 12, la petite montre l'heure. Intrus : les aiguilles confondues, l'heure d'à côté. */
function full(h: number): PicItem {
  const swap = h === 12 ? 6 : 12, near = h === 12 ? 11 : h === 11 ? 10 : h + 1;
  return {
    q: 'Quelle heure est-il ?', pic: clock(h), a: hourText(h), x: [hourText(swap), hourText(near)],
    tip: `La grande aiguille est sur le 12 : c'est une heure juste. La petite aiguille montre le ${h} : il est ${hourText(h)}.`,
  };
}
/** « Touche l'horloge qui montre 4 heures » : intrus = les aiguilles échangées (petite sur le 12, grande sur le 4 : 12 h 20)
    et l'heure suivante. */
const showFull = (h: number): PicItem => ({
  q: `Touche l'horloge qui montre ${hourText(h)}.`, big: hourText(h), a: clock(h), x: [clock(12, h * 5), clock(h + 1)], pics: true,
  tip: `À ${hourText(h)}, la petite aiguille est sur le ${h} et la grande sur le 12.`,
});
const HEURE: PicItem[] = [
  full(3), full(6), full(9), full(12), full(1), full(5), full(8), showFull(4),
  full(2), full(4), full(7), full(10), full(11), showFull(2), showFull(7), showFull(10),
];

/** Et demie : la grande aiguille sur le 6, la petite entre deux nombres (on lit le plus petit). */
function half(h: number): PicItem {
  const next = (h % 12) + 1;
  return {
    q: 'Quelle heure est-il ?', pic: clock(h, 30), a: hourText(h, true), x: [hourText(next, true), hourText(h === 6 ? 7 : 6)],
    tip: `La grande aiguille est sur le 6 : c'est la demie. La petite est entre le ${h} et le ${next} : il est ${hourText(h, true)}.`,
  };
}
const sky = (when: 'matin' | 'midi' | 'soir', q: string, tip: string): PicItem => ({
  q, pic: `sky:${when}`, a: when === 'midi' ? 'midi' : `le ${when}`, x: (when === 'matin' ? ['midi', 'le soir'] : when === 'midi' ? ['le matin', 'le soir'] : ['le matin', 'midi']) as [string, string], tip,
});
const DEMIE: PicItem[] = [
  sky('matin', "Le soleil se lève. C'est…", "Le matin, le soleil se lève : on se réveille et on part à l'école."),
  half(7), half(3), half(10),
  sky('midi', "Le soleil est tout en haut. C'est…", "À midi, le soleil est au plus haut : c'est l'heure du déjeuner, 12 heures."),
  half(1), half(5), half(8),
  sky('soir', "Le soleil se couche. C'est…", 'Le soir, le soleil se couche : on dîne, puis on va au lit.'),
  half(2), half(4), half(6),
  { q: 'En plein jour, 12 heures, on dit aussi…', a: 'midi', x: ['le matin', 'le soir'], big: hourText(12), tip: "12 heures, en plein jour, c'est midi : l'heure du déjeuner." },
  half(9), half(11), half(12),
];

export const GRD_SETS: readonly PicSet<GrdId>[] = [
  { id: 'pieces', title: 'Pièces et billets', items: PIECES },
  { id: 'payer', title: "Payer jusqu'à 20 €", items: PAYER },
  { id: 'heure', title: "L'heure juste", items: HEURE },
  { id: 'demie', title: 'Et demie', items: DEMIE },
];

export const grdSetOf = (id: GrdId): PicSet<GrdId> => GRD_SETS.find((s) => s.id === id)!;

/** Somme d'un dessin de monnaie (tests, aide). */
export const moneySum = (code: string): number => sum(moneyOf(code));
