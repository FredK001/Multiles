/* Dessins des mots d'anglais (viewBox 0 0 100 100, trait d'encre comme le reste de l'app).
   Un mot sans dessin ici est montré par son mot français (voir WordPic). Les thèmes sont dessinés un par un. */
import type { ThemeId } from '../content/english';
import { INK } from './shapes';

const svg = (body: string, s: number): string => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;

/** Couleurs : une tache de peinture. */
const COLOUR_FILL: Record<string, string> = {
  red: '#D62828', yellow: '#FFD23F', green: '#2E9E44', blue: '#2F6FE4', orange: '#F28C28', purple: '#7B3FB8',
  pink: '#F48FB1', brown: '#8B5A2B', black: '#1E2440', white: '#FFFFFF', grey: '#9AA0AE',
};
const splash = (c: string) =>
  `<path d="M50 12 C62 10 66 22 74 22 C86 22 92 34 86 44 C82 52 92 60 86 70 C80 80 68 76 62 84 C56 92 42 90 38 82 C34 74 20 80 14 70 C8 60 18 52 14 44 C10 34 20 24 30 26 C38 28 40 14 50 12Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` +
  `<circle cx="88" cy="18" r="5" fill="${c}" stroke="${INK}" stroke-width="3"/><circle cx="12" cy="88" r="4" fill="${c}" stroke="${INK}" stroke-width="3"/>`;

/** Nombres : des points rangés comme sur un dé (deux rangées de 5 au plus). */
const NUMBER_OF: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
function dots(n: number): string {
  const rows = n > 5 ? [5, n - 5] : [n], out: string[] = [];
  rows.forEach((k, r) => {
    const y = rows.length === 1 ? 50 : 34 + r * 32;
    for (let i = 0; i < k; i++) out.push(`<circle cx="${50 + (i - (k - 1) / 2) * 18}" cy="${y}" r="7.5" fill="#FFC93C" stroke="${INK}" stroke-width="3"/>`);
  });
  return `<rect x="4" y="14" width="92" height="72" rx="16" fill="#fff" stroke="${INK}" stroke-width="4"/>` + out.join('');
}

type Drawer = (en: string) => string | null;

const DRAWERS: Partial<Record<ThemeId, Drawer>> = {
  hello: (en) => (en in COLOUR_FILL ? splash(COLOUR_FILL[en]!) : en in NUMBER_OF ? dots(NUMBER_OF[en]!) : null),
};

/** Dessin d'un mot, ou null s'il n'est pas (encore) dessiné. */
export function wordArt(theme: ThemeId, en: string, size = 100): string | null {
  const body = DRAWERS[theme]?.(en);
  return body ? svg(body, size) : null;
}

/** Indices des phrases oui/non : visage qui sourit ou non, geste coché ou barré. */
export function cueArt(cue: 'like' | 'dislike' | 'can' | 'cant', size = 56): string {
  if (cue === 'like' || cue === 'dislike') {
    const mouth = cue === 'like' ? 'M32 60 Q50 76 68 60' : 'M32 70 Q50 56 68 70';
    return svg(`<circle cx="50" cy="50" r="42" fill="${cue === 'like' ? '#FFC93C' : '#C9CEDB'}" stroke="${INK}" stroke-width="5"/><circle cx="36" cy="40" r="5" fill="${INK}"/><circle cx="64" cy="40" r="5" fill="${INK}"/><path d="${mouth}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`, size);
  }
  return cue === 'can'
    ? svg(`<circle cx="50" cy="50" r="42" fill="#157F45" stroke="${INK}" stroke-width="5"/><path d="M30 52 L45 66 L72 36" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`, size)
    : svg(`<circle cx="50" cy="50" r="42" fill="#C8371D" stroke="${INK}" stroke-width="5"/><path d="M34 34 L66 66 M66 34 L34 66" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`, size);
}
