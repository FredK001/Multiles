import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { setSoundEnabled, stopSpeech } from '../audio';
import { dayKey, type DayKey } from '../engine/dates';
import { enterProfile } from '../engine/profile';
import { nb } from '../content/text';
import type { AppData, Profile, Store } from '../store';
import { Ctx, type AppCtx } from './context';
import type { Route } from './routes';
import { Screen } from './Screen';

/** Jour local courant, mis à jour à minuit et au retour au premier plan. */
function useToday(): DayKey {
  const [today, setToday] = useState(dayKey());
  useEffect(() => {
    const tick = () => setToday((t) => (t === dayKey() ? t : dayKey()));
    const id = setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);
  return today;
}

export function App({ store }: { store: Store }) {
  const [data, setData] = useState<AppData>(store.get());
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [route, setRoute] = useState<Route>({ name: 'who' });
  const [toastText, setToastText] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const backRef = useRef<(() => void) | null>(null);
  const routeRef = useRef<Route>({ name: 'who' });
  const today = useToday();

  useEffect(() => {
    const off = store.subscribe(setData);
    setData(store.get()); // une modification a pu arriver avant l'abonnement
    return off;
  }, [store]);
  useEffect(() => setSoundEnabled(data.settings.sound), [data.settings.sound]);

  const player: Profile | null = data.profiles.find((p) => p.id === playerId) ?? null;

  // Série vérifiée à l'arrivée du joueur et à chaque changement de jour.
  useEffect(() => {
    if (!player) return;
    const next = enterProfile(player, today);
    if (next !== player) void store.updateProfile(player.id, () => next);
  }, [player?.id, today]);

  const go = useCallback((r: Route) => {
    stopSpeech();
    // Chaque lancement de session (y compris « Rejouer ») reçoit son identifiant propre.
    setRoute(r.name === 'question' ? { ...r, nonce: Date.now() + Math.random() } : r);
  }, []);

  const toast = useCallback((t: string) => {
    setToastText(nb(t));
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastText(null), 2400);
  }, []);

  const selectPlayer = useCallback((id: string | null) => setPlayerId(id), []);

  // Bouton retour Android : se comporte comme le bouton Retour / Quitter de l'écran affiché.
  useEffect(() => {
    history.pushState({ multiles: true }, '');
    const onPop = () => {
      // Sur « Qui joue ? », le retour quitte l'app. Ailleurs, on garde toujours une entrée
      // d'historique et on applique le Retour / Quitter de l'écran (aucun effet sur l'accueil).
      if (routeRef.current.name === 'who') return;
      history.pushState({ multiles: true }, '');
      backRef.current?.();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  routeRef.current = route;
  // Revenir de « Qui joue ? » vers un écran : on réarme l'entrée d'historique consommée.
  useEffect(() => {
    if (route.name !== 'who' && history.state?.multiles !== true) history.pushState({ multiles: true }, '');
  }, [route.name]);

  const ctx: AppCtx = useMemo(
    () => ({
      data,
      store,
      player,
      selectPlayer,
      updatePlayer: (fn) => (player ? store.updateProfile(player.id, fn) : Promise.resolve()),
      route,
      go,
      toast,
      today,
      freshId,
      setFreshId,
      setBack: (fn) => {
        backRef.current = fn;
      },
    }),
    [data, store, player, route, today, freshId],
  );

  return (
    <Ctx.Provider value={ctx}>
      <div class="app" id="app">
        <Screen route={route} />
        <div class="toast" role="status" aria-live="polite" hidden={!toastText}>{toastText}</div>
      </div>
    </Ctx.Provider>
  );
}
