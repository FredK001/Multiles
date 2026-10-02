import type { IsleId } from '../content/isles';
import type { EndSummary } from '../engine/rewards';
import type { SessionConfig } from '../engine/session';

/** Routage par état interne (pas d'URL profonde). */
export type Route =
  | { name: 'who' }
  | { name: 'create' }
  | { name: 'editor'; ret: Route }
  | { name: 'home' }
  | { name: 'map' }
  | { name: 'isle'; n: IsleId }
  | { name: 'discover'; n: IsleId; m: number }
  | { name: 'question'; cfg: SessionConfig; back: Route; nonce?: number }
  | { name: 'end'; end: EndSummary; cfg: SessionConfig; back: Route }
  | { name: 'grid' }
  | { name: 'shop' }
  | { name: 'album' }
  | { name: 'parent' };

export type RouteName = Route['name'];
