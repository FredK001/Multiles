/* Horloges pures, pilotées par des instants (ms) fournis par l'appelant : testables sans DOM. */

/** Compte à rebours mis en pause pendant le feedback d'erreur et quand l'app est masquée. */
export class Countdown {
  private readonly totalMs: number;
  private elapsedMs = 0;
  private since: number | null;
  /** Sous ce seuil (s), la barre passe en miel. */
  static readonly LOW_SECONDS = 10;

  constructor(totalSeconds: number, now: number) {
    this.totalMs = totalSeconds * 1000;
    this.since = now;
  }

  get paused(): boolean {
    return this.since === null;
  }

  pause(now: number): void {
    if (this.since === null) return;
    this.elapsedMs += now - this.since;
    this.since = null;
  }

  resume(now: number): void {
    if (this.since === null) this.since = now;
  }

  /** Secondes restantes (jamais négatives). */
  left(now: number): number {
    const run = this.since === null ? 0 : now - this.since;
    return Math.max(0, (this.totalMs - this.elapsedMs - run) / 1000);
  }

  get total(): number {
    return this.totalMs / 1000;
  }

  expired(now: number): boolean {
    return this.left(now) <= 0;
  }

  low(now: number): boolean {
    return this.left(now) <= Countdown.LOW_SECONDS;
  }
}

/** Format m:ss, arrondi à la seconde supérieure (comme le prototype). */
export function fmtTime(t: number): string {
  const s = Math.ceil(t);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Temps de jeu actif d'une session : ne court que si l'app est visible. */
export class ActiveClock {
  private accMs = 0;
  private since: number | null = null;

  start(now: number): void {
    if (this.since === null) this.since = now;
  }

  pause(now: number): void {
    if (this.since === null) return;
    this.accMs += now - this.since;
    this.since = null;
  }

  elapsed(now: number): number {
    return this.accMs + (this.since === null ? 0 : now - this.since);
  }
}
