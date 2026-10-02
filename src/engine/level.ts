export type Stage = 1 | 2 | 3 | 4;

/** Stade du Pépin selon le niveau : 5, 12 puis 20. */
export function stageFor(level: number): Stage {
  return level >= 20 ? 4 : level >= 12 ? 3 : level >= 5 ? 2 : 1;
}

/** XP gagnée : session classique 0,12 + 0,06 × étoiles ; mode chrono 0,10 + 0,04 × étoiles. */
export function xpGain(stars: number, timed: boolean): number {
  return timed ? 0.1 + 0.04 * stars : 0.12 + 0.06 * stars;
}

export interface LevelResult {
  level: number;
  xp: number;
  levelUp: boolean;
  evolved: boolean;
}

/** Ajoute de l'XP ; le passage de niveau se fait à 1. */
export function addXp(level: number, xp: number, gain: number): LevelResult {
  let l = level, x = xp + gain, levelUp = false;
  if (x >= 1) {
    x -= 1;
    l++;
    levelUp = true;
  }
  return { level: l, xp: x, levelUp, evolved: stageFor(l) !== stageFor(level) };
}
