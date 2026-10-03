/* Configurations de session lancées depuis les écrans. */
import { SERIES, type Op, type SeriesId } from '../content/series';
import type { DayKey } from '../engine/dates';
import { parseFact } from '../engine/keys';
import { buildTrapsPlan, seriesBossPlan, seriesStepPlan } from '../engine/plan';
import { opProg } from '../engine/progress';
import type { Question } from '../engine/questions';
import { seriesForFact } from '../engine/series';
import { opOf, timedRules, type SessionConfig } from '../engine/session';
import { currentStep, isleOf } from '../engine/unlock';
import type { BossTime, Profile } from '../store/schema';

export const stepCfg = (s: SeriesId, i: number, label = `Étape ${i + 1}`): SessionConfig => ({ mode: 'step', series: s, stepIdx: i, label });

export const bossCfg = (s: SeriesId, bossTime: BossTime): SessionConfig => ({ mode: 'boss', series: s, stepIdx: 3, label: 'Gardien', timed: bossTime ? bossTime * 60 : null });

export const chronoCfg = (s: SeriesId): SessionConfig => ({ mode: 'chrono', series: s, timed: timedRules(SERIES[s].op).seconds, endless: true, label: 'Défi chrono' });

export function defiCfg(s: SeriesId): SessionConfig {
  const r = timedRules(SERIES[s].op);
  return { mode: 'defi', series: s, timed: r.seconds, endless: true, target: r.target, label: 'Défi du jour' };
}

/** Session « Pièges » : habillée par l'île du premier piège. */
export function trapsCfg(traps: readonly string[]): SessionConfig {
  const f = parseFact(traps[0]!)!, s = seriesForFact(f.op, f)!;
  return { mode: 'traps', series: s.id, label: 'Pièges' };
}

/** Série en cours d'une opération (l'opération en cours par défaut). */
export const currentSeries = (p: Profile, op: Op = p.op): SeriesId => opProg(p, op).current;

/** « Jouer » : l'étape en cours de l'île en cours. */
export function playCurrentCfg(p: Profile, op: Op = p.op): SessionConfig {
  const o = opProg(p, op), st = isleOf(o.series, o.current);
  return stepCfg(o.current, Math.min(st.steps, 2), `Étape ${currentStep(st)}`);
}

export function planFor(cfg: SessionConfig, p: Profile, today: DayKey): Question[] {
  const o = opProg(p, opOf(cfg));
  if (cfg.mode === 'step') return seriesStepPlan({ series: cfg.series, stepIdx: cfg.stepIdx ?? 0, traps: o.traps, trapLog: o.trapLog, mastered: o.mastered, today });
  if (cfg.mode === 'boss') return seriesBossPlan(cfg.series);
  if (cfg.mode === 'traps') return buildTrapsPlan(o.traps);
  return [];
}
