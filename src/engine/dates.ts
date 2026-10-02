/** Jour calendaire local au format AAAA-MM-JJ. Le défi du jour et la série changent à minuit local. */
export type DayKey = `${number}-${string}-${string}`;

export function dayKey(d: Date = new Date()): DayKey {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` as DayKey;
}

/** Numéro de jour indépendant des fuseaux et de l'heure d'été. */
export function dayNumber(k: string): number {
  const [y, m, d] = k.split('-').map(Number);
  return Math.round(Date.UTC(y!, m! - 1, d!) / 86_400_000);
}

export function fromDayNumber(n: number): DayKey {
  const d = new Date(n * 86_400_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}` as DayKey;
}

export const addDays = (k: string, n: number): DayKey => fromDayNumber(dayNumber(k) + n);

export const daysBetween = (from: string, to: string): number => dayNumber(to) - dayNumber(from);

/** Jour de la semaine, lundi = 0 … dimanche = 6. */
export function weekday(k: string): number {
  // Le 1er janvier 1970 était un jeudi (3 en partant de lundi).
  return (((dayNumber(k) + 3) % 7) + 7) % 7;
}

/** Les 7 jours (lundi → dimanche) de la semaine contenant `k`. */
export function weekOf(k: string): DayKey[] {
  const monday = dayNumber(k) - weekday(k);
  return Array.from({ length: 7 }, (_, i) => fromDayNumber(monday + i));
}
