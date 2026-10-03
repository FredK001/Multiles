/* Partagé entre l'application et la fonction Netlify de transfert (netlify/lib/transfer.ts) :
   aucune dépendance, pour garder la fonction légère. */

/** Marque d'un fichier de sauvegarde (et du contenu d'un transfert). */
export const BACKUP_MARK = 'multiles-sauvegarde';

/** Durée de validité d'un code de transfert. */
export const TRANSFER_TTL_MS = 24 * 60 * 60 * 1000;
/** Taille maximale d'une progression transférée (4 profils actifs depuis des années restent bien en dessous). */
export const TRANSFER_MAX_BYTES = 256 * 1024;

/** Sans 0/O ni 1/I/L : impossibles à confondre en recopiant. */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

const CODE_RE = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

/** Code aléatoire uniforme (rejet des octets ≥ 248 = 8 × 31 pour éviter le biais du modulo). */
export function newCode(bytes = (n: number) => crypto.getRandomValues(new Uint8Array(n))): string {
  let out = '';
  while (out.length < CODE_LENGTH) {
    for (const b of bytes(CODE_LENGTH)) {
      if (b < 248 && out.length < CODE_LENGTH) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
    }
  }
  return out;
}

/** Saisie libre (minuscules, espaces, tiret) → code brut. */
export const normalizeCode = (s: string) => s.toUpperCase().replace(/[\s-]/g, '');

export const isValidCode = (code: string) => CODE_RE.test(code);

/** « K7F29Q » → « K7F-29Q », plus facile à lire et à dicter. */
export const formatCode = (code: string) => `${code.slice(0, 3)}-${code.slice(3)}`;
