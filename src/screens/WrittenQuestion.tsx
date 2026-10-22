/* Question de grands nombres ou de mesures (CM1) : l'énoncé, l'horloge éventuelle, trois réponses écrites. */
import { clockArt, clockLabel } from '../art';
import { Svg } from '../app/ui';
import { MES_ZONE } from '../content/series';
import type { Question } from '../engine/questions';
import type { WrittenQ } from '../engine/written';

/** Contenu écrit de la question (grands nombres ou mesures). */
export const writtenOf = (q: Question): WrittenQ => (q.op === 'big' ? q.big! : q.mes!);

/** Horloge à aiguilles décrite pour les lecteurs d'écran. */
function ClockPic({ h, m, size }: { h: number; m: number; size?: number }) {
  return (
    <span role="img" aria-label={clockLabel(h, m)} class="wr-clock">
      <Svg html={clockArt(h, m, size, MES_ZONE.fort)} />
    </span>
  );
}

export function WrittenCard({ q }: { q: Question }) {
  const w = writtenOf(q);
  return (
    <div class="frac-card wr-card">
      {w.clock && <ClockPic h={w.clock.h} m={w.clock.m} />}
      <p class={`frac-q wr-q${w.text.length > 40 ? ' long' : ''}`}>{w.text}</p>
    </div>
  );
}

interface Picked {
  value: number | boolean;
  ok: boolean;
}

export function WrittenAnswers({ q, picked, locked, onPick }: { q: Question; picked: Picked | null; locked: boolean; onPick: (v: number) => void }) {
  const cls = (i: number) => (!picked ? '' : i === q.p ? 'ok' : i === picked.value ? 'help' : 'off');
  const o = writtenOf(q).options, long = o.some((w) => w.length > 12);
  return (
    <div class={`choices frac-choices wr-choices${long ? ' long' : ''}`}>
      {o.map((w, i) => (
        <button key={w} class={`choice ${cls(i)}`} onClick={() => !locked && onPick(i)}>{w}</button>
      ))}
    </div>
  );
}

/** Aide : l'horloge, s'il y en a une. */
export function WrittenAid({ q }: { q: Question }) {
  const c = writtenOf(q).clock;
  return c ? <div class="num-card"><ClockPic h={c.h} m={c.m} size={110} /></div> : null;
}

export const writtenRight = (q: Question): string => writtenOf(q).options[q.p]!;
