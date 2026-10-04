/* Anglais (CM1) : catalogue des thèmes, d'après les fiches de révision de la classe
   (Revision words CE1 et CE2, Classroom language). Un thème = une île :
   étape 1 = première moitié des mots, étape 2 = seconde moitié, étape 3 = tous les mots + les phrases du thème.
   « Hello again » (CE2) reprend les nombres de « Hello » : ses phrases sont rangées dans « Hello ». */

export interface Word {
  /** Mot ou expression en anglais, tel qu'il est écrit sur la fiche. */
  en: string;
  /** Traduction affichée quand le mot n'a pas de dessin (et dans l'espace parent). */
  fr: string;
  /** Faux : pas de dessin possible sans ambiguïté (aunt, breakfast…) ; la question montre le mot français. */
  pic: boolean;
  /** Nom toujours au pluriel (jeans, trousers) : pas d'article. */
  plural?: boolean;
  /** Pluriel, s'il ne se forme pas avec un simple « s ». */
  pl?: string;
  /** Forme en -ing (« I like playing… »). */
  ing?: string;
}

/** Phrases travaillées à l'étape 3. Dans les modèles : {w} le mot, {a} le mot avec son article (an apple, jeans),
    {pl} le pluriel, {ing} la forme en -ing, {n} un nombre écrit en lettres. `only` restreint aux mots cités. */
export type Drill =
  /** Dessin (ou mot français) d'un mot → choisir la bonne phrase parmi 3 (une par mot). */
  | { kind: 'pick'; q: string; a: string; only?: readonly string[] }
  /** Dessin + question sur un mot → répondre oui ou non. `cue` dit d'où vient la vérité :
      le dessin est-il ce mot (match), le visage sourit-il (like), le geste est-il coché (can). */
  | { kind: 'yesno'; cue: 'match' | 'like' | 'can'; q: string; yes: string; no: string; only?: readonly string[] }
  /** Dessin de 2 à 5 objets → choisir la phrase avec le bon nombre. */
  | { kind: 'count'; q: string; a: string; only?: readonly string[] }
  /** Question (ou situation en français si `fr`) → bonne réponse parmi celles des autres paires du thème. */
  | { kind: 'qa'; q: string; a: string; fr?: boolean };

export type ThemeId =
  | 'hello' | 'school' | 'toys' | 'family' | 'home' | 'body' | 'food' | 'actions' | 'animals'
  | 'transport' | 'pets' | 'clothes' | 'rooms' | 'meals' | 'activities' | 'town' | 'farm' | 'classroom';

export interface Theme {
  id: ThemeId;
  /** Titre de la fiche (anglais) et titre affiché à l'enfant (français). */
  en: string;
  fr: string;
  /** Fiche d'origine. */
  sheet: 'CE1' | 'CE2' | 'Classe';
  words: readonly Word[];
  drills: readonly Drill[];
}

/** Mot : `w('apple', 'pomme')`, options en 3e argument. */
const w = (en: string, fr: string, o: Partial<Omit<Word, 'en' | 'fr'>> = {}): Word => ({ en, fr, pic: true, ...o });
const noPic = { pic: false } as const;

const COLOURS = ['red', 'yellow', 'green', 'blue', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'grey'];
const COLOURS_FR = ['rouge', 'jaune', 'vert', 'bleu', 'orange', 'violet', 'rose', 'marron', 'noir', 'blanc', 'gris'];
export const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const NUMBERS_FR = ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];

export const THEMES: readonly Theme[] = [
  {
    id: 'hello', en: 'Hello', fr: 'Couleurs et nombres', sheet: 'CE1',
    words: [...COLOURS.map((c, i) => w(c, COLOURS_FR[i]!)), ...NUMBERS.map((n, i) => w(n, NUMBERS_FR[i]!))],
    drills: [
      { kind: 'pick', q: "What's your favourite colour?", a: 'My favourite colour is {w}.', only: COLOURS },
      { kind: 'qa', q: "What's your name?", a: 'My name is Tom.' },
      { kind: 'qa', q: 'How old are you?', a: 'I am nine.' },
      { kind: 'qa', q: "What's your favourite colour?", a: 'My favourite colour is green.' },
      { kind: 'qa', q: 'How do you spell "cat"?', a: 'C - A - T.' },
      { kind: 'qa', q: "What's this?", a: "It's a book." },
    ],
  },
  {
    id: 'school', en: 'School', fr: "L'école", sheet: 'CE1',
    words: [
      w('board', 'tableau'), w('book', 'livre'), w('chair', 'chaise'), w('desk', 'bureau'), w('door', 'porte'),
      w('pen', 'stylo'), w('pencil', 'crayon'), w('pencil case', 'trousse', { pl: 'pencil cases' }), w('rubber', 'gomme'), w('window', 'fenêtre'),
    ],
    drills: [
      { kind: 'pick', q: "What's this?", a: "It's {a}." },
      { kind: 'count', q: 'How many {pl} can you see?', a: 'I can see {n} {pl}.', only: ['book', 'chair', 'pen', 'pencil', 'rubber'] },
    ],
  },
  {
    id: 'toys', en: 'Toys', fr: 'Les jouets', sheet: 'CE1',
    words: [
      w('art set', 'boîte de peinture'), w('ball', 'ballon'), w('bike', 'vélo'), w('camera', 'appareil photo'), w('computer', 'ordinateur'),
      w('computer game', 'jeu vidéo'), w('doll', 'poupée'), w('kite', 'cerf-volant'), w('robot', 'robot'), w('teddy bear', 'ours en peluche'),
    ],
    drills: [
      { kind: 'pick', q: "What's this?", a: "It's {a}." },
      { kind: 'yesno', cue: 'match', q: 'Is it {a}?', yes: 'Yes, it is.', no: "No, it isn't." },
    ],
  },
  {
    id: 'family', en: 'Family', fr: 'La famille', sheet: 'CE1',
    // Dessinés en petit arbre généalogique : « moi » et une flèche vers la personne.
    words: [
      w('aunt', 'tante'), w('brother', 'frère'), w('cousin', 'cousin'), w('dad', 'papa'), w('grandpa', 'papi'),
      w('grandma', 'mamie'), w('mum', 'maman'), w('sister', 'sœur'), w('uncle', 'oncle'),
    ],
    drills: [
      { kind: 'pick', q: "Who's this?", a: "It's my {w}." },
      { kind: 'pick', q: "Who's that?", a: "It's my {w}." },
    ],
  },
  {
    id: 'home', en: 'At home', fr: 'La maison', sheet: 'CE1',
    words: [
      w('balcony', 'balcon'), w('bathroom', 'salle de bain'), w('bedroom', 'chambre'), w('dining room', 'salle à manger'), w('flat', 'appartement'),
      w('garden', 'jardin'), w('hall', 'entrée', noPic), w('house', 'maison'), w('kitchen', 'cuisine'), w('living room', 'salon'),
    ],
    drills: [
      { kind: 'pick', q: 'Where are you?', a: 'I am in the {w}.', only: ['bathroom', 'bedroom', 'dining room', 'garden', 'hall', 'kitchen', 'living room'] },
      { kind: 'pick', q: 'Where is he?', a: 'He is in the {w}.', only: ['bathroom', 'bedroom', 'dining room', 'garden', 'hall', 'kitchen', 'living room'] },
      { kind: 'pick', q: 'Where is she?', a: 'She is in the {w}.', only: ['bathroom', 'bedroom', 'dining room', 'garden', 'hall', 'kitchen', 'living room'] },
    ],
  },
  {
    id: 'body', en: 'My body', fr: 'Le corps', sheet: 'CE1',
    words: [
      w('arms', 'bras', { plural: true }), w('ears', 'oreilles', { plural: true }), w('eyes', 'yeux', { plural: true }), w('head', 'tête'), w('hair', 'cheveux'),
      w('hands', 'mains', { plural: true }), w('legs', 'jambes', { plural: true }), w('mouth', 'bouche'), w('nose', 'nez'),
    ],
    drills: [
      { kind: 'qa', q: "J'ai une tête rouge.", a: "I've got a red head.", fr: true },
      { kind: 'qa', q: 'As-tu un nez jaune ?', a: 'Have you got a yellow nose?', fr: true },
      { kind: 'qa', q: "J'ai deux oreilles.", a: "I've got two ears.", fr: true },
      { kind: 'qa', q: "J'ai les cheveux noirs.", a: "I've got black hair.", fr: true },
    ],
  },
  {
    id: 'food', en: 'Food', fr: 'La nourriture', sheet: 'CE1',
    words: [
      w('apple', 'pomme'), w('banana', 'banane'), w('bread', 'pain'), w('cheese', 'fromage'), w('chicken', 'poulet'),
      w('egg', 'œuf'), w('juice', 'jus de fruit'), w('milk', 'lait'), w('orange', 'orange'), w('water', 'eau'),
    ],
    drills: [
      { kind: 'yesno', cue: 'like', q: 'Do you like {pl}?', yes: 'Yes, I do.', no: "No, I don't.", only: ['apple', 'banana', 'egg', 'orange'] },
      { kind: 'yesno', cue: 'like', q: 'Do you like {w}?', yes: 'Yes, I do.', no: "No, I don't.", only: ['bread', 'cheese', 'chicken', 'juice', 'milk', 'water'] },
      { kind: 'qa', q: "J'aime les bananes.", a: 'I like bananas.', fr: true },
      { kind: 'qa', q: "Je n'aime pas le fromage.", a: "I don't like cheese.", fr: true },
    ],
  },
  {
    id: 'actions', en: 'Actions', fr: 'Les actions', sheet: 'CE1',
    words: [
      w('climb', 'grimper'), w('dance', 'danser'), w('draw', 'dessiner'), w('jump', 'sauter'), w('paint', 'peindre'),
      w('play football', 'jouer au foot'), w('ride a bike', 'faire du vélo'), w('run', 'courir'), w('sing', 'chanter'), w('swim', 'nager'),
    ],
    drills: [
      { kind: 'yesno', cue: 'can', q: 'Can you {w}?', yes: 'Yes, I can.', no: "No, I can't." },
      { kind: 'qa', q: 'Je sais nager.', a: 'I can swim.', fr: true },
      { kind: 'qa', q: 'Je ne sais pas danser.', a: "I can't dance.", fr: true },
    ],
  },
  {
    id: 'animals', en: 'Animals', fr: 'Les animaux', sheet: 'CE1',
    words: [
      w('bird', 'oiseau'), w('crocodile', 'crocodile'), w('elephant', 'éléphant'), w('giraffe', 'girafe'), w('lion', 'lion'),
      w('monkey', 'singe'), w('snake', 'serpent'), w('spider', 'araignée'), w('zebra', 'zèbre'),
    ],
    drills: [
      { kind: 'pick', q: "What's this?", a: "It's {a}." },
      { kind: 'qa', q: 'Les éléphants sont grands.', a: 'Elephants are big.', fr: true },
      { kind: 'qa', q: 'Les éléphants ont une longue trompe.', a: 'Elephants have got long trunks.', fr: true },
      { kind: 'qa', q: 'Les girafes ont un long cou.', a: 'Giraffes have got long necks.', fr: true },
    ],
  },
  {
    id: 'transport', en: 'Transport', fr: 'Les transports', sheet: 'CE2',
    words: [
      w('boat', 'bateau'), w('bus', 'bus', { pl: 'buses' }), w('car', 'voiture'), w('helicopter', 'hélicoptère'), w('lorry', 'camion', { pl: 'lorries' }),
      w('motorbike', 'moto'), w('plane', 'avion'), w('tractor', 'tracteur'), w('train', 'train'),
    ],
    drills: [
      { kind: 'yesno', cue: 'match', q: 'Has he got {a}?', yes: 'Yes, he has.', no: 'No, he has not.' },
      { kind: 'qa', q: "J'ai un gros camion vert.", a: 'I have got a big green lorry.', fr: true },
      { kind: 'qa', q: 'A-t-il un avion ?', a: 'Has he got a plane?', fr: true },
    ],
  },
  {
    id: 'pets', en: 'Pets', fr: 'Animaux et personnes', sheet: 'CE2',
    words: [
      w('baby', 'bébé', { pl: 'babies' }), w('boy', 'garçon'), w('cat', 'chat'), w('dog', 'chien'), w('fish', 'poisson', { pl: 'fish' }),
      w('girl', 'fille'), w('man', 'homme', { pl: 'men' }), w('mouse', 'souris', { pl: 'mice' }), w('woman', 'femme', { pl: 'women' }),
    ],
    drills: [
      { kind: 'yesno', cue: 'match', q: 'Is it {a}?', yes: 'Yes, it is.', no: 'No, it is not.' },
      { kind: 'qa', q: 'Il est beau.', a: 'It is beautiful.', fr: true },
      { kind: 'qa', q: 'Il est laid.', a: 'It is ugly.', fr: true },
      { kind: 'qa', q: 'Il est vieux.', a: 'It is old.', fr: true },
      { kind: 'qa', q: 'Il est jeune.', a: 'It is young.', fr: true },
      { kind: 'qa', q: 'Est-il petit ?', a: 'Is it small?', fr: true },
    ],
  },
  {
    id: 'clothes', en: 'Clothes', fr: 'Les vêtements', sheet: 'CE2',
    words: [
      w('dress', 'robe'), w('jacket', 'veste'), w('jeans', 'jean', { plural: true }), w('shirt', 'chemise'), w('shoes', 'chaussures', { plural: true }),
      w('skirt', 'jupe'), w('socks', 'chaussettes', { plural: true }), w('trousers', 'pantalon', { plural: true }), w('T-shirt', 'tee-shirt'),
    ],
    drills: [
      { kind: 'yesno', cue: 'match', q: 'Are you wearing {a}?', yes: 'Yes, I am.', no: 'No, I am not.' },
      { kind: 'pick', q: 'What are you wearing?', a: 'I am wearing {a}.' },
      { kind: 'qa', q: 'Je porte un pantalon bleu.', a: 'I am wearing blue trousers.', fr: true },
    ],
  },
  {
    id: 'rooms', en: 'Rooms', fr: 'Les meubles', sheet: 'CE2',
    words: [
      w('bookcase', 'bibliothèque'), w('cupboard', 'placard'), w('lamp', 'lampe'), w('mirror', 'miroir'), w('phone', 'téléphone'),
      w('sofa', 'canapé'), w('table', 'table'), w('TV', 'télé'), w('wardrobe', 'armoire'),
      w('in', 'dans'), w('on', 'sur'), w('under', 'sous'), w('next to', 'à côté de'),
    ],
    drills: [
      { kind: 'pick', q: 'Where is the cat?', a: 'The cat is {w} the box.', only: ['in', 'on', 'under', 'next to'] },
      { kind: 'qa', q: 'Il y a un canapé dans la salle de bain.', a: 'There is a sofa in the bathroom.', fr: true },
      { kind: 'qa', q: 'Combien de livres y a-t-il ?', a: 'How many books are there?', fr: true },
    ],
  },
  {
    id: 'meals', en: 'Meals', fr: 'Les repas', sheet: 'CE2',
    words: [
      w('beans', 'haricots', { plural: true }), w('carrots', 'carottes', { plural: true }), w('cereal', 'céréales'), w('fish', 'poisson'), w('meat', 'viande'),
      w('peas', 'petits pois', { plural: true }), w('potatoes', 'pommes de terre', { plural: true }), w('rice', 'riz'), w('sausages', 'saucisses', { plural: true }), w('toast', 'pain grillé'),
      w('breakfast', 'petit-déjeuner', noPic), w('lunch', 'déjeuner', noPic), w('dinner', 'dîner', noPic),
    ],
    drills: [
      { kind: 'yesno', cue: 'like', q: 'Does she like {w}?', yes: 'Yes, she does.', no: 'No, she does not.', only: ['beans', 'carrots', 'cereal', 'fish', 'meat', 'peas', 'potatoes', 'rice', 'sausages', 'toast'] },
      { kind: 'qa', q: "J'aime les céréales au petit-déjeuner.", a: 'I like cereal for breakfast.', fr: true },
      { kind: 'qa', q: 'Il aime le riz au déjeuner.', a: 'He likes rice for lunch.', fr: true },
      { kind: 'qa', q: 'Elle aime le poisson au dîner.', a: 'She likes fish for dinner.', fr: true },
    ],
  },
  {
    id: 'activities', en: 'Activities', fr: 'Les loisirs', sheet: 'CE2',
    words: [
      w('fly a kite', 'faire voler un cerf-volant', { ing: 'flying a kite' }), w('take photos', 'prendre des photos', { ing: 'taking photos' }),
      w('rollerskate', 'faire du roller', { ing: 'rollerskating' }), w('ride a horse', 'faire du cheval', { ing: 'riding a horse' }),
      w('play basketball', 'jouer au basket', { ing: 'playing basketball' }), w('play baseball', 'jouer au baseball', { ing: 'playing baseball' }),
      w('play tennis', 'jouer au tennis', { ing: 'playing tennis' }), w('play hockey', 'jouer au hockey', { ing: 'playing hockey' }),
    ],
    drills: [
      { kind: 'yesno', cue: 'like', q: 'Do you like {ing}?', yes: 'Yes, I do.', no: "No, I don't." },
      { kind: 'yesno', cue: 'like', q: 'Does he like {ing}?', yes: 'Yes, he does.', no: 'No, he does not.' },
      { kind: 'pick', q: 'What does she like?', a: 'She likes {ing}.' },
    ],
  },
  {
    id: 'town', en: 'In town', fr: 'La ville', sheet: 'CE2',
    words: [
      w('book shop', 'librairie'), w('café', 'café'), w('cinema', 'cinéma'), w('clothes shop', 'magasin de vêtements'), w('park', 'parc'),
      w('playground', 'aire de jeux'), w('school', 'école'), w('street', 'rue'), w('supermarket', 'supermarché'), w('toy shop', 'magasin de jouets'),
      w('behind', 'derrière'), w('in front of', 'devant'), w('between', 'entre'),
    ],
    drills: [
      // « between » se dit avec deux lieux : seules les deux autres prépositions vont dans ce modèle.
      { kind: 'yesno', cue: 'match', q: 'Is the toy shop {w} the cinema?', yes: 'Yes, it is.', no: 'No, it is not.', only: ['behind', 'in front of'] },
      { kind: 'qa', q: 'Le magasin de jouets est derrière le cinéma.', a: 'The toy shop is behind the cinema.', fr: true },
      { kind: 'qa', q: 'Y a-t-il un magasin de jouets devant le supermarché ?', a: 'Is there a toy shop in front of the supermarket?', fr: true },
      { kind: 'qa', q: 'Oui, il y en a un.', a: 'Yes, there is.', fr: true },
      { kind: 'qa', q: "Non, il n'y en a pas.", a: 'No, there is not.', fr: true },
    ],
  },
  {
    id: 'farm', en: 'On the farm', fr: 'La ferme', sheet: 'CE2',
    words: [
      w('barn', 'grange'), w('cow', 'vache'), w('donkey', 'âne'), w('duck', 'canard'), w('field', 'champ'),
      w('goat', 'chèvre'), w('horse', 'cheval'), w('pond', 'mare'), w('sheep', 'mouton', { pl: 'sheep' }),
    ],
    drills: [
      { kind: 'qa', q: "What's the duck doing?", a: 'It is swimming.' },
      { kind: 'qa', q: 'Is the cat sleeping?', a: 'Yes, it is.' },
      { kind: 'qa', q: 'Is the cow swimming?', a: 'No, it is not.' },
      { kind: 'pick', q: "What's this?", a: "It's {a}.", only: ['barn', 'cow', 'donkey', 'duck', 'field', 'goat', 'horse', 'pond'] },
    ],
  },
  {
    id: 'classroom', en: 'Classroom language', fr: 'En classe', sheet: 'Classe',
    words: [
      w('stand up', 'lève-toi'), w('sit down', 'assieds-toi'), w('come up to the board', 'viens au tableau'), w('look at the board', 'regarde le tableau'),
      w('close the door', 'ferme la porte'), w('open the window', 'ouvre la fenêtre'), w('take your exercise book', 'prends ton cahier'), w('be quiet', 'silence'),
      w('open your book', 'ouvre ton livre'),
      w('close your book', 'ferme ton livre'), w('read', 'lis'), w('draw', 'dessine'), w('take your pencil', 'prends ton crayon'),
      w('write', 'écris'), w('listen', 'écoute'), w('raise your hands', 'levez la main'), w('erase the board', 'efface le tableau'),
    ],
    drills: [
      { kind: 'qa', q: 'Tu veux aller au tableau.', a: 'Can I go to the board?', fr: true },
      { kind: 'qa', q: 'Tu veux aller aux toilettes.', a: 'Can I go to the toilet?', fr: true },
      { kind: 'qa', q: 'Tu veux allumer la lumière.', a: 'Can I switch on the lights?', fr: true },
      { kind: 'qa', q: 'Tu veux éteindre la lumière.', a: 'Can I switch off the lights?', fr: true },
      { kind: 'qa', q: 'Tu veux ouvrir la fenêtre.', a: 'Can I open the window?', fr: true },
      { kind: 'qa', q: 'Tu veux fermer la fenêtre.', a: 'Can I close the window?', fr: true },
      { kind: 'qa', q: 'Tu veux entrer.', a: 'Can I come in?', fr: true },
      { kind: 'qa', q: 'Tu veux répondre à la question.', a: 'Can I answer the question?', fr: true },
      { kind: 'qa', q: 'Tu veux remonter les stores.', a: 'Can I pull up the blinds?', fr: true },
      { kind: 'qa', q: 'Tu veux baisser les stores.', a: 'Can I pull down the blinds?', fr: true },
      { kind: 'qa', q: 'Tu veux sortir.', a: 'Can I go out?', fr: true },
      { kind: 'qa', q: 'Tu veux tailler ton crayon.', a: 'Can I sharpen my pencil?', fr: true },
      { kind: 'qa', q: 'Vous voulez ranger vos affaires.', a: 'Can we pack our things now?', fr: true },
      { kind: 'qa', q: "Tu veux faire l'exercice au tableau.", a: 'Can I do that exercise on the board?', fr: true },
      { kind: 'qa', q: 'Tu ne vois pas le tableau.', a: "I can't see the board, can you step aside?", fr: true },
      { kind: 'qa', q: 'Tu veux réécouter le CD.', a: 'Can you play the CD again, please?', fr: true },
      { kind: 'qa', q: "Tu as besoin d'aide.", a: 'Can you help me, please?', fr: true },
    ],
  },
];

export const themeOf = (id: ThemeId): Theme => THEMES.find((t) => t.id === id)!;

/** Mots d'une étape : 0 = première moitié, 1 = seconde moitié, null ou 2 = tous. */
export function stepWords(t: Theme, step: number | null): readonly Word[] {
  const half = Math.ceil(t.words.length / 2);
  return step === 0 ? t.words.slice(0, half) : step === 1 ? t.words.slice(half) : t.words;
}

const VOWEL = /^[aeiou]/i;

/** Mot avec son article : « an apple », « a book », « jeans ». */
export const withArticle = (x: Word): string => (x.plural ? x.en : `${VOWEL.test(x.en) ? 'an' : 'a'} ${x.en}`);

export const pluralOf = (x: Word): string => x.pl ?? (x.plural ? x.en : `${x.en}s`);

/** Remplit un modèle de phrase ({w}, {a}, {pl}, {ing}, {n}). */
export function fillDrill(tpl: string, x: Word, n = 0): string {
  return tpl
    .replace(/\{w\}/g, x.en)
    .replace(/\{a\}/g, withArticle(x))
    .replace(/\{pl\}/g, pluralOf(x))
    .replace(/\{ing\}/g, x.ing ?? x.en)
    .replace(/\{n\}/g, NUMBERS[n - 1] ?? String(n));
}

/** Mots concernés par une phrase (tous, ou ceux de `only`). */
export const drillWords = (t: Theme, d: Drill): readonly Word[] =>
  d.kind === 'qa' ? [] : d.only ? t.words.filter((x) => d.only!.includes(x.en)) : t.words;
