/* Nombres jusqu'à 100 (CP) : quatre îles, quatre façons de manipuler un nombre.
   - Dizaines et unités : « 4 dizaines et 7 unités, c'est ? » (47), avec le dessin des barres et des cubes.
   - Avant, après : « Quel nombre vient juste après 39 ? » (40).
   - Comparer : « 58 ou 85 : lequel est le plus grand ? ».
   - Droite graduée : « Quel nombre est caché sur la droite ? » (entre deux dizaines).
   Un calcul est un couple { a, b } : son sens dépend de l'île (voir numQuestion). */

export type NumId = 'du' | 'suite' | 'comp' | 'droite';

export interface NumSet {
  id: NumId;
  title: string;
  /** Tous les couples de l'île. */
  facts: readonly { a: number; b: number }[];
}

const range = (lo: number, hi: number): number[] => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

/** Dizaines et unités : a = dizaines (1 à 9), b = unités (0 à 9). */
const DU = range(1, 9).flatMap((a) => range(0, 9).map((b) => ({ a, b })));

/** Avant, après : a = nombre de départ (1 à 99), b = 0 pour « juste avant », 1 pour « juste après ». */
const SUITE = range(1, 98).flatMap((a) => [{ a: a + 1, b: 0 }, { a, b: 1 }]).filter((f, i, all) => all.findIndex((g) => g.a === f.a && g.b === f.b) === i);

/** Comparer : deux nombres différents de 10 à 99 qui se ressemblent (mêmes chiffres inversés, même dizaine, ou ±10). */
const COMP = range(10, 99).flatMap((a) => {
  const rev = (a % 10) * 10 + Math.floor(a / 10), out: { a: number; b: number }[] = [];
  if (rev !== a && rev >= 10 && a < rev) out.push({ a, b: rev });
  if (a % 10 !== 9) out.push({ a, b: a + 1 });
  if (a + 10 <= 99 && a % 3 === 0) out.push({ a, b: a + 10 });
  return out;
});

/** Droite graduée : a = dizaine de départ (0 à 90), b = nombre caché (a + 1 à a + 9). */
const DROITE = range(0, 9).flatMap((d) => range(1, 9).map((u) => ({ a: d * 10, b: d * 10 + u })));

export const NUM_SETS: readonly NumSet[] = [
  { id: 'du', title: 'Dizaines et unités', facts: DU },
  { id: 'suite', title: 'Avant, après', facts: SUITE },
  { id: 'comp', title: 'Le plus grand', facts: COMP },
  { id: 'droite', title: 'La droite graduée', facts: DROITE },
];

export const numSetOf = (id: NumId): NumSet => NUM_SETS.find((s) => s.id === id)!;
