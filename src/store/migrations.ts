/* Migrations versionnées et normalisation des données lues.
   Pour changer le schéma : incrémenter SCHEMA_VERSION et ajouter MIGRATIONS[ancienne version]. */
import { VARIANT_IDS } from '../content/pepins';
import { AV, PROFILE_COLORS, type AvatarLook } from '../content/avatar';
import { CURRICULUM, GRADES, seriesOf, type Op, type SeriesId } from '../content/series';
import { KINDS, stickerParts } from '../content/stickers';
import type { PepWear } from '../art/mascot';
import type { DayKey } from '../engine/dates';
import { factKey, parseFact, type FactKey } from '../engine/keys';
import { defaultAvatar } from '../engine/profile';
import { seriesForFact } from '../engine/series';
import { defaultSettings, emptyData, SCHEMA_VERSION, START_BUOYS, type AppData, type DayStats, type IsleProgress, type OpProgress, type PlayTime, type Profile, type StreakEvent } from './schema';

type Raw = Record<string, unknown>;

/** MIGRATIONS[n] transforme des données de version n en version n + 1. */
export const MIGRATIONS: Record<number, (d: Raw) => Raw> = {
  // Version 0 : données sans numéro de version (aucune n'a été publiée), simple marquage.
  0: (d) => ({ ...d, version: 1 }),
  // Version 2 : ajout de lastBackup (null par défaut, posé par la normalisation).
  1: (d) => d,
  // Version 3 : classe et progression par opération. Les profils existants passent en CM1,
  // toute leur progression va dans prog.mul, sans perte.
  // Un profil déjà au format v3 (sauvegarde mal étiquetée) n'est pas migré une seconde fois.
  2: (d) => ({ ...d, profiles: Array.isArray(d.profiles) ? d.profiles.map((p) => (isObj(p) && !isObj(p.prog) ? profileToV3(p) : p)) : d.profiles }),
};

/** Profil v2 (tout à plat, tables 1 à 10) → profil v3 (classe CM1, progression dans prog.mul). */
export function profileToV3(v: Raw): Raw {
  const byTable = (o: unknown) => (isObj(o) ? Object.fromEntries(Object.entries(o).map(([n, x]) => [`mul-${n}`, x])) : {});
  // Stickers « 7-lieu » → « mul-7-lieu ».
  const prefixed = (a: unknown) => (Array.isArray(a) ? a.map((k) => (typeof k === 'string' && /^\d+-/.test(k) ? `mul-${k}` : k)) : a);
  const days = isObj(v.days)
    ? Object.fromEntries(Object.entries(v.days).map(([k, d]) => [k, isObj(d) ? { ...d, ops: { mul: { ms: d.ms, sessions: d.sessions } } } : d]))
    : v.days;
  const pick = isObj(v.defiPick) ? { day: v.defiPick.day, series: `mul-${v.defiPick.table}` } : null;
  const rest: Raw = { ...v };
  for (const k of ['isle', 'isl', 'mastered', 'traps', 'trapLog', 'records', 'stickers', 'defiDay', 'defiPick', 'stars']) delete rest[k];
  return {
    ...rest,
    grade: 'CM1',
    op: 'mul',
    autoSpeech: false,
    days,
    seen: prefixed(v.seen),
    prog: {
      mul: {
        current: `mul-${typeof v.isle === 'number' ? v.isle : 1}`,
        series: byTable(v.isl),
        mastered: v.mastered,
        traps: v.traps,
        trapLog: v.trapLog,
        records: byTable(v.records),
        stickers: prefixed(v.stickers),
        defiDay: v.defiDay,
        defiPick: pick,
      },
    },
  };
}

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

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const int = (v: unknown, d: number, min = 0, max = Number.MAX_SAFE_INTEGER) => Math.min(max, Math.max(min, Math.round(num(v, d))));
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], d: T): T => (allowed.includes(v as T) ? (v as T) : d);
const day = (v: unknown) => (typeof v === 'string' && DAY_RE.test(v) ? (v as DayKey) : null);
const days = (v: unknown) => strArr(v).filter((x) => DAY_RE.test(x)) as DayKey[];
const ALL_OPS: readonly Op[] = ['mul', 'add', 'sub'];
/** Clé bien écrite d'un calcul de l'opération qui existe dans l'une de ses séries (« 7x8 », pas « 0x3 » ni « 07x8 »). */
const factOk = (op: Op, k: string): boolean => {
  const f = parseFact(k);
  return !!f && f.op === op && factKey(op, f.a, f.b) === k && !!seriesForFact(op, f);
};
/** Sans doublon, ordre conservé (il colore la grille). */
const uniq = <T>(a: T[]): T[] => [...new Set(a)];
const keys = (op: Op, v: unknown) => uniq(strArr(v).filter((x) => factOk(op, x))) as FactKey[];
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

function normTime(v: unknown): PlayTime {
  const d = isObj(v) ? v : {};
  return { ms: int(d.ms, 0), sessions: int(d.sessions, 0) };
}

function normDay(d: Raw): DayStats {
  const ops: DayStats['ops'] = {};
  if (isObj(d.ops)) for (const op of ALL_OPS) if (isObj(d.ops[op])) ops[op] = normTime(d.ops[op]);
  return { ...normTime(d), ops };
}

/** Progression d'une opération : seules les séries, clés et stickers de cette opération sont gardés. */
function normOp(op: Op, v: Raw): OpProgress {
  const ids = seriesOf(op).map((s) => s.id);
  const isId = (x: unknown): x is SeriesId => ids.includes(x as SeriesId);
  const series: OpProgress['series'] = {};
  if (isObj(v.series)) for (const id of ids) { const ip = normIsle(v.series[id]); if (ip) series[id] = ip; }
  const records: OpProgress['records'] = {};
  if (isObj(v.records)) for (const id of ids) if (typeof v.records[id] === 'number') records[id] = int(v.records[id], 0);
  const trapLog: OpProgress['trapLog'] = {};
  if (isObj(v.trapLog)) for (const [k, d] of Object.entries(v.trapLog)) if (factOk(op, k)) trapLog[k] = days(d);
  const pick = isObj(v.defiPick) ? v.defiPick : null;
  return {
    current: isId(v.current) ? v.current : ids[0]!,
    series,
    mastered: keys(op, v.mastered),
    traps: keys(op, v.traps),
    trapLog,
    records,
    stickers: uniq(strArr(v.stickers).filter((k) => { const s = stickerParts(k); return isId(s.series) && KINDS.includes(s.kind); })),
    defiDay: day(v.defiDay),
    defiPick: pick && day(pick.day) && isId(pick.series) ? { day: day(pick.day)!, series: pick.series } : null,
  };
}

/** Répare un profil (v3) incomplet ou abîmé : chaque champ est validé, sinon remplacé par sa valeur par défaut. */
export function normalizeProfile(v: Raw): Profile {
  const streak = isObj(v.streak) ? v.streak : {};
  const grade = oneOf(v.grade, GRADES, 'CM1'), ops = CURRICULUM[grade];
  const prog: Profile['prog'] = {};
  // Toutes les opérations sont gardées, même hors de la classe : un changement de classe ne perd rien.
  if (isObj(v.prog)) for (const op of ALL_OPS) if (isObj(v.prog[op])) prog[op] = normOp(op, v.prog[op]);
  const dayStats: Profile['days'] = {};
  if (isObj(v.days)) for (const [k, d] of Object.entries(v.days)) if (DAY_RE.test(k) && isObj(d)) dayStats[k] = normDay(d);
  return {
    id: str(v.id, `p-${Math.random().toString(36).slice(2, 10)}`),
    name: str(v.name, 'Joueur').slice(0, 12) || 'Joueur',
    color: oneOf(v.color, vals(PROFILE_COLORS), '#C8371D'),
    av: normAvatar(v.av),
    pepin: oneOf(v.pepin, VARIANT_IDS, 'pousse'),
    pw: normWear(v.pw),
    house: strArr(v.house),
    owned: strArr(v.owned),
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
    grade,
    op: oneOf(v.op, ops, ops[0]!),
    prog,
    seen: strArr(v.seen),
    autoSpeech: typeof v.autoSpeech === 'boolean' ? v.autoSpeech : grade === 'CP',
    days: dayStats,
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
