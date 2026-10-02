export type FaceShape = 'rond' | 'ovale' | 'doux';
export type HairStyle = 'court' | 'boucle' | 'milong' | 'couettes' | 'chignon' | 'ras';
export type Accessory =
  | 'aucun' | 'lunettes' | 'casquette' | 'bandeau' | 'noeud' | 'etoile'
  | 'ecouteurs' | 'bob' | 'couronne';
export type Outfit = '' | 'raye' | 'etoiles' | 'cape' | 'astro';

/** Apparence d'un avatar (champ `av` du profil). */
export interface AvatarLook {
  face: FaceShape;
  hair: HairStyle;
  skin: string;
  hairColor: string;
  acc: Accessory;
  outfit?: Outfit;
}

/** [valeur, libellé, prix éventuel en pièces]. */
export type Option<V extends string = string> = readonly [V, string, number?];

export const PROFILE_COLORS: readonly Option[] = [
  ['#C8371D', 'Tomate'], ['#0D7A5F', 'Menthe'], ['#8A36A8', 'Prune'], ['#A35400', 'Ocre'],
];

export const AV = {
  face: [['rond', 'Rond'], ['ovale', 'Ovale'], ['doux', 'Carré doux']] as readonly Option<FaceShape>[],
  hair: [['court', 'Court'], ['boucle', 'Bouclé'], ['milong', 'Mi-long'], ['couettes', 'Couettes'], ['chignon', 'Chignon'], ['ras', 'Très court']] as readonly Option<HairStyle>[],
  skin: [['#FDDCC4', 'Clair'], ['#F1C29A', 'Pêche'], ['#D9A06E', 'Doré'], ['#B97A4A', 'Caramel'], ['#8C5634', 'Cacao'], ['#5E3A22', 'Ébène']] as readonly Option[],
  hairColor: [['#2B1D14', 'Noir'], ['#6B3E1F', 'Brun'], ['#9A6233', 'Châtain'], ['#C4561E', 'Roux'], ['#E6B54A', 'Blond'], ['#7B4FD0', 'Violet']] as readonly Option[],
  acc: [['aucun', 'Aucun'], ['lunettes', 'Lunettes'], ['casquette', 'Casquette'], ['bandeau', 'Bandeau'], ['noeud', 'Nœud'], ['etoile', 'Barrette'], ['ecouteurs', 'Écouteurs', 80], ['bob', 'Bob de plage', 70], ['couronne', 'Couronne', 150]] as readonly Option<Accessory>[],
} as const;

export type EditorTab = keyof typeof AV | 'color';

export const TABS: readonly (readonly [EditorTab, string])[] = [
  ['face', 'Visage'], ['hair', 'Coiffure'], ['skin', 'Peau'], ['hairColor', 'Cheveux'], ['acc', 'Accessoire'], ['color', 'Couleur'],
];
