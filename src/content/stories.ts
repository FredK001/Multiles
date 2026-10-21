/* Petits problèmes du CP : une histoire courte, lue par la voix, pour une addition ou une soustraction.
   L'histoire est choisie d'après le calcul (même calcul, même histoire, y compris quand il revient après une erreur)
   et accordée au nombre : « 1 bille », « 3 billes », « un enfant monte », « 2 enfants montent ». */

interface Noun {
  sg: string;
  pl: string;
  /** Féminin : « une bille », « aucune ». */
  f?: boolean;
}

const N = (sg: string, pl: string, f = false): Noun => ({ sg, pl, f });
const count = (n: number, x: Noun): string => (n === 1 ? `${x.f ? 'une' : 'un'} ${x.sg}` : `${n} ${x.pl}`);
const Count = (n: number, x: Noun): string => { const s = count(n, x); return s.charAt(0).toUpperCase() + s.slice(1); };
/** Verbe au singulier ou au pluriel selon `n`. */
const v = (n: number, sg: string, pl: string): string => (n === 1 ? sg : pl);

type Story = (a: number, b: number) => string;

const BILLE = N('bille', 'billes', true), BONBON = N('bonbon', 'bonbons'), OISEAU = N('oiseau', 'oiseaux');
const ENFANT = N('enfant', 'enfants'), POMME = N('pomme', 'pommes', true), POISSON = N('poisson', 'poissons');

const ADD: readonly Story[] = [
  (a, b) => `Léo a ${count(a, BILLE)}. Il en gagne ${b}. Combien de billes a-t-il maintenant ?`,
  (a, b) => `Dans le bus, il y a ${count(a, ENFANT)}. ${Count(b, ENFANT)} ${v(b, 'monte', 'montent')}. Combien d'enfants y a-t-il dans le bus ?`,
  (a, b) => `Lina a ${count(a, BONBON)} et Tom en a ${b}. Combien de bonbons ont-ils en tout ?`,
  (a, b) => `Sur l'arbre, il y a ${count(a, OISEAU)}. ${Count(b, OISEAU)} ${v(b, 'arrive', 'arrivent')}. Combien d'oiseaux y a-t-il sur l'arbre ?`,
  (a, b) => `Dans le panier, il y a ${count(a, POMME)}. Mamie en ajoute ${b}. Combien de pommes y a-t-il dans le panier ?`,
  (a, b) => `Dans l'aquarium, il y a ${count(a, POISSON)}. On en met ${b} de plus. Combien de poissons y a-t-il ?`,
];

const SUB: readonly Story[] = [
  (a, b) => `Léo a ${count(a, BILLE)}. Il en perd ${b}. Combien de billes lui reste-t-il ?`,
  (a, b) => `Dans le bus, il y a ${count(a, ENFANT)}. ${Count(b, ENFANT)} ${v(b, 'descend', 'descendent')}. Combien d'enfants reste-t-il dans le bus ?`,
  (a, b) => `Lina a ${count(a, BONBON)}. Elle en mange ${b}. Combien de bonbons lui reste-t-il ?`,
  (a, b) => `Sur l'arbre, il y a ${count(a, OISEAU)}. ${Count(b, OISEAU)} ${v(b, "s'envole", "s'envolent")}. Combien d'oiseaux reste-t-il sur l'arbre ?`,
  (a, b) => `Dans le panier, il y a ${count(a, POMME)}. Papa en prend ${b}. Combien de pommes reste-t-il dans le panier ?`,
  (a, b) => `Tom a ${count(a, POISSON)} dans son seau. Il en remet ${b} dans la mer. Combien de poissons lui reste-t-il ?`,
];

/** Histoire d'un calcul : toujours la même pour un même calcul. */
export function storyOf(op: 'add' | 'sub', a: number, b: number): string {
  const list = op === 'add' ? ADD : SUB;
  return list[(a * 7 + b * 3) % list.length]!(a, b);
}
