/* Textes de l'interface enfant, repris mot pour mot du prototype. Tutoiement partout. */
import type { Question } from '../engine/questions';
import { themeOf } from './english';
import { fillBlank, quizOf, ruleOf } from './french';
import { sayFrac } from './fractions';
import { PICS, spell } from './reading';
import { DRILL_BASE, OP_SIGN, OP_SPOKEN, SERIES } from './series';
import { seriesStory } from './stories';
import { nb } from './text';

export const MSG = {
  pave: ['Combien font {a} {op} {b} ?', 'À toi, {name} : {a} {op} {b} ?'],
  qcm: ['Touche la bonne réponse.', 'Laquelle est juste, {name} ?'],
  manquant: ['Trouve le nombre qui manque.', 'Quel nombre se cache ici ?'],
  vf: ["Est-ce que c'est juste ?", 'Vrai ou faux, {name} ?'],
  ecoute: ['Écoute et touche le bon dessin.', 'Écoute bien, {name} !'],
} as const;

/** Consignes du CP : très courtes, sans prénom, appuyées par un pictogramme du format. */
export const MSG_CP = {
  pave: ['Combien font {a} {op} {b} ?'],
  qcm: ['Touche le bon nombre.'],
  manquant: ['Quel nombre manque ?'],
  vf: ['Juste ou pas juste ?'],
  ecoute: ['Écoute et touche le bon dessin.'],
} as const;

/** Consignes du français. */
export const FR_PROMPTS = ['Choisis le bon mot.', 'Quel mot va dans le trou, {name} ?', 'Lequel des deux, {name} ?'];
/** Consignes des petits problèmes : la question est dans l'histoire. */
export const STORY_PROMPTS = ["Écoute bien l'histoire.", "Lis l'histoire, puis réponds."] as const;

/** Consignes de la lecture (CP) : très courtes, lues par la voix. */
export const LEC_PROMPTS = {
  ecoute: ['Écoute et touche ce que tu entends.'], qcm: ['Trouve le même mot.'],
  // Phrases : la consigne est lue, jamais la phrase (c'est l'exercice). Dictée : avec la voix, ou avec le dessin.
  phrase: ['Lis la phrase et touche le bon dessin.'], dictee: ['Écoute et écris le mot.'], vu: ['Écris le mot du dessin.'],
} as const;

/** Consignes d'une question de lecture, selon l'île (sons, phrases, dictée) et la voix. */
export function lecPrompts(q: Pick<Question, 'fmt' | 'read'>): readonly string[] {
  const k = q.read?.kind;
  if (k === 'phrase') return LEC_PROMPTS.phrase;
  if (k === 'dictee') return q.read!.seen ? LEC_PROMPTS.vu : LEC_PROMPTS.dictee;
  return LEC_PROMPTS[q.fmt === 'qcm' ? 'qcm' : 'ecoute'];
}

/** Consignes de la conjugaison (trois formes du verbe). */
export const CONJ_PROMPTS = ['Choisis la bonne forme du verbe.', 'Conjugue le verbe, {name} !', 'Quelle forme va dans le trou ?'];

export const OK_TITLES = ['Bravo {name} !', 'Super !', 'Exact !', 'Bien joué, {name} !', 'Tu assures !', 'Génial !', 'Et voilà !'];
export const HELP_TITLES = ['Presque, {name} !', 'Pas tout à fait !', 'On regarde ensemble ?'];

/** Remplit un modèle de phrase et ajoute les espaces insécables. */
export const fill = (t: string, q: Pick<Question, 'a' | 'b' | 'op'>, name: string): string =>
  nb(t.replace('{a}', String(q.a)).replace('{op}', OP_SPOKEN[q.op]).replace('{b}', String(q.b)).replace('{name}', name).replace('{r}', ''));

/** Énoncé lu à voix haute et donné aux lecteurs d'écran. */
export function spoken(q: Question): string {
  // Français : le trou est lu comme un silence (a et à se prononcent pareil, mais pas toujours et/est).
  // Petit problème : l'histoire elle-même (le calcul n'est pas donné).
  if (SERIES[q.series]?.story && (q.op === 'add' || q.op === 'sub')) return seriesStory(q.series, q.op, q.a, q.b);
  if (q.op === 'frac' && q.frac) return sayFrac(q.frac.text);
  if (q.op === 'num' && q.num) return numSpoken(q.num.set, q.num.x, q.num.y);
  if (q.op === 'lec' && q.read?.kind === 'phrase') return LEC_PROMPTS.phrase[0];
  if (q.op === 'lec' && q.read?.kind === 'dictee') return q.read.seen ? `Écris le mot du dessin : ${PICS[q.read.pic!].label}.` : LEC_PROMPTS.dictee[0];
  if (q.op === 'lec' && q.read) return q.fmt === 'qcm' ? `Trouve : ${q.read.target}.` : 'Écoute bien.';
  if (q.op === 'fr' && q.fr) return q.fr.text.replace(/___/g, '…') + (q.fr.verb ? ` Verbe ${q.fr.verb}.` : '');
  const w = OP_SPOKEN[q.op];
  if (q.fmt === 'manquant') return q.op === 'div' ? `${q.a} ${w} combien égale ${q.p} ?` : `${q.a} ${w} combien font ${q.p} ?`;
  if (q.fmt === 'vf') return `${q.a} ${w} ${q.b} égale ${q.shown}. Vrai ou faux ?`;
  return `Combien font ${q.a} ${w} ${q.b} ?`;
}

/** Question de nombres, telle qu'on la dit. */
function numSpoken(set: NonNullable<Question['num']>['set'], a: number, b: number): string {
  if (set === 'du') return `${a} dizaine${a > 1 ? 's' : ''} et ${b} unité${b > 1 ? 's' : ''}, c'est quel nombre ?`;
  if (set === 'suite') return b === 1 ? `Quel nombre vient juste après ${a} ?` : `Quel nombre vient juste avant ${a} ?`;
  if (set === 'comp') return `Quel est le plus grand : ${a} ou ${b} ?`;
  return `Quel nombre est caché sur la droite, entre ${a} et ${a + 10} ?`;
}

/** Réponse complète d'une question de nombres (feuille de réponse). */
export function numEq(n: NonNullable<Question['num']>): string {
  const { set, x, y } = n;
  if (set === 'du') return `${x} dizaine${x > 1 ? 's' : ''} et ${y} unité${y > 1 ? 's' : ''} = ${x * 10 + y}`;
  if (set === 'suite') return y === 1 ? `${x}, puis ${x + 1}` : `${x - 1}, puis ${x}`;
  if (set === 'comp') return `${Math.max(x, y)} > ${Math.min(x, y)}`;
  return `${x} … ${y} … ${x + 10}`;
}

/** Égalité complète affichée : « 7 × 8 = 56 », « 13 − 5 = 8 ». */
export const equation = (q: Pick<Question, 'a' | 'b' | 'p' | 'op'>): string => `${q.a} ${OP_SIGN[q.op]} ${q.b} = ${q.p}`;

/** Astuce adaptée à la multiplication (feuille d'aide et grille). */
export function tipFor(a: number, b: number): string {
  const p = a * b, o = (x: number) => (a === x ? b : a);
  if (a === 1 || b === 1) return `Fois 1, le nombre ne change pas : ${o(1)} reste ${p}.`;
  if (a === 10 || b === 10) return `Fois 10, on ajoute un zéro : ${o(10)} devient ${p}.`;
  if ((a === 7 && b === 8) || (a === 8 && b === 7)) return 'Retiens la suite 5, 6, 7, 8 : 56 = 7 × 8.';
  if (a === 2 || b === 2) return `Fois 2, c'est le double : ${o(2)} + ${o(2)} = ${p}.`;
  if (a === 5 || b === 5) return `Fois 5, c'est la moitié de fois 10 : la moitié de ${o(5) * 10}, c'est ${p}.`;
  if (a === 9 || b === 9) return `Fois 9 : ${o(9)} × 10 = ${o(9) * 10}, puis on enlève ${o(9)}. Ça fait ${p}.`;
  if (a === 4 || b === 4) return `Fois 4, c'est le double du double : ${o(4)}, puis ${o(4) * 2}, puis ${p}.`;
  if (a === 3 || b === 3) return `Fois 3 : le double, plus une fois. ${o(3) * 2} + ${o(3)} = ${p}.`;
  const big = Math.max(a, b), sm = Math.min(a, b);
  return `Coupe en deux : ${sm} × 5 = ${sm * 5}, plus ${sm} × ${big - 5} = ${sm * (big - 5)}. Total : ${p}.`;
}

/** Astuce pour une division a ÷ b : on remonte à la table de b. */
function divTip(a: number, b: number): string {
  const p = a / b;
  if (b === 1) return `Divisé par 1, le nombre ne change pas : ${a} reste ${a}.`;
  if (a === b) return `Un nombre divisé par lui-même, ça fait 1 : il y a ${b} une seule fois dans ${a}.`;
  if (b === 10) return `Divisé par 10, on enlève le zéro : ${a} devient ${p}.`;
  if (b === 2) return `Divisé par 2, c'est la moitié : ${p} + ${p} = ${a}.`;
  return `Pense à la table de ${b} : ${b} × ${p} = ${a}. Donc ${a} ÷ ${b} = ${p}.`;
}

/** Astuce du CP pour une addition (calcul réfléchi : doubles, amis de 10, passage par 10). */
function addTip(a: number, b: number): string {
  const p = a + b, big = Math.max(a, b), small = Math.min(a, b);
  if (small === 0) return `Plus 0, le nombre ne change pas : ${big} reste ${big}.`;
  if (a === b) return `C'est un double : ${a} + ${a} = ${p}.`;
  if (p === 10) return `Ce sont des amis de 10 : ${a} et ${b} font 10.`;
  if (small === 1) return `Plus 1, c'est le nombre d'après : après ${big} vient ${p}.`;
  if (big < 10 && p > 10) return `Passe par 10 : ${big} + ${10 - big} = 10, puis 10 + ${small - (10 - big)} = ${p}.`;
  if (big >= 10) return `Ajoute aux unités : ${big % 10} + ${small} = ${(big % 10) + small}, donc ${big} + ${small} = ${p}.`;
  if (small <= 3) return `Pars du plus grand, ${big}, et avance de ${small} : ${Array.from({ length: small }, (_, i) => big + i + 1).join(', ')}.`;
  return `Pars du plus grand, ${big}, et avance de ${small} : tu arrives à ${p}.`;
}

/** Astuce du CP pour une soustraction (reculer, compléter, passer par 10). */
function subTip(a: number, b: number): string {
  const p = a - b;
  if (b === 0) return `Moins 0, le nombre ne change pas : ${a} reste ${a}.`;
  if (p === 0) return `On enlève tout : il ne reste rien, 0.`;
  if (b === 1) return `Moins 1, c'est le nombre d'avant : avant ${a} vient ${p}.`;
  if (a === 10) return `Pense aux amis de 10 : ${b} et ${p} font 10.`;
  if (b === 10) return `Enlève la dizaine : ${a} − 10 = ${p}.`;
  if (a === 20) return `20, c'est 10 et encore 10 : 10 − ${b} = ${10 - b}, puis 10 + ${10 - b} = ${p}.`;
  if (a > 10 && a % 10 < b) return `Descends jusqu'à 10 : ${a} − ${a - 10} = 10, puis 10 − ${b - (a - 10)} = ${p}.`;
  if (a > 10) return `Enlève aux unités : ${a % 10} − ${b} = ${(a % 10) - b}, donc ${a} − ${b} = ${p}.`;
  if (b <= 3) return `Recule de ${b} à partir de ${a} : ${Array.from({ length: b }, (_, i) => a - i - 1).join(', ')}.`;
  return `Compte de ${b} jusqu'à ${a} : il y a ${p} pas.`;
}

/** Consignes de l'anglais (en français : l'enfant lit l'anglais dans les propositions). */
export const MSG_ENG = {
  word: ['Comment dit-on en anglais ?', 'Quel est le mot anglais, {name} ?'],
  ecoute: ['Écoute et touche le bon dessin.', 'Écoute bien, {name} !'],
  vf: ['Est-ce le bon mot ?', 'Juste ou pas, {name} ?'],
  /** Phrase anglaise à comprendre (question du thème, oui/non, combien). */
  phrase: ['Choisis la bonne réponse.', 'Quelle est la bonne réponse, {name} ?'],
  /** Situation en français à dire en anglais. */
  dire: ['Comment le dire en anglais ?'],
} as const;

/** Consigne d'une question d'anglais. */
export function engPrompt(q: Question): readonly string[] {
  const e = q.eng!;
  if (q.fmt === 'ecoute') return MSG_ENG.ecoute;
  if (q.fmt === 'vf') return MSG_ENG.vf;
  if (q.b > DRILL_BASE) return e.textFr ? MSG_ENG.dire : MSG_ENG.phrase;
  return MSG_ENG.word;
}

/** Aide après une erreur en anglais : le sens du mot, ou la phrase à retenir. */
type TipQ = Pick<Question, 'op' | 'a' | 'b'> & Partial<Pick<Question, 'eng' | 'fr' | 'read' | 'num' | 'frac' | 'p' | 'fmt'>>;

function engTip(q: TipQ): string {
  const e = q.eng, t = e && themeOf(e.theme);
  if (!e || !t) return '';
  if (q.b <= DRILL_BASE) {
    const w = t.words[q.b - 1]!;
    return `« ${w.en} » veut dire « ${w.fr} ».`;
  }
  // La phrase juste est déjà affichée au-dessus : l'astuce dit comment la retrouver.
  const d = t.drills[q.b - DRILL_BASE - 1]!;
  if (d.kind === 'count') return `Compte les dessins : il y en a ${e.count}.`;
  if (d.kind === 'yesno' && e.cue) return e.cue === 'like' || e.cue === 'dislike' ? 'Regarde le visage : il aime, ou il n\'aime pas ?' : 'Regarde le signe : coché, il sait faire ; barré, il ne sait pas.';
  if (d.kind === 'yesno') return 'Regarde bien le dessin, puis réponds par oui ou par non.';
  if (d.kind === 'pick') return 'Regarde bien le dessin : la bonne phrase parle de lui.';
  return e.textFr ? 'Redis la phrase en anglais à voix haute pour la retenir.' : 'Redis la question et sa réponse à voix haute pour les retenir.';
}

/** Astuce du français : la règle du bon mot, et le mot d'essai mis dans la phrase. */
function frTip(q: TipQ): string {
  const f = q.fr;
  if (!f || q.p === undefined) return '';
  const quiz = quizOf(f.quiz), right = f.options[q.p]!, other = f.options[1 - q.p]!;
  // Conjugaison : la règle du temps et la bonne forme avec son pronom.
  if (quiz.tense) return ruleOf(quiz, quiz.items[q.b - 1]!);
  const swap = quiz.swap[right], test = quiz.swap[other], cite = (w: string) => fillBlank(f.text, w).replace(/\s*[.?!]$/, '');
  if (swap) return `${quiz.rule[right]} Ici : « ${cite(swap)} ».`;
  return `${quiz.rule[right]} « ${cite(test ?? other)} », ça ne va pas.`;
}

/** Astuce des nombres : dizaines d'abord. */
function numTip(q: TipQ): string {
  if (!q.num) return '';
  const { set, x: a, y: b } = q.num;
  if (set === 'du') return `${a} dizaine${a > 1 ? 's' : ''}, c'est ${a * 10}. ${a * 10} et ${b}, ça fait ${a * 10 + b}.`;
  if (set === 'suite') {
    if (b === 1) return a % 10 === 9 ? `Après ${a}, on change de dizaine : ${a + 1}.` : `Juste après, c'est un de plus : ${a} + 1 = ${a + 1}.`;
    return a % 10 === 0 ? `Avant ${a}, on recule d'une dizaine : ${a - 1}.` : `Juste avant, c'est un de moins : ${a} − 1 = ${a - 1}.`;
  }
  if (set === 'comp') {
    const ta = Math.floor(a / 10), tb = Math.floor(b / 10), big = Math.max(a, b);
    return ta !== tb ? `On regarde d'abord les dizaines : ${Math.max(ta, tb)} dizaines, c'est plus que ${Math.min(ta, tb)}. Le plus grand est ${big}.` : `Même nombre de dizaines : on regarde les unités. Le plus grand est ${big}.`;
  }
  // Près de la dizaine suivante, on compte à rebours.
  if (b - a >= 8) return `Compte les traits à rebours depuis ${a + 10} : ${Array.from({ length: a + 10 - b }, (_, i) => a + 9 - i).join(', ')}. Le nombre caché est ${b}.`;
  return `Compte les traits à partir de ${a} : ${Array.from({ length: Math.min(b - a, 4) }, (_, i) => a + i + 1).join(', ')}${b - a > 4 ? '…' : '.'} Le nombre caché est ${b}.`;
}

/** Astuce de lecture : les lettres qui se ressemblent, ou l'ordre des lettres. */
function lecTip(q: TipQ): string {
  const r = q.read;
  if (!r) return '';
  if (r.kind === 'phrase') return phraseTip(r);
  if (r.kind === 'dictee') {
    const accent = r.target.includes('é') ? " N'oublie pas l'accent sur le é." : '';
    return `${r.seen ? `C'est ${PICS[r.pic!].label}` : `On entend « ${r.target} »`} : ça s'écrit ${spell(r.target)}.${accent}`;
  }
  const w = r.target, letters = w.length <= 4 ? w.split('').join(' puis ') : w;
  // Un intrus est-il la cible avec deux lettres échangées (b ↔ d…) ?
  const swapped = (x: string, y: string) => r.options.includes(w.replace(new RegExp(`[${x}${y}]`, 'g'), (c) => (c === x ? y : x)));
  if (/[bd]/.test(w) && swapped('b', 'd')) return `Attention au b et au d : le ventre du b est à droite, celui du d à gauche. Ici : ${w}.`;
  if (/[pq]/.test(w) && swapped('p', 'q')) return `Attention au p et au q : la boucle du p est à droite. Ici : ${w}.`;
  if (/[pb]/.test(w) && swapped('p', 'b')) return `Attention au p et au b : le p descend, le b monte. Ici : ${w}.`;
  if (w.length === 2 && r.options.includes(w[1]! + w[0]!)) return `On lit de gauche à droite : ${letters}.${q.fmt === 'qcm' ? '' : ` Ça fait « ${r.say} ».`}`;
  return q.fmt === 'qcm' ? `Cherche le même mot, lettre par lettre : ${letters}.` : `On entend « ${r.say} » : ça s'écrit ${letters}.`;
}

/** Phrase lue : les mots qui font choisir le bon dessin (ceux qui le distinguent d'au moins un intrus). */
function phraseTip(r: NonNullable<TipQ['read']>): string {
  const right = PICS[r.pic!].keys, others = r.options.filter((o) => o !== r.pic).map((o) => PICS[o as keyof typeof PICS].keys);
  const clue = right.filter((k) => others.some((x) => !x.includes(k)));
  const quoted = clue.map((k) => `« ${k} »`), words = quoted.length > 1 ? `${quoted.slice(0, -1).join(', ')} et ${quoted[quoted.length - 1]}` : quoted.join('');
  return `Relis la phrase mot à mot : ${r.target} ${clue.length > 1 ? `Les mots ${words} disent` : `Le mot ${words} dit`} quel dessin choisir : ${PICS[r.pic!].label}.`;
}

/** Astuce adaptée au calcul, quelle que soit l'opération. */
export function tipOf(q: TipQ): string {
  return q.op === 'mul' ? tipFor(q.a, q.b) : q.op === 'div' ? divTip(q.a, q.b) : q.op === 'fr' ? frTip(q) : q.op === 'lec' ? lecTip(q) : q.op === 'num' ? numTip(q) : q.op === 'frac' ? (q.frac?.tip ?? '') : q.op === 'add' ? addTip(q.a, q.b) : q.op === 'sub' ? subTip(q.a, q.b) : engTip(q);
}

/** Bulle d'accueil. */
/** `of` : complément de l'île en cours, « de la Plage », « du Lagon ». */
export const HELLO = (p: { name: string; streak: number; of: string; step: number }): string[] =>
  p.streak === 0
    ? [`Salut ${p.name} ! On lance une série aujourd'hui ?`]
    : [`Salut ${p.name} ! On repart sur l'île ${p.of} ?`, `Coucou ${p.name} ! On attaque l'étape ${p.step} ?`, `${p.streak} jour${p.streak > 1 ? 's' : ''} de suite, ${p.name} ! On continue ?`];

/** Réactions du Pépin quand on le touche. */
export const PEP_LINES = ['Hi hi, ça chatouille !', 'On joue ?', 'Encore une étoile et je grandis !', "Tu es en forme aujourd'hui !"];

export const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const plural = (n: number, one: string, many: string): string => (n > 1 ? many : one);
export const goodAnswers = (n: number): string => `${n} bonne${n > 1 ? 's' : ''} réponse${n > 1 ? 's' : ''}`;
