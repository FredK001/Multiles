import { OP_KEY, type Op } from '../content/series';

/** Clé d'un calcul, dans l'ordre où il a été posé : « 7x8 », « 56d7 » (56 ÷ 7), « 3+4 », « 9-2 » ; en anglais « 4e12 » (thème 4, mot 12). */
export type FactKey = `${number}${'x' | 'd' | 'r' | 'g' | 'm' | 'o' | '+' | '-' | 'n' | 'h' | 's' | 'l' | 'f' | 'e'}${number}`;
/** Clé d'une multiplication : « 7x8 ». */
export type MulKey = `${number}x${number}`;

export const factKey = (op: Op, a: number, b: number): FactKey => `${a}${OP_KEY[op]}${b}`;
export const mulKey = (a: number, b: number): MulKey => `${a}x${b}`;

// Le dividende va jusqu'à 100 (10 × 10 ÷ 10).
// Grands nombres « 2g7 » et mesures « 3m12 » : île, puis rang de la question.
// Les questions de nombres vont jusqu'au rang 196 (avant/après) : trois chiffres de chaque côté.
const FACT_RE = /^(\d{1,3})([x+edflnrgmhso-])(\d{1,3})$/;
const OP_OF: Record<string, Op> = { x: 'mul', d: 'div', r: 'frac', g: 'big', m: 'mes', o: 'geo', '+': 'add', '-': 'sub', n: 'num', h: 'grd', s: 'esp', l: 'lec', f: 'fr', e: 'eng' };

/** Lit une clé de calcul ; null si elle est mal formée. */
export function parseFact(k: string): { op: Op; a: number; b: number } | null {
  const m = FACT_RE.exec(k);
  return m ? { op: OP_OF[m[2]!]!, a: Number(m[1]), b: Number(m[3]) } : null;
}

/** Les deux nombres d'une clé de multiplication. */
export function parseKey(k: string): [number, number] {
  const f = parseFact(k);
  return f ? [f.a, f.b] : [NaN, NaN];
}

/** Seules × et + sont commutatives : 9-2 et 2-9, 56÷7 et 7÷56, ou deux mots d'anglais, ne se confondent pas. */
const commutes = (op: Op): boolean => op === 'mul' || op === 'add';

/** Même calcul : 7x8 et 8x7, 3+4 et 4+3 sont confondus, mais pas 9-2 et 2-9. */
export function sameFact(x: string, y: string): boolean {
  if (x === y) return true;
  const f = parseFact(x), g = parseFact(y);
  if (!f || !g || f.op !== g.op || !commutes(f.op)) return false;
  return f.a === g.b && f.b === g.a;
}
export const sameKey = sameFact;

/** Forme canonique (petit nombre d'abord pour × et +), pour les compteurs indépendants de l'ordre. */
export function canonKey(k: string): string {
  const f = parseFact(k);
  if (!f || !commutes(f.op) || f.a <= f.b) return k;
  return factKey(f.op, f.b, f.a);
}

/** Forme canonique d'une multiplication. */
export const normKey = (a: number, b: number): MulKey => (a <= b ? mulKey(a, b) : mulKey(b, a));

export const hasKey = (list: readonly string[], k: string): boolean => list.some((x) => sameFact(x, k));
