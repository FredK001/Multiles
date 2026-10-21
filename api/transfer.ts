/* Fonction Vercel /api/transfer : transfert de progression par code (logique dans netlify/lib/transfer.ts,
   stockage Redis Upstash ajouté au projet depuis l'onglet Storage de Vercel). */
import { Redis } from '@upstash/redis';
// Extensions .js obligatoires : la fonction tourne en modules ES sous Node, sans bundler.
import { handleTransfer } from '../netlify/lib/transfer.js';
import { allowCall, redisTransferStore } from '../server/redis-store.js';

// L'intégration Upstash de Vercel fournit KV_REST_API_* ; un compte Upstash direct, UPSTASH_REDIS_REST_*.
const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

const NO_STORE = { 'Cache-Control': 'no-store' };

async function handle(req: Request): Promise<Response> {
  // Base Redis absente (pas encore reliée au projet) : erreur claire plutôt qu'un plantage.
  if (!(process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL)) return Response.json({ error: 'no-store' }, { status: 503, headers: NO_STORE });
  try {
    // Limite les essais de codes au hasard depuis une même adresse.
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0]!.trim() || 'inconnue';
    if (!(await allowCall(redis, ip))) return Response.json({ error: 'busy' }, { status: 429, headers: NO_STORE });
    return await handleTransfer(req, redisTransferStore(redis));
  } catch (e) {
    console.error('Transfert impossible', e);
    return Response.json({ error: 'busy' }, { status: 503, headers: NO_STORE });
  }
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
