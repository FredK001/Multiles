import { describe, expect, it } from 'vitest';
import { handleTransfer } from '../netlify/lib/transfer';
import { BACKUP_MARK } from '../src/store/transfer-shared';
import { allowCall, memoryRedis, redisTransferStore } from './redis-store';

const backup = JSON.stringify({ app: BACKUP_MARK, data: { version: 5, profiles: [] } });
const req = (method: string, query = '', body?: string) => new Request(`https://x.test/api/transfer${query}`, { method, ...(body ? { body } : {}) });

describe('transfert sur Redis (Vercel)', () => {
  it('dépôt, lecture, effacement : même comportement que sur Netlify', async () => {
    const store = redisTransferStore(memoryRedis(), () => 1000);
    const r = await handleTransfer(req('POST', '', backup), store, { now: 1000, makeCode: () => 'K7F29Q' });
    expect(r.status).toBe(201);
    const { code } = (await r.json()) as { code: string };
    expect(await (await handleTransfer(req('GET', `?code=${code}`), store, { now: 2000 })).text()).toBe(backup);
    expect((await handleTransfer(req('DELETE', `?code=${code}`), store, { now: 2000 })).status).toBe(204);
    expect((await handleTransfer(req('GET', `?code=${code}`), store, { now: 2000 })).status).toBe(404);
  });

  it('un code existant n’est jamais écrasé', async () => {
    const store = redisTransferStore(memoryRedis());
    expect(await store.create('AAAAAA', 'un', Date.now() + 1000)).toBe(true);
    expect(await store.create('AAAAAA', 'deux', Date.now() + 1000)).toBe(false);
    expect((await store.read('AAAAAA'))?.text).toBe('un');
  });

  it('au plus 10 appels par minute et par adresse', async () => {
    const redis = memoryRedis();
    const results = await Promise.all(Array.from({ length: 12 }, () => allowCall(redis, '1.2.3.4')));
    expect(results.filter(Boolean)).toHaveLength(10);
    expect(await allowCall(redis, '5.6.7.8')).toBe(true);
  });
});
