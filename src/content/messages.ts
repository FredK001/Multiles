/* Textes de l'interface enfant, repris mot pour mot du prototype. Tutoiement partout. */
import type { Question } from '../engine/questions';
import { OP_SIGN, OP_SPOKEN } from './series';
import { nb } from './text';

export const MSG = {
  pave: ['Combien font {a} {op} {b} ?', 'À toi, {name} : {a} {op} {b} ?'],
  qcm: ['Touche la bonne réponse.', 'Laquelle est juste, {name} ?'],
  manquant: ['Trouve le nombre qui manque.', 'Quel nombre se cache ici ?'],
  vf: ["Est-ce que c'est juste ?", 'Vrai ou faux, {name} ?'],
} as const;

/** Consignes du CP : très courtes, sans prénom, appuyées par un pictogramme du format. */
export const MSG_CP = {
  pave: ['Combien font {a} {op} {b} ?'],
  qcm: ['Touche le bon nombre.'],
  manquant: ['Quel nombre manque ?'],
  vf: ['Juste ou pas juste ?'],
} as const;

export const OK_TITLES = ['Bravo {name} !', 'Super !', 'Exact !', 'Bien joué, {name} !', 'Tu assures !', 'Génial !', 'Et voilà !'];
export const HELP_TITLES = ['Presque, {name} !', 'Pas tout à fait !', 'On regarde ensemble ?'];

/** Remplit un modèle de phrase et ajoute les espaces insécables. */
export const fill = (t: string, q: Pick<Question, 'a' | 'b' | 'op'>, name: string): string =>
  nb(t.replace('{a}', String(q.a)).replace('{op}', OP_SPOKEN[q.op]).replace('{b}', String(q.b)).replace('{name}', name).replace('{r}', ''));

/** Énoncé lu à voix haute et donné aux lecteurs d'écran. */
export function spoken(q: Question): string {
  const w = OP_SPOKEN[q.op];
  if (q.fmt === 'manquant') return `${q.a} ${w} combien font ${q.p} ?`;
  if (q.fmt === 'vf') return `${q.a} ${w} ${q.b} égale ${q.shown}. Vrai ou faux ?`;
  return `Combien font ${q.a} ${w} ${q.b} ?`;
}

/** Égalité complète affichée : « 7 × 8 = 56 », « 13 − 5 = 8 ». */
export const equation = (q: Pick<Question, 'a' | 'b' | 'p' | 'op'>): string => `${q.a} ${OP_SIGN[q.op]} ${q.b} = ${q.p}`;

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

/** Astuce du CP pour une addition (calcul réfléchi : doubles, amis de 10, passage par 10). */
function addTip(a: number, b: number): string {
  const p = a + b, big = Math.max(a, b), small = Math.min(a, b);
  if (small === 0) return `Plus 0, le nombre ne change pas : ${big} reste ${big}.`;
  if (a === b) return `C'est un double : ${a} + ${a} = ${p}.`;
  if (p === 10) return `Ce sont des amis de 10 : ${a} et ${b} font 10.`;
  if (small === 1) return `Plus 1, c'est le nombre d'après : après ${big} vient ${p}.`;
  if (big < 10 && p > 10) return `Passe par 10 : ${big} + ${10 - big} = 10, puis 10 + ${small - (10 - big)} = ${p}.`;
  if (big >= 10) return `Ajoute aux unités : ${big % 10} + ${small} = ${(big % 10) + small}, donc ${big} + ${small} = ${p}.`;
  if (small <= 3) return `Pars du plus grand, ${big}, et avance de ${small} : ${Array.from({ length: small }, (_, i) => big + i + 1).join(', ')}.`;
  return `Pars du plus grand, ${big}, et avance de ${small} : tu arrives à ${p}.`;
}

/** Astuce du CP pour une soustraction (reculer, compléter, passer par 10). */
function subTip(a: number, b: number): string {
  const p = a - b;
  if (b === 0) return `Moins 0, le nombre ne change pas : ${a} reste ${a}.`;
  if (p === 0) return `On enlève tout : il ne reste rien, 0.`;
  if (b === 1) return `Moins 1, c'est le nombre d'avant : avant ${a} vient ${p}.`;
  if (a === 10) return `Pense aux amis de 10 : ${b} et ${p} font 10.`;
  if (b === 10) return `Enlève la dizaine : ${a} − 10 = ${p}.`;
  if (a === 20) return `20, c'est 10 et encore 10 : 10 − ${b} = ${10 - b}, puis 10 + ${10 - b} = ${p}.`;
  if (a > 10 && a % 10 < b) return `Descends jusqu'à 10 : ${a} − ${a - 10} = 10, puis 10 − ${b - (a - 10)} = ${p}.`;
  if (a > 10) return `Enlève aux unités : ${a % 10} − ${b} = ${(a % 10) - b}, donc ${a} − ${b} = ${p}.`;
  if (b <= 3) return `Recule de ${b} à partir de ${a} : ${Array.from({ length: b }, (_, i) => a - i - 1).join(', ')}.`;
  return `Compte de ${b} jusqu'à ${a} : il y a ${p} pas.`;
}

/** Astuce adaptée au calcul, quelle que soit l'opération. */
export function tipOf(q: Pick<Question, 'op' | 'a' | 'b'>): string {
  return q.op === 'mul' ? tipFor(q.a, q.b) : q.op === 'add' ? addTip(q.a, q.b) : subTip(q.a, q.b);
}

/** Bulle d'accueil. */
/** `of` : complément de l'île en cours, « de la Plage », « du Lagon ». */
export const HELLO = (p: { name: string; streak: number; of: string; step: number }): string[] =>
  p.streak === 0
    ? [`Salut ${p.name} ! On lance une série aujourd'hui ?`]
    : [`Salut ${p.name} ! On repart sur l'île ${p.of} ?`, `Coucou ${p.name} ! On attaque l'étape ${p.step} ?`, `${p.streak} jour${p.streak > 1 ? 's' : ''} de suite, ${p.name} ! On continue ?`];

/** Réactions du Pépin quand on le touche. */
export const PEP_LINES = ['Hi hi, ça chatouille !', 'On joue ?', 'Encore une étoile et je grandis !', "Tu es en forme aujourd'hui !"];

export const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const plural = (n: number, one: string, many: string): string => (n > 1 ? many : one);
export const goodAnswers = (n: number): string => `${n} bonne${n > 1 ? 's' : ''} réponse${n > 1 ? 's' : ''}`;
