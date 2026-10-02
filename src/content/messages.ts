/* Textes de l'interface enfant, repris mot pour mot du prototype. Tutoiement partout. */
import type { Question } from '../engine/questions';
import { ofIsle, type IsleId } from './isles';
import { nb } from './text';

export const MSG = {
  pave: ['Combien font {a} fois {b} ?', 'À toi, {name} : {a} fois {b} ?'],
  qcm: ['Touche la bonne réponse.', 'Laquelle est juste, {name} ?'],
  manquant: ['Trouve le nombre qui manque.', 'Quel nombre se cache ici ?'],
  vf: ["Est-ce que c'est juste ?", 'Vrai ou faux, {name} ?'],
} as const;

export const OK_TITLES = ['Bravo {name} !', 'Super !', 'Exact !', 'Bien joué, {name} !', 'Tu assures !', 'Génial !', 'Et voilà !'];
export const HELP_TITLES = ['Presque, {name} !', 'Pas tout à fait !', 'On regarde ensemble ?'];

/** Remplit un modèle de phrase et ajoute les espaces insécables. */
export const fill = (t: string, q: Pick<Question, 'a' | 'b'>, name: string): string =>
  nb(t.replace('{a}', String(q.a)).replace('{b}', String(q.b)).replace('{name}', name).replace('{r}', ''));

/** Énoncé lu à voix haute et donné aux lecteurs d'écran. */
export function spoken(q: Question): string {
  if (q.fmt === 'manquant') return `${q.a} fois combien font ${q.p} ?`;
  if (q.fmt === 'vf') return `${q.a} fois ${q.b} égale ${q.shown}. Vrai ou faux ?`;
  return `Combien font ${q.a} fois ${q.b} ?`;
}

/** Astuce adaptée à la multiplication (feuille d'aide et grille). */
export function tipFor(a: number, b: number): string {
  const p = a * b, o = (x: number) => (a === x ? b : a);
  if (a === 1 || b === 1) return `Fois 1, le nombre ne change pas : ${o(1)} reste ${p}.`;
  if (a === 10 || b === 10) return `Fois 10, on ajoute un zéro : ${o(10)} devient ${p}.`;
  if ((a === 7 && b === 8) || (a === 8 && b === 7)) return 'Retiens la suite 5, 6, 7, 8 : 56 = 7 × 8.';
  if (a === 2 || b === 2) return `Fois 2, c'est le double : ${o(2)} + ${o(2)} = ${p}.`;
  if (a === 5 || b === 5) return `Fois 5, c'est la moitié de fois 10 : la moitié de ${o(5) * 10}, c'est ${p}.`;
  if (a === 9 || b === 9) return `Fois 9 : ${o(9)} × 10 = ${o(9) * 10}, puis on enlève ${o(9)}. Ça fait ${p}.`;
  if (a === 4 || b === 4) return `Fois 4, c'est le double du double : ${o(4)}, puis ${o(4) * 2}, puis ${p}.`;
  if (a === 3 || b === 3) return `Fois 3 : le double, plus une fois. ${o(3) * 2} + ${o(3)} = ${p}.`;
  const big = Math.max(a, b), sm = Math.min(a, b);
  return `Coupe en deux : ${sm} × 5 = ${sm * 5}, plus ${sm} × ${big - 5} = ${sm * (big - 5)}. Total : ${p}.`;
}

/** Bulle d'accueil. */
export const HELLO = (p: { name: string; streak: number; isle: IsleId; step: number }): string[] =>
  p.streak === 0
    ? [`Salut ${p.name} ! On lance une série aujourd'hui ?`]
    : [`Salut ${p.name} ! On repart sur l'île ${ofIsle(p.isle)} ?`, `Coucou ${p.name} ! On attaque l'étape ${p.step} ?`, `${p.streak} jour${p.streak > 1 ? 's' : ''} de suite, ${p.name} ! On continue ?`];

/** Réactions du Pépin quand on le touche. */
export const PEP_LINES = ['Hi hi, ça chatouille !', 'On joue ?', 'Encore une étoile et je grandis !', "Tu es en forme aujourd'hui !"];

export const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const plural = (n: number, one: string, many: string): string => (n > 1 ? many : one);
export const goodAnswers = (n: number): string => `${n} bonne${n > 1 ? 's' : ''} réponse${n > 1 ? 's' : ''}`;
