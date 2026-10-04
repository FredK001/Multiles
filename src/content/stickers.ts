import { lookOf } from './isles';
import type { SeriesId } from './series';

/** 3 stickers par île : le lieu, le gardien, le Pépin sur l'île. */
export type StickerKind = 'lieu' | 'gardien' | 'pepin';
export const KINDS: readonly StickerKind[] = ['lieu', 'gardien', 'pepin'];

/** Clé de sticker : la série puis le type, « mul-7-lieu », « add-10-gardien »… */
export type StickerKey = `${SeriesId}-${StickerKind}`;

export const stickerKey = (s: SeriesId, kind: StickerKind): StickerKey => `${s}-${kind}`;

export function stickerParts(k: string): { series: SeriesId; kind: StickerKind } {
  const i = k.lastIndexOf('-');
  return { series: k.slice(0, i) as SeriesId, kind: k.slice(i + 1) as StickerKind };
}

export function stickerName(k: string): string {
  const { series, kind } = stickerParts(k), I = lookOf(series);
  if (kind === 'lieu') return I.sticker;
  if (kind === 'gardien') return `${I.boss} le gardien`;
  // Îles d'anglais : « of » est le titre seul (« Animals »).
  if (!/^(de|du|des) /.test(I.of)) return `Pépin sur l'île ${I.name}`;
  return `Pépin ${I.name === 'Espace' ? "dans l'Espace" : I.of.replace(/^de la /, 'à la ').replace(/^du /, 'au ').replace(/^des /, 'aux ').replace(/^de l'/, "à l'")}`;
}

export function stickerHow(k: string): string {
  const { series, kind } = stickerParts(k), I = lookOf(series);
  return kind === 'lieu'
    ? `Une surprise de l'île ${I.of}.`
    : kind === 'gardien'
      ? `Bats ${I.boss} pour l'obtenir.`
      : `Fais 9 étoiles sur l'île ${I.of}.`;
}
