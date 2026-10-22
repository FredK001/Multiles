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
  100: ['centième', 'centièmes'], 2: ['demi', 'demis'], 3: ['tiers', 'tiers'], 4: ['quart', 'quarts'], 5: ['cinquième', 'cinquièmes'],
  6: ['sixième', 'sixièmes'], 8: ['huitième', 'huitièmes'], 10: ['dixième', 'dixièmes'],
};
/** « 3 quarts », « un demi » ; « 5 sur 7 » si le dénominateur n'a pas de nom ici. */
export const fracWords = (f: Frac): string => {
  const name = NAMES[f.d];
  return name ? `${f.n === 1 ? 'un' : f.n} ${name[f.n > 1 ? 1 : 0]}` : `${f.n} sur ${f.d}`;
};

/** Texte à dire : chaque fraction écrite « 3/4 » devient « 3 quarts » (sinon la voix peut lire une date). */
export const sayFrac = (s: string): string => s.replace(/(\d+)\/(\d+)/g, (_, n: string, d: string) => fracWords({ n: Number(n), d: Number(d) }));

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
const less = (n: number, d: number): FracItem => ({ q: `${n}/${d}, c'est…`, a: 'moins que 1', x: ['égal à 1', 'plus que 1'], tip: `${n} parts sur ${d} : il en manque pour faire une unité entière.` });
const one = (n: number): FracItem => ({ q: `${n}/${n}, c'est…`, a: 'égal à 1', x: ['moins que 1', 'plus que 1'], tip: `${n} parts sur ${n} : toutes les parts, c'est une unité entière.` });
const more = (n: number, d: number): FracItem => ({ q: `${n}/${d}, c'est…`, a: 'plus que 1', x: ['moins que 1', 'égal à 1'], tip: `${fracWords({ n, d })} : une unité, c'est ${d} ${NAMES[d]![1]} ; il y en a plus.` });
// Les trois cas sont mêlés : chaque étape (première et seconde moitié) les travaille tous.
const UNITE: FracItem[] = [
  less(3, 4), one(4), more(5, 4), less(2, 5), one(3), more(3, 2), less(5, 8),
  one(10), more(7, 5), less(1, 3), one(6), more(12, 10), less(7, 10),
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
  const v = (s: string) => parseFloat(s.replace(',', '.')), big = v(p!) > v(q!) ? p! : q!, small = big === p ? q! : p!;
  const sameUnits = Math.floor(v(p!)) === Math.floor(v(q!));
  const tip = sameUnits ? `Même partie entière : on compare les dixièmes, puis les centièmes. ${big} > ${small}.` : `On compare d'abord la partie entière : ${Math.floor(v(big))} > ${Math.floor(v(small))}. Donc ${big} > ${small}.`;
  return { q: `Le plus grand : ${p} ou ${q} ?`, a: big, x: [small, 'ils sont égaux'] as [string, string], tip };
});
// Égalités : un zéro au bout ne change rien (2,5 = 2,50).
COMP.push(...[['2,5', '2,50'], ['0,4', '0,40'], ['3,10', '3,1']].map(([p, q]) => ({ q: `Le plus grand : ${p} ou ${q} ?`, a: 'ils sont égaux', x: [p!, q!] as [string, string], tip: `Un zéro tout à droite après la virgule ne change rien : ${p} = ${q}.` })));

export const FRAC_SETS: readonly FracSet[] = [
  { id: 'lire', title: 'Lire une fraction', items: LIRE },
  { id: 'unite', title: 'Fractions et unité', items: UNITE },
  { id: 'dix', title: 'Dixièmes et centièmes', items: DIX },
  { id: 'comp', title: 'Comparer des décimaux', items: COMP },
];

export const fracSetOf = (id: FracId): FracSet => FRAC_SETS.find((s) => s.id === id)!;
