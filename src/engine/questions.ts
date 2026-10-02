import { defaultRng, pick, shuffle, type Rng } from './random';

/** Les 4 formats : pavé numérique, QCM à 3 choix, facteur manquant, vrai/faux. */
export type Format = 'pave' | 'qcm' | 'manquant' | 'vf';

/** Rotation des formats en session classique. */
export const FORMAT_ORDER: readonly Format[] = ['pave', 'qcm', 'manquant', 'vf'];
/** Rotation des formats en mode chrono (questions illimitées). */
export const CHRONO_ORDER: readonly Format[] = ['pave', 'qcm', 'vf', 'pave', 'manquant'];

export interface Question {
  a: number;
  b: number;
  fmt: Format;
  /** Produit a × b. */
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

/** Fabrique une question, comme `makeQ` du prototype. */
export function makeQ(a: number, b: number, fmt: Format, rng: Rng = defaultRng): Question {
  const q: Question = { a, b, fmt, p: a * b };
  if (fmt === 'qcm') {
    const c = new Set([q.p]);
    for (const x of shuffle([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, q.p + 10, q.p - 10, q.p + 1, q.p - 1].filter((x) => x > 0 && x !== q.p), rng)) {
      if (c.size >= 3) break;
      c.add(x);
    }
    q.choices = shuffle([...c], rng);
  }
  if (fmt === 'vf') {
    q.truth = rng() < 0.5;
    q.shown = q.truth ? q.p : pick([a * (b + 1), a * (b - 1), q.p + 1, q.p + 2, q.p - 1].filter((x) => x > 0 && x !== q.p), rng);
  }
  return q;
}

/** Valeur attendue au pavé : le produit, ou le facteur manquant. */
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
