/* Fractions et décimaux (CM1). Une île = une compétence du programme :
   - Lire une fraction : le dessin (disque ou barre partagés) → « 3/4 » parmi trois écritures.
   - Fractions et unité : comparer une fraction à 1 (plus petite, égale, plus grande) ; 1/2 = 2/4…
   - Dixièmes et centièmes : 3/10 = 0,3 ; 0,25 = 25/100 ; le chiffre des dixièmes.
   - Comparer des décimaux : 2,5 ou 2,45 : lequel est le plus grand ?
   Une question = { île, rang } comme les nombres du CP ; le contenu de chaque rang est ci-dessous. */

export type FracId = 'lire' | 'unite' | 'dix' | 'comp';

export interface Frac {
  n: number;
  d: number;
}

export interface FracItem {
  /** Énoncé (lu et affiché). */
  q: string;
  /** Bonne réponse et deux intrus (textes affichés sur les boutons). */
  a: string;
  x: readonly [string, string];
  /** Dessin d'une fraction (île « lire »). */
  pic?: Frac;
  /** Le truc pour réussir. */
  tip: string;
}

export interface FracSet {
  id: FracId;
  title: string;
  items: readonly FracItem[];
}

export const fracText = (f: Frac): string => `${f.n}/${f.d}`;

const DENOMS = [2, 3, 4, 5, 6, 8, 10];
const NAMES: Record<number, [string, string]> = {
  2: ['demi', 'demis'], 3: ['tiers', 'tiers'], 4: ['quart', 'quarts'], 5: ['cinquième', 'cinquièmes'],
  6: ['sixième', 'sixièmes'], 8: ['huitième', 'huitièmes'], 10: ['dixième', 'dixièmes'],
};
/** « trois quarts », « un demi ». */
export const fracWords = (f: Frac): string => `${f.n === 1 ? 'un' : f.n} ${NAMES[f.d]![f.n > 1 ? 1 : 0]}`;

/** Lire : une fraction dessinée ; intrus = numérateur et dénominateur inversés, ou parts non coloriées. */
const LIRE: FracItem[] = DENOMS.flatMap((d) =>
  Array.from({ length: d - 1 }, (_, i) => i + 1)
    .filter((n) => d <= 6 || n % 2 === 1)
    .map((n) => {
      const a = fracText({ n, d }), rev = fracText({ n: d, d: n }), rest = fracText({ n: d - n, d });
      const x2 = rest !== a ? rest : fracText({ n, d: d + 1 });
      return { q: 'Quelle fraction est coloriée ?', a, x: [rev, x2] as [string, string], pic: { n, d }, tip: `Le dénominateur (en bas) compte les parts : ${d}. Le numérateur (en haut) compte les parts coloriées : ${n}.` };
    }),
);

/** Fraction et unité : plus petite que 1, égale à 1, plus grande que 1. */
const UNITE: FracItem[] = [
  ...[[3, 4], [2, 5], [5, 8], [1, 3], [7, 10]].map(([n, d]) => ({ q: `${n}/${d}, c'est…`, a: 'moins que 1', x: ['égal à 1', 'plus que 1'] as [string, string], tip: `${n} parts sur ${d} : il en manque pour faire une unité entière.` })),
  ...[[4, 4], [3, 3], [10, 10], [6, 6]].map(([n, d]) => ({ q: `${n}/${d}, c'est…`, a: 'égal à 1', x: ['moins que 1', 'plus que 1'] as [string, string], tip: `${n} parts sur ${d} : toutes les parts, c'est une unité entière.` })),
  ...[[5, 4], [3, 2], [7, 5], [12, 10]].map(([n, d]) => ({ q: `${n}/${d}, c'est…`, a: 'plus que 1', x: ['moins que 1', 'égal à 1'] as [string, string], tip: `${n} parts de ${d} : une unité, c'est ${d} parts ; il y en a plus.` })),
  { q: '1/2 est égal à…', a: '2/4', x: ['1/4', '2/2'], tip: 'La moitié de 4 parts, c\'est 2 parts : 1/2 = 2/4.' },
  { q: '1/2 est égal à…', a: '5/10', x: ['1/10', '2/10'], tip: 'La moitié de 10 parts, c\'est 5 parts : 1/2 = 5/10.' },
  { q: '2/2 est égal à…', a: '1', x: ['2', '1/2'], tip: 'Deux demis font une unité.' },
  { q: '4/2 est égal à…', a: '2', x: ['1', '4'], tip: 'Deux demis font 1, donc quatre demis font 2.' },
  { q: '10/10 est égal à…', a: '1', x: ['10', '0,1'], tip: 'Dix dixièmes font une unité.' },
];

/** Dixièmes et centièmes : passer de la fraction décimale à l'écriture à virgule, et lire un chiffre. */
const DIX: FracItem[] = [
  ...[3, 7, 5, 9].map((n) => ({ q: `${n}/10 s'écrit…`, a: `0,${n}`, x: [`0,0${n}`, `${n},10`] as [string, string], tip: `${n} dixièmes : le ${n} va juste après la virgule, ${n}/10 = 0,${n}.` })),
  ...[25, 48, 7, 63].map((n) => {
    const a = `0,${String(n).padStart(2, '0')}`;
    return { q: `${n}/100 s'écrit…`, a, x: [n < 10 ? `0,${n}` : `0,${String(n)[0]}`, `${n},0`] as [string, string], tip: `${n} centièmes : deux chiffres après la virgule, ${n}/100 = ${a}.` };
  }),
  ...['1,4', '1,5', '2,3'].map((v) => {
    const [u, t] = v.split(',');
    return { q: `${v} s'écrit aussi…`, a: `${Number(u) * 10 + Number(t)}/10`, x: [`${t}/10`, `${Number(u) * 10 + Number(t)}/100`] as [string, string], tip: `${v}, c'est ${u} unité${Number(u) > 1 ? 's' : ''} et ${t} dixièmes : ${Number(u) * 10 + Number(t)} dixièmes en tout.` };
  }),
  ...[['3,47', '4'], ['12,08', '0'], ['5,6', '6'], ['0,92', '9']].map(([v, c]) => ({ q: `Dans ${v}, le chiffre des dixièmes est…`, a: c!, x: (v === '3,47' ? ['3', '7'] : v === '12,08' ? ['8', '2'] : v === '5,6' ? ['5', '0'] : ['2', '0']) as [string, string], tip: `Le chiffre des dixièmes est le premier après la virgule : dans ${v}, c'est ${c}.` })),
];

/** Comparer des décimaux : les pièges classiques (plus de chiffres ≠ plus grand). */
const COMP: FracItem[] = [
  ['2,5', '2,45'], ['3,1', '3,09'], ['0,7', '0,65'], ['1,25', '1,3'], ['4,08', '4,8'], ['6,5', '6,49'],
  ['0,3', '0,29'], ['9,9', '10,1'], ['2,05', '2,5'], ['7,10', '7,09'], ['5,2', '5,19'], ['8,01', '8,1'],
].map(([p, q]) => {
  const big = parseFloat(p!.replace(',', '.')) > parseFloat(q!.replace(',', '.')) ? p! : q!, small = big === p ? q! : p!;
  return { q: `Le plus grand : ${p} ou ${q} ?`, a: big, x: [small, 'ils sont égaux'] as [string, string], tip: `Même partie entière ? On compare les dixièmes, puis les centièmes. ${big} > ${small}.` };
});

export const FRAC_SETS: readonly FracSet[] = [
  { id: 'lire', title: 'Lire une fraction', items: LIRE },
  { id: 'unite', title: 'Fractions et unité', items: UNITE },
  { id: 'dix', title: 'Dixièmes et centièmes', items: DIX },
  { id: 'comp', title: 'Comparer des décimaux', items: COMP },
];

export const fracSetOf = (id: FracId): FracSet => FRAC_SETS.find((s) => s.id === id)!;
