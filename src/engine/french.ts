/* Questions de français : une phrase à trou, les deux mots de la paire. */
import { ALL_QUIZZES, fillBlank, quizOf, type FrQuizId } from '../content/french';
import type { SeriesDef } from '../content/series';
import { defaultRng, shuffle, type Rng } from './random';
import type { Fact } from './series';

export interface FrQ {
  quiz: FrQuizId;
  /** Phrase à trou. */
  text: string;
  /** Les deux mots, dans l'ordre de la paire ; en conjugaison, les trois formes mélangées. */
  options: readonly string[];
  /** Conjugaison : l'infinitif (« finir »). */
  verb?: string;
}

/** Paire d'une série de français. */
export const quizOfSeries = (s: SeriesDef) => {
  if (s.spec.kind !== 'quiz') throw new RangeError(`${s.id} n'est pas une série de français`);
  return quizOf(s.spec.quiz);
};

/** Question sur la phrase `f.b` de la série ; `p` = indice du bon mot. */
export function frDraft(s: SeriesDef, f: Fact, rng: Rng = defaultRng): { fr: FrQ; p: number } {
  const q = quizOfSeries(s), item = q.items[f.b - 1]!;
  const options = item.opts ? shuffle([...item.opts], rng) : q.choices;
  return { fr: { quiz: q.id, text: item.s, options, ...(item.verb ? { verb: item.verb } : {}) }, p: options.indexOf(item.a) };
}

/** Phrase complète, avec le bon mot. */
export const frAnswer = (q: { fr?: FrQ; p: number }): string => (q.fr ? fillBlank(q.fr.text, q.fr.options[q.p]!) : '');

/** Phrase d'une clé de français, pour l'espace parent et la grille : « Léo a un vélo rouge. » (a ou à). */
export function frFactLabel(a: number, b: number): { text: string; pair: string } {
  const q = ALL_QUIZZES[a - 1];
  if (!q) return { text: '?', pair: '' };
  const item = q.items[b - 1];
  return item ? { text: fillBlank(item.s, item.a), pair: q.title } : { text: '?', pair: q.title };
}
