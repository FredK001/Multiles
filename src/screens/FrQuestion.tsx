/* Question de français : la phrase à trou, les deux mots, et l'aide (la règle de la paire). */
import { beforeWord, quizOf, withPronoun, type Person } from '../content/french';
import { frAnswer } from '../engine/french';
import type { Question } from '../engine/questions';

/** Phrase avec ses trous ; une fois la réponse donnée, le bon mot s'y inscrit. */
export function FrCard({ q, revealed }: { q: Question; revealed: boolean }) {
  const f = q.fr!, parts = f.text.split('___'), word = f.options[q.p]!;
  // Une fois le mot inscrit, « je » s'élide devant une voyelle (« j'ai chanté »).
  const shown = revealed ? parts.map((part, i) => (i < parts.length - 1 ? beforeWord(part, word) : part)) : parts;
  return (
    <>
      {f.verb && <span class="fr-verb">Verbe <b>{f.verb}</b></span>}
      <p class="fr-sent">
        {shown.map((part, i) => (
          <span key={i}>
            {i > 0 && (revealed ? <b class="fr-word">{i === 1 && !shown[0] ? word.charAt(0).toUpperCase() + word.slice(1) : word}</b> : <span class="fr-blank" aria-label="mot à trouver">?</span>)}
            {part}
          </span>
        ))}
      </p>
    </>
  );
}

interface Picked {
  value: number | boolean;
  ok: boolean;
}

export function FrAnswers({ q, picked, locked, onPick }: { q: Question; picked: Picked | null; locked: boolean; onPick: (v: number) => void }) {
  const cls = (i: number) => (!picked ? '' : i === q.p ? 'ok' : i === picked.value ? 'help' : 'off');
  return (
    <div class={`choices fr-choices${q.fr!.options.length > 2 ? ' three' : ''}`}>
      {q.fr!.options.map((w, i) => (
        <button key={w} class={`choice ${cls(i)}`} onClick={() => !locked && onPick(i)}>{w}</button>
      ))}
    </div>
  );
}

/** Aide après une erreur : les deux règles de la paire, celle du bon mot en premier ;
    en conjugaison, le verbe au temps de l'île, la bonne personne en évidence. */
export function FrAid({ q }: { q: Question }) {
  const f = q.fr!, quiz = quizOf(f.quiz), item = quiz.items[q.b - 1]!;
  if (quiz.tense && item.verb && item.who !== undefined) {
    return <ConjTable verb={item.verb} forms={quiz.tense.tables[item.verb]!} on={item.who} title={`${item.verb}, ${quiz.tense.name}`} />;
  }
  const right = f.options[q.p]!, other = f.options[1 - q.p]!;
  return (
    <div class="fr-aid">
      <p class="fr-rule ok">{quiz.rule[right]}</p>
      <p class="fr-rule">{quiz.rule[other]}</p>
    </div>
  );
}

export const frRight = (q: Question): string => frAnswer(q);

/** Tableau de conjugaison d'un verbe (6 personnes) ; `on` = la personne à repérer. */
export function ConjTable({ verb, forms, on, title }: { verb: string; forms: readonly string[]; on?: number; title: string }) {
  return (
    <div class="conj" role="group" aria-label={title}>
      <p class="conj-t">{title}</p>
      <ul>
        {forms.map((x, i) => <li key={verb + i} class={i === on ? 'on' : ''}>{withPronoun(i as Person, x).replace(/^il /, 'il/elle ').replace(/^ils /, 'ils/elles ').replace(/ allé(s?)$/, ' allé(e)$1')}</li>)}
      </ul>
    </div>
  );
}
