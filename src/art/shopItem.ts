/* Vignettes des objets de la boutique. Portées du prototype à l'identique. */
import type { AvatarLook } from '../content/avatar';
import type { HouseItemId, ShopCat, ShopItem } from '../content/shop';
import { stageFor } from '../engine/level';
import { avatar } from './avatar';
import { HB, houseItem, type PepinLook } from './house';
import { mascot } from './mascot';

export function itemArt(cat: ShopCat, it: ShopItem, p: PepinLook & { av: AvatarLook; color: string }): string {
  if (cat === 'moi') {
    const av = { ...p.av, [it.slot!]: it.id };
    return avatar({ ...av, color: p.color, size: 66 });
  }
  if (cat === 'pepin') {
    const w = { ...p.pw, [it.slot!]: it.id.slice(2) };
    return mascot({ variant: p.pepin, stage: stageFor(p.level), wear: w, size: 62 });
  }
  return `<svg width="76" height="64" viewBox="${HB[it.id as HouseItemId]}" aria-hidden="true">${houseItem(it.id)}</svg>`;
}
