/* Verrou de l'espace parent : une addition écrite en lettres, à saisir en chiffres. */
import { defaultRng, type Rng } from './random';

const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const T: Record<number, string> = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };

/** Nombre en lettres (0 à 99), comme `frNum` du prototype. */
export function frNum(n: number): string {
  if (n < 20) return U[n]!;
  if (n < 70) {
    const t = Math.floor(n / 10), u = n % 10;
    return u === 0 ? T[t]! : u === 1 ? `${T[t]} et un` : `${T[t]}-${U[u]}`;
  }
  if (n < 80) return n === 71 ? 'soixante et onze' : `soixante-${U[n - 60]}`;
  if (n === 80) return 'quatre-vingts';
  return `quatre-vingt-${U[n - 80]}`;
}

export interface Gate {
  a: number;
  b: number;
}

/** Deux nombres de 21 à 49. */
export function newGate(rng: Rng = defaultRng): Gate {
  return { a: 21 + Math.floor(rng() * 29), b: 21 + Math.floor(rng() * 29) };
}

export const gateQuestion = (g: Gate): string => `${frNum(g.a)} plus ${frNum(g.b)}`;

export const gateSolved = (g: Gate, input: string): boolean => input !== '' && Number(input) === g.a + g.b;
