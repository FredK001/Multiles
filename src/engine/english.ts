/* Questions d'anglais : un mot (dessin → mot, écoute → dessin, vrai/faux) ou une phrase du thème (étape 3).
   Le moteur ne fait que choisir et ranger : l'affichage (dessin, mot français, voix) revient à l'écran. */
import { drillWords, fillDrill, THEMES, themeOf, type Drill, type ThemeId, type Word } from '../content/english';
import { DRILL_BASE, type SeriesDef } from '../content/series';
import { pick, shuffle, type Rng } from './random';
import { isDrill, type Fact } from './series';

/** Indice visuel d'une phrase oui/non : le visage sourit (like) ou non, le geste est coché (can) ou barré. */
export type EngCue = 'like' | 'dislike' | 'can' | 'cant';

export interface EngOption {
  /** Texte de la proposition (mot ou phrase anglaise). */
  text: string;
  /** Mot du thème correspondant : son dessin remplace le texte au format écoute. */
  word?: number;
}

export interface EngQ {
  theme: ThemeId;
  /** Mot dessiné dans la consigne (indice dans le thème) ; null = pas de dessin. */
  pic: number | null;
  /** Nombre d'objets dessinés (« How many pens can you see? »). */
  count?: number;
  cue?: EngCue;
  /** Phrase de la consigne (question anglaise, ou situation en français si `textFr`). */
  text?: string;
  textFr?: boolean;
  /** Propositions (QCM, écoute : 3 ; oui/non : 2 ; vrai/faux : le mot montré). */
  options: EngOption[];
  /** Texte anglais lu par la voix : le mot au format écoute, la question sinon. */
  say: string;
}

/** Ce que la question pose, avant habillage en Question. */
export interface EngDraft {
  eng: EngQ;
  /** Indice de la bonne proposition (QCM, écoute, oui/non). */
  p: number;
  /** Vrai/faux : le mot montré est-il le bon ? */
  truth?: boolean;
  /** Format réel : les phrases sont toujours des choix (qcm). */
  fmt: 'qcm' | 'ecoute' | 'vf';
}

const themeOfSeries = (s: SeriesDef) => {
  if (s.spec.kind !== 'theme') throw new RangeError(`${s.id} n'est pas un thème d'anglais`);
  return themeOf(s.spec.theme);
};

/** `n` éléments distincts de `pool` autres que `x`, au hasard. */
const others = <T>(pool: readonly T[], x: T, n: number, rng: Rng): T[] => shuffle(pool.filter((y) => y !== x), rng).slice(0, n);

/** Question sur un mot : dessin → mot (qcm), écoute → dessin (ecoute), dessin + mot juste ou pas (vf). */
function wordDraft(theme: ThemeId, words: readonly Word[], i: number, fmt: 'qcm' | 'ecoute' | 'vf', rng: Rng): EngDraft {
  const x = words[i]!, idx = words.map((_, j) => j);
  if (fmt === 'vf') {
    const truth = rng() < 0.5, shown = truth ? i : pick(others(idx, i, words.length, rng), rng);
    return { fmt, p: 0, truth, eng: { theme, pic: i, options: [{ text: words[shown]!.en, word: shown }], say: words[shown]!.en } };
  }
  const opts = shuffle([i, ...others(idx, i, 2, rng)], rng);
  return {
    fmt,
    p: opts.indexOf(i),
    eng: { theme, pic: fmt === 'qcm' ? i : null, options: opts.map((j) => ({ text: words[j]!.en, word: j })), say: x.en },
  };
}

/** Réponses des autres paires question-réponse : du thème d'abord, puis des autres thèmes si besoin. */
function qaDistractors(theme: ThemeId, d: Extract<Drill, { kind: 'qa' }>, rng: Rng): string[] {
  const answers = (ts: typeof THEMES) => ts.flatMap((t) => t.drills.flatMap((y) => (y.kind === 'qa' && y.a !== d.a ? [y.a] : [])));
  const own = shuffle(answers(THEMES.filter((t) => t.id === theme)), rng);
  const rest = shuffle(answers(THEMES.filter((t) => t.id !== theme)), rng).filter((a) => !own.includes(a));
  return [...own, ...rest].slice(0, 2);
}

/** Question sur une phrase du thème. */
function drillDraft(theme: ThemeId, d: Drill, rng: Rng): EngDraft {
  const t = themeOf(theme);
  if (d.kind === 'qa') {
    const opts = shuffle([d.a, ...qaDistractors(theme, d, rng)], rng);
    return { fmt: 'qcm', p: opts.indexOf(d.a), eng: { theme, pic: null, text: d.q, textFr: d.fr, options: opts.map((text) => ({ text })), say: d.fr ? d.a : d.q } };
  }
  const ws = drillWords(t, d), x = pick(ws, rng), i = t.words.indexOf(x);
  if (d.kind === 'pick') {
    const opts = shuffle([x, ...others(ws, x, 2, rng)], rng);
    return { fmt: 'qcm', p: opts.indexOf(x), eng: { theme, pic: i, text: fillDrill(d.q, x), options: opts.map((y) => ({ text: fillDrill(d.a, y) })), say: fillDrill(d.q, x) } };
  }
  if (d.kind === 'count') {
    const n = 2 + Math.floor(rng() * 4), ns = shuffle([n, ...others([2, 3, 4, 5], n, 2, rng)], rng);
    return { fmt: 'qcm', p: ns.indexOf(n), eng: { theme, pic: i, count: n, text: fillDrill(d.q, x), options: ns.map((k) => ({ text: fillDrill(d.a, x, k) })), say: fillDrill(d.q, x) } };
  }
  // Oui/non : la réponse attendue vient du dessin.
  const truth = rng() < 0.5;
  const asked = d.cue === 'match' && !truth ? pick(others(ws, x, ws.length, rng), rng) : x;
  const cue: EngCue | undefined = d.cue === 'like' ? (truth ? 'like' : 'dislike') : d.cue === 'can' ? (truth ? 'can' : 'cant') : undefined;
  const text = fillDrill(d.q, asked);
  return { fmt: 'qcm', p: truth ? 0 : 1, eng: { theme, pic: i, ...(cue ? { cue } : {}), text, options: [{ text: d.yes }, { text: d.no }], say: text } };
}

/** Question d'anglais pour le calcul `f` de la série. */
export function engDraft(s: SeriesDef, f: Fact, fmt: 'qcm' | 'ecoute' | 'vf', rng: Rng): EngDraft {
  const t = themeOfSeries(s);
  if (isDrill(f)) return drillDraft(t.id, t.drills[f.b - DRILL_BASE - 1]!, rng);
  return wordDraft(t.id, t.words, f.b - 1, fmt, rng);
}

/** Bonne réponse en clair (feedback, voix après la réponse). */
export function engAnswer(q: { eng?: EngQ; p: number; truth?: boolean }): string {
  const e = q.eng;
  if (!e) return '';
  if (e.pic !== null && e.options.length === 1) return themeOf(e.theme).words[e.pic]!.en;
  return e.options[q.p]?.text ?? '';
}

/** Mot ou phrase d'une clé d'anglais, pour l'espace parent : « giraffe » (girafe), « Do you like … ? ». */
export function engFactLabel(a: number, b: number): { en: string; fr: string } {
  const t = THEMES[a - 1];
  if (!t) return { en: '?', fr: '' };
  if (b <= DRILL_BASE) {
    const w = t.words[b - 1];
    return w ? { en: w.en, fr: w.fr } : { en: '?', fr: '' };
  }
  const d = t.drills[b - DRILL_BASE - 1];
  if (!d) return { en: '?', fr: '' };
  const blank = (s: string) => s.replace(/\{[a-z]+\}/g, '…');
  return d.kind === 'qa' ? { en: d.a, fr: d.fr ? d.q : '' } : { en: blank(d.q), fr: `phrase, île ${t.en}` };
}
