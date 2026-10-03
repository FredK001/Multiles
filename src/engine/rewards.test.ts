import { describe, expect, it } from 'vitest';
import type { Profile } from '../store/schema';
import { addXp, stageFor, xpGain } from './level';
import { isMastered } from './mastery';
import { seeded } from './random';
import { creditCoin, finishSession, recordQuit, starsFor } from './rewards';
import { totalStars } from './unlock';
import { bossSession, mulOf, newKid, play, playTimed, stepSession, timedSession, TODAY } from './test-helpers';

const ctx = (seed = 1) => ({ today: TODAY, rng: seeded(seed), activeMs: 180_000 });
/** rng qui accorde toujours (ou jamais) le sticker Lieu. */
const lucky = { today: TODAY, rng: () => 0 };
const unlucky = { today: TODAY, rng: () => 0.99 };

function runStep(p: Profile, isle: 1 | 2 | 3 | 5 | 7 | 10, stepIdx: number, wrong: number, c: Parameters<typeof finishSession>[2] = unlucky) {
  const s = stepSession(p, isle, stepIdx);
  const r = play(s, p, wrong);
  return finishSession(r.profile, s, c);
}

describe('Étoiles d\'une étape', () => {
  it.each([[10, 3], [9, 3], [8, 2], [7, 2], [6, 1], [0, 1]])('%i du premier coup → %i étoiles', (first, stars) => {
    expect(starsFor(first)).toBe(stars);
  });
  it('jamais 0 étoile', () => {
    const { end } = runStep(newKid(), 1, 0, 10);
    expect(end.first).toBe(0);
    expect(end.stars).toBe(1);
  });
  it("rejouer une étape n'ajoute que l'amélioration", () => {
    let p = newKid();
    ({ profile: p } = runStep(p, 2, 0, 3)); // 7 → 2 étoiles
    expect(mulOf(p).series['mul-2']!.stepStars[0]).toBe(2);
    expect(totalStars(mulOf(p).series)).toBe(2);
    const again = runStep(p, 2, 0, 0); // 10 → 3 étoiles : +1
    expect(again.end.starGain).toBe(1);
    expect(totalStars(mulOf(again.profile).series)).toBe(3);
    const worse = runStep(again.profile, 2, 0, 5); // 5 → 1 étoile : +0
    expect(worse.end.starGain).toBe(0);
    expect(mulOf(worse.profile).series['mul-2']!.stepStars[0]).toBe(3);
    expect(totalStars(mulOf(worse.profile).series)).toBe(3);
  });
  it('réussir une étape ouvre la suivante et fait de l\'île l\'île en cours', () => {
    const { profile, end } = runStep(newKid(), 5, 0, 0);
    expect(end.stepDone).toBe(true);
    expect(mulOf(profile).series['mul-5']!.steps).toBe(1);
    expect(mulOf(profile).current).toBe('mul-5');
  });
});

describe('Trophée du gardien', () => {
  const ready = (): Profile => newKid({}, { series: { 'mul-1': { steps: 3, trophy: false, stepStars: [3, 3, 3] } } });
  const runBoss = (wrong: number, timeUp = false) => {
    const s = bossSession(1, timeUp ? 120 : null);
    if (timeUp) {
      let p = ready();
      for (let i = 0; i < 9; i++) { s.next(); s.answer(true); p = creditCoin(p); }
      s.expire();
      return finishSession(p, s, unlucky);
    }
    const r = play(s, ready(), wrong);
    return finishSession(r.profile, s, unlucky);
  };
  it('gagné avec 8 réponses justes du premier coup', () => {
    const { profile, end } = runBoss(2);
    expect(end.trophy).toBe(true);
    expect(mulOf(profile).series['mul-1']!.trophy).toBe(true);
    expect(mulOf(profile).stickers).toContain('mul-1-gardien');
  });
  it('pas de trophée à 7', () => {
    expect(runBoss(3).end.trophy).toBe(false);
  });
  it('pas de trophée si le temps est dépassé', () => {
    const { end } = runBoss(0, true);
    expect(end.first).toBe(9);
    expect(end.timedOut).toBe(true);
    expect(end.trophy).toBe(false);
  });
});

describe('Pièces', () => {
  it('+1 par bonne réponse et +2 par étoile', () => {
    const p0 = newKid();
    const { profile, end } = runStep(p0, 1, 0, 0); // 10 bonnes réponses, 3 étoiles
    expect(end.coinsGain).toBe(10 + 6);
    expect(profile.coins).toBe(p0.coins + 16);
  });
  it('une question ratée puis réussie rapporte aussi sa pièce', () => {
    const p0 = newKid();
    const { profile, end } = runStep(p0, 1, 0, 2); // 10 bonnes réponses dont 2 après erreur, 8 → 2 étoiles
    expect(end.coinsGain).toBe(10 + 4);
    expect(profile.coins).toBe(p0.coins + 14);
  });
  it('+20 au défi du jour réussi, une seule fois par jour', () => {
    const p0 = newKid();
    const s = timedSession('defi', 6);
    const first = finishSession(playTimed(s, p0, 8), s, ctx());
    expect(first.end.success).toBe(true);
    expect(first.end.bonus).toBe(20);
    expect(first.profile.coins).toBe(p0.coins + 8 + 20);
    expect(mulOf(first.profile).defiDay).toBe(TODAY);
    const s2 = timedSession('defi', 6, 2);
    const again = finishSession(playTimed(s2, first.profile, 8), s2, ctx());
    expect(again.end.bonus).toBe(0);
  });
  it('+5 seulement quand le défi tombe sur la table de 1 ou de 10', () => {
    for (const t of [1, 10] as const) {
      const s = timedSession('defi', t);
      const { end, profile } = finishSession(playTimed(s, newKid(), 8), s, ctx());
      expect(end.bonus).toBe(5);
      expect(profile.coins).toBe(newKid().coins + 8 + 5);
    }
  });
  it("les pièces sont conservées si l'enfant quitte en cours de session", () => {
    let p = newKid();
    const s = stepSession(p, 1, 0);
    for (let i = 0; i < 4; i++) { s.next(); s.answer(true); p = creditCoin(p); }
    const quit = recordQuit(p, 'mul', { today: TODAY, activeMs: 60_000 });
    expect(quit.coins).toBe(newKid().coins + 4);
    expect(quit.days[TODAY]).toEqual({ ms: 60_000, sessions: 0, ops: { mul: { ms: 60_000, sessions: 0 } } });
  });
});

describe('Niveau du Pépin', () => {
  it('XP : 0,12 + 0,06 × étoiles ; chrono 0,10 + 0,04 × étoiles', () => {
    expect(xpGain(3, false)).toBeCloseTo(0.3);
    expect(xpGain(1, false)).toBeCloseTo(0.18);
    expect(xpGain(3, true)).toBeCloseTo(0.22);
    expect(xpGain(1, true)).toBeCloseTo(0.14);
  });
  it('passage de niveau à 1', () => {
    expect(addXp(3, 0.75, 0.3)).toMatchObject({ level: 4, levelUp: true });
    expect(addXp(3, 0.75, 0.3).xp).toBeCloseTo(0.05);
    expect(addXp(3, 0.6, 0.3)).toMatchObject({ level: 3, levelUp: false });
  });
  it('stades aux niveaux 5, 12 et 20', () => {
    expect([1, 4, 5, 11, 12, 19, 20, 30].map(stageFor)).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
    expect(addXp(4, 0.9, 0.3).evolved).toBe(true);
    expect(addXp(5, 0.9, 0.3).evolved).toBe(false);
  });
  it('appliqué en fin de session', () => {
    const { profile, end } = runStep(newKid({ xp: 0.8, level: 11 }), 1, 0, 0);
    expect(end.levelUp).toBe(true);
    expect(end.evolved).toBe(true);
    expect(profile.level).toBe(12);
    expect(profile.xp).toBeCloseTo(0.1);
  });
});

describe('Maîtrise et pièges', () => {
  it('une multiplication réussie du premier coup est maîtrisée, sa symétrique aussi', () => {
    const { profile, end } = runStep(newKid(), 7, 0, 0);
    expect(end.fresh).toHaveLength(5);
    expect(isMastered(mulOf(profile).mastered, 7, 3)).toBe(true);
    expect(isMastered(mulOf(profile).mastered, 3, 7)).toBe(true);
    expect(isMastered(mulOf(profile).mastered, 7, 8)).toBe(false);
  });
  it('toute erreur ajoute la multiplication aux pièges, sans doublon de symétrique', () => {
    const p = newKid({}, { traps: ['8x7'] });
    const s = stepSession(p, 7, 1);
    let q = s.next()!;
    while (q.b !== 8) { s.answer(true); q = s.next()!; }
    s.answer(false); // 7x8, symétrique de 8x7 déjà en piège
    const r = play(s, p);
    const { profile } = finishSession(r.profile, s, unlucky);
    expect(mulOf(profile).traps).toEqual(['8x7']);
    expect(mulOf(profile).trapLog['7x8']).toEqual([TODAY]);
  });
  it('un piège réussi du premier coup en sort', () => {
    const p = newKid({}, { traps: ['7x3', '9x9'], trapLog: { '3x7': [TODAY] } });
    const { profile } = runStep(p, 7, 0, 0);
    expect(mulOf(profile).traps).toEqual(['9x9']);
    expect(mulOf(profile).trapLog['3x7']).toBeUndefined();
  });
  it('même règle en mode chrono', () => {
    const p = newKid({}, { traps: ['3x6'] });
    const s = timedSession('chrono', 6, 3);
    let prof = p;
    // on joue jusqu'à tomber sur 6 × 3, réussi du premier coup
    for (let q = s.next(); q; q = s.next()) {
      s.answer(true);
      prof = creditCoin(prof);
      if (q.b === 3) { s.expire(); break; }
    }
    const { profile } = finishSession(prof, s, ctx());
    expect(mulOf(profile).traps).toEqual([]);
  });
});

describe('Stickers', () => {
  it('Lieu : 50 % de chance à 3 étoiles', () => {
    expect(runStep(newKid(), 1, 0, 0, lucky).end.stickers).toEqual(['mul-1-lieu']);
    expect(runStep(newKid(), 1, 0, 0, unlucky).end.stickers).toEqual([]);
    expect(runStep(newKid(), 1, 0, 2, lucky).end.stickers).toEqual([]); // 2 étoiles
  });
  it('Pépin sur l\'île : à 9 étoiles sur l\'île, sans tirage', () => {
    const p = newKid({}, { series: { 'mul-1': { steps: 2, trophy: false, stepStars: [3, 3, 0] } } });
    const { profile, end } = runStep(p, 1, 2, 0, unlucky);
    expect(end.stickers).toEqual(['mul-1-pepin']);
    expect(mulOf(profile).stickers).toContain('mul-1-pepin');
  });
  it('pas de sticker Pépin sous 9 étoiles', () => {
    const p = newKid({}, { series: { 'mul-1': { steps: 2, trophy: false, stepStars: [3, 2, 0] } } });
    expect(runStep(p, 1, 2, 0, unlucky).end.stickers).toEqual([]);
  });
});

describe('Défi chrono', () => {
  it('record personnel par table', () => {
    const p0 = newKid({}, { records: { 'mul-7': 12 } });
    const s = timedSession('chrono', 7);
    const { profile, end } = finishSession(playTimed(s, p0, 15), s, ctx());
    expect(end).toMatchObject({ newRec: true, rec: 12, score: 15, stars: 3, coinsGain: 15 });
    expect(mulOf(profile).records['mul-7']).toBe(15);
    expect(mulOf(profile).records).toEqual({ 'mul-7': 15 });
  });
  it('étoiles : 2 à 80 % du record, sinon 1', () => {
    const at = (score: number) => {
      const s = timedSession('chrono', 7);
      return finishSession(playTimed(s, newKid({}, { records: { 'mul-7': 20 } }), score), s, ctx()).end.stars;
    };
    expect(at(16)).toBe(2);
    expect(at(15)).toBe(1);
  });
});

describe('Défi du jour', () => {
  it('étoiles : 3 si réussi, 2 à 60 % de l\'objectif, sinon 1', () => {
    const at = (score: number) => {
      const s = timedSession('defi', 6);
      return finishSession(playTimed(s, newKid(), score), s, ctx()).end;
    };
    expect(at(8)).toMatchObject({ success: true, stars: 3 });
    expect(at(5)).toMatchObject({ success: false, stars: 2, bonus: 0 });
    expect(at(4)).toMatchObject({ success: false, stars: 1 });
  });
});

describe('Arbitrages après relecture', () => {
  it('ratée dans la session : pas maîtrisée, même réussie ailleurs du premier coup', () => {
    const p = newKid();
    const s = stepSession(p, 7, 0);
    const seen = new Set<number>();
    let prof = p, target = 0;
    for (let q = s.next(); q; q = s.next()) {
      const second = seen.has(q.b) && !q.retry && target === 0;
      if (second) target = q.b;
      seen.add(q.b);
      s.answer(!second);
      if (!second) prof = creditCoin(prof);
    }
    const { profile } = finishSession(prof, s, unlucky);
    expect(isMastered(mulOf(profile).mastered, 7, target)).toBe(false);
    expect(mulOf(profile).traps).toEqual([`7x${target}`]);
  });
  it('défi chrono à 0 sans record : 1 étoile', () => {
    const s = timedSession('chrono', 7);
    s.next();
    s.expire();
    expect(finishSession(newKid(), s, ctx()).end.stars).toBe(1);
  });
});

describe('Robustesse', () => {
  it('une session terminée après des jours sans repasser par l\'accueil utilise les bouées', () => {
    const p = newKid({ streak: { current: 5, best: 5, buoys: 1, lastDay: '2026-09-30', buoyDays: [], checkedDay: '2026-09-30' } });
    const { profile } = runStep(p, 1, 0, 0, ctx());
    expect(profile.streak.current).toBe(6);
    expect(profile.streak.buoys).toBe(0);
    expect(profile.pendingStreak).toMatchObject({ kind: 'buoy', missed: 1 });
  });
  it('le chrono qui expire après la dernière réponse ne retire pas le trophée', () => {
    const p = newKid({}, { series: { 'mul-1': { steps: 3, trophy: false, stepStars: [3, 3, 3] } } });
    const s = bossSession(1, 120);
    const r = play(s, p, 1);
    s.expire();
    const { end } = finishSession(r.profile, s, unlucky);
    expect(end.timedOut).toBe(false);
    expect(end.trophy).toBe(true);
  });
});

describe('Temps de jeu et sessions', () => {
  it('fin de session : temps actif et session ajoutés au jour', () => {
    const { profile } = runStep(newKid(), 1, 0, 0, ctx());
    expect(profile.days[TODAY]).toEqual({ ms: 180_000, sessions: 1, ops: { mul: { ms: 180_000, sessions: 1 } } });
    expect(profile.streak.current).toBe(1);
  });
});
