export const INK = '#1E2440';

/** Étincelle à 4 branches. */
export const sparkle = (cx: number, cy: number, r: number, fill = '#FFC93C'): string =>
  `<path d="M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r}Z" fill="${fill}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;

/** Trait épais cerné d'encre. */
export function line(x1: number, y1: number, x2: number, y2: number, col: string, w: number): string {
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${INK}" stroke-width="${w + 5}" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
}

/** Retire la balise <svg> englobante pour réutiliser un dessin dans un autre SVG. */
export const svgInner = (svg: string): string => svg.replace(/<svg[^>]*>/, '').replace('</svg>', '');
