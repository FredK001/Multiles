/* Générateur unique de questions, paramétré par la série (donc par l'opération). */
import { SERIES, type Op, type SeriesDef, type SeriesId } from '../content/series';
import { factKey } from './keys';
import { defaultRng, pick, shuffle, type Rng } from './random';
import { displayBounds, drawFact, factsOf, inSeries, resultOf, type Fact } from './series';

/** Les 4 formats : pavé numérique, QCM à 3 choix, facteur manquant, vrai/faux. */
export type Format = 'pave' | 'qcm' | 'manquant' | 'vf';

/** Rotation des formats en session classique. */
export const FORMAT_ORDER: readonly Format[] = ['pave', 'qcm', 'manquant', 'vf'];
/** Rotation des formats en mode chrono (questions illimitées). */
export const CHRONO_ORDER: readonly Format[] = ['pave', 'qcm', 'vf', 'pave', 'manquant'];

export interface Question {
  op: Op;
  series: SeriesId;
  a: number;
  b: number;
  fmt: Format;
  /** Résultat : produit, somme ou différence. */
  p: number;
  /** QCM : 3 propositions dont la bonne. */
  choices?: number[];
  /** Vrai/faux : l'égalité affichée est-elle juste ? */
  truth?: boolean;
  /** Vrai/faux : résultat affiché. */
  shown?: number;
  /** Question remise en fin de file après une erreur (ne compte pas « du premier coup »). */
  retry?: boolean;
  /** Question ajoutée par la répétition intelligente. */
  trap?: boolean;
}

export interface GenOptions {
  series: SeriesDef | SeriesId;
  fmt: Format;
  /** Calcul imposé ; sinon tiré dans la série (ou l'étape). */
  fact?: Fact;
  /** Étape 0 à 2 pour restreindre le tirage ; null ou 3 = toute la série. */
  step?: number | null;
  rng?: Rng;
}

/** Erreurs plausibles proposées au QCM. */
function qcmCandidates(op: Op, a: number, b: number, r: number): number[] {
  if (op === 'mul') return [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, r + 10, r - 10, r + 1, r - 1];
  // + et − : un d'écart, deux d'écart, une dizaine d'écart, ou l'autre opération.
  return [r + 1, r - 1, r + 2, r - 2, r + 10, r - 10, op === 'sub' ? a + b : Math.abs(a - b)];
}

/** Résultats faux proposés au vrai/faux. */
function vfCandidates(op: Op, a: number, b: number, r: number): number[] {
  if (op === 'mul') return [a * (b + 1), a * (b - 1), r + 1, r + 2, r - 1];
  return [r + 1, r + 2, r - 1, r - 2];
}

/** Fabrique une question de la série. Le calcul vient toujours de la liste de la série :
    résultat jamais négatif ni hors plage, propositions bornées (voir assertValid). */
export function generateQuestion({ series, fmt, fact, step = null, rng = defaultRng }: GenOptions): Question {
  const s = typeof series === 'string' ? SERIES[series] : series;
  const f = fact ?? drawFact(factsOf(s, step), rng);
  if (!inSeries(s, f)) throw new RangeError(`${factKey(s.op, f.a, f.b)} n'appartient pas à la série ${s.id}`);
  const { a, b } = f, r = resultOf(s.op, a, b), { lo, hi } = displayBounds(s);
  const wrong = (x: number) => x >= lo && x <= hi && x !== r;
  const q: Question = { op: s.op, series: s.id, a, b, fmt, p: r };
  if (fmt === 'qcm') {
    const c = new Set([r]);
    for (const x of shuffle(qcmCandidates(s.op, a, b, r).filter(wrong), rng)) {
      if (c.size >= 3) break;
      c.add(x);
    }
    q.choices = shuffle([...c], rng);
  }
  if (fmt === 'vf') {
    q.truth = rng() < 0.5;
    q.shown = q.truth ? r : pick(vfCandidates(s.op, a, b, r).filter(wrong), rng);
  }
  assertValid(q);
  return q;
}

/** Garde-fou : lève une erreur si la question sort de sa série. */
export function assertValid(q: Question): void {
  const s = SERIES[q.series], { lo, hi } = displayBounds(s);
  const fail = (why: string) => {
    throw new RangeError(`Question ${factKey(q.op, q.a, q.b)} (${q.series}) invalide : ${why}`);
  };
  if (q.op !== s.op) fail('opération');
  if (!inSeries(s, q)) fail('calcul hors série');
  if (q.p !== resultOf(q.op, q.a, q.b)) fail('résultat');
  if (q.p < 0 || q.p < lo || q.p > hi) fail('résultat hors plage');
  if (q.fmt === 'qcm') {
    const c = q.choices ?? [];
    if (c.length !== 3 || new Set(c).size !== 3 || !c.includes(q.p)) fail('propositions');
    if (c.some((x) => x < lo || x > hi)) fail('proposition hors plage');
  }
  if (q.fmt === 'vf' && (q.shown === undefined || q.shown < lo || q.shown > hi || (q.shown === q.p) !== q.truth)) fail('vrai/faux');
}

/** Multiplication a × b de la table de a (raccourci du parcours CM1). */
export function makeQ(a: number, b: number, fmt: Format, rng: Rng = defaultRng): Question {
  return generateQuestion({ series: `mul-${a}` as SeriesId, fact: { a, b }, fmt, rng });
}

/** Même calcul, même format, nouvelles propositions (question remise en fin de file). */
export const remakeQ = (q: Question, rng: Rng = defaultRng): Question => generateQuestion({ series: q.series, fact: q, fmt: q.fmt, rng });

/** Valeur attendue au pavé : le résultat, ou le nombre manquant (second terme). */
export const expected = (q: Question): number => (q.fmt === 'manquant' ? q.b : q.p);

/** Vérifie une réponse : nombre (pavé, QCM, facteur manquant) ou booléen (vrai/faux). */
export function isCorrect(q: Question, answer: number | boolean): boolean {
  if (q.fmt === 'vf') return answer === q.truth;
  if (q.fmt === 'qcm') return answer === q.p;
  return answer === expected(q);
}

/** Saisie au pavé : 3 chiffres au plus, pas de zéro en tête. */
export function typeDigit(input: string, d: string): string {
  if (input.length >= 3) return input;
  return (input === '0' ? '' : input) + d;
}
