/** Générateur aléatoire injectable : Math.random en production, graine fixe dans les tests. */
export type Rng = () => number;

export const defaultRng: Rng = Math.random;

/** Générateur déterministe (mulberry32). */
export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T>(a: readonly T[], rng: Rng = defaultRng): T => a[Math.floor(rng() * a.length)]!;

/** Mélange de Fisher-Yates, en place (comme le prototype). */
export function shuffle<T>(a: T[], rng: Rng = defaultRng): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Tirage pondéré sans remise de `k` éléments. */
export function weightedSample<T>(items: readonly T[], weight: (t: T) => number, k: number, rng: Rng = defaultRng): T[] {
  const pool = items.map((it) => ({ it, w: Math.max(0, weight(it)) }));
  const out: T[] = [];
  while (out.length < k && pool.length) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = rng() * total, idx = 0;
    for (; idx < pool.length - 1; idx++) {
      r -= pool[idx]!.w;
      if (r < 0) break;
    }
    out.push(pool.splice(idx, 1)[0]!.it);
  }
  return out;
}
