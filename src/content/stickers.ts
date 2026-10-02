import { BOSS, ISLES, STICKER_NAMES, ofIsle, type IsleId } from './isles';

/** 3 stickers par île : le lieu, le gardien, le Pépin sur l'île. */
export type StickerKind = 'lieu' | 'gardien' | 'pepin';
export const KINDS: readonly StickerKind[] = ['lieu', 'gardien', 'pepin'];

/** Clé de sticker : « 7-lieu », « 3-gardien »… */
export type StickerKey = `${IsleId}-${StickerKind}`;

export function parseSticker(k: string): [IsleId, StickerKind] {
  const [n, t] = k.split('-');
  return [Number(n) as IsleId, t as StickerKind];
}

export function stickerName(k: string): string {
  const [n, t] = parseSticker(k);
  return t === 'lieu'
    ? STICKER_NAMES[n]
    : t === 'gardien'
      ? `${BOSS[n]} le gardien`
      : `Pépin ${ISLES[n].name === 'Espace' ? "dans l'Espace" : ofIsle(n).replace(/^de la /, 'à la ').replace(/^du /, 'au ').replace(/^des /, 'aux ').replace(/^de l'/, "à l'")}`;
}

export function stickerHow(k: string): string {
  const [n, t] = parseSticker(k);
  return t === 'lieu'
    ? `Une surprise de l'île ${ofIsle(n)}.`
    : t === 'gardien'
      ? `Bats ${BOSS[n]} pour l'obtenir.`
      : `Fais 9 étoiles sur l'île ${ofIsle(n)}.`;
}
