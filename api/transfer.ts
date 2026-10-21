/* Fonction Vercel /api/transfer : transfert de progression par code (logique dans netlify/lib/transfer.ts,
   stockage Redis Upstash ajouté au projet depuis l'onglet Storage de Vercel). */
import { Redis } from '@upstash/redis';
import { handleTransfer } from '../netlify/lib/transfer';
import { allowCall, redisTransferStore } from '../server/redis-store';

// L'intégration Upstash de Vercel fournit KV_REST_API_* ; un compte Upstash direct, UPSTASH_REDIS_REST_*.
const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

async function handle(req: Request): Promise<Response> {
  // Limite les essais de codes au hasard depuis une même adresse.
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0]!.trim() || 'inconnue';
  if (!(await allowCall(redis, ip))) return Response.json({ error: 'busy' }, { status: 429, headers: { 'Cache-Control': 'no-store' } });
  return handleTransfer(req, redisTransferStore(redis));
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
