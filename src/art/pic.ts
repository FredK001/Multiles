/* Dessin d'un code de question à dessins (CP, grandeurs et espace) : voir src/content/picquiz.ts. */
import { clockOf, moneyOf, shapeOf, type PicCode } from '../content/picquiz';
import { clockArt, moneyArt, skyArt } from './measures';
import { gridArt, placeArt, shapeArt } from './space';

/** `size` : taille de référence (hauteur de la monnaie, côté des autres dessins) ; `aid` : version de l'aide
    (coins numérotés, ligne et colonne de l'étoile surlignées) ; `maxW` : largeur d'une rangée de monnaie. */
export function picArt(code: PicCode, size = 140, { aid = false, maxW = 320 }: { aid?: boolean; maxW?: number } = {}): string {
  const kind = code.split(':')[0];
  if (kind === 'money') return moneyArt(moneyOf(code), Math.round(size * 0.72), maxW);
  if (kind === 'clock') {
    const { h, m } = clockOf(code);
    return clockArt(h, m, size);
  }
  if (kind === 'sky') return skyArt(code.slice(4), size * 1.15);
  if (kind === 'shape') {
    const { k, rot, col } = shapeOf(code);
    return shapeArt(k, rot, col, size, aid);
  }
  if (kind === 'grid') return gridArt(code.slice(5), size * 1.3, aid);
  if (kind === 'place') return placeArt(code.slice(6), size);
  return '';
}
