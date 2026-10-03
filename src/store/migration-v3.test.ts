import { describe, expect, it } from 'vitest';
import { setGrade } from '../engine/profile';
import { totalStars } from '../engine/unlock';
import { makeBackup, readBackup } from './backup';
import { migrate, profileToV3 } from './migrations';
import { SCHEMA_VERSION } from './schema';

/** Profil tel qu'enregistré par la version 2 (tout à plat, tables 1 à 10). */
const v2Profile = () => ({
  id: 'k1', name: 'Nina', color: '#0D7A5F',
  av: { face: 'rond', hair: 'court', skin: '#F1C29A', hairColor: '#6B3E1F', acc: 'aucun', outfit: 'cape' },
  pepin: 'braise', pw: { head: 'bob' }, house: ['h-plante'], owned: ['h-plante', 'p-bob'],
  stars: 14, coins: 87, level: 6, xp: 0.42,
  streak: { current: 4, best: 9, buoys: 2, lastDay: '2026-10-01', buoyDays: ['2026-09-20'], checkedDay: '2026-10-01' },
  isle: 7,
  isl: {
    1: { steps: 3, trophy: true, stepStars: [3, 3, 2] },
    7: { steps: 1, trophy: false, stepStars: [3, 0, 0] },
    2: { steps: 2, trophy: false, stepStars: [2, 1, 0] },
  },
  mastered: ['7x1', '7x2', '1x4', '8x7'],
  traps: ['7x8', '6x9'],
  trapLog: { '7x8': ['2026-09-30', '2026-10-01'], '6x9': ['2026-09-28'] },
  records: { 7: 18, 1: 25 },
  stickers: ['1-gardien', '1-lieu', '7-lieu'],
  seen: ['1-gardien', '1-lieu'],
  days: { '2026-09-30': { ms: 300_000, sessions: 2 }, '2026-10-01': { ms: 120_000, sessions: 1 } },
  defiDay: '2026-10-01',
  defiPick: { day: '2026-10-01', table: 5 },
  pendingStreak: { kind: 'buoy', streak: 4, buoysLeft: 1, missed: 1 },
  createdAt: 1_700_000_000_000,
});
const v2Data = () => ({ version: 2, profiles: [v2Profile()], settings: { sound: false, bossTime: 3 }, persistAsked: true, lastBackup: '2026-09-29' });

describe('Migration v2 → v3 : profils existants', () => {
  const d = migrate(v2Data()), p = d.profiles[0]!, mul = p.prog.mul!;

  it('passent en CM1, multiplication en cours, sans lecture automatique', () => {
    expect(d.version).toBe(SCHEMA_VERSION);
    expect(p).toMatchObject({ grade: 'CM1', op: 'mul', autoSpeech: false });
    expect(Object.keys(p.prog)).toEqual(['mul']);
  });

  it('gardent tout ce qui est commun : identité, pièces, niveau, série, boutique, Pépin', () => {
    const v = v2Profile();
    expect(p).toMatchObject({
      id: v.id, name: v.name, color: v.color, av: v.av, pepin: v.pepin, pw: v.pw, house: v.house, owned: v.owned,
      coins: 87, level: 6, xp: 0.42, streak: v.streak, pendingStreak: v.pendingStreak, createdAt: v.createdAt,
    });
  });

  it('rangent les îles, records et île en cours par série', () => {
    expect(mul.current).toBe('mul-7');
    expect(mul.series).toEqual({
      'mul-1': { steps: 3, trophy: true, stepStars: [3, 3, 2] },
      'mul-2': { steps: 2, trophy: false, stepStars: [2, 1, 0] },
      'mul-7': { steps: 1, trophy: false, stepStars: [3, 0, 0] },
    });
    expect(mul.records).toEqual({ 'mul-7': 18, 'mul-1': 25 });
  });

  it('les étoiles, désormais calculées, valent l\'ancien total', () => {
    expect(totalStars(mul.series)).toBe(v2Profile().stars);
    expect('stars' in p).toBe(false);
  });

  it('gardent maîtrise, pièges et erreurs à l\'identique', () => {
    const v = v2Profile();
    expect(mul.mastered).toEqual(v.mastered);
    expect(mul.traps).toEqual(v.traps);
    expect(mul.trapLog).toEqual(v.trapLog);
  });

  it('préfixent les stickers par la série, vus compris', () => {
    expect(mul.stickers).toEqual(['mul-1-gardien', 'mul-1-lieu', 'mul-7-lieu']);
    expect(p.seen).toEqual(['mul-1-gardien', 'mul-1-lieu']);
  });

  it('reportent le défi du jour sur la série de la table tirée', () => {
    expect(mul.defiDay).toBe('2026-10-01');
    expect(mul.defiPick).toEqual({ day: '2026-10-01', series: 'mul-5' });
  });

  it('attribuent le temps de jeu passé à la multiplication', () => {
    expect(p.days).toEqual({
      '2026-09-30': { ms: 300_000, sessions: 2, ops: { mul: { ms: 300_000, sessions: 2 } } },
      '2026-10-01': { ms: 120_000, sessions: 1, ops: { mul: { ms: 120_000, sessions: 1 } } },
    });
  });

  it('ne gardent aucun ancien champ à plat', () => {
    for (const k of ['isle', 'isl', 'mastered', 'traps', 'trapLog', 'records', 'stickers', 'defiDay', 'defiPick']) expect(k in p).toBe(false);
  });

  it('gardent les réglages et l\'état de l\'appareil', () => {
    expect(d.settings).toEqual({ sound: false, bossTime: 3 });
    expect(d.persistAsked).toBe(true);
    expect(d.lastBackup).toBe('2026-09-29');
  });
});

describe('Migration v3 : robustesse', () => {
  it('relancer la migration ne change rien', () => {
    const once = migrate(v2Data());
    expect(migrate(structuredClone(once))).toEqual(once);
  });

  it('versions 0 et 1 traversent toutes les étapes', () => {
    for (const version of [undefined, 1]) {
      const d = migrate({ version, profiles: [{ ...v2Profile(), version: undefined }] });
      expect(d.profiles[0]!.prog.mul!.series['mul-1']!.trophy).toBe(true);
      expect(d.profiles[0]!.grade).toBe('CM1');
    }
  });

  it('un profil v2 presque vide reçoit des valeurs par défaut', () => {
    const p = migrate({ version: 2, profiles: [{ name: 'Léo' }] }).profiles[0]!;
    expect(p).toMatchObject({ name: 'Léo', grade: 'CM1', op: 'mul', prog: { mul: { current: 'mul-1', series: {}, mastered: [], stickers: [], defiPick: null } }, days: {} });
  });

  it('une île inconnue ou abîmée est écartée, pas le reste', () => {
    const p = migrate({ version: 2, profiles: [{ ...v2Profile(), isle: 42, isl: { 3: { steps: 2, trophy: false, stepStars: [2, 2, 0] }, 11: { steps: 3 }, 4: 'x' } }] }).profiles[0]!;
    expect(p.prog.mul!.current).toBe('mul-1');
    expect(p.prog.mul!.series).toEqual({ 'mul-3': { steps: 2, trophy: false, stepStars: [2, 2, 0] } });
  });

  it('un profil déjà en v3 dans des données marquées v2 n\'est pas migré une seconde fois', () => {
    const v3 = migrate(v2Data()).profiles[0]!;
    const again = migrate({ version: 2, profiles: [v3] }).profiles[0]!;
    expect(again).toEqual(v3);
  });

  it('les doublons (maîtrise, pièges, stickers) sont retirés, ordre conservé', () => {
    const p = migrate({ version: 2, profiles: [{ ...v2Profile(), mastered: ['7x1', '7x2', '7x1'], traps: ['7x8', '7x8'], stickers: ['1-lieu', '1-lieu'] }] }).profiles[0]!;
    expect(p.prog.mul!.mastered).toEqual(['7x1', '7x2']);
    expect(p.prog.mul!.traps).toEqual(['7x8']);
    expect(p.prog.mul!.stickers).toEqual(['mul-1-lieu']);
  });

  it('profileToV3 est pur : l\'entrée n\'est pas modifiée', () => {
    const v = v2Profile(), copy = structuredClone(v);
    profileToV3(v);
    expect(v).toEqual(copy);
  });
});

describe('Profils v3 (CP)', () => {
  const cp = () => ({
    version: 3,
    profiles: [{
      name: 'Tom', grade: 'CP', op: 'mul', autoSpeech: false,
      prog: {
        add: {
          current: 'add-20', series: { 'add-10': { steps: 3, trophy: true, stepStars: [3, 3, 3] }, 'mul-3': { steps: 1 } },
          mastered: ['3+4', '7+5', '11+11', '9-2', '7x8', '03+4'], traps: ['8+5'], trapLog: { '8+5': ['2026-10-01'], '9-2': ['2026-10-01'] },
          records: { 'add-10': 9, 'sub-10': 4 }, stickers: ['add-10-gardien', 'sub-10-lieu', 'add-10-bidon'], defiPick: { day: '2026-10-01', series: 'sub-10' },
        },
        sub: { mastered: ['9-2', '2-9', '13-5', '20-15'] },
        mul: { mastered: ['7x8'] },
      },
    }],
  });

  it('valident les clés, séries et stickers de chaque opération', () => {
    const p = migrate(cp()).profiles[0]!, add = p.prog.add!;
    expect(add.current).toBe('add-20');
    expect(Object.keys(add.series)).toEqual(['add-10']);
    expect(add.mastered).toEqual(['3+4', '7+5']); // 11+11 > 20, 9-2 et 7x8 d'une autre opération, 03+4 mal écrit
    expect(add.trapLog).toEqual({ '8+5': ['2026-10-01'] });
    expect(add.records).toEqual({ 'add-10': 9 });
    expect(add.stickers).toEqual(['add-10-gardien']);
    expect(add.defiPick).toBeNull();
    expect(p.prog.sub!.mastered).toEqual(['9-2', '13-5']); // 2-9 négatif, 20-15 enlève plus de 10
  });

  it('une opération hors de la classe est remplacée par la première de la classe', () => {
    expect(migrate(cp()).profiles[0]!.op).toBe('add');
  });

  it('la progression des autres classes est gardée (retour au CM1 sans perte)', () => {
    const p = migrate(cp()).profiles[0]!;
    expect(p.prog.mul!.mastered).toEqual(['7x8']);
    const back = setGrade(p, 'CM1');
    expect(back.op).toBe('mul');
    expect(back.prog.mul!.mastered).toEqual(['7x8']);
  });

  it('classe inconnue → CM1 ; lecture automatique par défaut selon la classe', () => {
    const [a, b] = migrate({ version: 3, profiles: [{ grade: 'CE2' }, { grade: 'CP' }] }).profiles;
    expect(a).toMatchObject({ grade: 'CM1', op: 'mul', autoSpeech: false });
    expect(b).toMatchObject({ grade: 'CP', op: 'add', autoSpeech: true });
  });
});

describe('Sauvegarde', () => {
  it('un fichier de sauvegarde v2 se restaure en v3', () => {
    const text = JSON.stringify({ app: 'multiles-sauvegarde', savedAt: '2026-10-01T10:00:00.000Z', data: v2Data() });
    const d = readBackup(text);
    expect(d.version).toBe(SCHEMA_VERSION);
    expect(d.profiles[0]!.prog.mul!.stickers).toContain('mul-7-lieu');
  });
  it('aller-retour v3 à l\'identique', () => {
    const d = migrate(v2Data());
    expect(readBackup(makeBackup(d).text)).toEqual(d);
  });
});
