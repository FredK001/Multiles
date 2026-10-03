import type { Op, SeriesId } from '../content/series';
import type { EndSummary } from '../engine/rewards';
import type { SessionConfig } from '../engine/session';

/** Routage par état interne (pas d'URL profonde). */
export type Route =
  | { name: 'who' }
  | { name: 'create' }
  | { name: 'editor'; ret: Route }
  | { name: 'home' }
  /** Choix de l'opération (CP), avant de jouer ou d'ouvrir la carte. */
  | { name: 'ops'; then: 'play' | 'map' }
  | { name: 'map'; op: Op }
  | { name: 'isle'; s: SeriesId }
  | { name: 'discover'; s: SeriesId; m: number }
  | { name: 'question'; cfg: SessionConfig; back: Route; nonce?: number }
  | { name: 'end'; end: EndSummary; cfg: SessionConfig; back: Route }
  | { name: 'grid' }
  | { name: 'shop' }
  | { name: 'album' }
  | { name: 'parent' };

export type RouteName = Route['name'];
