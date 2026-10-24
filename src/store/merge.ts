/* Fusion d'une progression reçue (transfert ou fichier) avec celle de l'appareil : enfant par enfant
   (même identifiant), champ par champ. Maximum ou réunion partout où c'est possible, pour que
   transférer A→B puis B→A ne compte rien deux fois ni ne perde rien. */
import { freeColors } from '../engine/profile';
import { MAX_PROFILES, type AppData, type DayStats, type IsleProgress, type OpProgress, type PlayTime, type Profile } from './schema';

export type MergeKind = 'added' | 'updated' | 'same' | 'full';

export interface MergeResult {
  data: AppData;
  /** Sort de chaque enfant reçu, pour le résumé avant confirmation. */
  report: { name: string; kind: MergeKind }[];
}

const union = <T>(a: readonly T[], b: readonly T[]): T[] => [...new Set([...a, ...b])];
const maxDay = <T extends string | null>(a: T, b: T): T => (a && b ? (a > b ? a : b) : a ?? b);

/** Égalité de contenu, quel que soit l'ordre des clés. */
const canon = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, x]) => [k, canon(x)])) : v;
const same = (a: Profile, b: Profile) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

/** Dernier jour joué (null si jamais). */
const lastPlayed = (p: Profile): string | null => Object.keys(p.days).sort().at(-1) ?? null;

function mergeTime<T extends PlayTime>(a: T, b: T): PlayTime {
  return { ms: Math.max(a.ms, b.ms), sessions: Math.max(a.sessions, b.sessions) };
}

function mergeDays(a: Profile['days'], b: Profile['days']): Profile['days'] {
  const out: Record<string, DayStats> = { ...a };
  for (const [k, d] of Object.entries(b)) {
    const o = out[k];
    if (!o) { out[k] = d; continue; }
    const ops: DayStats['ops'] = { ...o.ops };
    for (const [op, t] of Object.entries(d.ops) as [keyof DayStats['ops'], PlayTime][]) ops[op] = ops[op] ? mergeTime(ops[op]!, t) : t;
    out[k] = { ...mergeTime(o, d), ops };
  }
  return out;
}

function mergeIsle(a: IsleProgress, b: IsleProgress): IsleProgress {
  return {
    steps: Math.max(a.steps, b.steps),
    trophy: a.trophy || b.trophy,
    stepStars: a.stepStars.map((s, i) => Math.max(s, b.stepStars[i]!)) as IsleProgress['stepStars'],
  };
}

function mergeRecord<K extends string, V>(a: Partial<Record<K, V>>, b: Partial<Record<K, V>>, f: (x: V, y: V) => V): Partial<Record<K, V>> {
  const out = { ...a };
  for (const [k, v] of Object.entries(b) as [K, V][]) out[k] = k in out ? f(out[k]!, v) : v;
  return out;
}

/** Listes et clés dans l'ordre de l'appareil, puis les nouveautés reçues ; `recent` l'emporte pour les choix (île en cours, défi tiré). */
const mergeOp = (incomingRecent: boolean) => (local: OpProgress, incoming: OpProgress): OpProgress => ({
  ...(incomingRecent ? incoming : local),
  series: mergeRecord(local.series, incoming.series, mergeIsle),
  mastered: union(local.mastered, incoming.mastered),
  // Au pire, un calcul corrigé sur un seul appareil revient une fois en révision.
  traps: union(local.traps, incoming.traps),
  trapLog: mergeRecord(local.trapLog, incoming.trapLog, (x, y) => union(x, y).sort()) as OpProgress['trapLog'],
  records: mergeRecord(local.records, incoming.records, Math.max),
  stickers: union(local.stickers, incoming.stickers),
  defiDay: maxDay(local.defiDay, incoming.defiDay),
});

/** Fusionne deux versions du même enfant. À égalité de dernier jour joué, la version reçue l'emporte. */
export function mergeProfile(local: Profile, incoming: Profile): Profile {
  const incomingRecent = (lastPlayed(incoming) ?? '') >= (lastPlayed(local) ?? '');
  const [recent, old] = incomingRecent ? [incoming, local] : [local, incoming];
  const s = (recent.streak.lastDay ?? '') >= (old.streak.lastDay ?? '') ? recent.streak : old.streak;
  const lv = recent.level > old.level || (recent.level === old.level && recent.xp >= old.xp) ? recent : old;
  return {
    // Apparence, maison, classe, opération en cours, pièces : version la plus récente.
    ...recent,
    id: local.id,
    owned: union(local.owned, incoming.owned),
    seen: union(local.seen, incoming.seen),
    level: lv.level,
    xp: lv.xp,
    streak: { ...s, best: Math.max(local.streak.best, incoming.streak.best) },
    prog: mergeRecord(local.prog, incoming.prog, mergeOp(incomingRecent)),
    days: mergeDays(local.days, incoming.days),
    createdAt: Math.min(local.createdAt, incoming.createdAt),
  };
}

/** Intègre les enfants reçus : ceux de l'appareil absents de la réception restent tels quels. */
export function mergeData(local: AppData, incoming: AppData): MergeResult {
  const profiles = [...local.profiles];
  const report: MergeResult['report'] = [];
  for (const p of incoming.profiles) {
    const i = profiles.findIndex((q) => q.id === p.id);
    if (i >= 0) {
      const m = mergeProfile(profiles[i]!, p);
      report.push({ name: m.name, kind: same(m, profiles[i]!) ? 'same' : 'updated' });
      profiles[i] = m;
    } else if (profiles.length >= MAX_PROFILES) {
      report.push({ name: p.name, kind: 'full' });
    } else {
      // Deux enfants de la même couleur seraient difficiles à distinguer à l'accueil.
      const color = profiles.some((q) => q.color === p.color) ? freeColors(profiles)[0] ?? p.color : p.color;
      profiles.push({ ...p, color });
      report.push({ name: p.name, kind: 'added' });
    }
  }
  return { data: { ...local, profiles }, report };
}

const KIND_TEXT: Record<MergeKind, string> = {
  added: 'nouveau profil',
  updated: 'progression complétée',
  same: 'déjà à jour',
  full: `pas de place (${MAX_PROFILES} profils au maximum)`,
};

/** Résumé affiché avant de confirmer la récupération. */
export function restoreText(report: MergeResult['report']): string {
  if (!report.length) return 'Cette progression ne contient aucun profil.';
  const lines = report.map((r) => `${r.name} : ${KIND_TEXT[r.kind]}`).join(' · ');
  if (!report.some((r) => r.kind === 'added' || r.kind === 'updated')) return `Rien à récupérer. ${lines}.`;
  return `Récupérer cette progression ? ${lines}. Les autres profils de cet appareil ne changent pas.`;
}
