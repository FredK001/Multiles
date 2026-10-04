/* Déroulé d'une session : file de questions, erreurs remises en fin de file, compteurs. */
import { SERIES, type Op, type SeriesId } from '../content/series';
import { factKey, type FactKey } from './keys';
import { nextTimedQuestion } from './plan';
import { remakeQ, type Question } from './questions';
import { defaultRng, type Rng } from './random';

export type SessionMode = 'step' | 'boss' | 'chrono' | 'defi' | 'traps';

export interface SessionConfig {
  mode: SessionMode;
  /** Série jouée (son île habille la session) : sa progression reçoit les étoiles, le trophée et le record. */
  series: SeriesId;
  /** Étape 0 à 2, ou 3 pour le gardien. */
  stepIdx?: number;
  /** Durée en secondes ; absente = sans chrono. */
  timed?: number | null;
  /** Questions illimitées tant que le chrono tourne. */
  endless?: boolean;
  /** Bonnes réponses visées (défi du jour). */
  target?: number;
  /** « Étape 2 », « Gardien », « Défi chrono »… */
  label: string;
}

/** Durées du défi chrono et du défi du jour. */
export const TIMED_SECONDS = 60;
export const DEFI_TARGET = 8;

/** Modes chronométrés : 1 minute et 8 réponses en multiplication ; plus doux au CP et en anglais (2 minutes, 6 réponses). */
export function timedRules(op: Op): { seconds: number; target: number } {
  return op === 'mul' ? { seconds: TIMED_SECONDS, target: DEFI_TARGET } : { seconds: 120, target: 6 };
}

/** Opération d'une session. */
export const opOf = (cfg: Pick<SessionConfig, 'series'>): Op => SERIES[cfg.series].op;
/** Durée d'affichage du feedback de bonne réponse. */
export const OK_FEEDBACK_MS = { timed: 650, classic: 1500 } as const;
/** Paliers de série annoncés (« 3 d'affilée ! »). */
export const COMBO_STEPS: readonly number[] = [3, 5, 7, 10];

export interface AnswerOutcome {
  ok: boolean;
  question: Question;
  /** Série en cours atteint un palier (3, 5, 7, 10). */
  comboMilestone: boolean;
}

export class Session {
  readonly cfg: SessionConfig;
  readonly total: number;
  queue: Question[];
  cur: Question | null = null;
  /** Bonnes réponses (une question réussie après erreur compte aussi). */
  good = 0;
  /** Questions réussies (avancement de la barre). */
  done = 0;
  combo = 0;
  /** Réussies du premier coup. */
  firstOK: FactKey[] = [];
  /** Une entrée par erreur. */
  missed: FactKey[] = [];
  timeUp = false;
  finished = false;
  private readonly rng: Rng;

  constructor(cfg: SessionConfig, plan: Question[], rng: Rng = defaultRng) {
    this.cfg = cfg;
    this.rng = rng;
    this.queue = cfg.endless ? [] : [...plan];
    this.total = cfg.endless ? 0 : plan.length;
  }

  /** Passe à la question suivante ; renvoie null quand la session est finie. */
  next(): Question | null {
    if (this.finished) return null;
    if (this.cfg.target && this.good >= this.cfg.target) return this.finish();
    if (!this.queue.length) {
      if (this.cfg.endless && !this.timeUp) this.queue.push(nextTimedQuestion(this.cfg.series, this.cur, this.done, this.rng));
      else return this.finish();
    }
    this.cur = this.queue.shift()!;
    return this.cur;
  }

  /** Enregistre la réponse à la question en cours. */
  answer(ok: boolean): AnswerOutcome {
    const q = this.cur;
    if (!q || this.finished) throw new Error('Aucune question en cours');
    const k = factKey(q.op, q.a, q.b);
    if (ok) {
      this.good++;
      this.done++;
      this.combo++;
      if (!q.retry) this.firstOK.push(k);
    } else {
      this.combo = 0;
      this.missed.push(k);
      const rq = remakeQ(q, this.rng);
      rq.retry = true;
      if (q.trap) rq.trap = true;
      this.queue.push(rq);
    }
    return { ok, question: q, comboMilestone: ok && this.combo >= 3 && COMBO_STEPS.includes(this.combo) };
  }

  /** Le chrono est arrivé à zéro. */
  expire(): void {
    if (this.finished) return;
    this.timeUp = true;
    this.finish();
  }

  /** Questions restantes avant la fin (sessions de 10). */
  get remaining(): number {
    return this.total - this.done;
  }

  private finish(): null {
    this.finished = true;
    return null;
  }
}
