/* Service worker : précache complet, mise à jour proposée dans l'espace parent uniquement. */
import { useEffect, useState } from 'preact/hooks';

let available = false;
let apply: ((reload?: boolean) => Promise<void>) | null = null;
let registration: ServiceWorkerRegistration | undefined;
/** Seule la fenêtre où le parent a demandé la mise à jour se recharge (jamais une session enfant ailleurs). */
let installing = false;
const listeners = new Set<(v: boolean) => void>();

export async function initPwa(): Promise<void> {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  try {
    const { registerSW } = await import('virtual:pwa-register');
    apply = registerSW({
      immediate: true,
      onRegisteredSW: (_url, r) => {
        registration = r;
      },
      onRegisterError: (e) => console.error('Service worker non enregistré', e),
      onNeedRefresh() {
        available = true;
        listeners.forEach((l) => l(true));
      },
      onNeedReload() {
        if (installing) location.reload();
      },
    });
  } catch (e) {
    console.error('Service worker indisponible', e);
  }
}

/** Vérifie s'il existe une nouvelle version (appelé à l'ouverture de l'espace parent, hors usage enfant). */
export function checkForUpdate(): void {
  if (navigator.onLine) void registration?.update().catch(() => {});
}

/** Une nouvelle version est prête ; `install` la met en place et recharge cette fenêtre. */
export function useUpdate(): { available: boolean; install: () => void } {
  const [v, setV] = useState(available);
  useEffect(() => {
    listeners.add(setV);
    return () => void listeners.delete(setV);
  }, []);
  return {
    available: v,
    install: () => {
      installing = true;
      void apply?.(true);
    },
  };
}
