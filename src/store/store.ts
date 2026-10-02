/* État de l'application en mémoire, sauvegardé à chaque modification. */
import { migrate } from './migrations';
import { idbStorage, memoryStorage, requestPersistence, type StorageAdapter } from './persistence';
import { emptyData, MAX_PROFILES, type AppData, type Profile, type Settings } from './schema';

type Listener = (d: AppData) => void;

export interface Store {
  get(): AppData;
  subscribe(fn: Listener): () => void;
  /** Applique une modification et la sauvegarde. */
  update(fn: (d: AppData) => AppData): Promise<void>;
  updateProfile(id: string, fn: (p: Profile) => Profile): Promise<void>;
  addProfile(p: Profile): Promise<void>;
  removeProfile(id: string): Promise<void>;
  setSettings(patch: Partial<Settings>): Promise<void>;
  /** Attend la fin des écritures en cours ; faux si la dernière sauvegarde a échoué. */
  flush(): Promise<boolean>;
}

export interface OpenOptions {
  storage?: StorageAdapter;
  /** Demande de stockage persistant (désactivée dans les tests). */
  persist?: () => Promise<boolean>;
}

export async function openStore({ storage = idbStorage(), persist = requestPersistence }: OpenOptions = {}): Promise<Store> {
  let raw: unknown, data: AppData;
  try {
    raw = await storage.load();
  } catch (e) {
    // IndexedDB indisponible (navigation privée stricte…) : l'app tourne en mémoire.
    console.error('Stockage local indisponible', e);
    storage = memoryStorage();
  }
  try {
    data = migrate(raw);
  } catch (e) {
    // Données d'une version plus récente de l'app : on ne les écrase surtout pas.
    console.error(e);
    data = emptyData();
    storage = memoryStorage();
  }
  if (!data.persistAsked) {
    // Jamais bloquant : une écriture refusée (quota, mode privé) ne doit pas empêcher l'app de démarrer.
    try {
      await persist();
      data = { ...data, persistAsked: true };
      await storage.save(data);
    } catch (e) {
      console.error('Première sauvegarde impossible', e);
    }
  }

  const listeners = new Set<Listener>();
  let writing: Promise<void> = Promise.resolve();
  let lastError: unknown = null;
  const notify = () => listeners.forEach((l) => {
    try {
      l(data);
    } catch (e) {
      console.error(e);
    }
  });

  // Plusieurs onglets ou fenêtres : chaque sauvegarde est signalée aux autres, qui rechargent.
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('multiles') : null;
  channel?.addEventListener('message', () => {
    void writing.then(async () => {
      try {
        data = migrate(await storage.load());
        notify();
      } catch (e) {
        console.error(e);
      }
    });
  });

  const commit = (next: AppData) => {
    data = next;
    const snapshot = data;
    // Écritures en série, dans l'ordre des modifications, enfilées avant de notifier l'interface.
    writing = writing
      .then(() => storage.save(snapshot))
      .then(() => {
        lastError = null;
        channel?.postMessage('saved');
      })
      .catch((e) => {
        lastError = e;
        console.error('Sauvegarde impossible', e);
      });
    notify();
    return writing;
  };

  const store: Store = {
    get: () => data,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    update: (fn) => commit(fn(data)),
    updateProfile: (id, fn) =>
      data.profiles.some((p) => p.id === id)
        ? commit({ ...data, profiles: data.profiles.map((p) => (p.id === id ? fn(p) : p)) })
        : Promise.resolve(),
    addProfile: (p) => {
      if (data.profiles.length >= MAX_PROFILES) return Promise.reject(new Error('4 profils au maximum'));
      return commit({ ...data, profiles: [...data.profiles, p] });
    },
    removeProfile: (id) => commit({ ...data, profiles: data.profiles.filter((p) => p.id !== id) }),
    setSettings: (patch) => commit({ ...data, settings: { ...data.settings, ...patch } }),
    flush: () => writing.then(() => lastError === null),
  };
  // iOS peut fermer la PWA sans préavis : on termine les écritures quand elle passe en arrière-plan.
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.hidden) void store.flush(); });
  return store;
}
