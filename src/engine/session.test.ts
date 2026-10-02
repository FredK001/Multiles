import { describe, expect, it } from 'vitest';
import { FORMAT_ORDER } from './questions';
import { COMBO_STEPS, DEFI_TARGET, OK_FEEDBACK_MS, TIMED_SECONDS } from './session';
import { newKid, play, stepSession, timedSession } from './test-helpers';

describe('Session classique', () => {
  it('10 questions aux formats alternés', () => {
    const s = stepSession(newKid(), 7, 0);
    const { asked } = play(s, newKid());
    expect(asked).toHaveLength(10);
    expect(asked.map((q) => q.fmt)).toEqual(Array.from({ length: 10 }, (_, i) => FORMAT_ORDER[i % 4]));
    expect(s.finished).toBe(true);
    expect(s.firstOK).toHaveLength(10);
  });
  it('une erreur remet la question en fin de file', () => {
    const s = stepSession(newKid(), 7, 0);
    const first = s.next()!;
    s.answer(false);
    expect(s.queue.at(-1)).toMatchObject({ a: first.a, b: first.b, fmt: first.fmt, retry: true });
    const { asked } = play(s, newKid());
    expect(asked).toHaveLength(10); // les 9 restantes + la question remise
    expect(s.done).toBe(10);
    expect(s.firstOK).toHaveLength(9);
    expect(s.missed).toEqual([`${first.a}x${first.b}`]);
  });
  it('annonce les séries de 3, 5, 7 et 10 bonnes réponses', () => {
    expect(COMBO_STEPS).toEqual([3, 5, 7, 10]);
    const s = stepSession(newKid(), 2, 0);
    const hits: number[] = [];
    for (let q = s.next(); q; q = s.next()) if (s.answer(true).comboMilestone) hits.push(s.combo);
    expect(hits).toEqual([3, 5, 7, 10]);
  });
});

describe('Modes chronométrés', () => {
  it('défi chrono et défi du jour : 60 s, objectif 8', () => {
    expect(TIMED_SECONDS).toBe(60);
    expect(DEFI_TARGET).toBe(8);
  });
  it('le défi chrono pose des questions illimitées sur la table', () => {
    const s = timedSession('chrono', 7);
    let prev = null as null | { b: number };
    for (let i = 0; i < 40; i++) {
      const q = s.next()!;
      expect(q.a).toBe(7);
      if (prev) expect(q.b).not.toBe(prev.b);
      prev = q;
      s.answer(true);
    }
    expect(s.finished).toBe(false);
    s.expire();
    expect(s.next()).toBeNull();
  });
  it('le défi du jour s\'arrête à 8 bonnes réponses', () => {
    const s = timedSession('defi', 6);
    let n = 0;
    for (let q = s.next(); q; q = s.next()) { s.answer(true); n++; }
    expect(n).toBe(8);
    expect(s.finished).toBe(true);
  });
  it('feedback de bonne réponse : 0,65 s en chrono, 1,5 s sinon', () => {
    expect(OK_FEEDBACK_MS).toEqual({ timed: 650, classic: 1500 });
  });
});
