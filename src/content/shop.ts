export type ShopCat = 'moi' | 'pepin' | 'maison';
export type PepHead = 'fete' | 'couronne' | 'bob';
export type PepFace = 'soleil' | 'lunettes';
export type PepNeck = 'echarpe' | 'papillon';
export type HouseItemId = 'h-plante' | 'h-tapis' | 'h-lampion' | 'h-cadre' | 'h-hamac' | 'h-aquarium';

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  slot?: 'outfit' | 'acc' | 'head' | 'face' | 'neck';
}

export const SHOP: Record<ShopCat, readonly ShopItem[]> = {
  moi: [
    { id: 'raye', name: 'T-shirt rayé', price: 60, slot: 'outfit' },
    { id: 'etoiles', name: 'T-shirt étoiles', price: 90, slot: 'outfit' },
    { id: 'cape', name: 'Cape de héros', price: 120, slot: 'outfit' },
    { id: 'astro', name: 'Combi spatiale', price: 200, slot: 'outfit' },
    { id: 'ecouteurs', name: 'Écouteurs', price: 80, slot: 'acc' },
    { id: 'bob', name: 'Bob de plage', price: 70, slot: 'acc' },
    { id: 'couronne', name: 'Couronne', price: 150, slot: 'acc' },
  ],
  pepin: [
    { id: 'p-fete', name: 'Chapeau de fête', price: 60, slot: 'head' },
    { id: 'p-bob', name: 'Bob', price: 70, slot: 'head' },
    { id: 'p-couronne', name: 'Couronne', price: 150, slot: 'head' },
    { id: 'p-lunettes', name: 'Lunettes rondes', price: 40, slot: 'face' },
    { id: 'p-soleil', name: 'Lunettes de soleil', price: 70, slot: 'face' },
    { id: 'p-echarpe', name: 'Écharpe', price: 50, slot: 'neck' },
    { id: 'p-papillon', name: 'Nœud papillon', price: 40, slot: 'neck' },
  ],
  maison: [
    { id: 'h-plante', name: 'Plante', price: 30 },
    { id: 'h-tapis', name: 'Tapis', price: 40 },
    { id: 'h-lampion', name: 'Lampion', price: 40 },
    { id: 'h-cadre', name: 'Tableau', price: 50 },
    { id: 'h-hamac', name: 'Hamac', price: 90 },
    { id: 'h-aquarium', name: 'Aquarium', price: 120 },
  ],
};

export const CATS: readonly (readonly [ShopCat, string])[] = [['moi', 'Moi'], ['pepin', 'Pépin'], ['maison', 'Maison']];
