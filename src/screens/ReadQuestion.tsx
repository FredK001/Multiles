/* Question de lecture (CP) : réécouter le son (ou voir l'écriture à retrouver), trois écritures, l'aide. */
import { icoSay } from '../art';
import { speak } from '../audio';
import { Svg } from '../app/ui';
import type { Question } from '../engine/questions';

/** Dit le son ou le mot de la question. */
export const sayRead = (q: Question): void => speak([{ text: q.read!.say, lang: 'fr' }]);

export function ReadCard({ q }: { q: Question }) {
  const r = q.read!;
  if (q.fmt === 'qcm') return <p class="read-target" aria-label={`Trouve : ${r.target}`}>{r.target}</p>;
  return (
    <button class="eng-listen read-listen" aria-label="Réécouter" onClick={() => sayRead(q)}>
      <Svg html={icoSay} />
      <span>Réécouter</span>
    </button>
  );
}

interface Picked {
  value: number | boolean;
  ok: boolean;
}

export function ReadAnswers({ q, picked, locked, onPick }: { q: Question; picked: Picked | null; locked: boolean; onPick: (v: number) => void }) {
  const cls = (i: number) => (!picked ? '' : i === q.p ? 'ok' : i === picked.value ? 'help' : 'off');
  return (
    <div class="choices read-choices">
      {q.read!.options.map((w, i) => (
        <button key={w} class={`choice ${cls(i)}`} onClick={() => !locked && onPick(i)}>{w}</button>
      ))}
    </div>
  );
}

/** Aide : la bonne écriture en grand, à réécouter. */
export function ReadAid({ q }: { q: Question }) {
  const r = q.read!;
  return (
    <div class="read-aid">
      <b>{r.target}</b>
      <button class="btn-say" aria-label={`Écouter « ${r.say} »`} onClick={() => sayRead(q)}><Svg html={icoSay} /><span>Écouter</span></button>
    </div>
  );
}
