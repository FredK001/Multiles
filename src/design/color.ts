/** Mélange linéaire de deux couleurs #RRGGBB (f = 0 → h, f = 1 → t). Identique au prototype. */
export function mix(h: string, t: string, f: number): string {
  const a = [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(t.substr(i, 2), 16));
  return '#' + a.map((v, i) => Math.round(v + (b[i]! - v) * f).toString(16).padStart(2, '0')).join('');
}

export function darken(h: string, f = 0.72): string {
  return mix(h, '#000000', 1 - f);
}

/** Luminance relative WCAG 2.1. */
export function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.substr(i, 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rapport de contraste WCAG entre deux couleurs #RRGGBB. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
