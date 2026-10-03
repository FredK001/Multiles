/* Migrations versionnées et normalisation des données lues.
   Pour changer le schéma : incrémenter SCHEMA_VERSION et ajouter MIGRATIONS[ancienne version]. */
import { ISLE_IDS, type IsleId } from '../content/isles';
import { VARIANT_IDS } from '../content/pepins';
import { AV, PROFILE_COLORS, type AvatarLook } from '../content/avatar';
import type { PepWear } from '../art/mascot';
import type { DayKey } from '../engine/dates';
import type { MulKey } from '../engine/keys';
import { defaultAvatar } from '../engine/profile';
import { defaultSettings, emptyData, SCHEMA_VERSION, START_BUOYS, type AppData, type IsleProgress, type Profile, type StreakEvent } from './schema';

type Raw = Record<string, unknown>;

/** MIGRATIONS[n] transforme des données de version n en version n + 1. */
export const MIGRATIONS: Record<number, (d: Raw) => Raw> = {
  // Version 0 : données sans numéro de version (aucune n'a été publiée), simple marquage.
  0: (d) => ({ ...d, version: 1 }),
  // Version 2 : ajout de lastBackup (null par défaut, posé par la normalisation).
  1: (d) => d,
};

export class FutureVersionError extends Error {
  constructor(readonly found: number) {
    super(`Données en version ${found}, plus récente que l'application (${SCHEMA_VERSION}).`);
  }
}

const isObj = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const str = (v: unknown, d: string) => (typeof v === 'string' ? v : d);
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

function normIsle(v: unknown): IsleProgress | null {
  if (!isObj(v)) return null;
  const ss = Array.isArray(v.stepStars) ? v.stepStars : [];
  const steps = Math.min(3, Math.max(0, Math.round(num(v.steps, 0))));
  return {
    steps,
    trophy: v.trophy === true,
    stepStars: [0, 1, 2].map((i) => Math.min(3, Math.max(0, Math.round(num(ss[i], 0))))) as [number, number, number],
  };
}

const KEY_RE = /^([1-9]|10)x([1-9]|10)$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const int = (v: unknown, d: number, min = 0, max = Number.MAX_SAFE_INTEGER) => Math.min(max, Math.max(min, Math.round(num(v, d))));
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], d: T): T => (allowed.includes(v as T) ? (v as T) : d);
const day = (v: unknown) => (typeof v === 'string' && DAY_RE.test(v) ? (v as DayKey) : null);
const days = (v: unknown) => strArr(v).filter((x) => DAY_RE.test(x)) as DayKey[];
const keys = (v: unknown) => strArr(v).filter((x) => KEY_RE.test(x)) as MulKey[];
const vals = (opts: readonly (readonly [string, ...unknown[]])[]) => opts.map((o) => o[0]);

function normAvatar(v: unknown): AvatarLook {
  const a = isObj(v) ? v : {}, d = defaultAvatar();
  const look: AvatarLook = {
    face: oneOf(a.face, vals(AV.face) as AvatarLook['face'][], d.face),
    hair: oneOf(a.hair, vals(AV.hair) as AvatarLook['hair'][], d.hair),
    skin: oneOf(a.skin, vals(AV.skin), d.skin),
    hairColor: oneOf(a.hairColor, vals(AV.hairColor), d.hairColor),
    acc: oneOf(a.acc, vals(AV.acc) as AvatarLook['acc'][], d.acc),
  };
  const outfit = oneOf(a.outfit, ['', 'raye', 'etoiles', 'cape', 'astro'] as const, '');
  if (outfit) look.outfit = outfit;
  return look;
}

function normWear(v: unknown): PepWear {
  const w = isObj(v) ? v : {}, out: PepWear = {};
  if (['fete', 'couronne', 'bob'].includes(w.head as string)) out.head = w.head as PepWear['head'];
  if (['soleil', 'lunettes'].includes(w.face as string)) out.face = w.face as PepWear['face'];
  if (['echarpe', 'papillon'].includes(w.neck as string)) out.neck = w.neck as PepWear['neck'];
  return out;
}

function normPending(v: unknown): StreakEvent | null {
  if (!isObj(v)) return null;
  if (v.kind === 'buoy') return { kind: 'buoy', streak: int(v.streak, 0), buoysLeft: int(v.buoysLeft, 0, 0, 2), missed: int(v.missed, 1, 1) };
  if (v.kind === 'reset') return { kind: 'reset', best: int(v.best, 0) };
  return null;
}

/** Répare un profil incomplet ou abîmé : chaque champ est validé, sinon remplacé par sa valeur par défaut. */
export function normalizeProfile(v: Raw): Profile {
  const streak = isObj(v.streak) ? v.streak : {};
  const isl: Profile['isl'] = {};
  if (isObj(v.isl)) for (const n of ISLE_IDS) { const ip = normIsle(v.isl[n]); if (ip) isl[n] = ip; }
  const records: Profile['records'] = {};
  if (isObj(v.records)) for (const n of ISLE_IDS) if (typeof v.records[n] === 'number') records[n] = int(v.records[n], 0);
  const dayStats: Profile['days'] = {};
  if (isObj(v.days)) for (const [k, d] of Object.entries(v.days)) if (DAY_RE.test(k) && isObj(d)) dayStats[k] = { ms: int(d.ms, 0), sessions: int(d.sessions, 0) };
  const trapLog: Profile['trapLog'] = {};
  if (isObj(v.trapLog)) for (const [k, d] of Object.entries(v.trapLog)) if (KEY_RE.test(k)) trapLog[k] = days(d);
  return {
    id: str(v.id, `p-${Math.random().toString(36).slice(2, 10)}`),
    name: str(v.name, 'Joueur').slice(0, 12) || 'Joueur',
    color: oneOf(v.color, vals(PROFILE_COLORS), '#C8371D'),
    av: normAvatar(v.av),
    pepin: oneOf(v.pepin, VARIANT_IDS, 'pousse'),
    pw: normWear(v.pw),
    house: strArr(v.house),
    owned: strArr(v.owned),
    stars: int(v.stars, 0, 0, 90),
    coins: int(v.coins, 0),
    level: int(v.level, 1, 1),
    xp: Math.min(0.999, Math.max(0, num(v.xp, 0))),
    streak: {
      current: int(streak.current, 0),
      best: int(streak.best, 0),
      buoys: int(streak.buoys, START_BUOYS, 0, 2),
      lastDay: day(streak.lastDay),
      buoyDays: days(streak.buoyDays),
      checkedDay: day(streak.checkedDay),
    },
    isle: ISLE_IDS.includes(v.isle as IsleId) ? (v.isle as IsleId) : 1,
    isl,
    mastered: keys(v.mastered),
    traps: keys(v.traps),
    trapLog,
    records,
    stickers: strArr(v.stickers),
    seen: strArr(v.seen),
    days: dayStats,
    defiDay: day(v.defiDay),
    defiPick: isObj(v.defiPick) && day(v.defiPick.day) && ISLE_IDS.includes(v.defiPick.table as IsleId) ? { day: day(v.defiPick.day)!, table: v.defiPick.table as IsleId } : null,
    pendingStreak: normPending(v.pendingStreak),
    createdAt: num(v.createdAt, Date.now()),
  };
}

/** Lit des données brutes, applique les migrations et normalise. */
export function migrate(raw: unknown): AppData {
  if (!isObj(raw)) return emptyData();
  let d: Raw = raw;
  let v = num(d.version, 0);
  if (v > SCHEMA_VERSION) throw new FutureVersionError(v);
  while (v < SCHEMA_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error(`Migration manquante depuis la version ${v}`);
    d = step(d);
    v = v + 1;
    d = { ...d, version: v };
  }
  const s = isObj(d.settings) ? d.settings : {};
  const bossTime = [0, 2, 3].includes(s.bossTime as number) ? (s.bossTime as 0 | 2 | 3) : defaultSettings().bossTime;
  return {
    version: SCHEMA_VERSION,
    profiles: (Array.isArray(d.profiles) ? d.profiles : []).filter(isObj).map(normalizeProfile).slice(0, 4),
    settings: { sound: s.sound !== false, bossTime },
    persistAsked: d.persistAsked === true,
    lastBackup: day(d.lastBackup),
  };
}
