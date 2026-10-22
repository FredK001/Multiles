/* Espace et géométrie au CP (programme du CP : reconnaître et nommer carré, rectangle, triangle, cercle ;
   repérer une case d'un quadrillage ; se situer : sur, sous, devant, derrière, à gauche, à droite). Quatre îles :
   - Les formes : la forme dessinée → son nom, ou « touche le triangle » parmi trois dessins.
   - Côtés et coins : compter les côtés et les coins (les sommets) d'une forme.
   - Le quadrillage : « Où est l'étoile ? » → « B3 » (la lettre de la colonne, puis le chiffre de la ligne).
   - Se repérer : le chat et la boîte (ou la table) → la bonne phrase, ou le bon dessin.
   Une seule bonne réponse : un carré est aussi un rectangle (au CE2), donc jamais « carré » et « rectangle »
   ensemble quand l'un des deux est la bonne réponse et que l'autre la contient ; jamais « dans » et « derrière »
   ensemble (sur un dessin à plat, un chat qui dépasse d'une boîte peut être l'un ou l'autre). */
import { COLS, PLACE_TEXT, SHAPE_NAME, shape, type Place, type PicItem, type PicSet, type ShapeKind } from './picquiz';

export type EspId = 'formes' | 'cotes' | 'quadri' | 'position';

/** Couleurs des formes (src/art/space.ts), pour décrire le dessin sans donner son nom. */
export const SHAPE_COLOR_NAME = ['bleue', 'rouge', 'verte', 'jaune'] as const;
const alt = (col: number): string => `Une forme ${SHAPE_COLOR_NAME[col % 4]}`;

const NAME_TIP: Record<ShapeKind, string> = {
  carre: "Le carré a 4 côtés, tous de la même longueur, et 4 coins bien droits. Même penché, c'est un carré.",
  rectangle: 'Le rectangle a 4 côtés et 4 coins droits : deux grands côtés et deux petits.',
  triangle: 'Le triangle a 3 côtés et 3 coins (« tri », comme dans tricycle : trois).',
  cercle: "Le cercle est tout rond : pas de côté, pas de coin. On l'appelle aussi le rond.",
  losange: 'Le losange a 4 côtés de la même longueur.',
  pentagone: 'Compte les côtés.',
  hexagone: 'Compte les côtés.',
};

/** « Touche le triangle » : la bonne forme parmi trois dessins. */
const touch = (k: ShapeKind, rot: number, col: number, x1: ShapeKind, x2: ShapeKind): PicItem => ({
  q: `Touche ${SHAPE_NAME[k].replace(/^un /, 'le ')}.`, a: shape(k, rot, col), x: [shape(x1, 0, (col + 1) % 4), shape(x2, 0, (col + 2) % 4)], pics: true,
  big: SHAPE_NAME[k].replace(/^un /, 'le '), tip: NAME_TIP[k],
});

/** « Comment s'appelle cette forme ? » : le nom parmi trois. */
const nameIt = (k: ShapeKind, rot: number, col: number, x1: ShapeKind, x2: ShapeKind): PicItem => ({
  q: "Comment s'appelle cette forme ?", pic: shape(k, rot, col), alt: alt(col), a: SHAPE_NAME[k], x: [SHAPE_NAME[x1], SHAPE_NAME[x2]], tip: NAME_TIP[k],
});

const FORMES: PicItem[] = [
  touch('triangle', 0, 0, 'carre', 'cercle'), touch('carre', 0, 1, 'triangle', 'rectangle'), touch('cercle', 0, 2, 'carre', 'triangle'), touch('rectangle', 0, 3, 'triangle', 'cercle'),
  nameIt('triangle', 0, 1, 'carre', 'cercle'), nameIt('cercle', 0, 0, 'carre', 'triangle'), nameIt('carre', 0, 2, 'triangle', 'cercle'), nameIt('rectangle', 0, 3, 'carre', 'triangle'),
  // Seconde moitié : formes tournées (un carré penché reste un carré).
  touch('triangle', 180, 2, 'rectangle', 'cercle'), touch('carre', 45, 0, 'triangle', 'cercle'), touch('rectangle', 90, 1, 'triangle', 'cercle'),
  nameIt('triangle', 30, 3, 'rectangle', 'cercle'), nameIt('carre', 45, 1, 'triangle', 'cercle'), nameIt('rectangle', 90, 0, 'carre', 'cercle'),
  { q: "Le rond, son vrai nom, c'est…", big: 'le rond', a: 'un cercle', x: ['un carré', 'un triangle'], tip: NAME_TIP.cercle },
];

/** « Combien de côtés ? » ou « Combien de coins ? » : le nombre parmi trois. */
function count(k: ShapeKind, what: 'côtés' | 'coins', rot: number, col: number, x1: number, x2: number): PicItem {
  const n = k === 'cercle' ? 0 : { carre: 4, rectangle: 4, triangle: 3, losange: 4, pentagone: 5, hexagone: 6 }[k];
  const counted = Array.from({ length: n }, (_, i) => i + 1).join(', ');
  const tip = n === 0 ? NAME_TIP.cercle
    : what === 'côtés' ? `Suis le bord avec ton doigt et compte chaque trait droit : ${counted}. ${n} côtés.`
    : `Pose ton doigt sur chaque pointe : ${counted}. ${n} coins. Les coins s'appellent aussi les sommets.`;
  return { q: `Combien de ${what} ?`, pic: shape(k, rot, col), alt: alt(col), a: String(n), x: [String(x1), String(x2)], tip };
}

const COTES: PicItem[] = [
  count('triangle', 'côtés', 0, 0, 4, 2), count('carre', 'côtés', 0, 1, 3, 5), count('rectangle', 'côtés', 0, 2, 2, 5),
  count('triangle', 'coins', 0, 3, 4, 2), count('carre', 'coins', 0, 0, 3, 5),
  { q: 'Touche la forme qui a 3 côtés.', big: '3 côtés', a: shape('triangle', 0, 1), x: [shape('carre', 0, 2), shape('cercle', 0, 3)], pics: true, tip: 'Le triangle a 3 côtés : « tri », trois.' },
  { q: 'Touche la forme qui a 4 côtés.', big: '4 côtés', a: shape('rectangle', 0, 0), x: [shape('triangle', 0, 2), shape('hexagone', 0, 3)], pics: true, tip: "Le rectangle a 4 côtés. Le triangle en a 3, l'autre forme en a 6." },
  { q: "Touche la forme qui n'a pas de coin.", big: 'pas de coin', a: shape('cercle', 0, 2), x: [shape('triangle', 0, 0), shape('carre', 0, 1)], pics: true, tip: NAME_TIP.cercle },
  // Seconde moitié : plus de côtés, formes tournées.
  count('pentagone', 'côtés', 0, 1, 4, 6), count('hexagone', 'côtés', 0, 2, 5, 8), count('losange', 'côtés', 0, 3, 3, 5),
  count('pentagone', 'coins', 0, 0, 4, 6), count('hexagone', 'coins', 0, 1, 5, 7), count('rectangle', 'coins', 90, 2, 2, 3),
  count('triangle', 'côtés', 180, 3, 4, 6), count('cercle', 'coins', 0, 0, 1, 4),
];

/** « Où est l'étoile ? » dans la case `cell` (« B3 ») : intrus = lettre et chiffre échangés, ou la case voisine. */
function star(cell: string): PicItem {
  const c = COLS.indexOf(cell[0] as (typeof COLS)[number]), r = Number(cell[1]);
  const swapped = `${COLS[r - 1]}${c + 1}`, below = `${cell[0]}${r === 4 ? 3 : r + 1}`, beside = `${COLS[c === 3 ? 2 : c + 1]}${r}`;
  const x = [swapped, below, beside].filter((v, i, all) => v !== cell && all.indexOf(v) === i).slice(0, 2) as [string, string];
  return {
    q: "Où est l'étoile ?", pic: `grid:${cell}`, a: cell, x,
    tip: `Pose ton doigt sur l'étoile. Monte tout droit : la lettre est ${cell[0]}. Va sur le côté : le chiffre est ${r}. L'étoile est en ${cell}.`,
  };
}
const QUADRI: PicItem[] = ['B3', 'A1', 'C2', 'D4', 'A3', 'B1', 'C4', 'D2', 'C3', 'A2', 'D1', 'B4', 'A4', 'D3', 'B2', 'C1'].map(star);

/** « Où est le chat ? » : la scène → la phrase. */
const where = (pl: Place, x1: Place, x2: Place, tip: string): PicItem => ({
  q: 'Où est le chat ?', pic: `place:${pl}`, alt: pl.startsWith('table') ? 'Un chat et une table' : 'Un chat et une boîte', a: PLACE_TEXT[pl], x: [PLACE_TEXT[x1], PLACE_TEXT[x2]], tip,
});
/** « Touche le dessin : le chat est sous la table » : la phrase → la scène. */
const scene = (pl: Place, x1: Place, x2: Place, tip: string): PicItem => ({
  q: `Touche le dessin : le chat est ${PLACE_TEXT[pl]}.`, a: `place:${pl}`, x: [`place:${x1}`, `place:${x2}`], pics: true, tip,
});

const TIP: Record<Place, string> = {
  'table-on': 'Sur la table : le chat est assis en haut, sur le plateau.',
  'table-under': 'Sous la table : le chat est en bas, le plateau est au-dessus de lui.',
  'table-beside': 'À côté de la table : le chat est par terre, juste à côté.',
  in: 'Dans la boîte : la boîte est ouverte, le chat est dedans.',
  front: 'Devant la boîte : le chat cache une partie de la boîte.',
  behind: 'Derrière la boîte : la boîte cache une partie du chat.',
  left: 'À gauche : du côté de ta main gauche quand tu regardes le dessin.',
  right: 'À droite : du côté de ta main droite quand tu regardes le dessin.',
};

const POSITION: PicItem[] = [
  where('table-on', 'table-under', 'table-beside', TIP['table-on']), where('table-under', 'table-on', 'table-beside', TIP['table-under']),
  where('in', 'front', 'left', TIP.in), where('front', 'behind', 'right', TIP.front),
  scene('table-under', 'table-on', 'table-beside', TIP['table-under']), scene('in', 'left', 'right', TIP.in), scene('front', 'behind', 'left', TIP.front),
  where('behind', 'front', 'left', TIP.behind),
  // Seconde moitié : gauche et droite.
  where('left', 'right', 'in', TIP.left), where('right', 'left', 'behind', TIP.right), where('table-beside', 'table-on', 'table-under', TIP['table-beside']),
  scene('left', 'right', 'front', TIP.left), scene('right', 'left', 'in', TIP.right), scene('behind', 'front', 'left', TIP.behind), scene('table-on', 'table-under', 'table-beside', TIP['table-on']),
];

export const ESP_SETS: readonly PicSet<EspId>[] = [
  { id: 'formes', title: 'Les formes', items: FORMES },
  { id: 'cotes', title: 'Côtés et coins', items: COTES },
  { id: 'quadri', title: 'Le quadrillage', items: QUADRI },
  { id: 'position', title: 'Se repérer', items: POSITION },
];

export const espSetOf = (id: EspId): PicSet<EspId> => ESP_SETS.find((s) => s.id === id)!;
