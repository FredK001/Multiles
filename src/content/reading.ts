/* Lecture (CP) : la voix dit un son, une syllabe ou un petit mot ; l'enfant touche la bonne écriture parmi trois.
   Les intrus sont ceux qu'on confond au CP : lettres en miroir (b/d, p/q), voisines (m/n), syllabe à l'envers (la/al).
   Jamais deux écritures qui se prononcent pareil (et/est, an/en, mais/mes) : la voix ne pourrait pas les départager.
   Une île = une étape de l'apprentissage : voyelles, syllabes simples, sons de deux lettres, petits mots.
   Puis deux sortes d'îles ajoutées à la fin (sans déplacer les premières : les clés « 2l5 » restent valables) :
   - phrases : l'enfant LIT une courte phrase (la voix ne la dit pas) et touche le bon dessin parmi trois ;
   - dictée : la voix dit un mot simple et régulier, l'enfant l'écrit avec un petit clavier de lettres. */

export type ReadId = 'voy' | 'syl1' | 'syl2' | 'sons' | 'mots' | 'phr1' | 'dict1' | 'phr2' | 'dict2';

/** Sorte d'île : sons (la voix dit, on touche l'écriture), phrases (on lit, on touche le dessin), dictée (on écrit). */
export type ReadKind = 'son' | 'phrase' | 'dictee';

export interface ReadItem {
  /** Ce qui est écrit sur le bon bouton ; la phrase à lire ; le mot à écrire. */
  w: string;
  /** Sons : les deux écritures intruses. Phrases : les deux dessins intrus. Dictée : les lettres pièges (2 ou 3). */
  x: readonly string[];
  /** Ce que lit la voix, si l'écriture seule se lit mal (« e » → « eu ») ; dictée : le mot, puis le mot dans son groupe. */
  say?: string;
  /** Phrases : le bon dessin. Dictée : le dessin du mot (aide, et question sans voix). */
  pic?: PicId;
}

export interface ReadSet {
  id: ReadId;
  title: string;
  /** Absent = île de sons. */
  kind?: ReadKind;
  items: readonly ReadItem[];
}

/** Dessins des phrases et de la dictée (src/art/reading.ts). */
export type PicId =
  | 'chat-assis' | 'chat-dort' | 'chien' | 'souris' | 'lion'
  | 'chat-dans' | 'chat-sur' | 'chat-derriere' | 'chat-devant'
  | 'velo-rouge' | 'velo-bleu' | 'voiture-rouge' | 'voiture-bleue'
  | 'oiseau-bleu' | 'oiseau-rouge' | 'oiseaux-2-bleus' | 'oiseaux-2-rouges' | 'oiseaux-3-bleus'
  | 'pomme' | 'banane' | 'oeuf' | 'pommes-2' | 'pommes-3' | 'bananes-2' | 'ballons-2' | 'ballons-3'
  | 'garcon-nage' | 'garcon-court' | 'garcon-saute' | 'garcon-lit' | 'garcon-chante' | 'garcon-danse'
  | 'moto' | 'bus' | 'lit' | 'lune' | 'robe' | 'jupe' | 'ours' | 'sofa'
  | 'velo' | 'bebe' | 'ecole' | 'etoile' | 'cheval' | 'vache' | 'mouton' | 'tomate';

/** Chaque dessin : sa description (lecteurs d'écran, imagier) et les mots qui le décrivent entièrement.
    Contrôle du contenu (tests) : tous les mots du bon dessin sont dans la phrase, chaque intrus en a au moins un absent. */
export const PICS: Record<PicId, { label: string; keys: readonly string[] }> = {
  'chat-assis': { label: 'un chat assis, les yeux ouverts', keys: ['chat', 'assis'] },
  'chat-dort': { label: 'un chat qui dort en boule', keys: ['chat', 'dort'] },
  chien: { label: 'un chien', keys: ['chien'] },
  souris: { label: 'une souris grise', keys: ['souris'] },
  lion: { label: 'un lion', keys: ['lion'] },
  'chat-dans': { label: 'un chat dans une boîte', keys: ['chat', 'dans', 'boîte'] },
  'chat-sur': { label: 'un chat assis sur une boîte', keys: ['chat', 'sur', 'boîte'] },
  'chat-derriere': { label: 'un chat caché derrière une boîte', keys: ['chat', 'derrière', 'boîte'] },
  'chat-devant': { label: 'un chat assis devant une grande boîte', keys: ['chat', 'devant', 'boîte'] },
  'velo-rouge': { label: 'un vélo rouge', keys: ['vélo', 'rouge'] },
  'velo-bleu': { label: 'un vélo bleu', keys: ['vélo', 'bleu'] },
  'voiture-rouge': { label: 'une voiture rouge', keys: ['voiture', 'rouge'] },
  'voiture-bleue': { label: 'une voiture bleue', keys: ['voiture', 'bleue'] },
  'oiseau-bleu': { label: 'un oiseau bleu', keys: ['oiseau', 'bleu'] },
  'oiseau-rouge': { label: 'un oiseau rouge', keys: ['oiseau', 'rouge'] },
  'oiseaux-2-bleus': { label: 'deux oiseaux bleus', keys: ['deux', 'oiseaux', 'bleus'] },
  'oiseaux-2-rouges': { label: 'deux oiseaux rouges', keys: ['deux', 'oiseaux', 'rouges'] },
  'oiseaux-3-bleus': { label: 'trois oiseaux bleus', keys: ['trois', 'oiseaux', 'bleus'] },
  pomme: { label: 'une pomme', keys: ['une', 'pomme'] },
  banane: { label: 'une banane', keys: ['une', 'banane'] },
  oeuf: { label: 'un œuf', keys: ['un', 'œuf'] },
  'pommes-2': { label: 'deux pommes', keys: ['deux', 'pommes'] },
  'pommes-3': { label: 'trois pommes', keys: ['trois', 'pommes'] },
  'bananes-2': { label: 'deux bananes', keys: ['deux', 'bananes'] },
  'ballons-2': { label: 'deux ballons', keys: ['deux', 'ballons'] },
  'ballons-3': { label: 'trois ballons', keys: ['trois', 'ballons'] },
  'garcon-nage': { label: 'un garçon qui nage', keys: ['garçon', 'nage'] },
  'garcon-court': { label: 'un garçon qui court', keys: ['garçon', 'court'] },
  'garcon-saute': { label: 'un garçon qui saute', keys: ['garçon', 'saute'] },
  'garcon-lit': { label: 'un garçon qui lit un livre', keys: ['garçon', 'lit', 'livre'] },
  'garcon-chante': { label: 'un garçon qui chante', keys: ['garçon', 'chante'] },
  'garcon-danse': { label: 'un garçon qui danse', keys: ['garçon', 'danse'] },
  moto: { label: 'une moto', keys: ['moto'] },
  bus: { label: 'un bus', keys: ['bus'] },
  lit: { label: 'un lit', keys: ['lit'] },
  lune: { label: 'la lune', keys: ['lune'] },
  robe: { label: 'une robe', keys: ['robe'] },
  jupe: { label: 'une jupe', keys: ['jupe'] },
  ours: { label: 'un ours en peluche', keys: ['ours'] },
  sofa: { label: 'un sofa', keys: ['sofa'] },
  velo: { label: 'un vélo', keys: ['vélo'] },
  bebe: { label: 'un bébé', keys: ['bébé'] },
  ecole: { label: 'une école', keys: ['école'] },
  etoile: { label: 'une étoile', keys: ['étoile'] },
  cheval: { label: 'un cheval', keys: ['cheval'] },
  vache: { label: 'une vache', keys: ['vache'] },
  mouton: { label: 'un mouton', keys: ['mouton'] },
  tomate: { label: 'une tomate', keys: ['tomate'] },
};

const r = (w: string, x1: string, x2: string, say?: string): ReadItem => ({ w, x: [x1, x2], ...(say ? { say } : {}) });
/** Phrase à lire : le bon dessin, puis les deux intrus (un seul élément lu change : chat/chien, rouge/bleu, deux/trois). */
const ph = (w: string, pic: PicId, x1: PicId, x2: PicId): ReadItem => ({ w, pic, x: [x1, x2] });
/** Mot de la dictée : la voix dit le mot puis son groupe (« moto… une moto ») ; lettres pièges (b/d, p/q, m/n, e/é…). */
const dict = (w: string, group: string, pic: PicId, traps: string): ReadItem => ({ w, pic, x: [...traps], say: `${w}… ${group}` });

export const READ_SETS: readonly ReadSet[] = [
  {
    id: 'voy', title: 'Les voyelles',
    items: [
      r('a', 'o', 'e'), r('i', 'l', 'u'), r('o', 'a', 'u'), r('u', 'n', 'o'), r('é', 'e', 'a', 'é'), r('e', 'é', 'a', 'euh'),
      r('ou', 'on', 'u'), r('y', 'v', 'u', 'i'), r('au', 'ou', 'an', 'oh'),
    ],
  },
  {
    id: 'syl1', title: 'la, mi, ro…',
    items: [
      r('la', 'al', 'le'), r('li', 'il', 'lu'), r('lo', 'ol', 'la'), r('ma', 'na', 'am'), r('mi', 'ni', 'im'), r('mo', 'no', 'om'),
      r('ra', 'ar', 'na'), r('ri', 'ir', 'ru'), r('ro', 'or', 'ra'), r('sa', 'za', 'as'), r('si', 'is', 'su'), r('so', 'os', 'sa'),
      r('lu', 'ul', 'lo'), r('mu', 'nu', 'um'), r('ru', 'ur', 'ri'), r('su', 'us', 'si'),
    ],
  },
  {
    id: 'syl2', title: 'pa, to, di…',
    items: [
      r('pa', 'ga', 'ba'), r('pi', 'bi', 'ip'), r('po', 'bo', 'op'), r('ta', 'at', 'da'), r('ti', 'it', 'di'), r('to', 'ot', 'do'),
      r('da', 'ba', 'ad'), r('di', 'bi', 'id'), r('do', 'bo', 'od'), r('ba', 'da', 'pa'), r('bi', 'di', 'pi'), r('bo', 'do', 'po'),
      r('na', 'ma', 'an'), r('ni', 'mi', 'in'), r('fa', 'va', 'af'), r('vo', 'fo', 'ov'),
    ],
  },
  {
    id: 'sons', title: 'ou, on, an, ch…',
    items: [
      r('ou', 'on', 'au', 'ou'), r('on', 'ou', 'an', 'on'), r('an', 'on', 'in', 'an'), r('in', 'an', 'on', 'hein'), r('oi', 'io', 'on', 'oi'),
      r('ch', 'c', 'j', 'che'), r('chat', 'chou', 'char', 'chat'), r('loup', 'lion', 'long', 'loup'), r('moi', 'mon', 'mou', 'moi'),
      r('lapin', 'lampe', 'lavant', 'lapin'), r('maman', 'manon', 'mamie', 'maman'), r('mouton', 'monton', 'moutan', 'mouton'),
    ],
  },
  {
    id: 'mots', title: 'Les petits mots',
    items: [
      r('le', 'la', 'les'), r('un', 'une', 'on'), r('et', 'en', 'te'), r('il', 'li', 'elle'), r('elle', 'il', 'les'), r('les', 'des', 'le'),
      r('des', 'les', 'de'), r('dans', 'des', 'sans'), r('avec', 'aussi', 'avant'), r('mais', 'moi', 'mon'), r('pour', 'par', 'peur'),
      r('sur', 'sous', 'sœur'), r('une', 'un', 'lune'),
    ],
  },
  {
    // Phrases de 3 ou 4 mots : un nom, une couleur, un nombre ou une action à lire.
    id: 'phr1', title: 'Petites phrases', kind: 'phrase',
    items: [
      ph('Le chat dort.', 'chat-dort', 'chat-assis', 'chien'),
      ph('Un vélo rouge.', 'velo-rouge', 'velo-bleu', 'voiture-rouge'),
      ph('Je vois une pomme.', 'pomme', 'banane', 'oeuf'),
      ph('Une voiture bleue.', 'voiture-bleue', 'voiture-rouge', 'velo-bleu'),
      ph('Le garçon nage.', 'garcon-nage', 'garcon-court', 'garcon-saute'),
      ph("J'ai deux pommes.", 'pommes-2', 'pommes-3', 'bananes-2'),
      ph('Un oiseau bleu.', 'oiseau-bleu', 'oiseau-rouge', 'souris'),
      ph('Je vois une souris.', 'souris', 'chat-assis', 'lion'),
      ph('Le garçon court.', 'garcon-court', 'garcon-nage', 'garcon-saute'),
      ph('Voici trois ballons.', 'ballons-3', 'ballons-2', 'pommes-3'),
    ],
  },
  {
    // Mots réguliers sans accent : une lettre (ou ch, on, ou) pour chaque son.
    id: 'dict1', title: 'Dictée : moto, lune…', kind: 'dictee',
    items: [
      dict('moto', 'une moto', 'moto', 'nfa'), dict('lit', 'un lit', 'lit', 'jfu'), dict('bus', 'un bus', 'bus', 'dpn'),
      dict('lune', 'la lune', 'lune', 'mva'), dict('robe', 'une robe', 'robe', 'dpn'), dict('jupe', 'une jupe', 'jupe', 'qbi'),
      dict('sofa', 'un sofa', 'sofa', 'zvt'), dict('chat', 'un chat', 'chat-assis', 'ond'), dict('lion', 'un lion', 'lion', 'mau'),
      dict('ours', 'un ours', 'ours', 'nma'),
    ],
  },
  {
    // Phrases de 5 à 6 mots : où est le chat, combien, quelle couleur, que fait le garçon.
    id: 'phr2', title: 'Grandes phrases', kind: 'phrase',
    items: [
      ph('Le chat est dans la boîte.', 'chat-dans', 'chat-sur', 'chat-devant'),
      ph('Je vois un vélo rouge.', 'velo-rouge', 'velo-bleu', 'voiture-rouge'),
      ph('Le chat est sur la boîte.', 'chat-sur', 'chat-dans', 'chat-devant'),
      ph('Il y a trois pommes.', 'pommes-3', 'pommes-2', 'ballons-3'),
      ph('Le garçon lit un livre.', 'garcon-lit', 'garcon-chante', 'garcon-danse'),
      ph('Le chat est derrière la boîte.', 'chat-derriere', 'chat-devant', 'chat-dans'),
      ph('Il y a deux ballons.', 'ballons-2', 'ballons-3', 'pommes-2'),
      ph('Il y a deux oiseaux bleus.', 'oiseaux-2-bleus', 'oiseaux-2-rouges', 'oiseaux-3-bleus'),
      ph('Le chat est devant la boîte.', 'chat-devant', 'chat-derriere', 'chat-dans'),
      ph('Le garçon saute très haut.', 'garcon-saute', 'garcon-court', 'garcon-nage'),
    ],
  },
  {
    // Mots plus longs, puis les premiers accents : le é (piège : le e sans accent).
    id: 'dict2', title: 'Dictée : vélo, école…', kind: 'dictee',
    items: [
      dict('tomate', 'une tomate', 'tomate', 'ndi'), dict('vache', 'une vache', 'vache', 'fob'), dict('mouton', 'un mouton', 'mouton', 'adf'),
      dict('banane', 'une banane', 'banane', 'dmo'), dict('cheval', 'un cheval', 'cheval', 'fbo'),
      dict('vélo', 'un vélo', 'velo', 'efb'), dict('bébé', 'un bébé', 'bebe', 'edp'), dict('école', 'une école', 'ecole', 'aqd'),
      dict('étoile', 'une étoile', 'etoile', 'afu'),
    ],
  },
];

export const readSetOf = (id: ReadId): ReadSet => READ_SETS.find((s) => s.id === id)!;

/** Sorte d'une île de lecture. */
export const kindOf = (s: ReadSet): ReadKind => s.kind ?? 'son';

/** Touches du clavier de la dictée : chaque lettre du mot une seule fois, puis les pièges (le moteur les mélange). */
export const dictKeys = (it: ReadItem): string[] => [...new Set([...it.w, ...it.x])];

/** Mot épelé pour l'aide : « m, o, t, o ». */
export const spell = (w: string): string => [...w].join(', ');

/** Ce que dit la voix pour un élément. */
export const sayOf = (it: ReadItem): string => it.say ?? it.w;

/** Éléments d'une étape : 0 = première moitié, 1 = seconde moitié, null ou 2 = tous. */
export function stepReadItems(s: ReadSet, step: number | null): readonly ReadItem[] {
  const half = Math.ceil(s.items.length / 2);
  return step === 0 ? s.items.slice(0, half) : step === 1 ? s.items.slice(half) : s.items;
}
