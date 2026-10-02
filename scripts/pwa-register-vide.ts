/* Version « un seul fichier » : pas de service worker. */
export function registerSW(): (reload?: boolean) => Promise<void> {
  return async () => {};
}
