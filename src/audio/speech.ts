/* Lecture à voix haute en français, et en anglais pour les îles d'anglais.
   Seules les voix installées sur l'appareil (localService) sont retenues : elles marchent hors ligne.
   Sans voix française, les boutons « Écouter » sont masqués plutôt que de lire avec une voix étrangère ;
   sans voix anglaise, l'anglais n'est pas lu (les questions d'écoute deviennent des questions dessin → mot). */

export type Lang = 'fr' | 'en';

/** Morceau de texte avec sa langue : « Écoute et touche le bon dessin. » puis « apple ». */
export interface SayPart {
  text: string;
  lang: Lang;
}

/** Texte lu : une chaîne est en français. */
export type Speakable = string | readonly SayPart[];

/** Langue préférée (accent de l'école : anglais britannique, « rubber », « lorry »), puis toute variante. */
const PREFERRED: Record<Lang, string> = { fr: 'fr-fr', en: 'en-gb' };
/** Débit : un peu lent en français, plus lent en anglais pour qu'un enfant distingue chaque mot. */
const RATE: Record<Lang, number> = { fr: 0.92, en: 0.82 };

const voices: Record<Lang, SpeechSynthesisVoice | null> = { fr: null, en: null };
const listeners = new Set<() => void>();

const supported = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

const norm = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase();

/** Voix installée sur l'appareil pour la langue, la variante préférée d'abord. */
function findVoice(lang: Lang): SpeechSynthesisVoice | null {
  if (!supported()) return null;
  const all = speechSynthesis.getVoices().filter((v) => norm(v).startsWith(lang) && v.localService);
  return all.find((v) => norm(v) === PREFERRED[lang]) ?? all[0] ?? null;
}

function refresh(): void {
  const before = `${!!voices.fr}${!!voices.en}`;
  voices.fr = findVoice('fr');
  voices.en = findVoice('en');
  if (before !== `${!!voices.fr}${!!voices.en}`) listeners.forEach((l) => l());
}

if (supported()) {
  refresh();
  speechSynthesis.addEventListener?.('voiceschanged', refresh);
}

/** Une voix de cette langue est-elle disponible ? */
export const canSpeak = (lang: Lang = 'fr'): boolean => voices[lang] !== null;

/** Appelle `fn(ok)` quand la disponibilité de la voix de cette langue change. */
export function onVoiceChange(fn: (ok: boolean) => void, lang: Lang = 'fr'): () => void {
  let last = canSpeak(lang);
  const l = () => {
    if (canSpeak(lang) !== last) fn((last = canSpeak(lang)));
  };
  listeners.add(l);
  return () => listeners.delete(l);
}

const partsOf = (text: Speakable): readonly SayPart[] => (typeof text === 'string' ? [{ text, lang: 'fr' }] : text);

/** Au moins un morceau du texte peut être lu (bouton « Écouter » affiché). */
export const canSay = (text: Speakable): boolean => partsOf(text).some((p) => p.text.trim() && canSpeak(p.lang));

/** Débloque la synthèse au premier geste (iOS) en prononçant un texte vide. */
export function unlockSpeech(): void {
  if (!supported()) return;
  refresh();
  try {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    speechSynthesis.speak(u);
  } catch {
    /* ignoré */
  }
}

export function stopSpeech(): void {
  if (supported()) speechSynthesis.cancel();
}

/** Lit un texte, ou une suite de morceaux dans leurs langues ; les morceaux sans voix sont sautés.
    `onEnd` est appelé une fois, à la fin du dernier morceau (état « en cours de lecture » du bouton). */
export function speak(text: Speakable, onEnd?: () => void): void {
  const parts = supported() ? partsOf(text).filter((p) => p.text.trim() && voices[p.lang]) : [];
  if (!parts.length) {
    onEnd?.();
    return;
  }
  try {
    speechSynthesis.cancel();
    parts.forEach((p, i) => {
      const v = voices[p.lang]!, u = new SpeechSynthesisUtterance(p.text);
      u.lang = v.lang;
      u.rate = RATE[p.lang];
      try {
        u.voice = v;
      } catch {
        /* voix refusée par le navigateur : la langue suffit */
      }
      if (onEnd && i === parts.length - 1) u.onend = u.onerror = () => onEnd();
      speechSynthesis.speak(u);
    });
  } catch {
    onEnd?.();
  }
}
