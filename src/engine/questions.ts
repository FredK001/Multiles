/* Générateur unique de questions, paramétré par la série (donc par l'opération). */
import { SERIES, type Op, type SeriesDef, type SeriesId } from '../content/series';
import { factKey } from './keys';
import { defaultRng, pick, shuffle, type Rng } from './random';
import { engDraft, type EngQ } from './english';
import { frDraft, type FrQ } from './french';
import { readDraft, type ReadQ } from './reading';
import { numAnswer, numChoices, numQ, numSetOfSeries, type NumQ } from './numbers';
import { fracDraft, fracSetOfSeries, type FracQ } from './fractions';
import { writtenDraft, type WrittenQ } from './written';
import { picDraft, picSpecOf, type PicQ } from './picquiz';
import { geoDraft, geoSetOfSeries, type GeoQ } from './geometry';
import { displayBounds, drawFact, factsOf, inSeries, resultOf, weightOf, type Fact } from './series';

/** Les 4 formats : pavé numérique, QCM à 3 choix, facteur manquant, vrai/faux ;
    plus, en anglais, l'écoute (la voix dit le mot, l'enfant touche le dessin) ;
    plus, en lecture, la dictée (la voix dit le mot, l'enfant l'écrit au clavier de lettres). */
export type Format = 'pave' | 'qcm' | 'manquant' | 'vf' | 'ecoute' | 'dictee';

/** Rotation des formats en session classique. */
export const FORMAT_ORDER: readonly Format[] = ['pave', 'qcm', 'manquant', 'vf'];
/** Rotation des formats en mode chrono (questions illimitées). */
export const CHRONO_ORDER: readonly Format[] = ['pave', 'qcm', 'vf', 'pave', 'manquant'];
/** Anglais : pas de pavé ni de nombre manquant. Les phrases sont toujours des choix, quel que soit leur rang. */
export const ENG_ORDER: readonly Format[] = ['qcm', 'ecoute', 'vf', 'ecoute'];
export const ENG_CHRONO_ORDER: readonly Format[] = ['qcm', 'ecoute', 'vf', 'qcm', 'ecoute'];

/** Rotation des formats d'une opération (session classique, ou chrono). */
/** Lecture : la voix dit, l'enfant touche l'écriture (qcm : trouver la même, sans voix). */
export const LEC_ORDER: readonly Format[] = ['ecoute'];

/** Français : toujours un choix entre les deux mots de la paire. */
export const FR_ORDER: readonly Format[] = ['qcm'];

export const formatsOf = (op: Op, chrono = false): readonly Format[] =>
  op === 'fr' ? FR_ORDER : op === 'lec' ? LEC_ORDER : op === 'eng' ? (chrono ? ENG_CHRONO_ORDER : ENG_ORDER) : chrono ? CHRONO_ORDER : FORMAT_ORDER;

export interface Question {
  op: Op;
  series: SeriesId;
  a: number;
  b: number;
  fmt: Format;
  /** Résultat : produit, somme ou différence. */
  p: number;
  /** QCM : 3 propositions dont la bonne. */
  choices?: number[];
  /** Vrai/faux : l'égalité affichée est-elle juste ? */
  truth?: boolean;
  /** Vrai/faux : résultat affiché. */
  shown?: number;
  /** Question remise en fin de file après une erreur (ne compte pas « du premier coup »). */
  retry?: boolean;
  /** Question ajoutée par la répétition intelligente. */
  trap?: boolean;
  /** Anglais : ce qui est montré et proposé ; `p` est alors l'indice de la bonne proposition. */
  eng?: EngQ;
  /** Français : la phrase à trou ; `p` est l'indice du bon mot. */
  fr?: FrQ;
  /** Lecture : ce que dit la voix et les trois écritures ; `p` est l'indice de la bonne. */
  read?: ReadQ;
  /** Nombres jusqu'à 100 : l'île (dizaines et unités, avant/après, comparer, droite graduée). */
  num?: NumQ;
  /** Fractions et décimaux : l'énoncé et les trois réponses ; `p` est l'indice de la bonne. */
  frac?: FracQ;
  /** Grands nombres : l'énoncé et les trois réponses écrites ; `p` est l'indice de la bonne. */
  big?: WrittenQ;
  /** Mesures : l'énoncé (horloge éventuelle) et les trois réponses écrites ; `p` est l'indice de la bonne. */
  mes?: WrittenQ;
  /** Grandeurs et espace (CP) : consigne, dessin et trois réponses (écrites ou dessinées) ; `p` est l'indice de la bonne. */
  picq?: PicQ;
  /** Géométrie : l'énoncé, le dessin et les deux ou trois réponses ; `p` est l'indice de la bonne. */
  geo?: GeoQ;
}

export interface GenOptions {
  series: SeriesDef | SeriesId;
  fmt: Format;
  /** Calcul imposé ; sinon tiré dans la série (ou l'étape). */
  fact?: Fact;
  /** Étape 0 à 2 pour restreindre le tirage ; null ou 3 = toute la série. */
  step?: number | null;
  rng?: Rng;
}

/** Erreurs plausibles proposées au QCM. */
function qcmCandidates(op: Op, a: number, b: number, r: number): number[] {
  if (op === 'mul') return [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, r + 10, r - 10, r + 1, r - 1];
  // ÷ : un ou deux d'écart, ou le diviseur à la place du quotient.
  if (op === 'div') return [r + 1, r - 1, r + 2, r - 2, b];
  // + et − : un d'écart, deux d'écart, une dizaine d'écart, ou l'autre opération.
  return [r + 1, r - 1, r + 2, r - 2, r + 10, r - 10, op === 'sub' ? a + b : Math.abs(a - b)];
}

/** Résultats faux proposés au vrai/faux. */
function vfCandidates(op: Op, a: number, b: number, r: number): number[] {
  if (op === 'mul') return [a * (b + 1), a * (b - 1), r + 1, r + 2, r - 1];
  if (op === 'div') return [r + 1, r - 1, r + 2, b];
  return [r + 1, r + 2, r - 1, r - 2];
}

/** Fabrique une question de la série. Le calcul vient toujours de la liste de la série :
    résultat jamais négatif ni hors plage, propositions bornées (voir assertValid). */
export function generateQuestion({ series, fmt, fact, step = null, rng = defaultRng }: GenOptions): Question {
  const s = typeof series === 'string' ? SERIES[series] : series;
  const f = fact ?? drawFact(factsOf(s, step), rng, weightOf(s));
  if (!inSeries(s, f)) throw new RangeError(`${factKey(s.op, f.a, f.b)} n'appartient pas à la série ${s.id}`);
  if (s.op === 'eng') {
    const d = engDraft(s, f, fmt === 'ecoute' || fmt === 'vf' ? fmt : 'qcm', rng);
    const q: Question = { op: 'eng', series: s.id, a: f.a, b: f.b, fmt: d.fmt, p: d.p, eng: d.eng };
    if (d.fmt === 'qcm' || d.fmt === 'ecoute') q.choices = d.eng.options.map((_, i) => i);
    if (d.truth !== undefined) q.truth = d.truth;
    assertValid(q);
    return q;
  }
  if (s.op === 'frac') {
    const d = fracDraft(fracSetOfSeries(s), f.b, rng);
    const q: Question = { op: 'frac', series: s.id, a: f.a, b: f.b, fmt: 'qcm', p: d.p, frac: d.frac, choices: [0, 1, 2] };
    assertValid(q);
    return q;
  }
  if (s.op === 'big' || s.op === 'mes') {
    const d = writtenDraft(s, f.b, rng);
    const q: Question = { op: s.op, series: s.id, a: f.a, b: f.b, fmt: 'qcm', p: d.p, [s.op]: d.w, choices: [0, 1, 2] };
    assertValid(q);
    return q;
  }
  if (s.op === 'grd' || s.op === 'esp') {
    const d = picDraft(picSpecOf(s), f.b, rng);
    const q: Question = { op: s.op, series: s.id, a: f.a, b: f.b, fmt: 'qcm', p: d.p, picq: d.pic, choices: [0, 1, 2] };
    assertValid(q);
    return q;
  }
  if (s.op === 'geo') {
    const d = geoDraft(geoSetOfSeries(s), f.b, rng);
    const q: Question = { op: 'geo', series: s.id, a: f.a, b: f.b, fmt: 'qcm', p: d.p, geo: d.geo, choices: d.geo.options.map((_, i) => i) };
    assertValid(q);
    return q;
  }
  if (s.op === 'num') {
    const n = numQ(numSetOfSeries(s), f.b);
    // Comparer : toujours au choix (les nombres, les signes) ; vrai ou faux pour les affirmations.
    const nf: Format = n.set === 'vf' ? 'vf' : fmt === 'pave' && (n.set === 'du' || n.set === 'suite' || n.set === 'droite') ? 'pave' : 'qcm';
    const q: Question = { op: 'num', series: s.id, a: f.a, b: f.b, fmt: nf, p: numAnswer(n), num: n };
    if (q.fmt === 'qcm') q.choices = numChoices(n, rng);
    if (q.fmt === 'vf') q.truth = q.p === 1;
    assertValid(q);
    return q;
  }
  if (s.op === 'lec') {
    const d = readDraft(s, f, rng), kind = d.read.kind;
    // Le format dépend de l'île : sons à l'écoute (ou « trouve la même »), phrases à lire (qcm), mots dictés.
    const lfmt: Format = kind === 'dictee' ? 'dictee' : kind === 'phrase' || fmt === 'qcm' ? 'qcm' : 'ecoute';
    const q: Question = { op: 'lec', series: s.id, a: f.a, b: f.b, fmt: lfmt, p: d.p, read: d.read };
    if (kind !== 'dictee') q.choices = [0, 1, 2];
    assertValid(q);
    return q;
  }
  if (s.op === 'fr') {
    const d = frDraft(s, f, rng);
    const q: Question = { op: 'fr', series: s.id, a: f.a, b: f.b, fmt: 'qcm', p: d.p, fr: d.fr, choices: d.fr.options.map((_, i) => i) };
    assertValid(q);
    return q;
  }
  const { a, b } = f, r = resultOf(s.op, a, b), { lo, hi } = displayBounds(s);
  const wrong = (x: number) => x >= lo && x <= hi && x !== r;
  const q: Question = { op: s.op, series: s.id, a, b, fmt, p: r };
  if (fmt === 'qcm') {
    const c = new Set([r]);
    for (const x of shuffle(qcmCandidates(s.op, a, b, r).filter(wrong), rng)) {
      if (c.size >= 3) break;
      c.add(x);
    }
    q.choices = shuffle([...c], rng);
  }
  if (fmt === 'vf') {
    q.truth = rng() < 0.5;
    q.shown = q.truth ? r : pick(vfCandidates(s.op, a, b, r).filter(wrong), rng);
  }
  assertValid(q);
  return q;
}

/** Garde-fou : lève une erreur si la question sort de sa série. */
export function assertValid(q: Question): void {
  const s = SERIES[q.series], { lo, hi } = displayBounds(s);
  const fail = (why: string) => {
    throw new RangeError(`Question ${factKey(q.op, q.a, q.b)} (${q.series}) invalide : ${why}`);
  };
  if (q.op !== s.op) fail('opération');
  if (!inSeries(s, q)) fail('calcul hors série');
  if (q.op === 'eng') {
    const o = q.eng?.options ?? [];
    if (!q.eng) fail('anglais sans contenu');
    if (new Set(o.map((x) => x.text)).size !== o.length) fail('propositions en double');
    if (q.fmt === 'vf') {
      if (o.length !== 1 || q.truth === undefined) fail('vrai/faux');
    } else if (o.length < 2 || o.length > 3 || q.p < 0 || q.p >= o.length || q.choices?.length !== o.length) fail('propositions');
    if (q.fmt === 'ecoute' && o.some((x) => x.word === undefined)) fail('écoute sans dessins');
    return;
  }
  if (q.op === 'frac') {
    const o = q.frac?.options ?? [];
    if (!q.frac || q.fmt !== 'qcm' || o.length !== 3 || new Set(o).size !== 3 || q.p < 0 || q.p > 2) fail('fractions');
    return;
  }
  if (q.op === 'big' || q.op === 'mes') {
    const w = q[q.op], o = w?.options ?? [];
    if (!w || q.fmt !== 'qcm' || o.length !== 3 || new Set(o).size !== 3 || q.p < 0 || q.p > 2) fail(q.op === 'big' ? 'grands nombres' : 'mesures');
    return;
  }
  if (q.op === 'grd' || q.op === 'esp') {
    const o = q.picq?.options ?? [];
    if (!q.picq || q.fmt !== 'qcm' || o.length !== 3 || new Set(o).size !== 3 || q.p < 0 || q.p > 2) fail('grandeurs, espace');
    return;
  }
  if (q.op === 'geo') {
    const o = q.geo?.options ?? [];
    if (!q.geo || q.fmt !== 'qcm' || o.length < 2 || o.length > 3 || new Set(o).size !== o.length || q.p < 0 || q.p >= o.length) fail('géométrie');
    return;
  }
  if (q.op === 'num') {
    const c = q.choices ?? [];
    if (!q.num || q.p !== numAnswer(q.num) || q.p < 0 || q.p > 100) fail('nombres');
    if (q.fmt === 'vf' && q.truth !== (q.p === 1)) fail('nombres : vrai ou faux');
    if (q.fmt === 'qcm' && (c.length < 2 || new Set(c).size !== c.length || !c.includes(q.p) || c.some((x) => x < 0 || x > 100))) fail('nombres : propositions');
    return;
  }
  if (q.op === 'lec') {
    const r = q.read, o = r?.options ?? [];
    if (!r) return fail('lecture sans contenu');
    if (r.kind === 'dictee') {
      // Clavier : chaque lettre du mot présente une fois, au moins deux pièges, pas plus de 9 touches.
      const need = new Set(r.target);
      if (q.fmt !== 'dictee' || !r.pic || new Set(o).size !== o.length || [...need].some((l) => !o.includes(l)) || o.length < need.size + 2 || o.length > 9) fail('dictée');
      return;
    }
    const right = r.kind === 'phrase' ? r.pic : r.target;
    if ((r.kind === 'phrase' ? q.fmt !== 'qcm' : q.fmt !== 'qcm' && q.fmt !== 'ecoute') || o.length !== 3 || new Set(o).size !== 3 || o[q.p] !== right) fail('lecture');
    return;
  }
  if (q.op === 'fr') {
    const o = q.fr?.options ?? [];
    if (!q.fr || q.fmt !== 'qcm' || o.length < 2 || o.length > 3 || new Set(o).size !== o.length || q.p < 0 || q.p >= o.length || !q.fr.text.includes('___')) fail('français');
    return;
  }
  if (q.p !== resultOf(q.op, q.a, q.b)) fail('résultat');
  if (q.p < 0 || q.p < lo || q.p > hi) fail('résultat hors plage');
  if (q.fmt === 'qcm') {
    const c = q.choices ?? [];
    if (c.length !== 3 || new Set(c).size !== 3 || !c.includes(q.p)) fail('propositions');
    if (c.some((x) => x < lo || x > hi)) fail('proposition hors plage');
  }
  if (q.fmt === 'vf' && (q.shown === undefined || q.shown < lo || q.shown > hi || (q.shown === q.p) !== q.truth)) fail('vrai/faux');
}

/** Multiplication a × b de la table de a (raccourci du parcours CM1). */
export function makeQ(a: number, b: number, fmt: Format, rng: Rng = defaultRng): Question {
  return generateQuestion({ series: `mul-${a}` as SeriesId, fact: { a, b }, fmt, rng });
}

/** Même calcul, même format, nouvelles propositions (question remise en fin de file). */
export const remakeQ = (q: Question, rng: Rng = defaultRng): Question => generateQuestion({ series: q.series, fact: q, fmt: q.fmt, rng });

/** Sans voix anglaise, une question d'écoute devient une question dessin → mot sur le même mot.
    Dictée sans voix française : le dessin du mot est montré à la place de la voix. */
export const withoutListening = (q: Question, rng: Rng = defaultRng): Question =>
  q.fmt === 'dictee' && q.read ? { ...q, read: { ...q.read, seen: true } } : q.fmt === 'ecoute' ? { ...generateQuestion({ series: q.series, fact: q, fmt: 'qcm', rng }), ...(q.retry ? { retry: true } : {}), ...(q.trap ? { trap: true } : {}) } : q;

/** Valeur attendue au pavé : le résultat, ou le nombre manquant (second terme). */
export const expected = (q: Question): number => (q.fmt === 'manquant' ? q.b : q.p);

/** Vérifie une réponse : nombre (pavé, QCM, facteur manquant) ou booléen (vrai/faux). */
export function isCorrect(q: Question, answer: number | boolean): boolean {
  if (q.fmt === 'vf') return answer === q.truth;
  if (q.fmt === 'qcm' || q.fmt === 'ecoute') return answer === q.p;
  return answer === expected(q);
}

/** Saisie au pavé : 3 chiffres au plus, pas de zéro en tête. */
export function typeDigit(input: string, d: string): string {
  if (input.length >= 3) return input;
  return (input === '0' ? '' : input) + d;
}
