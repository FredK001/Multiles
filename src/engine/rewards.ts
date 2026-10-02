/* Fin de session : étoiles, pièces, XP, maîtrise, pièges, trophée, stickers, records, défi, série. */
import type { IsleId } from '../content/isles';
import type { Profile } from '../store/schema';
import { defiBonus } from './daily';
import type { DayKey } from './dates';
import { hasKey, type MulKey } from './keys';
import { addXp, xpGain } from './level';
import { freshMastered, updateTraps } from './mastery';
import { defaultRng, type Rng } from './random';
import type { Session, SessionMode } from './session';
import { checkStreak, recordPlayedDay } from './streak';
import { emptyIsle, isleStars } from './unlock';

/** Pièces : +1 par bonne réponse (créditée en direct), +2 par étoile en fin de session. */
export const COINS_PER_STAR = 2;
/** Chance d'obtenir le sticker Lieu en fin de session à 3 étoiles. */
export const LIEU_CHANCE = 0.5;
/** Bonnes réponses du premier coup minimales pour battre le gardien. */
export const BOSS_MIN_FIRST = 8;

/** Étoiles d'une session de 10 : 9+ → 3, 7+ → 2, sinon 1. Jamais 0. */
export const starsFor = (first: number): number => (first >= 9 ? 3 : first >= 7 ? 2 : 1);

export interface EndSummary {
  mode: SessionMode;
  isle: IsleId;
  label: string;
  stars: number;
  /** Bonnes réponses du premier coup (classique) ou score (chrono). */
  first: number;
  starGain: number;
  coinsGain: number;
  /** Nouvelles cases de la grille. */
  fresh: MulKey[];
  xp0: number;
  levelUp: boolean;
  evolved: boolean;
  /** Stickers à annoncer (Lieu, Pépin) ; le sticker Gardien accompagne le trophée sans annonce propre. */
  stickers: string[];
  trophy: boolean;
  stepDone: boolean;
  timedOut: boolean;
  buoyEarned: boolean;
  /* Modes chronométrés */
  score?: number;
  target?: number;
  rec?: number;
  newRec?: boolean;
  success?: boolean;
  bonus?: number;
}

export interface FinishContext {
  today: DayKey;
  rng?: Rng;
  /** Temps de jeu actif de la session (ms). */
  activeMs?: number;
}

/** Bonne réponse : la pièce est acquise tout de suite (conservée si l'enfant quitte). */
export function creditCoin(p: Profile): Profile {
  return { ...p, coins: p.coins + 1 };
}

/** Temps de jeu, sessions et série du jour. */
function recordDay(p: Profile, today: DayKey, activeMs: number, finished: boolean): boolean {
  const d = (p.days[today] ??= { ms: 0, sessions: 0 });
  d.ms += Math.max(0, Math.round(activeMs));
  if (!finished) return false;
  d.sessions++;
  // L'app a pu rester ouverte plusieurs jours sans repasser par l'accueil : bouées d'abord.
  const c = checkStreak(p.streak, today);
  if (c.event) p.pendingStreak = c.event;
  const r = recordPlayedDay(c.streak, today);
  p.streak = r.streak;
  return r.buoyEarned;
}

/** L'enfant quitte en cours de session : on garde les pièces (déjà créditées) et le temps joué. */
export function recordQuit(p0: Profile, ctx: FinishContext): Profile {
  const p = structuredClone(p0);
  recordDay(p, ctx.today, ctx.activeMs ?? 0, false);
  return p;
}

function applyMasteryAndTraps(p: Profile, s: Session, today: DayKey): MulKey[] {
  // Une multiplication ratée pendant la session n'est pas maîtrisée, même réussie ailleurs du premier coup.
  const fresh = freshMastered(p.mastered, s.firstOK.filter((k) => !hasKey(s.missed, k)));
  p.mastered.push(...fresh);
  const t = updateTraps(p.traps, p.trapLog, s.firstOK, s.missed, today);
  p.traps = t.traps;
  p.trapLog = t.trapLog;
  return fresh;
}

/** Fin d'une session terminée (y compris gardien hors temps). */
export function finishSession(p0: Profile, s: Session, ctx: FinishContext): { profile: Profile; end: EndSummary } {
  return s.cfg.mode === 'chrono' || s.cfg.mode === 'defi' ? finishTimed(p0, s, ctx) : finishClassic(p0, s, ctx);
}

function finishClassic(p0: Profile, s: Session, ctx: FinishContext): { profile: Profile; end: EndSummary } {
  const p = structuredClone(p0), rng = ctx.rng ?? defaultRng, cfg = s.cfg, n = cfg.isle;
  const first = s.firstOK.length, stars = starsFor(first);
  const st = (p.isl[n] ??= emptyIsle());
  let starGain = 0, stepDone = false;
  if (cfg.mode === 'step' && cfg.stepIdx != null && cfg.stepIdx < 3) {
    const i = cfg.stepIdx, prev = st.stepStars[i] ?? 0;
    if (i >= st.steps) {
      st.steps = i + 1;
      stepDone = true;
    }
    // Rejouer une étape n'ajoute que l'amélioration.
    starGain = Math.max(0, stars - prev);
    st.stepStars[i] = Math.max(prev, stars);
  }
  if (cfg.mode === 'step' || cfg.mode === 'boss') p.isle = n;
  const trophy = cfg.mode === 'boss' && first >= BOSS_MIN_FIRST && !st.trophy && !s.timeUp;
  if (trophy) st.trophy = true;
  p.stars += starGain;
  const bonus = stars * COINS_PER_STAR;
  p.coins += bonus;
  const fresh = applyMasteryAndTraps(p, s, ctx.today);
  const xp0 = p.xp, lv = addXp(p.level, p.xp, xpGain(stars, false));
  p.level = lv.level;
  p.xp = lv.xp;
  // Stickers : Gardien en le battant, Lieu 1 fois sur 2 à 3 étoiles, Pépin à 9 étoiles sur l'île.
  const stickers: string[] = [];
  const add = (k: string, announce: boolean) => {
    if (p.stickers.includes(k)) return;
    p.stickers.push(k);
    if (announce) stickers.push(k);
  };
  if (trophy) add(`${n}-gardien`, false);
  if (stars === 3 && !p.stickers.includes(`${n}-lieu`) && rng() < LIEU_CHANCE) add(`${n}-lieu`, true);
  if (isleStars(st) >= 9) add(`${n}-pepin`, true);
  const buoyEarned = recordDay(p, ctx.today, ctx.activeMs ?? 0, true);
  return {
    profile: p,
    end: {
      mode: cfg.mode, isle: n, label: cfg.label, stars, first, starGain, coinsGain: s.good + bonus, fresh,
      xp0, levelUp: lv.levelUp, evolved: lv.evolved, stickers, trophy, stepDone, timedOut: s.timeUp, buoyEarned,
    },
  };
}

function finishTimed(p0: Profile, s: Session, ctx: FinishContext): { profile: Profile; end: EndSummary } {
  const p = structuredClone(p0), cfg = s.cfg, n = cfg.isle, score = s.good, target = cfg.target ?? 0;
  const rec = p.records[n] ?? 0;
  let stars: number, newRec = false, success = false, bonus = 0;
  if (cfg.mode === 'chrono') {
    newRec = score > rec;
    if (newRec) p.records[n] = score;
    stars = newRec ? 3 : score > 0 && score >= rec * 0.8 ? 2 : 1;
  } else {
    success = score >= target;
    if (success && p.defiDay !== ctx.today) {
      p.defiDay = ctx.today;
      bonus = defiBonus(cfg.table);
    }
    stars = success ? 3 : score >= target * 0.6 ? 2 : 1;
  }
  p.coins += bonus;
  const fresh = applyMasteryAndTraps(p, s, ctx.today);
  const xp0 = p.xp, lv = addXp(p.level, p.xp, xpGain(stars, true));
  p.level = lv.level;
  p.xp = lv.xp;
  const buoyEarned = recordDay(p, ctx.today, ctx.activeMs ?? 0, true);
  return {
    profile: p,
    end: {
      mode: cfg.mode, isle: n, label: cfg.label, stars, first: score, starGain: 0, coinsGain: score + bonus, fresh,
      xp0, levelUp: lv.levelUp, evolved: lv.evolved, stickers: [], trophy: false, stepDone: false, timedOut: s.timeUp,
      buoyEarned, score, target, rec, newRec, success, bonus,
    },
  };
}
