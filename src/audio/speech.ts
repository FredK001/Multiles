/* Lecture à voix haute en français. Sans voix française disponible hors ligne,
   les boutons « Écouter » sont masqués plutôt que de lire avec une voix anglaise. */
let voice: SpeechSynthesisVoice | null = null;
const listeners = new Set<(ok: boolean) => void>();

const supported = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

/** Voix française installée sur l'appareil (localService) : utilisable hors ligne. */
function findVoice(): SpeechSynthesisVoice | null {
  if (!supported()) return null;
  const fr = speechSynthesis.getVoices().filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('fr') && v.localService);
  return fr.find((v) => v.lang.replace('_', '-').toLowerCase() === 'fr-fr') ?? fr[0] ?? null;
}

function refresh(): void {
  const before = voice !== null;
  voice = findVoice();
  if (before !== (voice !== null)) listeners.forEach((l) => l(voice !== null));
}

if (supported()) {
  refresh();
  speechSynthesis.addEventListener?.('voiceschanged', refresh);
}

export const canSpeak = (): boolean => voice !== null;

export function onVoiceChange(fn: (ok: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

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

/** Lit un texte ; `onEnd` est appelé à la fin (pour l'état « en cours de lecture » du bouton). */
export function speak(text: string, onEnd?: () => void): void {
  if (!supported() || !voice) {
    onEnd?.();
    return;
  }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice.lang;
    u.rate = 0.92;
    try {
      u.voice = voice;
    } catch {
      /* voix refusée par le navigateur : la langue fr-FR suffit */
    }
    if (onEnd) u.onend = u.onerror = () => onEnd();
    speechSynthesis.speak(u);
  } catch {
    onEnd?.();
  }
}
