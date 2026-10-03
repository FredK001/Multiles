/* Création et modification de profil, boutique, éditeur d'avatar. */
import { AV, PROFILE_COLORS, type AvatarLook } from '../content/avatar';
import type { PepinVariant } from '../content/pepins';
import { CURRICULUM, type Grade } from '../content/series';
import type { ShopCat, ShopItem } from '../content/shop';
import { START_BUOYS, START_COINS, type Profile } from '../store/schema';
import type { DayKey } from './dates';
import { defaultRng, pick, type Rng } from './random';
import { checkStreak } from './streak';
import { dailySeries } from './daily';
import { opProg, withOp } from './progress';
import { openSeries } from './unlock';

/** Avatar par défaut d'un nouveau joueur. */
export const defaultAvatar = (): AvatarLook => ({ face: 'rond', hair: 'court', skin: '#F1C29A', hairColor: '#6B3E1F', acc: 'aucun' });

/** Prénom saisi : espaces retirés, première lettre en capitale. */
export function cleanName(v: string): string {
  const t = v.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Couleurs de profil encore libres (hors profil `self`). */
export const freeColors = (profiles: readonly Profile[], self?: Profile | null): string[] =>
  PROFILE_COLORS.map(([c]) => c).filter((c) => !profiles.some((p) => p !== self && p.color === c));

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function createProfile(input: { name: string; color: string; av: AvatarLook; pepin: PepinVariant; grade?: Grade }, now = Date.now()): Profile {
  const grade = input.grade ?? 'CM1';
  return {
    id: uid(), name: cleanName(input.name), color: input.color, av: { ...input.av }, pepin: input.pepin,
    pw: {}, house: [], owned: [], coins: START_COINS, level: 1, xp: 0,
    streak: { current: 0, best: 0, buoys: START_BUOYS, lastDay: null, buoyDays: [], checkedDay: null },
    grade, op: CURRICULUM[grade][0]!, prog: {}, seen: [],
    // Au CP, l'enfant lit peu : consignes et calculs lus à voix haute par défaut.
    autoSpeech: grade === 'CP',
    days: {}, pendingStreak: null, createdAt: now,
  };
}

/** Change la classe : la progression de chaque opération est conservée (un retour en arrière la retrouve). */
export function setGrade(p: Profile, grade: Grade): Profile {
  if (p.grade === grade) return p;
  return { ...p, grade, op: CURRICULUM[grade][0]! };
}

/** « Au hasard » : visage, coiffure, couleur de cheveux et accessoire gratuit. Jamais la peau. */
export function randomizeAvatar(av: AvatarLook, rng: Rng = defaultRng): AvatarLook {
  return {
    ...av,
    face: pick(AV.face, rng)[0],
    hair: pick(AV.hair, rng)[0],
    hairColor: pick(AV.hairColor, rng)[0],
    acc: pick(AV.acc.filter((a) => !a[2]), rng)[0],
  };
}

/* ---- Boutique ---- */

export function isWorn(cat: ShopCat, it: ShopItem, p: Profile): boolean {
  if (cat === 'moi') return (p.av as unknown as Record<string, unknown>)[it.slot!] === it.id;
  if (cat === 'pepin') return (p.pw as Record<string, unknown>)[it.slot!] === it.id.slice(2);
  return p.house.includes(it.id);
}

/** Porter / enlever (Moi, Pépin) ou installer / ranger (Maison). */
export function wear(cat: ShopCat, it: ShopItem, p0: Profile, on: boolean): Profile {
  const p = structuredClone(p0);
  if (cat === 'moi') (p.av as unknown as Record<string, string>)[it.slot!] = on ? it.id : it.slot === 'acc' ? 'aucun' : '';
  if (cat === 'pepin') (p.pw as Record<string, string | null>)[it.slot!] = on ? it.id.slice(2) : null;
  if (cat === 'maison') {
    p.house = p.house.filter((x) => x !== it.id);
    if (on) p.house.push(it.id);
  }
  return p;
}

export type BuyResult = { ok: true; profile: Profile } | { ok: false; reason: 'owned' | 'coins'; missing?: number };

/** Achat avec des pièces gagnées en jouant ; l'objet est porté tout de suite. */
export function buy(cat: ShopCat, it: ShopItem, p: Profile): BuyResult {
  if (p.owned.includes(it.id)) return { ok: false, reason: 'owned' };
  if (p.coins < it.price) return { ok: false, reason: 'coins', missing: it.price - p.coins };
  const bought = { ...p, coins: p.coins - it.price, owned: [...p.owned, it.id] };
  return { ok: true, profile: wear(cat, it, bought, true) };
}

/** Série du défi du jour de chaque opération de la classe, tirée une fois par jour et mémorisée. */
export function withDefiPick(p: Profile, today: DayKey): Profile {
  let out = p;
  for (const op of CURRICULUM[p.grade]) {
    if (opProg(out, op).defiPick?.day === today) continue;
    out = withOp(out, op, (o) => ({ ...o, defiPick: { day: today, series: dailySeries(today, openSeries(o.series, op)) } }));
  }
  return out;
}

/** À l'arrivée sur l'accueil : vérifie la série et prépare l'annonce éventuelle (bouée ou nouveau départ). */
export function enterProfile(p: Profile, today: DayKey): Profile {
  const picked = withDefiPick(p, today);
  const { streak, event } = checkStreak(picked.streak, today);
  if (streak === picked.streak) return picked;
  return { ...picked, streak, pendingStreak: event ?? picked.pendingStreak };
}

export const todayStats = (p: Profile, today: DayKey) => p.days[today] ?? { ms: 0, sessions: 0, ops: {} };
