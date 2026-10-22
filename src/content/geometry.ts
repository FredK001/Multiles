/* Géométrie (CM1). Une île = une compétence du programme :
   - Les angles : angle droit, aigu, obtus (un dessin → son nom ; l'équerre ; l'horloge).
   - Les droites : parallèles, perpendiculaires, sécantes sans angle droit (un dessin → leur position).
   - Les figures : carré, rectangle, losange, triangles rectangle, isocèle, équilatéral ; cercle, rayon, diamètre.
   - Symétrie et périmètre : la ligne en pointillés est-elle un axe de symétrie ? le tour d'un carré, d'un rectangle.
   Une question = { île, rang } comme les fractions ; deux ou trois réponses écrites, mélangées.
   Les dessins sont décrits ici (angles en degrés, longueurs en pixels du dessin) et tracés par art/geometry.ts. */

export type GeoId = 'angle' | 'droite' | 'figure' | 'sym';

/** Figures tracées (codage des côtés égaux et des angles droits : voir art/geometry.ts). */
export type ShapeKind = 'carre' | 'rect' | 'losange' | 'triRect' | 'triIso' | 'triEqui' | 'maison' | 'para';

/** Un segment de droite : le point (x, y), la direction t (degrés, sens inverse des aiguilles), de s0 à s1 le long de la droite. */
export interface Seg {
  x: number;
  y: number;
  t: number;
  s0: number;
  s1: number;
}

export type GeoPic =
  /** Angle de `deg` degrés ; le premier côté part dans la direction `rot`. */
  | { k: 'angle'; deg: number; rot: number }
  /** Deux droites. */
  | { k: 'lines'; l: readonly [Seg, Seg] }
  /** Une figure codée (côtés égaux, angles droits), tournée de `rot` degrés. */
  | { k: 'shape'; f: ShapeKind; rot: number }
  /** Un cercle et son centre ; un rayon ou un diamètre en couleur, dans la direction `rot`. */
  | { k: 'circle'; seg: 'rayon' | 'diametre'; rot: number }
  /** Une figure et une ligne en pointillés (dans le repère de la figure, avant rotation). */
  | { k: 'axis'; f: ShapeKind; rot: number; ax: readonly [number, number, number, number] }
  /** Un rectangle (ou un carré) et ses mesures en cm. */
  | { k: 'dims'; w: number; h: number };

export interface GeoItem {
  /** Énoncé (lu et affiché). */
  q: string;
  /** Bonne réponse et un ou deux intrus (textes affichés sur les boutons). */
  a: string;
  x: readonly string[];
  pic?: GeoPic;
  /** Le truc pour réussir. */
  tip: string;
}

export interface GeoSet {
  id: GeoId;
  title: string;
  items: readonly GeoItem[];
}

/** « 16 cm », avec une espace insécable. */
export const cm = (n: number): string => `${n} cm`;

/* ---- Les angles ---- */

const ANGLES = ['angle droit', 'angle aigu', 'angle obtus'] as const;
const ANGLE_TIP: Record<(typeof ANGLES)[number], string> = {
  'angle droit': "Les deux côtés forment un coin comme celui d'une feuille : c'est un angle droit. L'équerre permet de le vérifier.",
  'angle aigu': "L'angle est plus fermé qu'un angle droit : il rentre dans le coin de l'équerre. C'est un angle aigu.",
  'angle obtus': "L'angle est plus ouvert qu'un angle droit : il dépasse le coin de l'équerre. C'est un angle obtus.",
};
const kindOf = (deg: number): (typeof ANGLES)[number] => (deg === 90 ? 'angle droit' : deg < 90 ? 'angle aigu' : 'angle obtus');

/** Un angle dessiné : jamais entre 65° et 115° sauf l'angle droit, pour qu'on le voie à l'œil. */
const drawn = (deg: number, rot: number): GeoItem => {
  const a = kindOf(deg);
  return { q: 'Quel est cet angle ?', a, x: ANGLES.filter((k) => k !== a), pic: { k: 'angle', deg, rot }, tip: ANGLE_TIP[a] };
};
const said = (q: string, a: (typeof ANGLES)[number], tip: string): GeoItem => ({ q, a, x: ANGLES.filter((k) => k !== a), tip });

const ANGLE: GeoItem[] = [
  // Étape 1 : des angles bien posés, et les définitions.
  drawn(90, 0), drawn(45, 0), drawn(135, 0), drawn(90, 25), drawn(30, 20), drawn(120, 10), drawn(90, 180),
  said("Un angle plus petit qu'un angle droit est un…", 'angle aigu', "Aigu, c'est plus fermé que l'angle droit."),
  said("Un angle plus grand qu'un angle droit est un…", 'angle obtus', "Obtus, c'est plus ouvert que l'angle droit."),
  said("Le coin d'une feuille de papier forme un…", 'angle droit', "Le coin d'une feuille est un angle droit : on peut s'en servir comme d'une équerre."),
  { q: "Pour vérifier qu'un angle est droit, on utilise…", a: 'une équerre', x: ['un compas', 'une gomme'], tip: "L'équerre a un angle droit : on le pose contre l'angle à vérifier." },
  // Étape 2 : des angles tournés, l'horloge.
  drawn(60, 100), drawn(150, 200), drawn(90, 300), drawn(115, 40), drawn(65, 250), drawn(90, 135), drawn(20, 60), drawn(160, 330),
  said("À 3 h, les deux aiguilles d'une horloge forment un…", 'angle droit', "À 3 h, la grande aiguille est sur le 12 et la petite sur le 3 : un quart de tour, c'est un angle droit."),
  said("À 1 h, les deux aiguilles d'une horloge forment un…", 'angle aigu', "À 1 h, les aiguilles sont très proches : l'angle est plus fermé qu'un angle droit."),
  said("À 5 h, les deux aiguilles d'une horloge forment un…", 'angle obtus', "À 5 h, les aiguilles sont très écartées : l'angle est plus ouvert qu'un angle droit."),
];

/* ---- Les droites ---- */

const POS = ['parallèles', 'perpendiculaires', 'sécantes sans angle droit'] as const;
type Pos = (typeof POS)[number];
const POS_TIP: Record<Pos, string> = {
  parallèles: "Les deux droites gardent toujours le même écart : elles ne se couperont jamais. Elles sont parallèles.",
  perpendiculaires: "Les deux droites se coupent en formant un angle droit : elles sont perpendiculaires. L'équerre permet de le vérifier.",
  'sécantes sans angle droit': "Les deux droites se coupent (ou se couperaient si on les prolongeait), mais pas en angle droit.",
};
const L = 85;
const rad = (d: number): number => (d * Math.PI) / 180;
/** Point (x, y) tourné de `t` degrés autour de l'origine (y vers le bas, comme dans le dessin). */
const turn = (x: number, y: number, t: number): [number, number] => [x * Math.cos(rad(t)) + y * Math.sin(rad(t)), -x * Math.sin(rad(t)) + y * Math.cos(rad(t))];
const seg = (p: [number, number], t: number, s0 = -L, s1 = L): Seg => ({ x: Math.round(p[0] * 100) / 100, y: Math.round(p[1] * 100) / 100, t, s0, s1 });

/** Deux droites parallèles, écartées de `gap`. */
const par = (t: number, gap = 50): GeoPic => ({ k: 'lines', l: [seg(turn(0, -gap / 2, t), t), seg(turn(0, gap / 2, t), t)] });
/** Deux droites perpendiculaires qui se croisent ; `tee` : la seconde part de la première (en T). */
const perp = (t: number, tee = false): GeoPic => ({ k: 'lines', l: [seg([0, 0], t), seg([0, 0], t + 90, tee ? 0 : -60, tee ? 75 : 60)] });
/** Deux droites qui se croisent en faisant un angle de `phi` degrés (jamais 90). */
const cross = (t: number, phi: number): GeoPic => ({ k: 'lines', l: [seg([0, 0], t), seg([0, 0], t + phi)] });
/** Deux droites presque parallèles qui ne se touchent pas sur le dessin, mais se couperaient plus loin. */
const apart = (t: number, phi: number): GeoPic => ({ k: 'lines', l: [seg(turn(0, -35, t), t), seg(turn(0, 35, t), t + phi)] });

const lines = (pic: GeoPic, a: Pos, more = ''): GeoItem => ({ q: 'Ces deux droites sont…', a, x: POS.filter((p) => p !== a), pic, tip: POS_TIP[a] + more });

const DROITE: GeoItem[] = [
  // Étape 1.
  lines(par(0), 'parallèles'), lines(perp(0), 'perpendiculaires'), lines(cross(0, 45), 'sécantes sans angle droit'),
  lines(par(30), 'parallèles'), lines(perp(20), 'perpendiculaires'), lines(cross(10, 130), 'sécantes sans angle droit'),
  lines(par(90, 60), 'parallèles'), lines(perp(45), 'perpendiculaires'), lines(cross(60, 35), 'sécantes sans angle droit'),
  { q: 'Deux droites qui ne se coupent jamais sont…', a: 'parallèles', x: ['perpendiculaires', 'sécantes sans angle droit'], tip: POS_TIP.parallèles },
  { q: 'Deux droites qui se coupent en formant un angle droit sont…', a: 'perpendiculaires', x: ['parallèles', 'sécantes sans angle droit'], tip: POS_TIP.perpendiculaires },
  // Étape 2 : les pièges (droites qui se couperaient plus loin, en T, penchées).
  lines(apart(0, 15), 'sécantes sans angle droit', ' Prolonge-les : elles finissent par se couper.'),
  lines(par(150, 40), 'parallèles'), lines(perp(0, true), 'perpendiculaires', ' Même en forme de T, elles forment un angle droit.'),
  lines(cross(100, 60), 'sécantes sans angle droit'), lines(perp(70), 'perpendiculaires'), lines(par(-20, 70), 'parallèles'),
  lines(apart(90, 20), 'sécantes sans angle droit', ' Prolonge-les : elles finissent par se couper.'),
  lines(perp(135, true), 'perpendiculaires', ' Même en forme de T, elles forment un angle droit.'),
  { q: 'Pour tracer deux droites perpendiculaires, on utilise…', a: 'une équerre', x: ['un compas', 'une gomme'], tip: "L'équerre a un angle droit : elle sert à tracer et à vérifier des droites perpendiculaires." },
  { q: "Les deux longs bords d'une règle sont…", a: 'parallèles', x: ['perpendiculaires', 'sécantes sans angle droit'], tip: "Les deux bords d'une règle gardent toujours le même écart : ils sont parallèles." },
];

/* ---- Les figures ---- */

const FIG_Q = 'Quel est le nom précis de cette figure ?';
const FIG_TIP: Record<'carre' | 'rect' | 'losange' | 'triRect' | 'triIso' | 'triEqui', string> = {
  carre: "4 angles droits comme le rectangle, et 4 côtés égaux comme le losange : c'est un carré, même s'il est penché.",
  rect: "4 angles droits, mais des côtés de deux longueurs différentes : c'est un rectangle.",
  losange: "4 côtés égaux, mais pas d'angle droit : c'est un losange.",
  triRect: "Un triangle avec un angle droit (le petit carré) : c'est un triangle rectangle.",
  triIso: "Un triangle avec 2 côtés de même longueur (les petits traits) : c'est un triangle isocèle.",
  triEqui: "Un triangle avec 3 côtés de même longueur : c'est un triangle équilatéral. Il est aussi isocèle, mais son nom précis est équilatéral.",
};
const fig = (f: keyof typeof FIG_TIP, rot: number, a: string, x: readonly string[]): GeoItem => ({ q: FIG_Q, a, x, pic: { k: 'shape', f, rot }, tip: FIG_TIP[f] });
const QUADS = ['carré', 'rectangle', 'losange'];
const quad = (f: 'carre' | 'rect' | 'losange', rot: number): GeoItem => {
  const a = f === 'carre' ? 'carré' : f === 'rect' ? 'rectangle' : 'losange';
  return fig(f, rot, a, QUADS.filter((q) => q !== a));
};
const TRIS = ['triangle rectangle', 'triangle isocèle', 'triangle équilatéral'];
// Le triangle équilatéral est aussi isocèle : on ne propose jamais « isocèle » à côté de lui.
const tri = (f: 'triRect' | 'triIso' | 'triEqui', rot: number): GeoItem =>
  f === 'triEqui' ? fig(f, rot, 'triangle équilatéral', ['triangle rectangle', 'rectangle']) : fig(f, rot, f === 'triRect' ? 'triangle rectangle' : 'triangle isocèle', TRIS.filter((t) => t !== (f === 'triRect' ? 'triangle rectangle' : 'triangle isocèle')));
const circ = (seg: 'rayon' | 'diametre', rot: number): GeoItem => {
  const a = seg === 'rayon' ? 'un rayon' : 'un diamètre';
  return {
    q: 'Le segment en couleur est…', a, x: [seg === 'rayon' ? 'un diamètre' : 'un rayon', 'un côté'], pic: { k: 'circle', seg, rot },
    tip: seg === 'rayon' ? "Il va du centre jusqu'au cercle : c'est un rayon." : "Il traverse le cercle d'un bord à l'autre en passant par le centre : c'est un diamètre. Il mesure deux rayons.",
  };
};

const FIGURE: GeoItem[] = [
  // Étape 1 : les figures bien posées, les propriétés, le cercle.
  quad('carre', 0), quad('rect', 0), quad('losange', 0), tri('triRect', 0), tri('triIso', 0), tri('triEqui', 0),
  circ('rayon', 30), circ('diametre', 0),
  { q: "Un quadrilatère qui a 4 angles droits, mais pas 4 côtés égaux, est un…", a: 'rectangle', x: ['carré', 'losange'], tip: FIG_TIP.rect },
  { q: "Un quadrilatère qui a 4 côtés égaux, mais pas d'angle droit, est un…", a: 'losange', x: ['carré', 'rectangle'], tip: FIG_TIP.losange },
  { q: 'Le rayon d\'un cercle mesure 3 cm. Son diamètre mesure…', a: cm(6), x: [cm(3), cm(9)], tip: 'Le diamètre mesure deux rayons : 3 + 3 = 6 cm.' },
  { q: 'Pour tracer un cercle, on utilise…', a: 'un compas', x: ['une équerre', 'une règle'], tip: "On plante la pointe du compas au centre, et la mine trace le cercle." },
  // Étape 2 : les figures penchées ou retournées, les triangles par leurs propriétés.
  quad('carre', 45), quad('rect', 30), quad('losange', 90), tri('triRect', 200), tri('triIso', 180), tri('triEqui', 30),
  circ('diametre', 60), circ('rayon', 210),
  { q: 'Un triangle qui a 3 côtés de même longueur est un triangle…', a: 'équilatéral', x: ['rectangle', 'quelconque'], tip: FIG_TIP.triEqui },
  { q: 'Un triangle qui a 2 côtés de même longueur, et pas 3, est un triangle…', a: 'isocèle', x: ['équilatéral', 'quelconque'], tip: FIG_TIP.triIso },
  { q: 'Un triangle qui a un angle droit est un triangle…', a: 'rectangle', x: ['équilatéral', 'quelconque'], tip: FIG_TIP.triRect },
  { q: 'Le diamètre d\'un cercle mesure 10 cm. Son rayon mesure…', a: cm(5), x: [cm(10), cm(20)], tip: 'Le rayon, c\'est la moitié du diamètre : la moitié de 10, c\'est 5 cm.' },
];

/* ---- Symétrie et périmètre ---- */

const SYM_Q = 'La ligne en pointillés est-elle un axe de symétrie de la figure ?';
const YES = 'Si on plie la figure le long de la ligne, les deux moitiés se superposent exactement : c\'est un axe de symétrie.';
const axis = (f: ShapeKind, rot: number, ax: readonly [number, number, number, number], yes: boolean, no = ''): GeoItem => ({
  q: SYM_Q, a: yes ? 'oui' : 'non', x: [yes ? 'non' : 'oui'], pic: { k: 'axis', f, rot, ax },
  tip: yes ? YES : `Si on plie la figure le long de la ligne, les deux moitiés ne se superposent pas.${no}`,
});
/** Périmètre d'un rectangle w × h (carré si w = h) ; intrus : w × h (la surface) et w + h (la moitié du tour). */
const perim = (w: number, h: number): GeoItem => {
  const p = 2 * (w + h), sq = w === h;
  return {
    q: `Quel est le périmètre de ce ${sq ? 'carré' : 'rectangle'} ?`, a: cm(p), x: [cm(w * h), cm(sq ? 2 * w : w + h)], pic: { k: 'dims', w, h },
    tip: sq ? `Le carré a 4 côtés de ${w} cm : ${w} × 4 = ${p} cm.` : `On fait tout le tour : ${w} + ${h} + ${w} + ${h} = ${p} cm.`,
  };
};

const SYM: GeoItem[] = [
  // Étape 1.
  { q: "Le périmètre d'une figure, c'est…", a: 'la longueur de son tour', x: ['la place à l\'intérieur', 'la longueur d\'un côté'], tip: 'Le périmètre, c\'est la longueur du tour de la figure : on additionne tous ses côtés.' },
  axis('rect', 0, [60, 0, 60, -70], true), axis('carre', 0, [0, 0, 90, -90], true), axis('triIso', 0, [0, 0, 0, -100], true),
  axis('rect', 0, [0, 0, 120, -70], false, ' La diagonale d\'un rectangle n\'est pas un axe de symétrie.'),
  axis('maison', 0, [40, 0, 40, -85], true), axis('rect', 0, [35, 0, 35, -70], false, ' La ligne n\'est pas au milieu.'),
  { q: "Combien d'axes de symétrie a un carré ?", a: '4', x: ['2', '1'], tip: 'Le carré a 4 axes de symétrie : les 2 diagonales et les 2 droites qui passent par le milieu des côtés.' },
  { q: "Combien d'axes de symétrie a un rectangle qui n'est pas un carré ?", a: '2', x: ['4', '1'], tip: 'Le rectangle a 2 axes : ceux qui passent par le milieu des côtés. Ses diagonales ne sont pas des axes.' },
  perim(5, 3), perim(6, 6), perim(7, 2),
  // Étape 2.
  axis('para', 0, [65, 0, 65, -60], false, ' Un parallélogramme n\'a aucun axe de symétrie.'),
  axis('losange', 0, [-70, 0, 70, 0], true), axis('triEqui', 0, [0, 0, 0, -86.6], true),
  axis('maison', 0, [0, -25, 80, -25], false), axis('triRect', 0, [0, 0, 55, -35], false),
  { q: "Combien d'axes de symétrie a un triangle équilatéral ?", a: '3', x: ['1', '0'], tip: 'Le triangle équilatéral a 3 axes : chacun passe par un sommet et le milieu du côté d\'en face.' },
  perim(6, 4), perim(8, 5), perim(3, 3),
  { q: 'Un carré a un périmètre de 20 cm. Son côté mesure…', a: cm(5), x: [cm(10), cm(4)], tip: 'Le carré a 4 côtés égaux : 20 ÷ 4 = 5 cm, car 5 × 4 = 20.' },
  perim(10, 3),
  { q: 'Un rectangle mesure 9 cm sur 1 cm. Son périmètre mesure…', a: cm(20), x: [cm(9), cm(10)], tip: 'On fait tout le tour : 9 + 1 + 9 + 1 = 20 cm.' },
];

export const GEO_SETS: readonly GeoSet[] = [
  { id: 'angle', title: 'Les angles', items: ANGLE },
  { id: 'droite', title: 'Les droites', items: DROITE },
  { id: 'figure', title: 'Les figures', items: FIGURE },
  { id: 'sym', title: 'Symétrie et périmètre', items: SYM },
];

export const geoSetOf = (id: GeoId): GeoSet => GEO_SETS.find((s) => s.id === id)!;
