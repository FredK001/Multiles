/* Question de français : la phrase à trou, les deux mots, et l'aide (la règle de la paire). */
import { quizOf } from '../content/french';
import { frAnswer } from '../engine/french';
import type { Question } from '../engine/questions';

/** Phrase avec ses trous ; une fois la réponse donnée, le bon mot s'y inscrit. */
export function FrCard({ q, revealed }: { q: Question; revealed: boolean }) {
  const f = q.fr!, parts = f.text.split('___'), word = f.options[q.p]!;
  return (
    <p class="fr-sent">
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && (revealed ? <b class="fr-word">{i === 1 && !parts[0] ? word.charAt(0).toUpperCase() + word.slice(1) : word}</b> : <span class="fr-blank" aria-label="mot à trouver">?</span>)}
          {part}
        </span>
      ))}
    </p>
  );
}

interface Picked {
  value: number | boolean;
  ok: boolean;
}

export function FrAnswers({ q, picked, locked, onPick }: { q: Question; picked: Picked | null; locked: boolean; onPick: (v: number) => void }) {
  const cls = (i: number) => (!picked ? '' : i === q.p ? 'ok' : i === picked.value ? 'help' : 'off');
  return (
    <div class="choices fr-choices">
      {q.fr!.options.map((w, i) => (
        <button key={w} class={`choice ${cls(i)}`} onClick={() => !locked && onPick(i)}>{w}</button>
      ))}
    </div>
  );
}

/** Aide après une erreur : les deux règles de la paire, celle du bon mot en premier. */
export function FrAid({ q }: { q: Question }) {
  const f = q.fr!, quiz = quizOf(f.quiz), right = f.options[q.p]!, other = f.options[1 - q.p]!;
  return (
    <div class="fr-aid">
      <p class="fr-rule ok"><b>{right}</b> {quiz.rule[right]}</p>
      <p class="fr-rule"><b>{other}</b> {quiz.rule[other]}</p>
    </div>
  );
}

export const frRight = (q: Question): string => frAnswer(q);
