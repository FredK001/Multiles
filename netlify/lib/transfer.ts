/* Transfert de progression d'un téléphone à l'autre par code temporaire.
   POST : dépose la progression, renvoie un code valable 24 h.
   GET ?code= : rend la progression (sans l'effacer : la réponse peut se perdre, le parent peut annuler).
   DELETE ?code= : efface la progression, une fois restaurée sur le nouveau téléphone (ou le code remplacé).
   Les codes expirés sont effacés à chaque appel.
   Logique pure, le stockage est injecté (Netlify Blobs en production, mémoire dans les tests). */
import { BACKUP_MARK, isValidCode, newCode, normalizeCode, TRANSFER_MAX_BYTES, TRANSFER_TTL_MS } from '../../src/store/transfer-shared';

export interface TransferStore {
  /** Écrit seulement si le code est libre ; faux sinon. */
  create(code: string, text: string, expiresAt: number): Promise<boolean>;
  read(code: string): Promise<{ text: string; expiresAt: number } | null>;
  remove(code: string): Promise<void>;
  /** Codes présents et leur échéance (pour effacer ceux qui ont expiré sans servir). */
  list(): Promise<{ code: string; expiresAt: number }[]>;
}

interface Options {
  now?: number;
  makeCode?: () => string;
}

const HEADERS = { 'Cache-Control': 'no-store' };
const json = (body: unknown, status: number) => Response.json(body, { status, headers: HEADERS });

function isBackup(text: string): boolean {
  try {
    const o = JSON.parse(text) as { app?: unknown; data?: unknown } | null;
    return !!o && o.app === BACKUP_MARK && typeof o.data === 'object' && o.data !== null;
  } catch {
    return false;
  }
}

async function purgeExpired(store: TransferStore, now: number) {
  try {
    const expired = (await store.list()).filter((e) => e.expiresAt <= now);
    await Promise.all(expired.map((e) => store.remove(e.code)));
  } catch (e) {
    // Le ménage ne doit jamais empêcher un transfert.
    console.error('Nettoyage des transferts expirés impossible', e);
  }
}

export async function handleTransfer(req: Request, store: TransferStore, { now = Date.now(), makeCode = newCode }: Options = {}): Promise<Response> {
  if (req.method === 'POST') {
    // Refus avant lecture quand la taille annoncée dépasse déjà la limite.
    if (Number(req.headers.get('Content-Length') ?? 0) > TRANSFER_MAX_BYTES) return json({ error: 'too-large' }, 413);
    const text = await req.text();
    if (new TextEncoder().encode(text).length > TRANSFER_MAX_BYTES) return json({ error: 'too-large' }, 413);
    if (!isBackup(text)) return json({ error: 'invalid' }, 400);
    await purgeExpired(store, now);
    const expiresAt = now + TRANSFER_TTL_MS;
    // Collision très improbable (31^6 codes), quelques essais suffisent.
    for (let i = 0; i < 5; i++) {
      const code = makeCode();
      if (await store.create(code, text, expiresAt)) return json({ code, expiresAt }, 201);
    }
    return json({ error: 'busy' }, 503);
  }

  if (req.method === 'GET' || req.method === 'DELETE') {
    await purgeExpired(store, now);
    const code = normalizeCode(new URL(req.url).searchParams.get('code') ?? '');
    if (!isValidCode(code)) return json({ error: 'invalid-code' }, 400);
    if (req.method === 'DELETE') {
      await store.remove(code);
      return new Response(null, { status: 204, headers: HEADERS });
    }
    const entry = await store.read(code);
    if (!entry || entry.expiresAt <= now) return json({ error: 'not-found' }, 404);
    return new Response(entry.text, { status: 200, headers: { ...HEADERS, 'Content-Type': 'application/json' } });
  }

  return json({ error: 'method' }, 405);
}

/** Stockage en mémoire, pour les tests. */
export function memoryTransferStore(): TransferStore & { size(): number } {
  const m = new Map<string, { text: string; expiresAt: number }>();
  return {
    async create(code, text, expiresAt) {
      if (m.has(code)) return false;
      m.set(code, { text, expiresAt });
      return true;
    },
    async read(code) {
      return m.get(code) ?? null;
    },
    async remove(code) {
      m.delete(code);
    },
    async list() {
      return [...m].map(([code, e]) => ({ code, expiresAt: e.expiresAt }));
    },
    size: () => m.size,
  };
}
