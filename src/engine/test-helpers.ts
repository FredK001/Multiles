/* Utilitaires partagés par les tests du moteur (non embarqués dans l'app). */
import type { IsleId } from '../content/isles';
import type { OpProgress, Profile } from '../store/schema';
import type { DayKey } from './dates';
import { createProfile, defaultAvatar } from './profile';
import { emptyOp, opProg } from './progress';
import { buildBossPlan, buildStepPlan } from './plan';
import type { Question } from './questions';
import { seeded } from './random';
import { creditCoin } from './rewards';
import { Session, type SessionConfig } from './session';

export const TODAY = '2026-10-02' as DayKey; // un vendredi

/** Enfant de CM1 ; `mul` précise sa progression en multiplication. */
export function newKid(over: Partial<Profile> = {}, mul: Partial<OpProgress> = {}): Profile {
  const p = { ...createProfile({ name: 'léa', color: '#C8371D', av: defaultAvatar(), pepin: 'corail' }, 0), ...over };
  return { ...p, prog: { ...p.prog, mul: { ...emptyOp('mul'), ...p.prog.mul, ...mul } } };
}

/** Progression en multiplication. */
export const mulOf = (p: Profile): OpProgress => opProg(p, 'mul');

export function stepSession(p: Profile, isle: IsleId, stepIdx: number, seed = 1): Session {
  const rng = seeded(seed);
  const o = mulOf(p);
  const plan = buildStepPlan({ table: isle, stepIdx, traps: o.traps, trapLog: o.trapLog, mastered: o.mastered, today: TODAY, rng });
  return new Session({ mode: 'step', series: `mul-${isle}`, stepIdx, label: `Étape ${stepIdx + 1}` }, plan, rng);
}

export function bossSession(isle: IsleId, timed: number | null = null, seed = 1): Session {
  const rng = seeded(seed);
  return new Session({ mode: 'boss', series: `mul-${isle}`, stepIdx: 3, timed, label: 'Gardien' }, buildBossPlan(isle, rng), rng);
}

export function timedSession(mode: 'chrono' | 'defi', isle: IsleId, seed = 1): Session {
  const cfg: SessionConfig = mode === 'chrono'
    ? { mode, series: `mul-${isle}`, timed: 60, endless: true, label: 'Défi chrono' }
    : { mode, series: `mul-${isle}`, timed: 60, endless: true, target: 8, label: 'Défi du jour' };
  return new Session(cfg, [], seeded(seed));
}

/**
 * Joue une session : `wrongFirst` = nombre de questions ratées une fois avant d'être réussies.
 * Les pièces des bonnes réponses sont créditées au fil de l'eau, comme dans l'app.
 */
export function play(s: Session, p: Profile, wrongFirst = 0): { profile: Profile; asked: Question[] } {
  const asked: Question[] = [];
  let misses = wrongFirst, prof = p;
  for (let q = s.next(); q; q = s.next()) {
    asked.push(q);
    const ok = q.retry ? true : misses > 0 ? (misses--, false) : true;
    s.answer(ok);
    if (ok) prof = creditCoin(prof);
  }
  return { profile: prof, asked };
}

/** Répond juste `n` fois en mode chrono / défi puis laisse le temps s'écouler. */
export function playTimed(s: Session, p: Profile, goods: number, wrongs = 0): Profile {
  let prof = p, w = wrongs;
  for (let q = s.next(); q; q = s.next()) {
    if (w > 0) { w--; s.answer(false); continue; }
    if (s.good >= goods) { s.expire(); break; }
    s.answer(true);
    prof = creditCoin(prof);
  }
  if (!s.finished) s.expire();
  return prof;
}
