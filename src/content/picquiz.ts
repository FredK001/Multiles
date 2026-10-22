/* Questions à dessins du CP (grandeurs, espace) : une consigne courte lue par la voix, un dessin, trois réponses
   (écrites, ou dessinées : « touche le triangle »). Un dessin est décrit par un code court, dessiné par src/art/pic.ts :
   - « money:10,5,2 » : billets et pièces d'euro (1 et 2 : pièces ; 5, 10, 20 : billets) ;
   - « clock:7:30 » : horloge à aiguilles ; « sky:matin » : moment de la journée (soleil, lune) ;
   - « shape:triangle:0:2 » : forme, rotation en degrés, couleur n° ; « grid:B3 » : quadrillage avec une étoile ;
   - « place:left » : le chat et la boîte (ou la table). */

export type PicCode = string;

export interface PicItem {
  /** Consigne (bulle), lue par la voix. */
  q: string;
  /** Bonne réponse : texte affiché, ou code de dessin si `pics`. */
  a: string;
  /** Les deux intrus. */
  x: readonly [string, string];
  /** Dessin de la question. */
  pic?: PicCode;
  /** Description du dessin de la question quand `picLabel` donnerait la réponse (« Une forme à nommer »). */
  alt?: string;
  /** Grand texte de la carte quand il n'y a pas de dessin (« 2 € »). */
  big?: string;
  /** Les réponses sont des dessins. */
  pics?: true;
  /** Le truc pour réussir. */
  tip: string;
}

export interface PicSet<Id extends string> {
  id: Id;
  title: string;
  items: readonly PicItem[];
}

/* ---- Monnaie ---- */

/** Pièces : 1 et 2 € ; billets : 5, 10, 20 €. */
export const isCoin = (v: number): boolean => v < 5;

/** Valeurs d'un code « money:… ». */
export const moneyOf = (code: PicCode): number[] => code.slice(6).split(',').map(Number);
export const money = (...v: number[]): PicCode => `money:${v.join(',')}`;
export const sum = (v: readonly number[]): number => v.reduce((t, x) => t + x, 0);

const NUM_WORD = ['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six'];

/** « deux pièces de 2 € et un billet de 5 € » (du plus grand au plus petit). */
export function moneyWords(v: readonly number[]): string {
  const vals = [...new Set(v)].sort((a, b) => b - a);
  const part = (x: number) => {
    const n = v.filter((y) => y === x).length, coin = isCoin(x);
    const det = n === 1 ? (coin ? 'une' : 'un') : NUM_WORD[n] ?? String(n);
    return `${det} ${coin ? 'pièce' : 'billet'}${n > 1 ? 's' : ''} de ${x} €`;
  };
  const parts = vals.map(part);
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}` : parts[0]!;
}

/** « 3 € » ; espace insécable entre le nombre et le symbole. */
export const euros = (n: number): string => `${n} €`;

/* ---- Heure ---- */

/** Horloge à h heures m minutes (m multiple de 5). */
export const clock = (h: number, m = 0): PicCode => `clock:${h}:${String(m).padStart(2, '0')}`;
export const clockOf = (code: PicCode): { h: number; m: number } => {
  const [, h, m] = code.split(':');
  return { h: Number(h), m: Number(m) };
};
/** « 3 heures », « 1 heure », « 7 heures et demie ». */
export const hourText = (h: number, half = false): string => `${h} heure${h > 1 ? 's' : ''}${half ? ' et demie' : ''}`;

/* ---- Formes ---- */

export type ShapeKind = 'carre' | 'rectangle' | 'triangle' | 'cercle' | 'losange' | 'pentagone' | 'hexagone';
/** Nom de la forme, avec son article. */
export const SHAPE_NAME: Record<ShapeKind, string> = {
  carre: 'un carré', rectangle: 'un rectangle', triangle: 'un triangle', cercle: 'un cercle',
  losange: 'un losange', pentagone: 'une forme à 5 côtés', hexagone: 'une forme à 6 côtés',
};
/** Nombre de côtés (et de coins) ; le cercle n'en a pas. */
export const SIDES: Record<ShapeKind, number> = { carre: 4, rectangle: 4, triangle: 3, cercle: 0, losange: 4, pentagone: 5, hexagone: 6 };
export const shape = (k: ShapeKind, rot = 0, col = 0): PicCode => `shape:${k}:${rot}:${col}`;
export const shapeOf = (code: PicCode): { k: ShapeKind; rot: number; col: number } => {
  const [, k, rot, col] = code.split(':');
  return { k: k as ShapeKind, rot: Number(rot ?? 0), col: Number(col ?? 0) };
};

/* ---- Quadrillage et position ---- */

export const COLS = ['A', 'B', 'C', 'D'] as const;
export type Place = 'table-on' | 'table-under' | 'table-beside' | 'in' | 'front' | 'behind' | 'left' | 'right';
/** Où est le chat : la phrase de chaque scène. */
export const PLACE_TEXT: Record<Place, string> = {
  'table-on': 'sur la table', 'table-under': 'sous la table', 'table-beside': 'à côté de la table',
  in: 'dans la boîte', front: 'devant la boîte', behind: 'derrière la boîte', left: 'à gauche de la boîte', right: 'à droite de la boîte',
};

const SKY_TEXT: Record<string, string> = {
  matin: 'Le soleil se lève derrière la colline.',
  midi: 'Le soleil est tout en haut du ciel.',
  soir: 'Le soleil se couche, la lune arrive.',
};

/** Description d'un dessin (lecteurs d'écran, réponses dessinées). */
export function picLabel(code: PicCode): string {
  const kind = code.split(':')[0];
  if (kind === 'money') {
    const v = moneyOf(code);
    return v.length === 1 ? `${isCoin(v[0]!) ? 'La pièce' : 'Le billet'} de ${v[0]} €` : moneyWords(v).replace(/^./, (c) => c.toUpperCase());
  }
  if (kind === 'clock') {
    const { h, m } = clockOf(code), big = m === 0 ? 12 : m === 30 ? 6 : m / 5;
    const small = m === 0 ? `sur le ${h}` : `entre le ${h} et le ${(h % 12) + 1}`;
    return `Une horloge : la petite aiguille est ${small}, la grande aiguille est sur le ${big}.`;
  }
  if (kind === 'sky') return SKY_TEXT[code.slice(4)] ?? 'Le ciel';
  if (kind === 'shape') {
    const n = SHAPE_NAME[shapeOf(code).k];
    return n.charAt(0).toUpperCase() + n.slice(1);
  }
  if (kind === 'grid') return 'Un quadrillage : les colonnes A, B, C, D en haut, les lignes 1, 2, 3, 4 sur le côté. Une étoile est dans une case.';
  if (kind === 'place') return `Le chat est ${PLACE_TEXT[code.slice(6) as Place] ?? '?'}.`;
  return code;
}

/** Texte à dire : « 3 € » devient « 3 euros » (certaines voix lisent mal le symbole). */
export const sayEuros = (s: string): string => s.replace(/(\d+)[\s ]€/g, (_, n: string) => `${n} euro${n === '1' ? '' : 's'}`);
