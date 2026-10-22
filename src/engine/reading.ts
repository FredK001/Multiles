/* Questions de lecture (CP) : la voix dit un son ou un mot, l'enfant touche la bonne écriture parmi trois.
   Sans voix française, la question devient « trouve la même écriture » (format qcm).
   Îles de phrases : l'enfant lit la phrase et touche le bon dessin (format qcm, la voix ne lit pas la phrase).
   Îles de dictée : la voix dit le mot, l'enfant l'écrit au clavier de lettres (format dictee) ;
   sans voix, le dessin du mot remplace la voix (`seen`). */
import { dictKeys, kindOf, READ_SETS, readSetOf, sayOf, type PicId, type ReadId, type ReadKind } from '../content/reading';
import type { SeriesDef } from '../content/series';
import { defaultRng, shuffle, type Rng } from './random';
import type { Fact } from './series';

export interface ReadQ {
  set: ReadId;
  /** Sorte d'île : son, phrase ou dictée. */
  kind: ReadKind;
  /** Ce que lit la voix (le son, le mot ; pour une phrase, seulement dans l'aide après une erreur). */
  say: string;
  /** La bonne écriture (montrée au format qcm) ; la phrase à lire ; le mot à écrire. */
  target: string;
  /** Sons : les trois écritures, mélangées. Phrases : les trois dessins, mélangés. Dictée : les touches du clavier, mélangées. */
  options: readonly string[];
  /** Phrases : le bon dessin. Dictée : le dessin du mot. */
  pic?: PicId;
  /** Dictée sans voix française : le dessin est montré à la place de la voix. */
  seen?: boolean;
}

/** Série de lecture d'une série. */
export const readOfSeries = (s: SeriesDef) => {
  if (s.spec.kind !== 'read') throw new RangeError(`${s.id} n'est pas une série de lecture`);
  return readSetOf(s.spec.set);
};

/** Question sur l'élément `f.b` ; `p` = indice de la bonne écriture (ou du bon dessin ; 0 en dictée, sans objet). */
export function readDraft(s: SeriesDef, f: Fact, rng: Rng = defaultRng): { read: ReadQ; p: number } {
  const set = readOfSeries(s), it = set.items[f.b - 1], kind = kindOf(set);
  if (!it) throw new RangeError(`${s.id} : pas d'élément n° ${f.b}`);
  if (kind === 'dictee') return { read: { set: set.id, kind, say: sayOf(it), target: it.w, options: shuffle(dictKeys(it), rng), pic: it.pic! }, p: 0 };
  const right = kind === 'phrase' ? it.pic! : it.w;
  const options = shuffle([right, ...it.x], rng);
  return { read: { set: set.id, kind, say: sayOf(it), target: it.w, options, ...(it.pic ? { pic: it.pic } : {}) }, p: options.indexOf(right) };
}

/** Dictée : longueur maximale de la saisie (celle du mot). */
export const dictMax = (r: ReadQ): number => [...r.target].length;

/** Dictée : la réponse est-elle exactement le mot (accents compris) ? */
export const dictOk = (r: ReadQ, typed: string): boolean => typed.normalize('NFC') === r.target.normalize('NFC');

/** Dictée : ajoute une lettre à la saisie, sans dépasser la longueur du mot. */
export const dictType = (r: ReadQ, typed: string, letter: string): string => ([...typed].length >= dictMax(r) ? typed : typed + letter);

/** Écriture d'une clé de lecture (espace parent, grille). */
export function readFactLabel(a: number, b: number): { w: string; say: string; set: string } {
  const set = READ_SETS[a - 1], it = set?.items[b - 1];
  return it ? { w: it.w, say: sayOf(it), set: set.title } : { w: '?', say: '', set: '' };
}

/** Sorte d'une île de lecture (son, phrase, dictée) ; null hors lecture. */
export const readKindOf = (s: SeriesDef): ReadKind | null => (s.spec.kind === 'read' ? kindOf(readSetOf(s.spec.set)) : null);
