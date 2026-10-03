/* Transfert de progression vers un autre téléphone par code temporaire (fonction Netlify /api/transfer). */
import { readBackup } from './backup';
import type { AppData } from './schema';
import { isValidCode, normalizeCode } from './transfer-shared';

/** Message prêt à afficher au parent. */
export class TransferError extends Error {}

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

const API = '/api/transfer';
const OFFLINE = "Pas de connexion à internet. Le transfert par code en a besoin ; vous pouvez aussi passer par un fichier de sauvegarde.";
const SERVER = 'Le service de transfert ne répond pas. Réessayez dans un moment, ou passez par un fichier de sauvegarde.';

async function call(f: Fetch, url: string, init?: RequestInit): Promise<Response> {
  try {
    return await f(url, init);
  } catch {
    throw new TransferError(navigator.onLine === false ? OFFLINE : SERVER);
  }
}

/** Dépose la progression (texte d'un fichier de sauvegarde) et renvoie le code à saisir sur l'autre téléphone. */
export async function sendTransfer(text: string, f: Fetch = (u, i) => fetch(u, i)): Promise<string> {
  const r = await call(f, API, { method: 'POST', body: text, headers: { 'Content-Type': 'application/json' } });
  if (r.status === 413) throw new TransferError('La progression est trop volumineuse pour un transfert par code. Passez par un fichier de sauvegarde.');
  if (!r.ok) throw new TransferError(SERVER);
  const { code } = (await r.json().catch(() => ({}))) as { code?: unknown };
  if (typeof code !== 'string' || !isValidCode(code)) throw new TransferError(SERVER);
  return code;
}

/** Récupère la progression liée à un code. Lève TransferError, ou les erreurs de readBackup. */
export async function receiveTransfer(input: string, f: Fetch = (u, i) => fetch(u, i)): Promise<AppData> {
  const code = normalizeCode(input);
  if (!isValidCode(code)) throw new TransferError('Un code de transfert compte 6 caractères, par exemple K7F-29Q.');
  const r = await call(f, `${API}?code=${code}`);
  if (r.status === 404) throw new TransferError("Ce code n'existe pas, a déjà servi ou a expiré. Vérifiez-le, ou demandez un nouveau code sur l'ancien téléphone.");
  if (!r.ok) throw new TransferError(SERVER);
  return readBackup(await r.text());
}

/** Efface la progression déposée (restauration faite, ou code remplacé). Sans gravité si cela échoue : elle expire seule. */
export async function forgetTransfer(code: string, f: Fetch = (u, i) => fetch(u, i)): Promise<void> {
  try {
    await f(`${API}?code=${normalizeCode(code)}`, { method: 'DELETE' });
  } catch {
    // Expiration au bout de 24 h.
  }
}
