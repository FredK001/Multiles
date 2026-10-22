/* Grammaire et accords (CM1), rangés dans le français après la conjugaison :
   - La nature des mots : le mot en couleur est-il un nom, un verbe, un adjectif, un déterminant, un pronom ?
   - Le sujet et le verbe : la bonne forme du verbe au présent (sujet proche, loin, ou après le verbe).
   - Les accords du nom : l'adjectif au féminin ou au pluriel, les pluriels en ‑x.
   - Les mots invariables : la bonne orthographe parmi deux ou trois.
   Une île = une liste de phrases à trou, comme les homophones ; deux ou trois réponses, mélangées.
   Étape 1 = première moitié (le plus simple), étape 2 = seconde moitié (les pièges). */
import type { FrItem, FrQuiz } from './french';

export type Nature = 'nom' | 'verbe' | 'adjectif' | 'déterminant' | 'pronom';

/** Ce qui permet de reconnaître chaque nature (astuce après une erreur). */
const NATURE_TIP: Record<Nature, string> = {
  nom: 'Un nom désigne une personne, un animal, une chose ou une idée ; on peut mettre un déterminant devant.',
  verbe: 'Le verbe dit ce que fait le sujet ; il change si on dit « hier » ou « demain ».',
  adjectif: "L'adjectif dit comment est le nom ; on peut l'enlever, la phrase reste correcte.",
  déterminant: 'Le déterminant est le petit mot juste devant le nom : le, la, les, un, une, des, mon, ce…',
  pronom: 'Le pronom remplace un nom : il, elle, nous, ils… Il est souvent le sujet du verbe.',
};

/** Nature d'un mot : la phrase (le trou marque la place du mot), le mot, sa nature et deux autres natures. */
const nat = (s: string, w: string, a: Nature, x1: Nature, x2: Nature): FrItem => ({ s, a, w, opts: [a, x1, x2], tip: `${NATURE_TIP[a]} Ici, « ${w} » est un ${a}.` });

/** Accord sujet-verbe : `subj` = le sujet de la phrase, `who` = le pronom qui le remplace, `more` = remarque (sujet loin ou après). */
const sv = (s: string, verb: string, a: string, x: readonly string[], subj: string, who: string, more = ''): FrItem => {
  const form = `${who} ${a}`;
  const find = subj.toLowerCase() === who ? `Le sujet est « ${who} »` : `Le sujet est « ${subj} », c'est-à-dire « ${who} »`;
  return { s, a, verb, opts: [a, ...x], tip: `${more}${find} : ${form}.` };
};

/** Accord dans le groupe nominal : le mot de départ (adjectif ou nom), la bonne forme, les autres, le truc. */
const gn = (s: string, kind: 'Adjectif' | 'Nom', base: string, a: string, x: readonly string[], tip: string): FrItem => ({ s, a, cue: [kind, base], opts: [a, ...x], tip });

/** Mot invariable : la bonne orthographe, une ou deux fautes fréquentes, et une remarque éventuelle. */
const inv = (s: string, a: string, x: readonly string[], more = ''): FrItem => {
  const spelled = /^[a-z]+$/.test(a) ? `, ${a.split('').join('-')}` : '';
  return { s, a, opts: [a, ...x], tip: `« ${a} » est un mot invariable : il s'écrit toujours de la même façon${spelled}.${more}` };
};

const FAR = 'Les mots placés entre le sujet et le verbe ne comptent pas. ';
const AFTER = 'Ici, le sujet est placé après le verbe. ';
const TWO = "Deux personnes, c'est un sujet au pluriel. ";

const NATURE: FrQuiz = {
  id: 'nat', title: 'La nature des mots', choices: [], rule: {}, swap: {},
  grammar: {
    rule: "La nature d'un mot, c'est sa famille : nom, verbe, adjectif, déterminant ou pronom.",
    lesson: [
      { t: 'Le nom', d: 'Il désigne une personne, un animal, une chose ou une idée.', ex: ['le chat', 'une maison', 'Léo'] },
      { t: 'Le verbe', d: 'Il dit ce que fait le sujet ; il se conjugue.', ex: ['il mange', 'nous jouons'] },
      { t: "L'adjectif", d: "Il dit comment est le nom ; on peut l'enlever.", ex: ['une robe rouge', 'un vieux château'] },
      { t: 'Le déterminant', d: 'Le petit mot juste devant le nom.', ex: ['le, la, les, un, une, des', 'mon, ton, son, ce, cette'] },
      { t: 'Le pronom', d: 'Il remplace un nom.', ex: ['je, tu, il, elle', 'nous, vous, ils, elles'] },
    ],
  },
  items: [
    // Étape 1 : nom, verbe ou adjectif.
    nat('Le ___ dort sur le canapé.', 'chat', 'nom', 'verbe', 'adjectif'),
    nat('Le chat ___ sur le canapé.', 'dort', 'verbe', 'nom', 'adjectif'),
    nat('Lina porte une robe ___.', 'rouge', 'adjectif', 'nom', 'verbe'),
    nat('Mon frère ___ une pomme.', 'mange', 'verbe', 'nom', 'adjectif'),
    nat('Nous visitons un ___ château.', 'vieux', 'adjectif', 'nom', 'verbe'),
    nat('Le ___ aboie très fort.', 'chien', 'nom', 'adjectif', 'verbe'),
    nat('Les élèves ___ leur cahier.', 'ouvrent', 'verbe', 'nom', 'adjectif'),
    nat('Tom a un chat ___.', 'noir', 'adjectif', 'verbe', 'nom'),
    nat('Le boulanger prépare du ___ chaud.', 'pain', 'nom', 'verbe', 'adjectif'),
    nat('Le soleil ___ dans le ciel.', 'brille', 'verbe', 'adjectif', 'nom'),
    nat('Cette ___ fleur sent bon.', 'jolie', 'adjectif', 'nom', 'verbe'),
    nat('Le ___ de Lucas est cassé.', 'vélo', 'nom', 'verbe', 'adjectif'),
    // Étape 2 : avec les déterminants et les pronoms.
    nat('___ chante dans la chorale.', 'Elle', 'pronom', 'déterminant', 'nom'),
    nat('___ chien court dans le jardin.', 'Mon', 'déterminant', 'pronom', 'nom'),
    nat('Les enfants jouent, puis ___ rentrent.', 'ils', 'pronom', 'déterminant', 'verbe'),
    nat("J'ai lu ___ livre passionnant.", 'un', 'déterminant', 'pronom', 'adjectif'),
    nat('___ partons en vacances.', 'Nous', 'pronom', 'déterminant', 'nom'),
    nat('___ maison est grande.', 'Cette', 'déterminant', 'adjectif', 'pronom'),
    nat('Zoé appelle ___ amie.', 'son', 'déterminant', 'pronom', 'nom'),
    nat('Où est Léo ? ___ arrive.', 'Il', 'pronom', 'déterminant', 'verbe'),
    nat('Les ___ volent vers le sud.', 'oiseaux', 'nom', 'déterminant', 'verbe'),
    nat('Papa ___ la voiture.', 'lave', 'verbe', 'pronom', 'nom'),
    nat('Le petit garçon a un ___ ballon.', 'gros', 'adjectif', 'déterminant', 'nom'),
    nat('___ enfants rient.', 'Les', 'déterminant', 'pronom', 'adjectif'),
  ],
};

const SUBJECT: FrQuiz = {
  id: 'sv', title: 'Le sujet et le verbe', choices: [], rule: {}, swap: {},
  grammar: {
    rule: "Le verbe s'accorde avec son sujet : cherche qui fait l'action en demandant « Qui est-ce qui… ? ».",
    lesson: [
      { t: 'Sujet au singulier', d: 'Il, elle, le chien : le verbe finit souvent par ‑e ou ‑t.', ex: ['Le chien court.', 'Ma sœur chante.'] },
      { t: 'Sujet au pluriel', d: 'Ils, elles, les enfants : le verbe finit par ‑nt.', ex: ['Les enfants jouent.', 'Léa et Tom partent.'] },
      { t: 'Sujet loin du verbe', d: 'Les mots entre le sujet et le verbe ne commandent pas le verbe.', ex: ['Les enfants de ma classe jouent.', 'Le chat des voisins dort.'] },
      { t: 'Sujet après le verbe', d: 'Parfois, le sujet est placé après le verbe.', ex: ['Dans la forêt vivent les loups.', 'Où vont les oiseaux ?'] },
    ],
  },
  items: [
    // Étape 1 : le sujet est juste devant le verbe.
    sv('Les enfants ___ dans la cour.', 'jouer', 'jouent', ['joue', 'joues'], 'Les enfants', 'ils'),
    sv('Le chien ___ dans le jardin.', 'courir', 'court', ['courent', 'cours'], 'Le chien', 'il'),
    sv('Tu ___ tes mains.', 'laver', 'laves', ['lave', 'lavent'], 'Tu', 'tu'),
    sv('Nous ___ une chanson.', 'chanter', 'chantons', ['chantez', 'chantent'], 'Nous', 'nous'),
    sv('Mes cousines ___ à Lyon.', 'habiter', 'habitent', ['habite', 'habites'], 'Mes cousines', 'elles'),
    sv('Vous ___ le bus.', 'prendre', 'prenez', ['prenons', 'prennent'], 'Vous', 'vous'),
    sv('Ma grand-mère ___ un gâteau.', 'préparer', 'prépare', ['préparent', 'prépares'], 'Ma grand-mère', 'elle'),
    sv('Les élèves ___ leurs cahiers.', 'ouvrir', 'ouvrent', ['ouvre', 'ouvres'], 'Les élèves', 'ils'),
    sv('Lucas et Inès ___ au ballon.', 'jouer', 'jouent', ['joue', 'jouons'], 'Lucas et Inès', 'ils', TWO),
    sv('Le vent ___ fort.', 'souffler', 'souffle', ['soufflent', 'souffles'], 'Le vent', 'il'),
    sv('Je ___ mon goûter.', 'finir', 'finis', ['finit', 'finissent'], 'Je', 'je'),
    sv('Ils ___ très vite.', 'grandir', 'grandissent', ['grandit', 'grandis'], 'Ils', 'ils'),
    // Étape 2 : le sujet est loin du verbe, ou placé après lui.
    sv('Les enfants de ma classe ___ au foot.', 'jouer', 'jouent', ['joue', 'joues'], 'Les enfants de ma classe', 'ils', FAR),
    sv('Le chat des voisins ___ sur le mur.', 'dormir', 'dort', ['dorment', 'dors'], 'Le chat des voisins', 'il', FAR),
    sv('Les fleurs du jardin ___ bon.', 'sentir', 'sentent', ['sent', 'sens'], 'Les fleurs du jardin', 'elles', FAR),
    sv('La maîtresse des CM1 ___ une histoire.', 'lire', 'lit', ['lisent', 'lis'], 'La maîtresse des CM1', 'elle', FAR),
    sv('Les pommes de cet arbre ___ rouges.', 'être', 'sont', ['est', 'es'], 'Les pommes de cet arbre', 'elles', FAR),
    sv('Le bruit des voitures ___ le bébé.', 'réveiller', 'réveille', ['réveillent', 'réveilles'], 'Le bruit des voitures', 'il', FAR),
    sv('Le sac de mes amis ___ lourd.', 'être', 'est', ['sont', 'es'], 'Le sac de mes amis', 'il', FAR),
    sv('Mon frère et ma sœur ___ en vacances.', 'partir', 'partent', ['part', 'pars'], 'Mon frère et ma sœur', 'ils', TWO),
    sv('Dans la forêt ___ les loups.', 'vivre', 'vivent', ['vit', 'vis'], 'les loups', 'ils', AFTER),
    sv('Où ___ les oiseaux en hiver ?', 'aller', 'vont', ['va', 'vas'], 'les oiseaux', 'ils', AFTER),
    sv('Sur la branche ___ un oiseau.', 'chanter', 'chante', ['chantent', 'chantes'], 'un oiseau', 'il', AFTER),
    sv('Que ___ les enfants ?', 'dire', 'disent', ['dit', 'dis'], 'les enfants', 'ils', AFTER),
  ],
};

const NOUN_GROUP: FrQuiz = {
  id: 'gn', title: 'Les accords du nom', choices: [], rule: {}, swap: {},
  grammar: {
    rule: "Dans le groupe nominal, le déterminant, le nom et l'adjectif s'accordent : au féminin, on ajoute souvent ‑e ; au pluriel, ‑s ou ‑x.",
    lesson: [
      { t: 'Au féminin', d: "L'adjectif prend souvent un ‑e.", ex: ['un chat noir → une chatte noire', 'un beau livre → une belle histoire'] },
      { t: 'Au pluriel', d: "Le nom et l'adjectif prennent souvent un ‑s.", ex: ['un ballon rond → des ballons ronds', 'une robe verte → des robes vertes'] },
      { t: 'Les pluriels en ‑x', d: 'Les noms en ‑eau et en ‑eu prennent un ‑x ; ceux en ‑al font ‑aux.', ex: ['un bateau → des bateaux', 'un jeu → des jeux', 'un cheval → des chevaux'] },
    ],
  },
  items: [
    // Étape 1 : l'adjectif s'accorde avec le nom.
    gn('Léa a acheté des robes ___.', 'Adjectif', 'vert', 'vertes', ['vert', 'verts'], "« des robes » : féminin pluriel. L'adjectif prend un ‑e et un ‑s : vertes."),
    gn('Mes ___ amies sont là.', 'Adjectif', 'petit', 'petites', ['petit', 'petits'], "« mes amies » : féminin pluriel. L'adjectif prend un ‑e et un ‑s : petites."),
    gn('Un chien ___ aboie.', 'Adjectif', 'noir', 'noir', ['noirs', 'noire'], "« un chien » : masculin singulier. L'adjectif ne change pas : noir."),
    gn('Nous habitons une maison ___.', 'Adjectif', 'blanc', 'blanche', ['blanc', 'blanches'], '« une maison » : féminin singulier. Blanc devient blanche.'),
    gn('Les enfants lancent des ballons ___.', 'Adjectif', 'rond', 'ronds', ['rond', 'rondes'], "« des ballons » : masculin pluriel. L'adjectif prend un ‑s : ronds."),
    gn('Papi raconte une ___ histoire.', 'Adjectif', 'beau', 'belle', ['beau', 'belles'], '« une histoire » : féminin singulier. Beau devient belle.'),
    gn('Le jardin est plein de fleurs ___.', 'Adjectif', 'bleu', 'bleues', ['bleu', 'bleus'], "« des fleurs » : féminin pluriel. L'adjectif prend un ‑e et un ‑s : bleues."),
    gn('Deux ___ garçons jouent au tennis.', 'Adjectif', 'grand', 'grands', ['grand', 'grandes'], "« deux garçons » : masculin pluriel. L'adjectif prend un ‑s : grands."),
    gn('Maman sert une soupe ___.', 'Adjectif', 'chaud', 'chaude', ['chaud', 'chauds'], "« une soupe » : féminin singulier. L'adjectif prend un ‑e : chaude."),
    gn("J'ai mis mes ___ chaussures.", 'Adjectif', 'nouveau', 'nouvelles', ['nouveau', 'nouveaux'], '« mes chaussures » : féminin pluriel. Nouveau devient nouvelles.'),
    gn('Tom est un ami ___.', 'Adjectif', 'gentil', 'gentil', ['gentille', 'gentils'], "« un ami » : masculin singulier. L'adjectif ne change pas : gentil."),
    gn('Je cueille les pommes ___.', 'Adjectif', 'mûr', 'mûres', ['mûr', 'mûrs'], "« les pommes » : féminin pluriel. L'adjectif prend un ‑e et un ‑s : mûres."),
    // Étape 2 : les pluriels en ‑x et les adjectifs qui ne changent pas.
    gn('À la ferme, il y a trois ___.', 'Nom', 'cheval', 'chevaux', ['chevals'], 'Les noms en ‑al font leur pluriel en ‑aux : un cheval, des chevaux.'),
    gn('Les ___ entrent dans le port.', 'Nom', 'bateau', 'bateaux', ['bateaus'], 'Les noms en ‑eau prennent un ‑x au pluriel : des bateaux.'),
    gn('La reine porte des ___.', 'Nom', 'bijou', 'bijoux', ['bijous'], 'Bijou fait partie des sept noms en ‑ou qui prennent un ‑x : des bijoux.'),
    gn('Les ___ de société sont rangés.', 'Nom', 'jeu', 'jeux', ['jeus'], 'Les noms en ‑eu prennent un ‑x au pluriel : des jeux.'),
    gn('Papi lit les ___.', 'Nom', 'journal', 'journaux', ['journals'], 'Les noms en ‑al font leur pluriel en ‑aux : un journal, des journaux.'),
    gn('Mamie fait des gâteaux ___.', 'Adjectif', 'délicieux', 'délicieux', ['délicieuse', 'délicieuses'], '« des gâteaux » : masculin pluriel. Délicieux finit déjà par ‑x : il ne change pas.'),
    gn("Les ___ journées d'été passent vite.", 'Adjectif', 'long', 'longues', ['long', 'longs'], '« les journées » : féminin pluriel. Long devient longues.'),
    gn('Tu as eu une ___ idée.', 'Adjectif', 'bon', 'bonne', ['bon', 'bonnes'], '« une idée » : féminin singulier. Bon devient bonne.'),
    gn('Il porte des pulls ___.', 'Adjectif', 'gris', 'gris', ['grise', 'grises'], '« des pulls » : masculin pluriel. Gris finit déjà par ‑s : il ne change pas.'),
    gn('Au zoo, on voit des animaux ___.', 'Adjectif', 'sauvage', 'sauvages', ['sauvage'], "« des animaux » : pluriel. L'adjectif prend un ‑s : sauvages."),
    gn('Ces ___ voitures roulent encore.', 'Adjectif', 'vieux', 'vieilles', ['vieux', 'vieille'], '« ces voitures » : féminin pluriel. Vieux devient vieilles.'),
  ],
};

const INVARIABLE: FrQuiz = {
  id: 'inv', title: 'Les mots invariables', choices: [], rule: {}, swap: {},
  grammar: {
    rule: "Un mot invariable ne change jamais : pas de ‑s au pluriel, pas de ‑e au féminin. Son orthographe s'apprend par cœur.",
    lesson: [
      { t: 'Pour dire quand', d: 'Ils disent le moment, ou combien de temps.', ex: ["aujourd'hui, maintenant, bientôt, déjà", 'toujours, souvent, jamais, longtemps', 'avant, après, pendant, depuis, ensuite'] },
      { t: 'Pour dire comment', d: 'Ils disent comment, ou combien.', ex: ['beaucoup, très, trop, encore', 'vite, ensemble, dehors'] },
      { t: 'Pour relier', d: 'Ils relient des mots ou des idées.', ex: ['avec, sans', 'alors, parce que'] },
    ],
  },
  items: [
    inv('Il y a ___ de monde au marché.', 'beaucoup', ['boucoup', 'beaucoups']),
    inv('Mon chat dort ___ sur mon lit.', 'toujours', ['toujour', 'toujourt'], ' Il finit toujours par un ‑s.'),
    inv('Range ta chambre ___ !', 'maintenant', ['maintenan', 'maintenent']),
    inv('Il a plu ___ toute la nuit.', 'pendant', ['pandant', 'pendent']),
    inv("J'ai attendu ___ devant l'école.", 'longtemps', ['lontemps', 'longtemp'], ' On y voit « long » et « temps ».'),
    inv('Nous allons ___ à la piscine.', 'souvent', ['souvant', 'souvens']),
    inv("Je n'ai ___ vu la mer.", 'jamais', ['jamai', 'jamè']),
    inv('Il fait beau ___.', "aujourd'hui", ['aujourdhui', "aujourd'huit"], ' Avec une apostrophe.'),
    inv('Les vacances arrivent ___.', 'bientôt', ['bientot', 'bientô'], ' Un accent circonflexe sur le ô, et un ‑t à la fin.'),
    inv('Il a ___ fini ses devoirs.', 'déjà', ['déja', 'dèja'], ' Un accent aigu sur le é, un accent grave sur le à.'),
    inv('Je voudrais ___ un peu de gâteau.', 'encore', ['encor', 'encores']),
    inv('Ce sac est ___ lourd pour moi.', 'trop', ['trot', 'tro']),
    inv('Le film est ___ drôle.', 'très', ['trés', 'tré'], ' Un accent grave sur le è.'),
    inv('Je suis en retard ___ le bus est parti.', 'parce que', ['parceque', 'par ce que'], ' Toujours en deux mots.'),
    inv('Je lis ___ le dîner.', 'après', ['aprés', 'aprè'], ' Un accent grave sur le è.'),
    inv('Lave-toi les mains ___ de manger.', 'avant', ['avan', 'avent']),
    inv('Il joue ___ ses amis.', 'avec', ['avek', 'avecque']),
    inv('Il sort ___ son manteau.', 'sans', ['san', 'sant']),
    inv('Nous jouons ___ dans le jardin.', 'dehors', ['dehor', 'deors']),
    inv('Il court ___ pour attraper le bus.', 'vite', ['vitte', 'vîte']),
    inv('Nous chantons tous ___.', 'ensemble', ['ansemble', 'ensembles']),
    inv('Il habite ici ___ trois ans.', 'depuis', ['depui', 'depuit']),
    inv("Je me lève, ___ je m'habille.", 'ensuite', ['ansuite', 'ensuitte']),
    inv('Il pleut, ___ je prends mon parapluie.', 'alors', ['alor', 'alord']),
  ],
};

/** Les quatre îles de grammaire, dans l'ordre des clés (rangées après la conjugaison). */
export const GRAMMAR: readonly FrQuiz[] = [NATURE, SUBJECT, NOUN_GROUP, INVARIABLE];
