/* Carillons WebAudio, uniquement positifs (aucun son négatif). Repris du prototype. */
export type ChimeKind = 'ok' | 'combo' | 'help';

let ctx: AudioContext | null = null;
let enabled = true;
let lastTap: OscillatorNode | null = null;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

function audioContext(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

/** À appeler lors du premier geste de l'utilisateur (contrainte iOS et Chrome). */
export function unlockAudio(): void {
  try {
    const ac = audioContext();
    if (ac && ac.state === 'suspended') void ac.resume();
  } catch {
    /* audio indisponible : l'app reste muette */
  }
}

/** « Pop » discret joué à chaque appui sur un bouton. */
export function tap(): void {
  if (!enabled) return;
  try {
    const AC = audioContext();
    if (!AC || AC.state !== 'running') return;
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = 'sine';
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(440, t + 0.05);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o.connect(g).connect(AC.destination);
    o.start(t);
    o.stop(t + 0.09);
    lastTap = o;
  } catch {
    /* ignoré */
  }
}

export function chime(kind: ChimeKind): void {
  if (!enabled) return;
  try {
    // Le carillon d'une bonne réponse part du même appui : on coupe le clic pour qu'il reste net.
    lastTap?.stop();
    lastTap = null;
    const AC = audioContext();
    if (!AC) return;
    const notes = kind === 'ok' ? [784, 1047] : kind === 'combo' ? [784, 988, 1319] : [392, 440];
    notes.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * 0.09;
      o.type = kind === 'help' ? 'sine' : 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(kind === 'help' ? 0.08 : 0.14, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      o.connect(g).connect(AC.destination);
      o.start(t);
      o.stop(t + 0.35);
    });
  } catch {
    /* ignoré */
  }
}
