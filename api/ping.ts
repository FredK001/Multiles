/* Diagnostic : la fonction répond, et la base Redis est-elle reliée ? (oui / non, jamais les clés). */
export function GET(): Response {
  const redis = !!(process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL);
  return Response.json({ ok: true, redis, node: process.version }, { headers: { 'Cache-Control': 'no-store' } });
}
