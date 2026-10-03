import { describe, expect, it } from 'vitest';
import { createProfile, defaultAvatar } from '../engine/profile';
import { BackupError, makeBackup, readBackup } from './backup';
import { FutureVersionError } from './migrations';
import { emptyData } from './schema';

const data = () => ({ ...emptyData(), profiles: [{ ...createProfile({ name: 'Nina', color: '#0D7A5F', av: defaultAvatar(), pepin: 'braise' }), level: 4, coins: 40 }] });

describe('Sauvegarde', () => {
  it('aller-retour : la progression revient à l\'identique', () => {
    const d = data();
    const { name, text } = makeBackup(d, new Date(2026, 9, 3));
    expect(name).toBe('multiles-sauvegarde-2026-10-03.json');
    expect(readBackup(text)).toEqual(d);
  });
  it('refuse un fichier qui n\'est pas une sauvegarde', () => {
    expect(() => readBackup('pas du json')).toThrow(BackupError);
    expect(() => readBackup(JSON.stringify({ profiles: [] }))).toThrow(BackupError);
  });
  it('refuse une sauvegarde d\'une version plus récente', () => {
    expect(() => readBackup(JSON.stringify({ app: 'multiles-sauvegarde', data: { version: 99, profiles: [] } }))).toThrow(FutureVersionError);
  });
});
