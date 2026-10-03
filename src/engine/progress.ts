/* Accès à la progression d'une opération dans un profil. */
import { CURRICULUM, seriesOf, type Op } from '../content/series';
import type { OpProgress, Profile } from '../store/schema';

export const emptyOp = (op: Op): OpProgress => ({
  current: seriesOf(op)[0]!.id, series: {}, mastered: [], traps: [], trapLog: {}, records: {}, stickers: [], defiDay: null, defiPick: null,
});

/** Opérations proposées au profil, selon sa classe. */
export const opsOf = (p: Pick<Profile, 'grade'>): readonly Op[] => CURRICULUM[p.grade];

/** Progression d'une opération (l'opération en cours par défaut) ; vide si l'enfant n'y a pas encore joué. */
export const opProg = (p: Pick<Profile, 'prog' | 'op'>, op: Op = p.op): OpProgress => p.prog[op] ?? emptyOp(op);

/** Modifie la progression d'une opération. */
export function withOp(p: Profile, op: Op, fn: (o: OpProgress) => OpProgress): Profile {
  return { ...p, prog: { ...p.prog, [op]: fn(opProg(p, op)) } };
}

/** Stickers gagnés, toutes opérations confondues (album). */
export const allStickers = (p: Pick<Profile, 'prog'>): string[] => Object.values(p.prog).flatMap((o) => o?.stickers ?? []);
