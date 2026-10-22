/* Question de géométrie (CM1) : le dessin éventuel, l'énoncé, deux ou trois réponses écrites. */
import { geoArt, geoLabel } from '../art';
import { Svg } from '../app/ui';
import { GEO_ZONE } from '../content/series';
import type { Question } from '../engine/questions';

const COLORS = { fort: GEO_ZONE.fort, clair: GEO_ZONE.clair };

export function GeoCard({ q }: { q: Question }) {
  const g = q.geo!;
  return (
    <div class="frac-card geo-card">
      {g.pic && (
        <span class="geo-pic" role="img" aria-label={geoLabel(g.pic)}>
          <Svg html={geoArt(g.pic, { ...COLORS, size: 210 })} />
        </span>
      )}
      <p class="frac-q geo-q">{g.text}</p>
    </div>
  );
}

interface Picked {
  value: number | boolean;
  ok: boolean;
}

export function GeoAnswers({ q, picked, locked, onPick }: { q: Question; picked: Picked | null; locked: boolean; onPick: (v: number) => void }) {
  const cls = (i: number) => (!picked ? '' : i === q.p ? 'ok' : i === picked.value ? 'help' : 'off');
  const o = q.geo!.options;
  return (
    <div class={`choices geo-choices${o.length === 2 ? ' two' : ''}`}>
      {o.map((w, i) => (
        <button key={w} class={`choice ${cls(i)}`} onClick={() => !locked && onPick(i)}>{w}</button>
      ))}
    </div>
  );
}

/** Aide : le dessin repris avec ce qui aide à voir (coin de l'équerre, droites prolongées, angle droit). */
export function GeoAid({ q }: { q: Question }) {
  const g = q.geo!;
  return g.pic ? (
    <div class="num-card" role="img" aria-label={geoLabel(g.pic)}>
      <Svg html={geoArt(g.pic, { ...COLORS, size: 140, aid: true })} />
    </div>
  ) : null;
}

export const geoRight = (q: Question): string => q.geo!.options[q.p]!;
