/* Question à dessins du CP (grandeurs, espace) : le dessin en grand (ou le mot à trouver), trois réponses écrites
   ou dessinées ; la voix lit la consigne et les réponses écrites. */
import { picArt } from '../art';
import { Svg } from '../app/ui';
import { picLabel } from '../content/picquiz';
import { optionText } from '../engine/picquiz';
import type { Question } from '../engine/questions';

export function PicCard({ q }: { q: Question }) {
  const c = q.picq!;
  return (
    <div class="pic-card">
      {c.pic ? (
        <span class="pic-art" role="img" aria-label={c.alt ?? picLabel(c.pic)}><Svg html={picArt(c.pic, 150)} /></span>
      ) : c.big ? (
        <p class="pic-big">{c.big}</p>
      ) : null}
    </div>
  );
}

interface Picked {
  value: number | boolean;
  ok: boolean;
}

export function PicAnswers({ q, picked, locked, onPick }: { q: Question; picked: Picked | null; locked: boolean; onPick: (v: number) => void }) {
  const c = q.picq!, cls = (i: number) => (!picked ? '' : i === q.p ? 'ok' : i === picked.value ? 'help' : 'off');
  // Monnaie : une rangée par porte-monnaie, sur toute la largeur ; les autres dessins côte à côte.
  const wide = c.pics && c.options.some((o) => o.startsWith('money:') && o.split(',').length > 1);
  return (
    <div class={`choices pic-choices${c.pics ? ' pics' : ''}${wide ? ' wide' : ''}`}>
      {c.options.map((o, i) => (
        <button key={o} class={`choice ${cls(i)}`} aria-label={c.pics ? picLabel(o) : undefined} onClick={() => !locked && onPick(i)}>
          {c.pics ? <Svg html={picArt(o, wide ? 100 : 96, { maxW: 300 })} /> : o}
        </button>
      ))}
    </div>
  );
}

/** Aide : le dessin de la bonne réponse (ou de la question), avec ses repères (coins numérotés, ligne et colonne). */
export function PicAid({ q }: { q: Question }) {
  const c = q.picq!, code = c.pics ? c.options[q.p]! : c.pic;
  return code ? <div class="num-card pic-aid"><Svg html={picArt(code, 110, { aid: true })} /></div> : null;
}

/** Bonne réponse, en texte (feuille de réponse, voix). */
export const picRight = (q: Question): string => optionText(q.picq!, q.picq!.options[q.p]!);
