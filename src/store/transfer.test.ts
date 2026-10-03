import { describe, expect, it } from 'vitest';
import { handleTransfer, memoryTransferStore } from '../../netlify/lib/transfer';
import { createProfile, defaultAvatar } from '../engine/profile';
import { lastBackupText, makeBackup } from './backup';
import { emptyData } from './schema';
import { forgetTransfer, receiveTransfer, sendTransfer, TransferError } from './transfer';
import { CODE_ALPHABET, formatCode, isValidCode, newCode } from './transfer-shared';

const data = () => ({ ...emptyData(), profiles: [{ ...createProfile({ name: 'Nina', color: '#0D7A5F', av: defaultAvatar(), pepin: 'braise' }), level: 4 }] });

/** fetch branché directement sur la fonction, avec son stockage en mémoire. */
const fakeServer = () => {
  const store = memoryTransferStore();
  return (url: string, init?: RequestInit) => handleTransfer(new Request(new URL(url, 'https://multiles.test'), init), store);
};

describe('Codes de transfert', () => {
  it('6 caractères sans confusion possible, uniformes', () => {
    for (let i = 0; i < 200; i++) expect(isValidCode(newCode())).toBe(true);
    expect(CODE_ALPHABET).not.toMatch(/[01OIL]/);
    // Octets ≥ 248 rejetés (biais du modulo).
    const seq = [255, 248, 0, 1, 2, 3, 4, 30];
    expect(newCode((n) => new Uint8Array(seq.splice(0, n)))).toBe('ABCDE9');
    expect(formatCode('K7F29Q')).toBe('K7F-29Q');
  });
});

describe('Transfert entre téléphones', () => {
  it('aller-retour : la progression arrive à l\'identique', async () => {
    const f = fakeServer();
    const d = data();
    const code = await sendTransfer(makeBackup(d).text, f);
    expect(await receiveTransfer(formatCode(code).toLowerCase(), f)).toEqual(d);
    await forgetTransfer(code, f);
    await expect(receiveTransfer(code, f)).rejects.toThrow(/déjà servi/);
  });
  it('messages clairs : code mal saisi, réseau absent, serveur en panne', async () => {
    await expect(receiveTransfer('12', fakeServer())).rejects.toThrow(TransferError);
    const down = () => Promise.reject(new TypeError('Failed to fetch'));
    await expect(sendTransfer('{}', down)).rejects.toThrow(TransferError);
    const boom = async () => new Response('', { status: 500 });
    await expect(receiveTransfer('K7F29Q', boom)).rejects.toThrow(/ne répond pas/);
  });
});

describe('Rappel de sauvegarde', () => {
  it('formule selon l\'ancienneté', () => {
    expect(lastBackupText(null, '2026-10-03')).toBe('Aucune sauvegarde enregistrée depuis cet appareil.');
    expect(lastBackupText('2026-10-03', '2026-10-03')).toBe("Dernière sauvegarde : aujourd'hui.");
    expect(lastBackupText('2026-10-02', '2026-10-03')).toBe('Dernière sauvegarde : hier.');
    expect(lastBackupText('2026-09-13', '2026-10-03')).toBe('Dernière sauvegarde : il y a 20 jours.');
    expect(lastBackupText('2026-06-01', '2026-10-03')).toBe('Dernière sauvegarde : il y a 4 mois.');
  });
});
