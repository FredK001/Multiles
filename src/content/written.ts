/* Outils communs aux matières « trois réponses écrites » du CM1 (grands nombres, mesures) :
   l'écriture des nombres avec l'espace des milliers, et l'énoncé tel que la voix doit le dire. */

/** Une question écrite : énoncé, bonne réponse, deux intrus, astuce ; une horloge éventuelle (mesures). */
export interface WrittenItem {
  /** Énoncé (lu et affiché). */
  q: string;
  /** Bonne réponse et deux intrus (textes affichés sur les boutons). */
  a: string;
  x: readonly [string, string];
  /** Le truc pour réussir. */
  tip: string;
  /** Horloge à aiguilles à lire (heures de 1 à 12, minutes de 0 à 55). */
  clock?: Clock;
}

export interface Clock {
  h: number;
  m: number;
}

/** Espace des milliers : espace fine insécable (typographie française), jamais coupée en fin de ligne. */
export const THOU = '\u202f';

/** « 4532 » → « 4 532 », « 1250000 » → « 1 250 000 » (espace fine insécable). */
export const fmtNum = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, THOU);

/** « 3 000 » écrit avec une espace ordinaire → espace fine insécable (le nombre ne se coupe pas en fin de ligne). */
export const thin = (s: string): string => s.replace(/(\d) (?=\d{3}(?!\d))/g, `$1${THOU}`);

/** Toutes les écritures d'une liste de questions passées par `thin`. */
export const thinAll = (items: readonly WrittenItem[]): WrittenItem[] =>
  items.map((it) => ({ ...it, q: thin(it.q), a: thin(it.a), x: [thin(it.x[0]), thin(it.x[1])] as const, tip: thin(it.tip) }));

/** Heure affichée : « 9 h 45 », « 9 h 05 », « 9 h » pile. */
export const fmtHour = (h: number, m: number): string => (m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`);

/** Unités, au singulier et au pluriel, pour la voix (« 3 cm » est lu « 3 centimètres »). */
const UNIT_WORDS: Record<string, [string, string]> = {
  km: ['kilomètre', 'kilomètres'], m: ['mètre', 'mètres'], cm: ['centimètre', 'centimètres'], mm: ['millimètre', 'millimètres'],
  kg: ['kilogramme', 'kilogrammes'], g: ['gramme', 'grammes'], L: ['litre', 'litres'], cL: ['centilitre', 'centilitres'], mL: ['millilitre', 'millilitres'],
  h: ['heure', 'heures'], min: ['minute', 'minutes'], s: ['seconde', 'secondes'],
};
const UNIT_RE = 'km|mm|cm|m|kg|g|cL|mL|L|min|h|s';

/** Texte à dire : « 4 532 » est lu comme un seul nombre, les signes et les unités en mots.
    « 3 m = ? cm » → « 3 mètres égale combien de centimètres ? » ; « 47 ÷ 5 » → « 47 divisé par 5 ». */
export function sayMaths(s: string): string {
  const out = s
    // Espace des milliers retirée : la voix lirait « 4 » puis « 532 ».
    .replace(/(\d)[\u202f\u00a0 ](?=\d{3}(?!\d))/g, '$1')
    .replace(new RegExp(`\\? (${UNIT_RE})(?![\\p{L}])`, 'gu'), (_, u: string) => `combien de ${UNIT_WORDS[u]![1]}`)
    // « 9 h 45 » : « 9 heures 45 » (les minutes ne sont pas suivies de « min »).
    .replace(/(\d+) h (\d+)(?!\d| ?min)/g, (_, h: string, m: string) => `${h} ${Number(h) > 1 ? 'heures' : 'heure'} ${Number(m)}`)
    .replace(new RegExp(`(\\d+) (${UNIT_RE})(?![\\p{L}])`, 'gu'), (_, n: string, u: string) => `${n} ${UNIT_WORDS[u]![Number(n) > 1 ? 1 : 0]}`)
    .replace(/ × /g, ' fois ')
    .replace(/ ÷ /g, ' divisé par ')
    .replace(/ \+ \? /g, ' plus combien ')
    .replace(/ \+ /g, ' plus ')
    .replace(/ − /g, ' moins ')
    .replace(/ = \?/g, ' égale combien ?')
    .replace(/ = /g, ' égale ')
    .replace(/ < /g, ' est plus petit que ')
    .replace(/ > /g, ' est plus grand que ');
  // « 3 m = ? cm » : le point d'interrogation, remplacé par « combien », est remis à la fin pour l'intonation.
  return s.includes('?') && !out.includes('?') ? `${out} ?` : out;
}
