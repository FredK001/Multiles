/* Question de fractions et décimaux (CM1) : l'énoncé, le dessin éventuel, trois réponses écrites. */
import { fractionArt } from '../art';
import { Svg } from '../app/ui';
import type { Question } from '../engine/questions';

export function FracCard({ q }: { q: Question }) {
  const f = q.frac!;
  return (
    <div class="frac-card">
      {f.pic && (
        <span role="img" aria-label={`${f.pic.d >= 8 ? 'Une barre' : 'Un disque'} partagé en ${f.pic.d} parts égales, dont ${f.pic.n} ${f.pic.n > 1 ? 'sont coloriées' : 'est coloriée'}.`}>
          <Svg html={fractionArt(f.pic.n, f.pic.d)} />
        </span>
      )}
      <p class="frac-q">{f.text}</p>
    </div>
  );
}

interface Picked {
  value: number | boolean;
  ok: boolean;
}

export function FracAnswers({ q, picked, locked, onPick }: { q: Question; picked: Picked | null; locked: boolean; onPick: (v: number) => void }) {
  const cls = (i: number) => (!picked ? '' : i === q.p ? 'ok' : i === picked.value ? 'help' : 'off');
  return (
    <div class="choices frac-choices">
      {q.frac!.options.map((w, i) => (
        <button key={w} class={`choice ${cls(i)}`} onClick={() => !locked && onPick(i)}>{w}</button>
      ))}
    </div>
  );
}

/** Aide : le dessin de la fraction, s'il y en a un. */
export function FracAid({ q }: { q: Question }) {
  const f = q.frac!;
  return f.pic ? <div class="num-card"><Svg html={fractionArt(f.pic.n, f.pic.d, 100)} /></div> : null;
}

export const fracRight = (q: Question): string => q.frac!.options[q.p]!;
