import { unlockAudio } from './chime';
import { unlockSpeech } from './speech';

export { chime, setSoundEnabled, type ChimeKind } from './chime';
export { speak, stopSpeech, canSpeak, onVoiceChange } from './speech';

/** Débloque l'AudioContext et la synthèse vocale au premier geste de l'utilisateur. */
export function installAudioUnlock(): void {
  const once = () => {
    unlockAudio();
    unlockSpeech();
    window.removeEventListener('pointerdown', once, true);
    window.removeEventListener('keydown', once, true);
  };
  window.addEventListener('pointerdown', once, true);
  window.addEventListener('keydown', once, true);
}
