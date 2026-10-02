import { mix } from './color';

/** Couleur d'île : uniquement dans les écrans d'île et de question (règle des zones). */
export function applyIsleTheme(fort: string, clair: string): void {
  const r = document.documentElement.style;
  r.setProperty('--ile', fort);
  r.setProperty('--ile-clair', clair);
  r.setProperty('--ile-sombre', mix(fort, '#000000', 0.22));
}

/** Couleur de profil : uniquement dans les zones de l'enfant. */
export function applyProfileTheme(color: string): void {
  const r = document.documentElement.style;
  r.setProperty('--profil', color);
  r.setProperty('--profil-sol', mix(color, '#FFFFFF', 0.22));
}
