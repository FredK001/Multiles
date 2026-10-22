/* Dessins de la lecture au CP (phrases à lire, mots dictés), viewBox 0 0 100 100.
   Presque tous reprennent les dessins des mots d'anglais : un vélo rouge devient bleu en changeant sa couleur,
   « deux pommes » pose deux pommes côte à côte. Trois dessins nouveaux : la lune, l'étoile, la tomate. */
import type { PicId } from '../content/reading';
import { ACTIONS, ANIMALS, FOOD, HOME, TOYS } from './words-ce1';
import { CAT, CAT_ASLEEP, CLASSROOM, CLOTHES, FARM, HORSE, PETS, PLACES, ROOMS, TOWN, TRANSPORT } from './words-ce2';
import { c, dot, e, p, place } from './words-kit';

const RED = '#D62828', BLUE = '#2F6FE4', NAVY = '#1E3E8C', DARK_RED = '#8E1B1B';

/** Change une couleur du dessin (toutes ses occurrences). */
const tint = (body: string, from: string, to: string): string => body.split(from).join(to);
/** Oiseau rouge : le bleu et le bleu nuit deviennent rouge et rouge sombre. */
const redBird = (body: string): string => tint(tint(body, BLUE, RED), NAVY, DARK_RED);

/** Deux ou trois exemplaires du même dessin, en petit (deux côte à côte, trois en triangle). */
function many(body: string, n: 2 | 3): string {
  const spots: readonly (readonly [number, number])[] = n === 2 ? [[1, 26], [51, 26]] : [[1, 4], [51, 4], [26, 52]];
  return spots.map(([x, y]) => place(x, y, 0.48, body)).join('');
}

const MOON = c(30, 26, 3, '#FFE58A', 2) + c(84, 70, 3.5, '#FFE58A', 2) + p('M58 10 Q24 18 26 52 Q30 84 64 90 Q36 70 40 48 Q44 24 58 10Z', '#FFD23F');
const STAR = p('M50 6 L61 36 L94 37 L68 57 L77 90 L50 71 L23 90 L32 57 L6 37 L39 36Z', '#FFD23F') + dot(42, 46, 2.6) + dot(58, 46, 2.6) + p('M44 56 Q50 61 56 56', 'none', 2.5);
const TOMATO = c(50, 56, 34, '#E53935') + p('M30 44 Q34 36 42 34', 'none', 4, '#fff') +
  p('M50 26 L40 18 L48 26 L38 30 L50 30 L50 38 L56 30 L66 32 L58 26 L64 18Z', '#2E9E44', 3) + e(50, 24, 3, 6, '#2E9E44', 2.5);

const ART: Record<PicId, string> = {
  'chat-assis': CAT,
  'chat-dort': CAT_ASLEEP,
  chien: PETS.dog!,
  souris: PETS.mouse!,
  lion: ANIMALS.lion!,
  'chat-dans': PLACES.in!,
  'chat-sur': PLACES.on!,
  'chat-derriere': PLACES.behind!,
  'chat-devant': PLACES['in front of']!,
  'velo-rouge': TOYS.bike!,
  'velo-bleu': tint(TOYS.bike!, RED, BLUE),
  'voiture-rouge': TRANSPORT.car!,
  'voiture-bleue': tint(TRANSPORT.car!, RED, BLUE),
  'oiseau-bleu': ANIMALS.bird!,
  'oiseau-rouge': redBird(ANIMALS.bird!),
  'oiseaux-2-bleus': many(ANIMALS.bird!, 2),
  'oiseaux-2-rouges': many(redBird(ANIMALS.bird!), 2),
  'oiseaux-3-bleus': many(ANIMALS.bird!, 3),
  pomme: FOOD.apple!,
  banane: FOOD.banana!,
  oeuf: FOOD.egg!,
  'pommes-2': many(FOOD.apple!, 2),
  'pommes-3': many(FOOD.apple!, 3),
  'bananes-2': many(FOOD.banana!, 2),
  'ballons-2': many(TOYS.ball!, 2),
  'ballons-3': many(TOYS.ball!, 3),
  'garcon-nage': ACTIONS.swim!,
  'garcon-court': ACTIONS.run!,
  'garcon-saute': ACTIONS.jump!,
  'garcon-lit': CLASSROOM.read!,
  'garcon-chante': ACTIONS.sing!,
  'garcon-danse': ACTIONS.dance!,
  moto: TRANSPORT.motorbike!,
  bus: TRANSPORT.bus!,
  lit: HOME.bedroom!,
  lune: MOON,
  robe: CLOTHES.dress!,
  jupe: CLOTHES.skirt!,
  ours: TOYS['teddy bear']!,
  sofa: ROOMS.sofa!,
  velo: TOYS.bike!,
  bebe: PETS.baby!,
  ecole: TOWN.school!,
  etoile: STAR,
  cheval: HORSE,
  vache: FARM.cow!,
  mouton: FARM.sheep!,
  tomate: TOMATO,
};

/** Dessin d'une phrase ou d'un mot dicté (décoratif : la description est portée par le bouton ou le cadre). */
export const readPicArt = (id: PicId, size = 100): string =>
  `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">${ART[id]}</svg>`;

/** Corps du dessin (tests : dessin présent pour chaque identifiant). */
export const readPicBody = (id: PicId): string => ART[id];
