/* Fonction Netlify : transfert de progression par code (logique dans netlify/lib/transfer.ts). */
import { getStore } from '@netlify/blobs';
import { handleTransfer, type TransferStore } from '../lib/transfer';

function blobStore(): TransferStore {
  // Cohérence forte : le code doit être lisible sur l'autre téléphone dès sa création.
  const store = getStore({ name: 'transferts', consistency: 'strong' });
  const expiry = (m: Record<string, unknown> | undefined) => (typeof m?.expiresAt === 'number' ? m.expiresAt : 0);
  return {
    async create(code, text, expiresAt) {
      return (await store.set(code, text, { onlyIfNew: true, metadata: { expiresAt } })).modified;
    },
    async read(code) {
      const r = await store.getWithMetadata(code, { type: 'text' });
      return r ? { text: r.data, expiresAt: expiry(r.metadata) } : null;
    },
    async remove(code) {
      await store.delete(code);
    },
    async list() {
      const { blobs } = await store.list();
      return Promise.all(blobs.map(async ({ key }) => ({ code: key, expiresAt: expiry((await store.getMetadata(key))?.metadata) })));
    },
  };
}

export default (req: Request) => handleTransfer(req, blobStore());

export const config = {
  path: '/api/transfer',
  // Limite les essais de codes au hasard depuis une même adresse.
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
