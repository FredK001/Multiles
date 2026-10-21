/* Questions de français : une phrase à trou, les deux mots de la paire. */
import { fillBlank, quizOf, type FrQuizId } from '../content/french';
import type { SeriesDef } from '../content/series';
import type { Fact } from './series';

export interface FrQ {
  quiz: FrQuizId;
  /** Phrase à trou. */
  text: string;
  /** Les deux mots, dans l'ordre de la paire. */
  options: readonly string[];
}

/** Paire d'une série de français. */
export const quizOfSeries = (s: SeriesDef) => {
  if (s.spec.kind !== 'quiz') throw new RangeError(`${s.id} n'est pas une série de français`);
  return quizOf(s.spec.quiz);
};

/** Question sur la phrase `f.b` de la série ; `p` = indice du bon mot. */
export function frDraft(s: SeriesDef, f: Fact): { fr: FrQ; p: number } {
  const q = quizOfSeries(s), item = q.items[f.b - 1]!;
  return { fr: { quiz: q.id, text: item.s, options: q.choices }, p: q.choices.indexOf(item.a) };
}

/** Phrase complète, avec le bon mot. */
export const frAnswer = (q: { fr?: FrQ; p: number }): string => (q.fr ? fillBlank(q.fr.text, q.fr.options[q.p]!) : '');

/** Phrase d'une clé de français, pour l'espace parent et la grille : « Léo a un vélo rouge. » (a ou à). */
export function frFactLabel(a: number, b: number): { text: string; pair: string } {
  const s = (['a', 'et', 'son', 'on'] as const)[a - 1];
  if (!s) return { text: '?', pair: '' };
  const q = quizOf(s), item = q.items[b - 1];
  return item ? { text: fillBlank(item.s, item.a), pair: q.title } : { text: '?', pair: q.title };
}
