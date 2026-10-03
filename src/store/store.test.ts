import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { createProfile, defaultAvatar } from '../engine/profile';
import { FutureVersionError, migrate } from './migrations';
import { idbStorage, memoryStorage } from './persistence';
import { SCHEMA_VERSION, type Profile } from './schema';
import { openStore } from './store';

const kid = (name = 'Noah', color = '#0D7A5F') => createProfile({ name, color, av: defaultAvatar(), pepin: 'pousse' });
const noPersist = async () => true;

describe('Migrations', () => {
  it('données absentes : base vide à la version courante', () => {
    expect(migrate(undefined)).toEqual({ version: SCHEMA_VERSION, profiles: [], settings: { sound: true, bossTime: 2 }, persistAsked: false, lastBackup: null });
  });
  it('version 0 (sans numéro) migrée vers la version courante', () => {
    const d = migrate({ profiles: [{ name: 'Léa', coins: 12 }] });
    expect(d.version).toBe(SCHEMA_VERSION);
    expect(d.profiles[0]).toMatchObject({ name: 'Léa', coins: 12, level: 1, grade: 'CM1', op: 'mul', prog: { mul: { current: 'mul-1' } }, streak: { buoys: 1 } });
  });
  it('répare un profil incomplet ou abîmé', () => {
    const d = migrate({ version: 1, profiles: [{ name: 'Inès', isl: { 3: { steps: 9, stepStars: [5, 'x'] } }, pepin: 'dragon', traps: ['7x8', 3] }], settings: { bossTime: 7 } });
    const p = d.profiles[0]!;
    expect(p.prog.mul!.series['mul-3']).toEqual({ steps: 3, trophy: false, stepStars: [3, 0, 0] });
    expect(p.pepin).toBe('pousse');
    expect(p.prog.mul!.traps).toEqual(['7x8']);
    expect(d.settings.bossTime).toBe(2);
  });
  it('valide chaque champ : avatar, clés, dates, jours, nombres', () => {
    const p = migrate({ version: 1, profiles: [{ av: { face: 'triangle', hair: null, acc: 'couronne', outfit: 'pyjama' }, days: { '2026-10-02': 5, '2026-10-01': { ms: 60000 }, nope: {} }, traps: ['foo', '7x8', '0x3'], mastered: ['11x2', '2x3'], streak: { lastDay: 'hier', buoys: 9 }, xp: 4, coins: -3, color: 'rouge', pendingStreak: { kind: 'bidon' } }] }).profiles[0]!;
    expect(p.av).toEqual({ face: 'rond', hair: 'court', skin: '#F1C29A', hairColor: '#6B3E1F', acc: 'couronne' });
    expect(p.days).toEqual({ '2026-10-01': { ms: 60000, sessions: 0, ops: { mul: { ms: 60000, sessions: 0 } } } });
    expect(p.prog.mul!.traps).toEqual(['7x8']);
    expect(p.prog.mul!.mastered).toEqual(['2x3']);
    expect(p.streak).toMatchObject({ lastDay: null, buoys: 2 });
    expect(p.xp).toBeLessThan(1);
    expect(p.coins).toBe(0);
    expect(p.color).toBe('#C8371D');
    expect(p.pendingStreak).toBeNull();
  });
  it('refuse des données plus récentes que l\'application', () => {
    expect(() => migrate({ version: SCHEMA_VERSION + 1 })).toThrow(FutureVersionError);
  });
});

describe('Store', () => {
  it('demande le stockage persistant au premier lancement seulement', async () => {
    const storage = memoryStorage();
    let asked = 0;
    const persist = async () => { asked++; return true; };
    await openStore({ storage, persist });
    await openStore({ storage, persist });
    expect(asked).toBe(1);
  });
  it('sauvegarde chaque modification et notifie', async () => {
    const storage = memoryStorage();
    const s = await openStore({ storage, persist: noPersist });
    const seen: number[] = [];
    s.subscribe((d) => seen.push(d.profiles.length));
    const p = kid();
    await s.addProfile(p);
    await s.updateProfile(p.id, (x) => ({ ...x, coins: 99 }));
    await s.setSettings({ bossTime: 0 });
    expect(seen).toEqual([1, 1, 1]);
    const reopened = await openStore({ storage, persist: noPersist });
    expect(reopened.get().profiles[0]!.coins).toBe(99);
    expect(reopened.get().settings.bossTime).toBe(0);
  });
  it('4 profils au maximum', async () => {
    const s = await openStore({ storage: memoryStorage(), persist: noPersist });
    for (const [n, c] of [['A', '#C8371D'], ['B', '#0D7A5F'], ['C', '#8A36A8'], ['D', '#A35400']]) await s.addProfile(kid(n, c));
    await expect(s.addProfile(kid('E'))).rejects.toThrow();
  });
  it('n\'écrase jamais des données d\'une version future', async () => {
    const future = { version: SCHEMA_VERSION + 1, profiles: [{ name: 'X' }] };
    const storage = memoryStorage(future);
    const s = await openStore({ storage, persist: noPersist });
    await s.addProfile(kid());
    expect(await storage.load()).toEqual(future);
  });
  it('une écriture refusée au premier lancement ne bloque pas le démarrage', async () => {
    const storage = { load: async () => undefined, save: async () => { throw new Error('quota'); } };
    const s = await openStore({ storage, persist: noPersist });
    await s.addProfile(kid());
    expect(s.get().profiles).toHaveLength(1);
    expect(await s.flush()).toBe(false);
  });
  it('un écouteur qui plante n\'empêche pas la sauvegarde', async () => {
    const storage = memoryStorage();
    const s = await openStore({ storage, persist: noPersist });
    s.subscribe(() => { throw new Error('boum'); });
    await s.addProfile(kid());
    expect(((await storage.load()) as { profiles: unknown[] }).profiles).toHaveLength(1);
  });
  it('IndexedDB : aller-retour complet d\'un profil', async () => {
    const storage = idbStorage('multiles-test');
    const s = await openStore({ storage, persist: noPersist });
    const p: Profile = {
      ...kid('Inès', '#8A36A8'), seen: ['mul-7-lieu'], pw: { head: 'bob' }, house: ['h-plante'], owned: ['h-plante', 'p-bob'],
      days: { '2026-10-02': { ms: 240_000, sessions: 2, ops: { mul: { ms: 240_000, sessions: 2 } } } },
      prog: { mul: { current: 'mul-7', series: { 'mul-7': { steps: 2, trophy: false, stepStars: [3, 2, 0] } }, mastered: ['7x2'], traps: ['7x8'], trapLog: { '7x8': ['2026-10-02'] }, records: { 'mul-7': 14 }, stickers: ['mul-7-lieu'], defiDay: null, defiPick: { day: '2026-10-02', series: 'mul-5' } } },
    };
    await s.addProfile(p);
    await s.flush();
    const back = await openStore({ storage: idbStorage('multiles-test'), persist: noPersist });
    expect(back.get().profiles[0]).toEqual(p);
  });
});
