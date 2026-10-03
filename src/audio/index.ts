import { tap, unlockAudio } from './chime';
import { unlockSpeech } from './speech';

export { chime, tap, setSoundEnabled, type ChimeKind } from './chime';

/** Petit bruit de clic sur chaque bouton actif (souris, doigt ou clavier). */
export function installTapSound(): void {
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as Element | null)?.closest?.('button, [role="button"]');
      if (!el || el.matches('[disabled], [aria-disabled="true"]')) return;
      tap();
    },
    true,
  );
}
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
