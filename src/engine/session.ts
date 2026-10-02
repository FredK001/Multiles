/* Déroulé d'une session : file de questions, erreurs remises en fin de file, compteurs. */
import type { IsleId } from '../content/isles';
import { mulKey, type MulKey } from './keys';
import { nextTimedQuestion } from './plan';
import { makeQ, type Question } from './questions';
import { defaultRng, type Rng } from './random';

export type SessionMode = 'step' | 'boss' | 'chrono' | 'defi' | 'traps';

export interface SessionConfig {
  mode: SessionMode;
  /** Île dont les couleurs habillent la session (et dont on joue la table). */
  isle: IsleId;
  /** Table jouée (modes chronométrés). */
  table: number;
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
  firstOK: MulKey[] = [];
  /** Une entrée par erreur. */
  missed: MulKey[] = [];
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
      if (this.cfg.endless && !this.timeUp) this.queue.push(nextTimedQuestion(this.cfg.table, this.cur, this.done, this.rng));
      else return this.finish();
    }
    this.cur = this.queue.shift()!;
    return this.cur;
  }

  /** Enregistre la réponse à la question en cours. */
  answer(ok: boolean): AnswerOutcome {
    const q = this.cur;
    if (!q || this.finished) throw new Error('Aucune question en cours');
    const k = mulKey(q.a, q.b);
    if (ok) {
      this.good++;
      this.done++;
      this.combo++;
      if (!q.retry) this.firstOK.push(k);
    } else {
      this.combo = 0;
      this.missed.push(k);
      const rq = makeQ(q.a, q.b, q.fmt, this.rng);
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
