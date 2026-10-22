/* Questions de français : une phrase à trou, les deux mots de la paire (ou deux à trois réponses mélangées). */
import { ALL_QUIZZES, fillBlank, itemText, quizOf, type FrQuizId } from '../content/french';
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
  /** Nature des mots : le mot mis en évidence dans la phrase (à la place du trou). */
  focus?: string;
  /** Accords du nom : le mot de départ, affiché au-dessus de la phrase (« Adjectif », « vert »). */
  cue?: readonly [string, string];
  /** Grammaire : deux ou trois réponses mélangées (consignes adaptées). */
  gram?: true;
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
  const extra = { ...(item.verb ? { verb: item.verb } : {}), ...(item.w ? { focus: item.w } : {}), ...(item.cue ? { cue: item.cue } : {}), ...(q.grammar ? { gram: true as const } : {}) };
  return { fr: { quiz: q.id, text: item.s, options, ...extra }, p: options.indexOf(item.a) };
}

/** Phrase complète, avec le bon mot ; en nature des mots, « « chat » est un nom. ». */
export const frAnswer = (q: { fr?: FrQ; p: number }): string => {
  if (!q.fr) return '';
  if (q.fr.focus) return `« ${q.fr.focus} » est un ${q.fr.options[q.p]!}.`;
  return fillBlank(q.fr.text, q.fr.options[q.p]!);
};

/** Phrase d'une clé de français, pour l'espace parent et la grille : « Léo a un vélo rouge. » (a ou à). */
export function frFactLabel(a: number, b: number): { text: string; pair: string } {
  const q = ALL_QUIZZES[a - 1];
  if (!q) return { text: '?', pair: '' };
  const item = q.items[b - 1];
  return item ? { text: itemText(item), pair: q.title } : { text: '?', pair: q.title };
}
