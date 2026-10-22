import { describe, expect, it } from 'vitest';
import { geoArt, geoLabel, linesTouch, meet, shapePoints } from '../art/geometry';
import { GEO_SETS, type GeoItem, type ShapeKind } from '../content/geometry';
import { lookOf } from '../content/isles';
import { spoken, tipOf } from '../content/messages';
import { CURRICULUM, GEO_ZONE, OP_KEY, seriesOf } from '../content/series';
import { contrast } from '../design/color';
import { geoFactLabel } from './geometry';
import { factKey, parseFact } from './keys';
import { seriesBossPlan, seriesStepPlan } from './plan';
import { generateQuestion } from './questions';
import { seeded } from './random';
import { factsOf } from './series';

type P = readonly [number, number];
const all = (): GeoItem[] => GEO_SETS.flatMap((s) => s.items);
const dist = (a: P, b: P): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
const near = (a: number, b: number): boolean => Math.abs(a - b) < 0.5;
/** Angle (degrés) au sommet i d'un polygone. */
const angleAt = (pts: readonly P[], i: number): number => {
  const n = pts.length, v = pts[i]!, a = pts[(i + n - 1) % n]!, b = pts[(i + 1) % n]!;
  const u = [a[0] - v[0], a[1] - v[1]], w = [b[0] - v[0], b[1] - v[1]];
  return (Math.acos((u[0]! * w[0]! + u[1]! * w[1]!) / (Math.hypot(u[0]!, u[1]!) * Math.hypot(w[0]!, w[1]!))) * 180) / Math.PI;
};
const sides = (f: ShapeKind): number[] => {
  const p = shapePoints(f);
  return p.map((x, i) => dist(x, p[(i + 1) % p.length]!));
};
/** Symétrique du point p par rapport à la droite (a, b). */
const reflect = (p: P, a: P, b: P): P => {
  const dx = b[0] - a[0], dy = b[1] - a[1], t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const h = [a[0] + t * dx, a[1] + t * dy];
  return [2 * h[0]! - p[0], 2 * h[1]! - p[1]];
};

describe('géométrie (CM1)', () => {
  it('au CM1, juste avant le français ; 4 îles, les angles ouverts au départ ; clés « 2o5 »', () => {
    expect(CURRICULUM.CM1.indexOf('geo')).toBe(CURRICULUM.CM1.indexOf('fr') - 1);
    expect(seriesOf('geo').map((s) => s.id)).toEqual(['geo-angle', 'geo-droite', 'geo-figure', 'geo-sym']);
    expect(seriesOf('geo').map((s) => s.need)).toEqual([0, 1, 1, 2]);
    expect(OP_KEY.geo).toBe('o');
    expect(factKey('geo', 2, 5)).toBe('2o5');
    expect(parseFact('4o24')).toEqual({ op: 'geo', a: 4, b: 24 });
    expect(seriesOf('geo').map((s) => lookOf(s.id).name)).toEqual(['Équerre', 'Rails', 'Mosaïque', 'Miroir']);
  });

  it('couleur de zone : texte blanc lisible (≥ 5:1), encre lisible sur le fond clair', () => {
    expect(contrast(GEO_ZONE.fort, '#FFFFFF')).toBeGreaterThanOrEqual(5);
    expect(contrast('#1E2440', GEO_ZONE.clair)).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#4D5675', GEO_ZONE.clair)).toBeGreaterThanOrEqual(4.5);
  });

  it('contenu : 2 ou 3 réponses distinctes, une seule bonne, une astuce, pas de question en double', () => {
    for (const s of GEO_SETS) {
      expect(s.items.length, s.id).toBeGreaterThanOrEqual(20);
      const keys = s.items.map((it) => it.q + JSON.stringify(it.pic ?? null));
      expect(new Set(keys).size, s.id).toBe(keys.length);
      for (const it of s.items) {
        expect(it.x.length, it.q).toBeGreaterThanOrEqual(1);
        expect(it.x.length, it.q).toBeLessThanOrEqual(2);
        expect(new Set([it.a, ...it.x]).size, it.q).toBe(it.x.length + 1);
        expect(it.tip, it.q).toBeTruthy();
      }
    }
  });

  it('angles : le dessin a bien la mesure annoncée, et jamais un angle « presque droit »', () => {
    for (const it of GEO_SETS[0]!.items) {
      if (it.pic?.k !== 'angle') continue;
      const d = it.pic.deg;
      expect(it.a).toBe(d === 90 ? 'angle droit' : d < 90 ? 'angle aigu' : 'angle obtus');
      if (d !== 90) expect(d <= 65 || d >= 115, `${d}°`).toBe(true);
    }
  });

  it('droites : parallèles = même direction, perpendiculaires = 90°, sécantes sinon (et elles se rencontrent)', () => {
    for (const it of GEO_SETS[1]!.items) {
      if (it.pic?.k !== 'lines') continue;
      const [l1, l2] = it.pic.l, diff = (((l2.t - l1.t) % 180) + 180) % 180;
      if (it.a === 'parallèles') {
        expect(diff).toBe(0);
        expect(meet(l1, l2)).toBeNull();
        expect(linesTouch(it.pic.l)).toBe(false);
      } else if (it.a === 'perpendiculaires') {
        expect(diff).toBe(90);
        expect(linesTouch(it.pic.l)).toBe(true);
      } else {
        expect(diff === 0 || diff === 90, `${diff}°`).toBe(false);
        expect(Math.min(diff, 180 - diff), 'assez penchées pour se voir').toBeGreaterThanOrEqual(15);
        expect(meet(l1, l2)).not.toBeNull();
      }
    }
    // Le piège : des sécantes qui ne se touchent pas sur le dessin.
    expect(GEO_SETS[1]!.items.some((it) => it.pic?.k === 'lines' && it.a.startsWith('sécantes') && !linesTouch(it.pic.l))).toBe(true);
  });

  it('figures : les dessins ont vraiment les propriétés de leur nom', () => {
    const eq = (xs: number[]) => xs.every((x) => near(x, xs[0]!));
    const rights = (f: ShapeKind) => shapePoints(f).map((_, i) => near(angleAt(shapePoints(f), i), 90));
    expect(eq(sides('carre')) && rights('carre').every(Boolean)).toBe(true);
    expect(rights('rect').every(Boolean) && !eq(sides('rect'))).toBe(true);
    expect(eq(sides('losange')) && !rights('losange').some(Boolean)).toBe(true);
    expect(rights('triRect')).toEqual([true, false, false]);
    expect(new Set(sides('triRect').map(Math.round)).size).toBe(3);
    const iso = sides('triIso');
    expect(near(iso[1]!, iso[2]!) && !near(iso[0]!, iso[1]!) && !rights('triIso').some(Boolean)).toBe(true);
    expect(eq(sides('triEqui'))).toBe(true);
    // Le parallélogramme n'a pas d'angle droit (il sert de piège en symétrie).
    expect(rights('para').some(Boolean)).toBe(false);
  });

  it('symétrie : « oui » si et seulement si la figure repliée sur la ligne retombe sur elle-même', () => {
    for (const it of GEO_SETS[3]!.items) {
      if (it.pic?.k !== 'axis') continue;
      const pts = shapePoints(it.pic.f), a: P = [it.pic.ax[0], it.pic.ax[1]], b: P = [it.pic.ax[2], it.pic.ax[3]];
      const sym = pts.every((p) => pts.some((q) => dist(reflect(p, a, b), q) < 0.5));
      expect(it.a, `${it.pic.f} ${it.pic.ax.join(',')}`).toBe(sym ? 'oui' : 'non');
    }
  });

  it('périmètre : la bonne réponse est le tour ; ni la surface ni le demi-tour ne tombent juste', () => {
    for (const it of GEO_SETS[3]!.items) {
      if (it.pic?.k !== 'dims') continue;
      const { w, h } = it.pic, val = (s: string) => Number(s.replace(/\D+$/, '').replace(/\s/g, ''));
      expect(val(it.a)).toBe(2 * (w + h));
      for (const x of it.x) expect(val(x)).not.toBe(2 * (w + h));
    }
  });

  it('dessins : SVG cadré sans valeur manquante ; la description ne donne jamais la réponse', () => {
    for (const it of all()) {
      if (!it.pic) continue;
      for (const aid of [false, true]) {
        const svg = geoArt(it.pic, { aid });
        expect(svg).toMatch(/^<svg [^>]*viewBox="[-\d. ]+"/);
        expect(svg).not.toMatch(/NaN|undefined|Infinity/);
      }
      const label = geoLabel(it.pic).toLowerCase();
      expect(label.length).toBeGreaterThan(10);
      if (it.pic.k !== 'dims') expect(label, it.q).not.toContain(it.a.toLowerCase());
    }
  });

  it('questions valides ; énoncé lu, astuce, libellé parent ; sessions de 10 questions', () => {
    const rng = seeded(4);
    for (const s of seriesOf('geo')) for (const f of factsOf(s)) {
      const q = generateQuestion({ series: s, fact: f, fmt: 'pave', rng });
      expect(q.fmt).toBe('qcm');
      expect(q.geo!.options[q.p]).toBe(GEO_SETS[f.a - 1]!.items[f.b - 1]!.a);
      expect(spoken(q)).toBe(q.geo!.text);
      expect(tipOf(q)).toBeTruthy();
    }
    expect(geoFactLabel(4, 10)).toEqual({ q: 'Quel est le périmètre de ce rectangle ?', a: '16 cm' });
    const base = { traps: [], trapLog: {}, mastered: [], today: '2026-10-21' as const, rng };
    for (const s of seriesOf('geo')) {
      expect(seriesStepPlan({ ...base, series: s.id, stepIdx: 0 })).toHaveLength(10);
      expect(seriesBossPlan(s.id, rng)).toHaveLength(10);
    }
  });
});
