/* Stockage des transferts sur Redis (Upstash, via Vercel) : un code = une clé qui expire seule au bout de 24 h.
   Le client Redis est injecté (fetch REST en production, faux en mémoire dans les tests). */
import type { TransferStore } from '../netlify/lib/transfer';

/** Ce dont on a besoin d'un client Redis (sous-ensemble de @upstash/redis). */
export interface RedisLike {
  set(key: string, value: string, opts: { nx: true; px: number }): Promise<unknown>;
  get(key: string): Promise<unknown>;
  del(key: string): Promise<unknown>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
}

const KEY = (code: string) => `transfert:${code}`;

export function redisTransferStore(redis: RedisLike, now: () => number = Date.now): TransferStore {
  return {
    async create(code, text, expiresAt) {
      // NX : jamais d'écrasement d'un code existant ; PX : Redis efface la clé à l'échéance.
      const ok = await redis.set(KEY(code), JSON.stringify({ text, expiresAt }), { nx: true, px: Math.max(1, expiresAt - now()) });
      return ok === 'OK';
    },
    async read(code) {
      const v = await redis.get(KEY(code));
      if (v === null || v === undefined) return null;
      // @upstash/redis désérialise le JSON tout seul ; un client brut rend une chaîne.
      const o = (typeof v === 'string' ? JSON.parse(v) : v) as { text?: unknown; expiresAt?: unknown };
      return typeof o.text === 'string' && typeof o.expiresAt === 'number' ? { text: o.text, expiresAt: o.expiresAt } : null;
    },
    async remove(code) {
      await redis.del(KEY(code));
    },
    // Redis fait le ménage des codes expirés : rien à lister.
    async list() {
      return [];
    },
  };
}

/** Au plus `limit` appels par minute et par adresse ; vrai si l'appel est accepté. */
export async function allowCall(redis: RedisLike, ip: string, limit = 10): Promise<boolean> {
  const k = `essais:${ip}`, n = await redis.incr(k);
  if (n === 1) await redis.expire(k, 60);
  return n <= limit;
}

/** Faux Redis en mémoire, pour les tests (sans expiration réelle). */
export function memoryRedis(): RedisLike {
  const m = new Map<string, string>();
  return {
    async set(key, value, { nx }) {
      if (nx && m.has(key)) return null;
      m.set(key, value);
      return 'OK';
    },
    async get(key) {
      const v = m.get(key);
      return v === undefined ? null : JSON.parse(v);
    },
    async del(key) {
      m.delete(key);
    },
    async incr(key) {
      const n = Number(m.get(key) ?? 0) + 1;
      m.set(key, String(n));
      return n;
    },
    async expire() {
      return 1;
    },
  };
}
