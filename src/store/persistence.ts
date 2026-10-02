/* Persistance locale. Aucune donnée ne quitte l'appareil. */
import { createStore, get, set, type UseStore } from 'idb-keyval';

export interface StorageAdapter {
  load(): Promise<unknown>;
  save(data: unknown): Promise<void>;
}

const KEY = 'data';

/** IndexedDB (base « multiles », magasin « kv ») : un seul document, écrit d'un bloc. */
export function idbStorage(dbName = 'multiles'): StorageAdapter {
  let store: UseStore | null = null;
  const db = () => (store ??= createStore(dbName, 'kv'));
  return {
    load: () => get(KEY, db()),
    save: (data) => set(KEY, data, db()),
  };
}

/** Stockage en mémoire (tests, navigation privée sans IndexedDB). */
export function memoryStorage(initial?: unknown): StorageAdapter {
  let value: unknown = initial === undefined ? undefined : structuredClone(initial);
  return {
    load: async () => (value === undefined ? undefined : structuredClone(value)),
    save: async (data) => { value = structuredClone(data); },
  };
}

/** Demande au navigateur de ne pas effacer les données (appelé au premier lancement). */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
    if (await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
