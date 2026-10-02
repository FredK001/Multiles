import { createContext } from 'preact';
import { useContext, useLayoutEffect, useRef } from 'preact/hooks';
import type { DayKey } from '../engine/dates';
import type { AppData, Profile, Store } from '../store';
import type { Route } from './routes';

export interface AppCtx {
  data: AppData;
  store: Store;
  /** Joueur en cours (null sur « Qui joue ? » et dans l'espace parent sans profil). */
  player: Profile | null;
  selectPlayer(id: string | null): void;
  updatePlayer(fn: (p: Profile) => Profile): Promise<void>;
  route: Route;
  go(r: Route): void;
  toast(text: string): void;
  today: DayKey;
  /** Profil créé à l'instant (animation d'apparition sur « Qui joue ? »). */
  freshId: string | null;
  setFreshId(id: string | null): void;
  /** Gestionnaire du bouton retour Android pour l'écran affiché. */
  setBack(fn: (() => void) | null): void;
}

export const Ctx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('Contexte Multîles absent');
  return c;
}

/** Le joueur en cours (écrans enfant). */
export function usePlayer(): Profile {
  const { player } = useApp();
  if (!player) throw new Error('Aucun joueur sélectionné');
  return player;
}

/** Branche le bouton retour Android sur l'action Retour / Quitter de l'écran. */
export function useBack(fn: () => void): void {
  const { setBack } = useApp();
  const ref = useRef(fn);
  ref.current = fn;
  // Enregistré dès le montage (avant l'affichage) : un retour pressé tout de suite est bien pris en compte.
  useLayoutEffect(() => {
    setBack(() => ref.current());
    return () => setBack(null);
  }, []);
}
