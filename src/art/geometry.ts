/* Dessins de géométrie (CM1) : angles, droites, figures codées, cercle, axe de symétrie, mesures.
   Les dessins sont exacts : un angle droit fait 90°, deux parallèles ont la même direction.
   Repère du dessin : x vers la droite, y vers le bas ; une direction t (en degrés) tourne dans le sens
   inverse des aiguilles d'une montre (0 = vers la droite, 90 = vers le haut). */
import type { GeoPic, Seg, ShapeKind } from '../content/geometry';
import { INK } from './shapes';

type P = readonly [number, number];

const rad = (d: number): number => (d * Math.PI) / 180;
const dir = (t: number): P => [Math.cos(rad(t)), -Math.sin(rad(t))];
/** Point tourné de `t` degrés autour de l'origine. */
const turn = ([x, y]: P, t: number): P => [x * Math.cos(rad(t)) + y * Math.sin(rad(t)), -x * Math.sin(rad(t)) + y * Math.cos(rad(t))];
const add = (a: P, b: P, k = 1): P => [a[0] + k * b[0], a[1] + k * b[1]];
const unit = (a: P, b: P): P => {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
};
const n1 = (v: number): string => String(Math.round(v * 10) / 10);
const pt = (p: P): string => `${n1(p[0])} ${n1(p[1])}`;
const path = (pts: readonly P[], close = false): string => `M${pts.map(pt).join(' L')}${close ? 'Z' : ''}`;

/** Sommets d'une figure (avant rotation), côtés marqués (nombre de traits) et angles droits marqués. */
const SHAPES: Record<ShapeKind, { pts: readonly P[]; ticks: readonly number[]; right: readonly boolean[] }> = {
  carre: { pts: [[0, 0], [90, 0], [90, -90], [0, -90]], ticks: [1, 1, 1, 1], right: [true, true, true, true] },
  rect: { pts: [[0, 0], [120, 0], [120, -70], [0, -70]], ticks: [1, 2, 1, 2], right: [true, true, true, true] },
  losange: { pts: [[0, -45], [70, 0], [0, 45], [-70, 0]], ticks: [1, 1, 1, 1], right: [false, false, false, false] },
  triRect: { pts: [[0, 0], [110, 0], [0, -70]], ticks: [0, 0, 0], right: [true, false, false] },
  triIso: { pts: [[-45, 0], [45, 0], [0, -100]], ticks: [0, 1, 1], right: [false, false, false] },
  triEqui: { pts: [[-50, 0], [50, 0], [0, -86.6]], ticks: [1, 1, 1], right: [false, false, false] },
  maison: { pts: [[0, 0], [80, 0], [80, -50], [40, -85], [0, -50]], ticks: [0, 0, 0, 0, 0], right: [false, false, false, false, false] },
  para: { pts: [[0, 0], [100, 0], [130, -60], [30, -60]], ticks: [0, 0, 0, 0], right: [false, false, false, false] },
};

export const shapePoints = (f: ShapeKind, rot = 0): P[] => SHAPES[f].pts.map((p) => turn(p, rot));

export interface GeoArtOpts {
  /** Largeur en pixels pour 200 unités de dessin. */
  size?: number;
  /** Couleur forte (rayons, axes) et claire (intérieur des figures). */
  fort?: string;
  clair?: string;
  /** Couleur vive des éléments à repérer : segment du cercle, axe en pointillés, traits d'aide. */
  accent?: string;
  /** Dessin d'aide : angle droit de référence, droites prolongées, angles droits marqués. */
  aid?: boolean;
}

interface Drawing {
  body: string;
  /** Points à faire tenir dans le cadre. */
  pts: P[];
}

/** Petit carré d'angle droit au sommet v, entre les directions u1 et u2. */
const rightMark = (v: P, u1: P, u2: P, s = 13): string =>
  `<path d="${path([add(v, u1, s), add(add(v, u1, s), u2, s), add(v, u2, s)])}" fill="none" stroke="${INK}" stroke-width="2.5"/>`;

/** Traits de codage (k traits) au milieu du côté ab. */
function ticks(a: P, b: P, k: number): string {
  if (!k) return '';
  const t = unit(a, b), n: P = [-t[1], t[0]], m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let s = '';
  for (let j = 0; j < k; j++) {
    const c = add(m, t, (j - (k - 1) / 2) * 6);
    s += `<path d="${path([add(c, n, -7), add(c, n, 7)])}" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
  }
  return s;
}

function polygon(f: ShapeKind, rot: number, clair: string, coded: boolean): Drawing {
  const sh = SHAPES[f], pts = shapePoints(f, rot), n = pts.length;
  let body = `<path d="${path(pts, true)}" fill="${clair}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  if (coded) {
    pts.forEach((p, i) => {
      body += ticks(p, pts[(i + 1) % n]!, sh.ticks[i]!);
      if (sh.right[i]) body += rightMark(p, unit(p, pts[(i + n - 1) % n]!), unit(p, pts[(i + 1) % n]!));
    });
  }
  return { body, pts };
}

function angle(deg: number, rot: number, o: Required<GeoArtOpts>): Drawing {
  const v: P = [0, 0], L = 95, r = 28, e1 = add(v, dir(rot), L), e2 = add(v, dir(rot + deg), L);
  let body = '';
  if (o.aid && deg === 90) body += rightMark(v, dir(rot), dir(rot + 90), 18);
  else body += `<path d="M0 0 L${pt(add(v, dir(rot), r))} A${r} ${r} 0 ${deg > 180 ? 1 : 0} 0 ${pt(add(v, dir(rot + deg), r))}Z" fill="${o.clair}" stroke="${o.fort}" stroke-width="3"/>`;
  const pts: P[] = [v, e1, e2];
  // Aide : l'angle droit de référence (le coin de l'équerre), en pointillés, posé sur le premier côté.
  if (o.aid && deg !== 90) {
    const ref = add(v, dir(rot + 90), L * 0.8);
    body += `<path d="${path([v, ref])}" stroke="${o.accent}" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>${rightMark(v, dir(rot), dir(rot + 90), 14)}`;
    pts.push(ref);
  }
  body += `<path d="${path([e1, v, e2])}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="0" cy="0" r="4.5" fill="${INK}"/>`;
  return { body, pts };
}

const ends = (s: Seg): [P, P] => [add([s.x, s.y], dir(s.t), s.s0), add([s.x, s.y], dir(s.t), s.s1)];

/** Point de rencontre des deux droites (paramètres le long de chacune), ou null si elles sont parallèles. */
export function meet(a: Seg, b: Seg): { p: P; ta: number; tb: number } | null {
  const d1 = dir(a.t), d2 = dir(b.t), den = d1[0] * d2[1] - d1[1] * d2[0];
  if (Math.abs(den) < 1e-9) return null;
  const dx = b.x - a.x, dy = b.y - a.y, ta = (dx * d2[1] - dy * d2[0]) / den, tb = (dx * d1[1] - dy * d1[0]) / den;
  return { p: add([a.x, a.y], d1, ta), ta, tb };
}

/** Les deux segments se touchent-ils sur le dessin ? */
export const linesTouch = (l: readonly [Seg, Seg]): boolean => {
  const m = meet(l[0], l[1]);
  return !!m && m.ta >= l[0].s0 - 0.5 && m.ta <= l[0].s1 + 0.5 && m.tb >= l[1].s0 - 0.5 && m.tb <= l[1].s1 + 0.5;
};

function lines(l: readonly [Seg, Seg], o: Required<GeoArtOpts>): Drawing {
  const pts: P[] = [];
  let body = '';
  const m = meet(l[0], l[1]);
  // Aide : les droites prolongées jusqu'à leur point de rencontre, et l'angle droit s'il y en a un.
  if (o.aid && m) {
    for (const [s, t] of [[l[0], m.ta], [l[1], m.tb]] as const) {
      if (t < s.s0 || t > s.s1) {
        const from = add([s.x, s.y], dir(s.t), t < s.s0 ? s.s0 : s.s1);
        body += `<path d="${path([from, m.p])}" stroke="${o.accent}" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>`;
      }
    }
    const diff = (((l[1].t - l[0].t) % 180) + 180) % 180;
    if (Math.abs(diff - 90) < 1e-6) {
      const u1 = m.ta < l[0].s1 - 1 ? dir(l[0].t) : dir(l[0].t + 180), u2 = m.tb < l[1].s1 - 1 ? dir(l[1].t) : dir(l[1].t + 180);
      body += rightMark(m.p, u1, u2, 14);
    }
    pts.push(m.p);
  }
  for (const s of l) {
    const [a, b] = ends(s);
    body += `<path d="${path([a, b])}" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
    pts.push(a, b);
  }
  return { body, pts };
}

function circle(seg: 'rayon' | 'diametre', rot: number, o: Required<GeoArtOpts>): Drawing {
  const r = 62, a = seg === 'rayon' ? ([0, 0] as P) : add([0, 0], dir(rot), -r), b = add([0, 0], dir(rot), r), lab = add([0, 0], dir(rot + (seg === 'rayon' ? 180 : 90)), 15);
  const body =
    `<circle cx="0" cy="0" r="${r}" fill="${o.clair}" stroke="${INK}" stroke-width="4"/>` +
    `<path d="${path([a, b])}" stroke="${o.accent}" stroke-width="6" stroke-linecap="round"/>` +
    `<circle cx="0" cy="0" r="4" fill="${INK}"/><circle cx="${n1(b[0])}" cy="${n1(b[1])}" r="4" fill="${o.accent}"/>` +
    `<text x="${n1(lab[0])}" y="${n1(lab[1] + 5)}" text-anchor="middle" font-size="16" font-weight="700" fill="${INK}">O</text>`;
  return { body, pts: [[-r, -r], [r, r]] };
}

function axis(f: ShapeKind, rot: number, ax: readonly [number, number, number, number], o: Required<GeoArtOpts>): Drawing {
  const shape = polygon(f, rot, o.clair, false);
  const a = turn([ax[0], ax[1]], rot), b = turn([ax[2], ax[3]], rot), u = unit(a, b), a2 = add(a, u, -20), b2 = add(b, u, 20);
  return { body: shape.body + `<path d="${path([a2, b2])}" stroke="${o.accent}" stroke-width="3.5" stroke-dasharray="9 7" stroke-linecap="round"/>`, pts: [...shape.pts, a2, b2] };
}

function dims(w: number, h: number, o: Required<GeoArtOpts>): Drawing {
  const k = Math.min(30, 150 / Math.max(w, h)), W = w * k, H = h * k, pts: P[] = [[0, 0], [W, 0], [W, -H], [0, -H]], sq = w === h;
  let body = `<path d="${path(pts, true)}" fill="${o.clair}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  pts.forEach((p, i) => {
    body += rightMark(p, unit(p, pts[(i + 3) % 4]!), unit(p, pts[(i + 1) % 4]!), 11);
    if (sq) body += ticks(p, pts[(i + 1) % 4]!, 1);
  });
  const txt = (x: number, y: number, s: string, anchor: string) => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="17" font-weight="700" fill="${INK}">${s}</text>`;
  body += txt(W / 2, 26, `${w} cm`, 'middle');
  if (!sq) body += txt(W + 10, -H / 2 + 6, `${h} cm`, 'start');
  return { body, pts: [...pts, [W / 2 - 30, 30], [sq ? W : W + 62, -H / 2]] };
}

/** Dessin de géométrie, cadré au plus juste. */
export function geoArt(pic: GeoPic, opts: GeoArtOpts = {}): string {
  const o: Required<GeoArtOpts> = { size: 220, fort: '#3E5468', clair: '#E0E7EE', accent: '#C2410C', aid: false, ...opts };
  const d =
    pic.k === 'angle' ? angle(pic.deg, pic.rot, o)
    : pic.k === 'lines' ? lines(pic.l, o)
    : pic.k === 'shape' ? polygon(pic.f, pic.rot, o.clair, true)
    : pic.k === 'circle' ? circle(pic.seg, pic.rot, o)
    : pic.k === 'axis' ? axis(pic.f, pic.rot, pic.ax, o)
    : dims(pic.w, pic.h, o);
  const pad = 14, xs = d.pts.map((p) => p[0]), ys = d.pts.map((p) => p[1]);
  const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad, w = Math.max(...xs) - x0 + pad, h = Math.max(...ys) - y0 + pad, k = o.size / 200;
  return `<svg width="${Math.round(w * k)}" height="${Math.round(h * k)}" viewBox="${n1(x0)} ${n1(y0)} ${n1(w)} ${n1(h)}" aria-hidden="true" style="max-width:100%;height:auto">${d.body}</svg>`;
}

const SHAPE_LABEL: Record<ShapeKind, string> = {
  carre: 'Une figure à 4 côtés : les 4 côtés sont marqués de même longueur, et les 4 angles sont marqués droits.',
  rect: 'Une figure à 4 côtés : les côtés opposés sont marqués de même longueur deux à deux, et les 4 angles sont marqués droits.',
  losange: "Une figure à 4 côtés : les 4 côtés sont marqués de même longueur, et aucun angle n'est droit.",
  triRect: 'Une figure à 3 côtés de longueurs différentes, dont un angle est marqué droit.',
  triIso: 'Une figure à 3 côtés : 2 côtés sont marqués de même longueur.',
  triEqui: 'Une figure à 3 côtés : les 3 côtés sont marqués de même longueur.',
  maison: 'Une figure à 5 côtés, en forme de maison.',
  para: 'Une figure à 4 côtés, penchée, sans angle droit.',
};
const SHAPE_SIDES: Record<ShapeKind, string> = { carre: 'à 4 côtés', rect: 'à 4 côtés', losange: 'à 4 côtés', triRect: 'à 3 côtés', triIso: 'à 3 côtés', triEqui: 'à 3 côtés', maison: 'à 5 côtés, en forme de maison', para: 'à 4 côtés' };

/** Description du dessin pour les lecteurs d'écran : ce qu'on voit, sans donner la réponse. */
export function geoLabel(pic: GeoPic): string {
  if (pic.k === 'angle') return 'Un angle : deux côtés qui partent du même point.';
  if (pic.k === 'lines') return linesTouch(pic.l) ? 'Deux droites qui se croisent.' : 'Deux droites qui ne se touchent pas sur le dessin.';
  if (pic.k === 'shape') return SHAPE_LABEL[pic.f];
  if (pic.k === 'circle') return pic.seg === 'rayon' ? "Un cercle de centre O ; un segment en couleur va du centre O jusqu'au cercle." : "Un cercle de centre O ; un segment en couleur va d'un bord du cercle à l'autre en passant par O.";
  if (pic.k === 'axis') return `Une figure ${SHAPE_SIDES[pic.f]}, traversée par une ligne en pointillés.`;
  return pic.w === pic.h ? `Un carré dont le côté mesure ${pic.w} cm.` : `Un rectangle de ${pic.w} cm de longueur et ${pic.h} cm de largeur.`;
}
