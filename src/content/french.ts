/* Français (CM1) : une île = une paire d'homophones (deux mots, toujours dans le même ordre)
   ou un temps de conjugaison (trois formes du verbe, mélangées).
   Étape 1 = première moitié des phrases, étape 2 = seconde moitié, étape 3 et gardien = toutes. */

export type FrQuizId = 'a' | 'et' | 'son' | 'on' | 'pres' | 'fut' | 'imp' | 'pc';

/** Personnes de conjugaison : je, tu, il, nous, vous, ils. */
export type Person = 0 | 1 | 2 | 3 | 4 | 5;
export const PRONOUNS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'] as const;

export interface FrItem {
  /** Phrase avec un trou « ___ ». */
  s: string;
  /** Le mot qui va dans le trou. */
  a: string;
  /** Conjugaison : les trois formes proposées (dont la bonne), le verbe et la personne. */
  opts?: readonly string[];
  verb?: string;
  who?: Person;
}

export interface FrQuiz {
  id: FrQuizId;
  /** « a ou à », « Le futur ». */
  title: string;
  /** Homophones : les deux mots, toujours dans cet ordre sur les boutons ; vide en conjugaison. */
  choices: readonly string[];
  /** Conjugaison : la règle du temps, et ses tableaux (6 formes par verbe). */
  tense?: { name: string; rule: string; tables: Readonly<Record<string, readonly string[]>> };
  /** Le truc pour choisir, mot par mot. */
  rule: Readonly<Record<string, string>>;
  /** Mot qu'on essaie à la place (« avait » pour « a ») ; absent si aucun ne marche (« à »). */
  swap: Readonly<Record<string, string>>;
  items: readonly FrItem[];
}

const it = (s: string, a: string): FrItem => ({ s, a });

/* Homophones (QUIZZES) puis conjugaison (ALL_QUIZZES, plus bas). */

export const QUIZZES: readonly FrQuiz[] = [
  {
    id: 'a', title: 'a ou à', choices: ['a', 'à'],
    rule: {
      a: "« a », c'est le verbe avoir : on peut le remplacer par « avait ».",
      à: "« à » n'est pas un verbe : on ne peut pas dire « avait » à sa place.",
    },
    swap: { a: 'avait' },
    items: [
      it('Léo ___ un vélo rouge.', 'a'), it('Nous allons ___ la piscine.', 'à'), it('Ma sœur ___ perdu sa trousse.', 'a'),
      it('Il habite ___ Paris.', 'à'), it('Le chat ___ faim.', 'a'), it("J'ai donné un bonbon ___ Lina.", 'à'),
      it('Papa ___ réparé la porte.', 'a'), it("C'est l'heure d'aller ___ l'école.", 'à'), it('Elle ___ dix ans.', 'a'),
      it('Il joue ___ la balle.', 'à'), it('Tom ___ un chien très gentil.', 'a'),
      it('Nous partons ___ la mer.', 'à'), it('La maîtresse ___ écrit au tableau.', 'a'), it('Je pense ___ toi.', 'à'),
      it('Mon frère ___ gagné le match.', 'a'), it('Un gâteau ___ la crème.', 'à'), it('Le bébé ___ sommeil.', 'a'),
      it('On se retrouve ___ midi.', 'à'), it('Elle ___ peur du noir.', 'a'), it('Il est venu ___ vélo.', 'à'),
      it('Mamie ___ préparé une tarte.', 'a'), it('Je vais ___ la boulangerie.', 'à'),
    ],
  },
  {
    id: 'et', title: 'et ou est', choices: ['et', 'est'],
    rule: {
      et: "« et » relie deux mots : on peut le remplacer par « et puis ».",
      est: "« est », c'est le verbe être : on peut le remplacer par « était ».",
    },
    swap: { et: 'et puis', est: 'était' },
    items: [
      it('Le ciel ___ bleu.', 'est'), it("J'aime les pommes ___ les poires.", 'et'), it('Mon chien ___ très joueur.', 'est'),
      it('Léa ___ Hugo sont amis.', 'et'), it('La soupe ___ chaude.', 'est'), it('Il prend son sac ___ il part.', 'et'),
      it('Ce livre ___ passionnant.', 'est'), it('Du pain ___ du fromage sont sur la table.', 'et'), it("Ma tante ___ en vacances.", 'est'),
      it('Je cours ___ je saute.', 'et'), it('La porte ___ ouverte.', 'est'),
      it('Le chat ___ la souris jouent.', 'et'), it('Le film ___ trop long.', 'est'), it('Il pleut ___ il fait froid.', 'et'),
      it('Ton dessin ___ magnifique.', 'est'), it('Papa ___ maman arrivent.', 'et'), it('Le lion ___ le roi des animaux.', 'est'),
      it('Elle chante ___ elle danse.', 'et'), it('La classe ___ silencieuse.', 'est'), it('Mes crayons ___ mes feutres sont rangés.', 'et'),
      it('Mon vélo ___ cassé.', 'est'), it('Il rit ___ il applaudit.', 'et'),
    ],
  },
  {
    id: 'son', title: 'son ou sont', choices: ['son', 'sont'],
    rule: {
      son: "« son » va avec un nom : on peut dire « mon » à sa place.",
      sont: "« sont », c'est le verbe être : on peut le remplacer par « étaient ».",
    },
    swap: { son: 'mon', sont: 'étaient' },
    items: [
      it('Léo range ___ cartable.', 'son'), it('Les enfants ___ dans la cour.', 'sont'), it('Elle cherche ___ écharpe.', 'son'),
      it('Mes amis ___ très drôles.', 'sont'), it('Il promène ___ chien.', 'son'), it('Les fleurs ___ jolies.', 'sont'),
      it('Tom a perdu ___ ballon.', 'son'), it('Ils ___ en retard.', 'sont'), it('Le chat lèche ___ poil.', 'son'),
      it('Les pommes ___ mûres.', 'sont'), it('Elle aime ___ vélo.', 'son'),
      it('Les oiseaux ___ sur le toit.', 'sont'), it('Il mange ___ goûter.', 'son'), it('Mes cousins ___ partis.', 'sont'),
      it('La maîtresse ouvre ___ livre.', 'son'), it('Les bananes ___ jaunes.', 'sont'), it('Papa lave ___ auto.', 'son'),
      it('Elles ___ contentes.', 'sont'), it('Il a oublié ___ manteau.', 'son'), it('Les portes ___ fermées.', 'sont'),
      it('Ma sœur prête ___ feutre.', 'son'), it('Mes chaussures ___ neuves.', 'sont'),
    ],
  },
  {
    id: 'on', title: 'on ou ont', choices: ['on', 'ont'],
    rule: {
      on: "« on » veut dire « quelqu'un » : on peut le remplacer par « il ».",
      ont: "« ont », c'est le verbe avoir : on peut le remplacer par « avaient ».",
    },
    swap: { on: 'il', ont: 'avaient' },
    items: [
      it('___ va au parc.', 'on'), it('Les élèves ___ fini leur travail.', 'ont'), it('Ce soir, ___ mange des crêpes.', 'on'),
      it('Mes parents ___ une voiture bleue.', 'ont'), it('___ joue au loup ?', 'on'), it('Ils ___ faim.', 'ont'),
      it('___ entend la pluie.', 'on'), it('Les chats ___ des moustaches.', 'ont'), it('Demain, ___ part en voyage.', 'on'),
      it('Elles ___ gagné la course.', 'ont'), it('___ frappe à la porte.', 'on'),
      it('Les filles ___ un secret.', 'ont'), it('À la cantine, ___ mange bien.', 'on'), it('Mes voisins ___ un jardin.', 'ont'),
      it('___ dit que la mer est froide.', 'on'), it("Les enfants ___ peur de l'orage.", 'ont'), it('___ chante une chanson.', 'on'),
      it('Ils ___ trouvé un trésor.', 'ont'), it('Quand ___ a froid, ___ met un pull.', 'on'), it('Les arbres ___ perdu leurs feuilles.', 'ont'),
      it('Ici, ___ parle français.', 'on'), it('Mes amis ___ dix ans.', 'ont'),
    ],
  },
];

/* ---- Conjugaison : 6 verbes (1er et 2e groupes, être, avoir, aller, faire), 4 temps. ---- */

const VERBS = ['chanter', 'finir', 'être', 'avoir', 'aller', 'faire'] as const;
type Verb = (typeof VERBS)[number];
type Tables = Record<Verb, readonly string[]>;

const PRES: Tables = {
  chanter: ['chante', 'chantes', 'chante', 'chantons', 'chantez', 'chantent'],
  finir: ['finis', 'finis', 'finit', 'finissons', 'finissez', 'finissent'],
  être: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
  avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
  aller: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
  faire: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
};
const FUT: Tables = {
  chanter: ['chanterai', 'chanteras', 'chantera', 'chanterons', 'chanterez', 'chanteront'],
  finir: ['finirai', 'finiras', 'finira', 'finirons', 'finirez', 'finiront'],
  être: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
  avoir: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
  aller: ['irai', 'iras', 'ira', 'irons', 'irez', 'iront'],
  faire: ['ferai', 'feras', 'fera', 'ferons', 'ferez', 'feront'],
};
const IMP: Tables = {
  chanter: ['chantais', 'chantais', 'chantait', 'chantions', 'chantiez', 'chantaient'],
  finir: ['finissais', 'finissais', 'finissait', 'finissions', 'finissiez', 'finissaient'],
  être: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
  avoir: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
  aller: ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient'],
  faire: ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient'],
};
const pc = (aux: readonly string[], part: string): string[] => aux.map((x) => `${x} ${part}`);
const AVOIR = PRES.avoir, ETRE = PRES.être;
const PC: Tables = {
  chanter: pc(AVOIR, 'chanté'),
  finir: pc(AVOIR, 'fini'),
  être: pc(AVOIR, 'été'),
  avoir: pc(AVOIR, 'eu'),
  // Avec être, le participe s'accorde : les phrases du quiz n'ont que des sujets masculins.
  aller: ETRE.map((x, i) => `${x} allé${i >= 3 ? 's' : ''}`),
  faire: pc(AVOIR, 'fait'),
};

/** Formes les plus faciles à confondre avec la bonne, par personne (même son, ou personne voisine). */
const CONFUSE: Record<Person, readonly Person[]> = { 0: [1, 2, 5], 1: [0, 2, 5], 2: [5, 0, 1], 3: [4, 5, 2], 4: [3, 5, 1], 5: [2, 3, 4] };

/** Phrase de conjugaison : la bonne forme et deux formes du même verbe, à d'autres personnes. */
function conj(t: Tables, s: string, verb: Verb, who: Person): FrItem {
  const forms = t[verb], a = forms[who]!;
  const others = [...new Set(CONFUSE[who].map((k) => forms[k]!).filter((x) => x !== a))].slice(0, 2);
  return { s, a, opts: [a, ...others], verb, who };
}

/** Les mêmes phrases à chaque temps, avec un mot de temps adapté. */
const SENTENCES: readonly [string, Verb, Person][] = [
  ['{t}, je ___ une chanson.', 'chanter', 0], ['{t}, les oiseaux ___ dans les arbres.', 'chanter', 5], ['{t}, tu ___ avec la chorale.', 'chanter', 1],
  ['{t}, nous ___ nos devoirs.', 'finir', 3], ['{t}, Léo ___ son dessin.', 'finir', 2], ['{t}, vous ___ le puzzle.', 'finir', 4],
  ['{t}, je ___ malade.', 'être', 0], ['{t}, vous ___ très gentils.', 'être', 4], ['{t}, mes amis ___ très contents.', 'être', 5],
  ['{t}, tu ___ un cadeau.', 'avoir', 1], ['{t}, nous ___ de la chance.', 'avoir', 3], ['{t}, elle ___ un vélo rouge.', 'avoir', 2],
  ['{t}, je ___ à la piscine.', 'aller', 0], ['{t}, ils ___ à la mer.', 'aller', 5], ['{t}, nous ___ au cinéma.', 'aller', 3],
  ['{t}, tu ___ un gâteau.', 'faire', 1], ['{t}, vous ___ du vélo.', 'faire', 4], ['{t}, papa ___ la vaisselle.', 'faire', 2],
  ['{t}, il ___ dans la cour.', 'chanter', 2], ['{t}, tu ___ ton goûter.', 'finir', 1],
];

/** Phrases d'un temps : les mêmes situations, avec « Aujourd'hui », « Demain », « Autrefois » ou « Hier ». */
const tenseItems = (t: Tables, when: string): FrItem[] =>
  SENTENCES.map(([s, v, w]) => conj(t, s.replace('{t}', when), v, w));

const TENSES: readonly FrQuiz[] = [
  {
    id: 'pres', title: 'Le présent', choices: [], rule: {}, swap: {},
    tense: { name: 'au présent', rule: 'Au présent, les verbes en ‑er finissent par ‑e, ‑es, ‑e, ‑ons, ‑ez, ‑ent ; être, avoir, aller et faire sont à connaître par cœur.', tables: PRES },
    items: tenseItems(PRES, "Aujourd'hui"),
  },
  {
    id: 'fut', title: 'Le futur', choices: [], rule: {}, swap: {},
    tense: { name: 'au futur', rule: "Au futur, on entend souvent l'infinitif, puis ‑ai, ‑as, ‑a, ‑ons, ‑ez, ‑ont.", tables: FUT },
    items: tenseItems(FUT, 'Demain'),
  },
  {
    id: 'imp', title: "L'imparfait", choices: [], rule: {}, swap: {},
    tense: { name: "à l'imparfait", rule: "À l'imparfait, les terminaisons sont toujours ‑ais, ‑ais, ‑ait, ‑ions, ‑iez, ‑aient.", tables: IMP },
    items: tenseItems(IMP, 'Autrefois'),
  },
  {
    id: 'pc', title: 'Le passé composé', choices: [], rule: {}, swap: {},
    tense: { name: 'au passé composé', rule: 'Au passé composé, on met avoir (ou être) au présent, puis le participe passé : j\'ai chanté.', tables: PC },
    items: tenseItems(PC, 'Hier'),
  },
];

export const ALL_QUIZZES: readonly FrQuiz[] = [...QUIZZES, ...TENSES];

export const quizOf = (id: FrQuizId): FrQuiz => ALL_QUIZZES.find((q) => q.id === id)!;

/** Conjugaison : la ligne du tableau (« nous finirons »), avec l'élision de « je ». */
export const withPronoun = (who: Person, form: string): string => (who === 0 && /^[aeiouéèêh]/i.test(form) ? `j'${form}` : `${PRONOUNS[who]} ${form}`);

/** Le truc pour une phrase : la règle du mot (homophones), ou celle du temps avec la bonne forme (conjugaison). */
export function ruleOf(q: FrQuiz, it: FrItem): string {
  if (q.tense && it.verb && it.who !== undefined) return `${q.tense.rule} Ici : ${withPronoun(it.who, it.a)} (${it.verb}).`;
  return q.rule[it.a] ?? '';
}

const VOWEL = /^[aeiouéèêh]/i;

/** Texte avant un trou, une fois le mot connu : « je » s'élide devant une voyelle (« j'étais »). */
export const beforeWord = (before: string, w: string): string => (VOWEL.test(w) ? before.replace(/(^|[^\p{L}])([Jj])e $/u, "$1$2'") : before);

/** Les trous de la phrase remplis avec `w` (« Quand on a froid, on met un pull. », « Hier, j'ai chanté. »). */
export const fillBlank = (s: string, w: string): string => {
  const out = s.split('___').reduce((acc, part, i) => (i === 0 ? part : beforeWord(acc, w) + w + part), '');
  return out.charAt(0).toUpperCase() + out.slice(1);
};

/** Phrases d'une étape : 0 = première moitié, 1 = seconde moitié, null ou 2 = toutes. */
export function stepItems(q: FrQuiz, step: number | null): readonly FrItem[] {
  const half = Math.ceil(q.items.length / 2);
  return step === 0 ? q.items.slice(0, half) : step === 1 ? q.items.slice(half) : q.items;
}
