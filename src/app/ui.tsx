/* Éléments communs aux écrans, fidèles au balisage du prototype. */
import type { ComponentChildren, CSSProperties } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { icoBack, icoSay, icoTabGrid, icoTabHome, icoTabTreasure, svgHtml } from '../art';
import { canSpeak, onVoiceChange, speak } from '../audio';
import { useApp } from './context';

/** Vrai si une voix française est disponible (sinon les boutons Écouter sont masqués). */
export function useCanSpeak(): boolean {
  const [ok, setOk] = useState(canSpeak());
  useEffect(() => onVoiceChange(setOk), []);
  return ok;
}

/** Délai avant une lecture automatique. */
export const AUTO_SAY_DELAY = 250;

/** Lecture automatique (réglage du profil) : lit `text` à l'affichage, puis à chaque changement de `key`. */
export function useAutoSay(text: string | null, key: unknown = text): void {
  const { player } = useApp();
  const on = !!player?.autoSpeech;
  const latest = useRef(text);
  latest.current = text;
  useEffect(() => {
    if (!on || !latest.current) return;
    // Petit délai : laisse l'écran s'afficher et le son de clic se terminer.
    const t = setTimeout(() => latest.current && speak(latest.current), AUTO_SAY_DELAY);
    return () => clearTimeout(t);
  }, [on, key]);
}

interface SayProps {
  /** Texte lu, ou fonction appelée au moment du tap. */
  text: string | (() => string);
  label?: string;
  id?: string;
  class?: string;
  style?: CSSProperties | string;
  /** Icône enveloppée dans un <span> (variante des feuilles d'aide et fenêtres du prototype). */
  wrap?: boolean;
}

/** Bouton « Écouter » (56 × 56). */
export function BtnSay({ text, label = 'Écouter', id, class: cls, style, wrap }: SayProps) {
  const ok = useCanSpeak();
  const [speaking, setSpeaking] = useState(false);
  if (!ok) return null;
  return (
    <button
      class={`btn-say${speaking ? ' speaking' : ''}${cls ? ' ' + cls : ''}`}
      id={id}
      style={style}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        setSpeaking(true);
        speak(typeof text === 'function' ? text() : text, () => setSpeaking(false));
      }}
    >
      {wrap ? <span {...svgHtml(icoSay)} /> : <Svg html={icoSay} />}
      <span>Écouter</span>
    </button>
  );
}

export function BackChip({ label, aria, onClick, id }: { label: string; aria: string; onClick: () => void; id?: string }) {
  return (
    <button class="btn-chip" id={id} aria-label={aria} onClick={onClick}>
      <span style={{ display: 'contents' }} {...svgHtml(icoBack)} />
      {label}
    </button>
  );
}

type Tab = 'home' | 'grid' | 'treasure';

/** Barre d'onglets : Accueil, Ma grille, Trésors (3 au maximum). */
export function TabBar({ current }: { current: Tab }) {
  const { go } = useApp();
  const tab = (t: Tab, ico: string, label: string) => (
    <button
      class="tabbtn"
      aria-current={current === t ? 'page' : undefined}
      onClick={() => {
        if (t === current) return;
        go(t === 'home' ? { name: 'home' } : t === 'grid' ? { name: 'grid' } : { name: 'shop' });
      }}
    >
      <span style={{ display: 'contents' }} {...svgHtml(ico)} />
      {label}
    </button>
  );
  return (
    <nav class="tabbar" aria-label="Navigation">
      {tab('home', icoTabHome, 'Accueil')}
      {tab('grid', icoTabGrid, 'Ma grille')}
      {tab('treasure', icoTabTreasure, 'Trésors')}
    </nav>
  );
}

/** Fenêtre de surprise (trophée, sticker, bouée…) : focus sur le bouton principal, Échap pour fermer, focus rendu à la fermeture. */
export function Overlay({ children, onBackdrop, onClose }: { children: ComponentChildren; onBackdrop?: () => void; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const card = ref.current;
    card?.querySelector<HTMLElement>('.btn-primary, .btn-isle')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') (onClose ?? onBackdrop)?.();
      if (e.key === 'Tab' && card) {
        // Le focus reste dans la fenêtre.
        const f = [...card.querySelectorAll<HTMLElement>('button')];
        if (!f.length) return;
        const i = f.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length]!.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      before?.focus?.();
    };
  }, []);
  return (
    <div class="overlay" onClick={(e) => { if (e.target === e.currentTarget) onBackdrop?.(); }}>
      <div class="ov-card" ref={ref} role="dialog" aria-modal="true" aria-labelledby="ov-title">{children}</div>
    </div>
  );
}

/** Raccourci : <Svg html={...} /> injecte un SVG sans conteneur visible. */
export const Svg = ({ html }: { html: string }) => <span style={{ display: 'contents' }} {...svgHtml(html)} />;

export const reducedMotion = (): boolean => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
