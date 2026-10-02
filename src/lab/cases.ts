/* Cas d'illustration partagés entre la page d'atelier (lab.html) et les tests de parité.
   Chaque cas désigne une fonction (ou constante) qui existe sous le même nom dans le prototype
   et dans src/art, avec des arguments sérialisables. Aucun import : ce fichier est aussi lu par Playwright. */

export interface ArtCase {
  fn: string;
  args?: unknown[];
  label?: string;
}
export interface GallerySection {
  title: string;
  bg?: string;
  cases: ArtCase[];
}

const VARIANTS = ['pousse', 'corail', 'braise'];
const MOODS = ['neutre', 'joie', 'encourage', 'pense'];
const FACES = ['rond', 'ovale', 'doux'];
const HAIRS = ['court', 'boucle', 'milong', 'couettes', 'chignon', 'ras'];
const ACCS = ['aucun', 'lunettes', 'casquette', 'bandeau', 'noeud', 'etoile', 'ecouteurs', 'bob', 'couronne'];
const OUTFITS = ['', 'raye', 'etoiles', 'cape', 'astro'];
const SKINS = ['#FDDCC4', '#F1C29A', '#D9A06E', '#B97A4A', '#8C5634', '#5E3A22'];
const HAIR_COLORS = ['#2B1D14', '#6B3E1F', '#9A6233', '#C4561E', '#E6B54A', '#7B4FD0'];
const PROFILE_COLORS = ['#C8371D', '#0D7A5F', '#8A36A8', '#A35400'];
const DECORS = ['plage', 'jungle', 'verger', 'desert', 'glace', 'bonbon', 'volcan', 'collines', 'nuages', 'espace'];
const FORTS = ['#0A7A80', '#2E7A2F', '#B0365A', '#9C5A12', '#1D6CB0', '#A93A8C', '#BF3A1A', '#5F7314', '#3550B0', '#5B3AA6'];
const ISLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const WEARS = [
  { head: 'fete' }, { head: 'couronne' }, { head: 'bob' },
  { face: 'lunettes' }, { face: 'soleil' },
  { neck: 'echarpe' }, { neck: 'papillon' },
  { head: 'couronne', face: 'soleil', neck: 'echarpe' },
  { head: 'fete', face: 'lunettes', neck: 'papillon' },
];
const SHOP_ITEMS = {
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
const HOUSE_ALL = ['h-plante', 'h-tapis', 'h-lampion', 'h-cadre', 'h-hamac', 'h-aquarium'];

const BASE_AV = { face: 'rond', hair: 'court', skin: '#F1C29A', hairColor: '#6B3E1F', acc: 'aucun' };
/** Profil fictif servant uniquement à dessiner (boutique, maison, stickers). */
const LOOK = { pepin: 'corail', level: 13, pw: { head: 'bob' }, house: ['h-tapis', 'h-plante'], av: { ...BASE_AV, hair: 'couettes', acc: 'noeud' }, color: '#8A36A8' };

const CONSTS = ['icoSay', 'icoLock', 'icoCheck', 'icoErase', 'icoTrue', 'icoFalse', 'icoDice', 'icoBuoy', 'icoClock', 'icoHouse'];

/** Galerie visuelle : une sélection lisible de chaque famille. */
export function gallerySections(): GallerySection[] {
  return [
    {
      title: 'Icônes',
      cases: [
        ...CONSTS.map((fn) => ({ fn, label: fn })),
        { fn: 'starIcon', args: [30], label: 'starIcon' },
        { fn: 'coinIcon', args: [30], label: 'coinIcon' },
        { fn: 'trophyIcon', args: [48], label: 'trophyIcon' },
        { fn: 'icoChest', args: [false], label: 'coffre fermé' },
        { fn: 'icoChest', args: [true], label: 'coffre ouvert' },
        { fn: 'starSmall', args: [true], label: 'étoile gagnée' },
        { fn: 'starSmall', args: [false], label: 'étoile à gagner' },
        { fn: 'logoMark', args: [96], label: 'logoMark' },
      ],
    },
    {
      title: 'Pépin — variantes × stades',
      cases: VARIANTS.flatMap((variant) => [1, 2, 3, 4].map((stage) => ({ fn: 'mascot', args: [{ variant, stage, size: 96 }], label: `${variant} ${stage}` }))),
    },
    {
      title: 'Pépin — humeurs',
      cases: VARIANTS.flatMap((variant) => MOODS.map((mood) => ({ fn: 'mascot', args: [{ variant, stage: 3, mood, size: 96 }], label: `${variant} ${mood}` }))),
    },
    {
      title: 'Pépin — habillage',
      cases: WEARS.map((wear, i) => ({ fn: 'mascot', args: [{ variant: VARIANTS[i % 3], stage: 2 + (i % 3), wear, size: 96 }], label: Object.values(wear).join(' + ') })),
    },
    {
      title: 'Avatar — visages × coiffures',
      cases: FACES.flatMap((face) => HAIRS.map((hair, i) => ({ fn: 'avatar', args: [{ ...BASE_AV, face, hair, hairColor: HAIR_COLORS[i], skin: SKINS[i], color: PROFILE_COLORS[i % 4], size: 96 }], label: `${face} ${hair}` }))),
    },
    {
      title: 'Avatar — accessoires',
      cases: ACCS.map((acc, i) => ({ fn: 'avatar', args: [{ ...BASE_AV, face: FACES[i % 3], acc, color: PROFILE_COLORS[i % 4], size: 96 }], label: acc })),
    },
    {
      title: 'Avatar — tenues',
      cases: OUTFITS.map((outfit, i) => ({ fn: 'avatar', args: [{ ...BASE_AV, hair: HAIRS[i], outfit, color: PROFILE_COLORS[i % 4], size: 96 }], label: outfit || 'sans tenue' })),
    },
    {
      title: 'Îles ouvertes',
      bg: '#A6DCE5',
      cases: ISLES.map((n) => ({ fn: 'islandArt', args: [n, false], label: `île ${n}` })),
    },
    {
      title: 'Îles fermées',
      bg: '#A6DCE5',
      cases: ISLES.map((n) => ({ fn: 'islandArt', args: [n, true], label: `île ${n}` })),
    },
    {
      title: 'Décors de bandeau',
      cases: DECORS.map((d, i) => ({ fn: 'decorSvg', args: [d, FORTS[i]], label: d })),
    },
    {
      title: 'Gardiens',
      cases: [...ISLES.map((n) => ({ fn: 'bossSvg', args: [n, 92, false], label: `gardien ${n}` })), { fn: 'bossSvg', args: [7, 92, true], label: 'fermé' }],
    },
    {
      title: 'Maison du Pépin',
      cases: [
        { fn: 'houseSvg', args: [{ ...LOOK, house: [] }, null], label: 'vide' },
        { fn: 'houseSvg', args: [{ ...LOOK, house: HOUSE_ALL }, null], label: 'tout installé' },
        { fn: 'houseSvg', args: [LOOK, 'h-hamac'], label: 'essai hamac' },
      ],
    },
    {
      title: 'Boutique',
      cases: (['moi', 'pepin', 'maison'] as const).flatMap((cat) => SHOP_ITEMS[cat].map((it) => ({ fn: 'itemArt', args: [cat, it, LOOK], label: it.name }))),
    },
    {
      title: 'Stickers',
      cases: ISLES.flatMap((n) => ['lieu', 'gardien', 'pepin'].map((t) => ({ fn: 'stickerArt', args: [`${n}-${t}`, LOOK, 94], label: `${n}-${t}` }))),
    },
  ];
}

/** Combinatoire large pour la parité stricte des chaînes SVG. */
export function parityCases(): ArtCase[] {
  const out: ArtCase[] = gallerySections().flatMap((s) => s.cases);
  for (const variant of VARIANTS)
    for (const stage of [1, 2, 3, 4])
      for (const mood of MOODS)
        for (const wear of [null, ...WEARS])
          for (const noSparkle of [false, true])
            out.push({ fn: 'mascot', args: [{ variant, stage, mood, wear, noSparkle, size: 84 }] });
  out.push({ fn: 'mascot', args: [{}] });
  for (const face of FACES)
    for (const hair of HAIRS)
      for (const acc of ACCS)
        for (const outfit of OUTFITS)
          out.push({ fn: 'avatar', args: [{ face, hair, acc, outfit, skin: SKINS[ACCS.indexOf(acc) % 6], hairColor: HAIR_COLORS[HAIRS.indexOf(hair)], color: PROFILE_COLORS[FACES.indexOf(face)], size: 118 }] });
  for (const color of PROFILE_COLORS) out.push({ fn: 'avatar', args: [{ ...BASE_AV, acc: 'casquette', color }] });
  for (const n of ISLES) for (const s of [40, 120]) out.push({ fn: 'bossSvg', args: [n, s, n % 2 === 0] });
  for (const variant of VARIANTS)
    for (const level of [1, 5, 12, 20])
      for (const k of ISLES.flatMap((n) => [`${n}-lieu`, `${n}-gardien`, `${n}-pepin`]))
        out.push({ fn: 'stickerArt', args: [k, { pepin: variant, level, pw: { neck: 'papillon' } }, 164] });
  for (const extra of [null, ...HOUSE_ALL]) out.push({ fn: 'houseSvg', args: [{ ...LOOK, house: ['h-aquarium'] }, extra] });
  for (const s of [16, 18, 20, 22, 24, 26, 28, 30, 34, 64, 80]) out.push({ fn: 'starIcon', args: [s] }, { fn: 'coinIcon', args: [s] }, { fn: 'trophyIcon', args: [s] });
  out.push({ fn: 'starIcon', args: [] }, { fn: 'coinIcon', args: [] }, { fn: 'trophyIcon', args: [] });
  for (const s of [30, 120, 512]) out.push({ fn: 'logoMark', args: [s] });
  return out;
}
