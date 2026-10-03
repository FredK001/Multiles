import { describe, expect, it } from 'vitest';
import { TRANSFER_MAX_BYTES, TRANSFER_TTL_MS } from '../../src/store/transfer-shared';
import { handleTransfer, memoryTransferStore } from './transfer';

const URL_ = 'https://multiles.test/api/transfer';
const backup = JSON.stringify({ app: 'multiles-sauvegarde', savedAt: '2026-10-03T10:00:00Z', data: { version: 2, profiles: [] } });
const post = (body: string) => new Request(URL_, { method: 'POST', body });
const get = (code: string) => new Request(`${URL_}?code=${encodeURIComponent(code)}`);

describe('Fonction de transfert', () => {
  it('dépose, rend autant que nécessaire, puis oublie sur demande', async () => {
    const store = memoryTransferStore();
    const r = await handleTransfer(post(backup), store, { now: 1000, makeCode: () => 'K7F29Q' });
    expect(r.status).toBe(201);
    expect(await r.json()).toEqual({ code: 'K7F29Q', expiresAt: 1000 + TRANSFER_TTL_MS });
    // Saisie avec tiret, espaces et minuscules acceptée.
    const g = await handleTransfer(get(' k7f-29q '), store, { now: 2000 });
    expect(g.status).toBe(200);
    expect(await g.text()).toBe(backup);
    expect(g.headers.get('Cache-Control')).toBe('no-store');
    // Réponse perdue ou restauration annulée : le code fonctionne encore.
    expect((await handleTransfer(get('K7F29Q'), store, { now: 3000 })).status).toBe(200);
    const d = await handleTransfer(new Request(`${URL_}?code=K7F-29Q`, { method: 'DELETE' }), store, { now: 4000 });
    expect(d.status).toBe(204);
    expect((await handleTransfer(get('K7F29Q'), store, { now: 5000 })).status).toBe(404);
    expect(store.size()).toBe(0);
  });
  it('un code expiré ne rend rien et est effacé', async () => {
    const store = memoryTransferStore();
    await handleTransfer(post(backup), store, { now: 0, makeCode: () => 'AAAAAA' });
    expect((await handleTransfer(get('AAAAAA'), store, { now: TRANSFER_TTL_MS })).status).toBe(404);
    expect(store.size()).toBe(0);
  });
  it('tout appel efface les codes expirés jamais utilisés', async () => {
    const store = memoryTransferStore();
    await handleTransfer(post(backup), store, { now: 0, makeCode: () => 'AAAAAA' });
    await handleTransfer(post(backup), store, { now: TRANSFER_TTL_MS + 1, makeCode: () => 'BBBBBB' });
    expect((await store.list()).map((e) => e.code)).toEqual(['BBBBBB']);
  });
  it('en cas de collision, tire un autre code', async () => {
    const store = memoryTransferStore();
    const codes = ['AAAAAA', 'AAAAAA', 'CCCCCC'];
    await handleTransfer(post(backup), store, { makeCode: () => codes.shift()! });
    const r = await handleTransfer(post(backup), store, { makeCode: () => codes.shift()! });
    expect(((await r.json()) as { code: string }).code).toBe('CCCCCC');
  });
  it('refuse ce qui n\'est pas une sauvegarde, ou trop gros', async () => {
    const store = memoryTransferStore();
    expect((await handleTransfer(post('{"a":1}'), store)).status).toBe(400);
    expect((await handleTransfer(post('pas du json'), store)).status).toBe(400);
    const big = JSON.stringify({ app: 'multiles-sauvegarde', data: { x: 'a'.repeat(TRANSFER_MAX_BYTES) } });
    expect((await handleTransfer(post(big), store)).status).toBe(413);
    expect(store.size()).toBe(0);
  });
  it('refuse un code mal formé et les autres méthodes', async () => {
    const store = memoryTransferStore();
    expect((await handleTransfer(get('K7F29'), store)).status).toBe(400);
    expect((await handleTransfer(get('O0I1L2'), store)).status).toBe(400);
    expect((await handleTransfer(new Request(URL_, { method: 'PUT' }), store)).status).toBe(405);
  });
});
