/* Configurations de session lancées depuis les écrans. */
import type { IsleId } from '../content/isles';
import type { DayKey } from '../engine/dates';
import { buildBossPlan, buildStepPlan, buildTrapsPlan } from '../engine/plan';
import { parseKey } from '../engine/keys';
import type { Question } from '../engine/questions';
import { DEFI_TARGET, TIMED_SECONDS, type SessionConfig } from '../engine/session';
import { currentStep, isleOf } from '../engine/unlock';
import type { BossTime, Profile } from '../store/schema';

export const stepCfg = (n: IsleId, i: number, label = `Étape ${i + 1}`): SessionConfig => ({ mode: 'step', isle: n, table: n, stepIdx: i, label });

export const bossCfg = (n: IsleId, bossTime: BossTime): SessionConfig => ({ mode: 'boss', isle: n, table: n, stepIdx: 3, label: 'Gardien', timed: bossTime ? bossTime * 60 : null });

export const chronoCfg = (n: IsleId): SessionConfig => ({ mode: 'chrono', isle: n, table: n, timed: TIMED_SECONDS, endless: true, label: 'Défi chrono' });

export const defiCfg = (t: IsleId): SessionConfig => ({ mode: 'defi', isle: t, table: t, timed: TIMED_SECONDS, endless: true, target: DEFI_TARGET, label: 'Défi du jour' });

export function trapsCfg(traps: readonly string[]): SessionConfig {
  const a = parseKey(traps[0]!)[0] as IsleId;
  return { mode: 'traps', isle: a, table: a, label: 'Pièges' };
}

/** « Jouer » : l'étape en cours de l'île en cours. */
export function playCurrentCfg(p: Profile): SessionConfig {
  const st = isleOf(p.isl, p.isle);
  return stepCfg(p.isle, Math.min(st.steps, 2), `Étape ${currentStep(st)}`);
}

export function planFor(cfg: SessionConfig, p: Profile, today: DayKey): Question[] {
  if (cfg.mode === 'step') return buildStepPlan({ table: cfg.table, stepIdx: cfg.stepIdx ?? 0, traps: p.traps, trapLog: p.trapLog, mastered: p.mastered, today });
  if (cfg.mode === 'boss') return buildBossPlan(cfg.table);
  if (cfg.mode === 'traps') return buildTrapsPlan(p.traps);
  return [];
}
