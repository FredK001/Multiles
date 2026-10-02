import { useLayoutEffect } from 'preact/hooks';
import { applyIsleTheme, applyProfileTheme } from '../design/theme';

/** Couleur d'île (écrans d'île et de question), appliquée avant l'affichage. */
export function useIsleTheme(fort: string, clair: string): void {
  useLayoutEffect(() => applyIsleTheme(fort, clair), [fort, clair]);
}

/** Couleur de profil (zones de l'enfant), appliquée avant l'affichage. */
export function useProfileTheme(color: string): void {
  useLayoutEffect(() => applyProfileTheme(color), [color]);
}
