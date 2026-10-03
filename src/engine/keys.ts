import { OP_KEY, type Op } from '../content/series';

/** Clé d'un calcul, dans l'ordre où il a été posé : « 7x8 », « 3+4 », « 9-2 ». */
export type FactKey = `${number}${'x' | '+' | '-'}${number}`;
/** Clé d'une multiplication : « 7x8 ». */
export type MulKey = `${number}x${number}`;

export const factKey = (op: Op, a: number, b: number): FactKey => `${a}${OP_KEY[op]}${b}`;
export const mulKey = (a: number, b: number): MulKey => `${a}x${b}`;

const FACT_RE = /^(\d{1,2})([x+-])(\d{1,2})$/;
const OP_OF: Record<string, Op> = { x: 'mul', '+': 'add', '-': 'sub' };

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

/** Même calcul : 7x8 et 8x7, 3+4 et 4+3 sont confondus, mais pas 9-2 et 2-9. */
export function sameFact(x: string, y: string): boolean {
  if (x === y) return true;
  const f = parseFact(x), g = parseFact(y);
  if (!f || !g || f.op !== g.op || f.op === 'sub') return false;
  return f.a === g.b && f.b === g.a;
}
export const sameKey = sameFact;

/** Forme canonique (petit nombre d'abord pour × et +), pour les compteurs indépendants de l'ordre. */
export function canonKey(k: string): string {
  const f = parseFact(k);
  if (!f || f.op === 'sub' || f.a <= f.b) return k;
  return factKey(f.op, f.b, f.a);
}

/** Forme canonique d'une multiplication. */
export const normKey = (a: number, b: number): MulKey => (a <= b ? mulKey(a, b) : mulKey(b, a));

export const hasKey = (list: readonly string[], k: string): boolean => list.some((x) => sameFact(x, k));
