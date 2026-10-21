/* Français (CM1) : les homophones grammaticaux. Une paire = une île : une phrase à trou, deux mots possibles.
   Étape 1 = première moitié des phrases, étape 2 = seconde moitié, étape 3 et gardien = toutes. */

export type FrQuizId = 'a' | 'et' | 'son' | 'on';

export interface FrItem {
  /** Phrase avec un trou « ___ ». */
  s: string;
  /** Le mot qui va dans le trou (l'un des deux de la paire). */
  a: string;
}

export interface FrQuiz {
  id: FrQuizId;
  /** « a ou à ». */
  title: string;
  /** Les deux mots, toujours dans cet ordre sur les boutons. */
  choices: readonly [string, string];
  /** Le truc pour choisir, mot par mot. */
  rule: Readonly<Record<string, string>>;
  /** Mot qu'on essaie à la place (« avait » pour « a ») ; absent si aucun ne marche (« à »). */
  swap: Readonly<Record<string, string>>;
  items: readonly FrItem[];
}

const it = (s: string, a: string): FrItem => ({ s, a });

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
      it("Mamie ___ préparé une tarte.", 'a'), it('Je vais ___ la boulangerie.', 'à'),
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
      it('Ce livre ___ passionnant.', 'est'), it('Du pain ___ du fromage.', 'et'), it("Ma tante ___ en vacances.", 'est'),
      it('Je cours ___ je saute.', 'et'), it('La porte ___ ouverte.', 'est'),
      it('Un chat ___ une souris.', 'et'), it('Le film ___ trop long.', 'est'), it('Il pleut ___ il fait froid.', 'et'),
      it('Ton dessin ___ magnifique.', 'est'), it('Papa ___ maman arrivent.', 'et'), it('Le lion ___ le roi des animaux.', 'est'),
      it('Elle chante ___ elle danse.', 'et'), it('La classe ___ silencieuse.', 'est'), it('Des crayons ___ des feutres.', 'et'),
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
      it('___ dit que la mer est froide.', 'on'), it('Les enfants ___ peur de l’orage.', 'ont'), it('___ chante une chanson.', 'on'),
      it('Ils ___ trouvé un trésor.', 'ont'), it('Quand ___ a froid, ___ met un pull.', 'on'), it('Les arbres ___ perdu leurs feuilles.', 'ont'),
      it('Ici, ___ parle français.', 'on'), it('Mes amis ___ dix ans.', 'ont'),
    ],
  },
];

export const quizOf = (id: FrQuizId): FrQuiz => QUIZZES.find((q) => q.id === id)!;

/** Les trous de la phrase remplis avec `w` (« Quand on a froid, on met un pull. »). */
export const fillBlank = (s: string, w: string): string => {
  const out = s.replace(/___/g, w);
  return out.charAt(0).toUpperCase() + out.slice(1);
};

/** Phrases d'une étape : 0 = première moitié, 1 = seconde moitié, null ou 2 = toutes. */
export function stepItems(q: FrQuiz, step: number | null): readonly FrItem[] {
  const half = Math.ceil(q.items.length / 2);
  return step === 0 ? q.items.slice(0, half) : step === 1 ? q.items.slice(half) : q.items;
}
