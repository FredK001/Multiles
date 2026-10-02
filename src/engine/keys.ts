/** Clé d'une multiplication, dans l'ordre où elle a été posée : « 7x8 ». */
export type MulKey = `${number}x${number}`;

export const mulKey = (a: number, b: number): MulKey => `${a}x${b}`;

export function parseKey(k: string): [number, number] {
  const [a, b] = k.split('x').map(Number);
  return [a!, b!];
}

/** 7x8 et 8x7 désignent la même multiplication. */
export function sameKey(x: string, y: string): boolean {
  const [a, b] = parseKey(x), [c, d] = parseKey(y);
  return (a === c && b === d) || (a === d && b === c);
}

/** Forme canonique (petit facteur d'abord), pour les compteurs indépendants de l'ordre. */
export function normKey(a: number, b: number): MulKey {
  return a <= b ? mulKey(a, b) : mulKey(b, a);
}

export const hasKey = (list: readonly string[], k: string): boolean => list.some((x) => sameKey(x, k));
