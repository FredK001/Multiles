/* Nombres jusqu'à 100 (CP) : quatre îles, quatre façons de manipuler un nombre.
   - Dizaines et unités : « 4 dizaines et 7 unités, c'est ? » (47), avec le dessin des barres et des cubes.
   - Avant, après : « Quel nombre vient juste après 39 ? » (40).
   - Comparer : « 58 ou 85 : lequel est le plus grand ? ».
   - Droite graduée : « Quel nombre est caché sur la droite ? » (entre deux dizaines).
   Puis quatre îles pour comparer (leçon « Comparer les nombres ») :
   - Plus petit, plus grand : deux tours de cubes (1 à 10), « Lequel est le plus petit ? » ou « le plus grand ? ».
   - Les signes : « 2 … 6 », on choisit <, = ou >.
   - Vrai ou faux : « 6 < 2 », « 6 est plus grand que 2 ».
   - Le plus petit des trois (ou le plus grand).
   Un calcul est un couple { a, b } : son sens dépend de l'île (voir numQuestion) ; c = troisième nombre, k = variante. */

export type NumId = 'du' | 'suite' | 'comp' | 'droite' | 'pg' | 'signe' | 'vf' | 'trois';

/** Variante d'une question de comparaison : le plus petit (0) ou le plus grand (1) ;
    en vrai/faux, l'affirmation : « < » (0), « > » (1), « plus petit que » (2), « plus grand que » (3). */
export type NumFact = { a: number; b: number; c?: number; k?: number };

export interface NumSet {
  id: NumId;
  title: string;
  /** Tous les couples de l'île. */
  facts: readonly NumFact[];
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

/** Deux moitiés de même longueur (les étapes 1 et 2 coupent l'île en deux) : on garde des éléments répartis sur toute la liste. */
function halves<T>(lo: readonly T[], hi: readonly T[]): T[] {
  const n = Math.min(lo.length, hi.length), pick = (l: readonly T[]) => Array.from({ length: n }, (_, i) => l[Math.floor((i * l.length) / n)]!);
  return [...pick(lo), ...pick(hi)];
}

/** Deux nombres de 11 à 99 qui se ressemblent : chiffres inversés (47 et 74), ou voisins dans la même dizaine (48 et 49). */
const lookalikes = (): [number, number][] => range(11, 98).flatMap((a): [number, number][] => {
  const rev = (a % 10) * 10 + Math.floor(a / 10);
  return a % 10 !== 0 && a < rev ? [[a, rev]] : a % 4 === 0 ? [[a, a + 1]] : [];
});

/** Plus petit, plus grand : deux tours de 1 à 10 cubes. Chaque paire revient dans les deux ordres, une fois pour chaque question. */
const PG = halves(
  range(2, 6).flatMap((m) => range(1, m - 1).flatMap((x) => [{ a: x, b: m, k: (x + m) % 2 }, { a: m, b: x, k: 1 - ((x + m) % 2) }])),
  range(7, 10).flatMap((m) => range(1, m - 1).flatMap((x) => [{ a: x, b: m, k: (x + m) % 2 }, { a: m, b: x, k: 1 - ((x + m) % 2) }])),
);

/** Les signes : de 0 à 10 (avec les cubes), puis des nombres jusqu'à 99 ; quelques égalités. */
const SIGNE = halves(
  range(0, 10).flatMap((x) => range(0, 10).filter((y) => x !== y ? (x + y) % 3 !== 0 : x % 2 === 1).map((y) => ({ a: x, b: y }))),
  [...lookalikes().flatMap(([x, y]) => [{ a: x, b: y }, { a: y, b: x }]), ...range(2, 9).map((t) => ({ a: t * 11, b: t * 11 }))],
);

/** Vrai ou faux : jusqu'à 20, puis jusqu'à 99. Chaque paire vient dans les deux ordres (i pair : le petit d'abord) ;
    une paire sur deux est vraie, et l'on passe des signes aux mots toutes les deux paires. */
const VF = halves(
  range(1, 20).flatMap((x) => [1, 3, 5].filter((d) => x + d <= 20).flatMap((d) => [{ a: x, b: x + d }, { a: x + d, b: x }])),
  lookalikes().flatMap(([x, y]) => [{ a: x, b: y }, { a: y, b: x }]),
).map((f, i) => {
  const j = Math.floor(i / 2), sign = (i + j) % 2;
  return { ...f, k: sign + 2 * (Math.floor(j / 2) % 2) };
});

/** Les six ordres de trois nombres. */
const ORDERS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]] as const;
const triple = (t: readonly [number, number, number], i: number): NumFact => {
  const o = ORDERS[i % 6]!;
  return { a: t[o[0]], b: t[o[1]], c: t[o[2]], k: Math.floor(i / 3) % 2 };
};

/** Le plus petit des trois (ou le plus grand) : jusqu'à 20, puis des nombres qui se ressemblent jusqu'à 99. */
const TROIS = halves(
  [1, 2, 3, 4].flatMap((g) => range(1, 19 - 2 * g).map((lo): [number, number, number] => [lo, lo + g, lo + 2 * g + 1])).map(triple),
  range(1, 9).flatMap((t) => range(1, 9).filter((u) => u !== t).map((u): [number, number, number] => [t * 10 + u, u * 10 + t, t * 10 + u + (u < 9 ? 1 : -1)])).map(triple),
);

export const NUM_SETS: readonly NumSet[] = [
  { id: 'du', title: 'Dizaines et unités', facts: DU },
  { id: 'suite', title: 'Avant, après', facts: SUITE },
  { id: 'comp', title: 'Le plus grand', facts: COMP },
  { id: 'droite', title: 'La droite graduée', facts: DROITE },
  { id: 'pg', title: 'Plus petit, plus grand', facts: PG },
  { id: 'signe', title: 'Les signes < et >', facts: SIGNE },
  { id: 'vf', title: 'Vrai ou faux ?', facts: VF },
  { id: 'trois', title: 'Le plus petit des trois', facts: TROIS },
];

export const numSetOf = (id: NumId): NumSet => NUM_SETS.find((s) => s.id === id)!;
