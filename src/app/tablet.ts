/* Tablette : l'app (dessinée pour une colonne de téléphone de 600 px au plus) est agrandie d'un facteur --k
   pour remplir l'écran ; en paysage, l'écran de question s'élargit (deux colonnes, voir app.css).
   Sur téléphone, --k reste à 1 : rien ne change. */

/** Hauteur de référence de la colonne : en dessous, on n'agrandit pas (le contenu ne tiendrait plus). */
const REF_W = 600, REF_H = 880;
const MAX_K = 1.8;

/** Facteur d'agrandissement pour un écran w × h. */
export function tabletScale(w: number, h: number): number {
  if (w < 640) return 1;
  // Paysage : la hauteur décide (la colonne s'élargit ailleurs) ; portrait : largeur et hauteur.
  const k = w > h ? h / (REF_H - 80) : Math.min(w / REF_W, h / REF_H);
  return Math.round(Math.min(MAX_K, Math.max(1, k)) * 100) / 100;
}

function apply(): void {
  const k = tabletScale(innerWidth, innerHeight), s = document.documentElement.style;
  s.setProperty('--k', String(k));
  // Largeur disponible avant agrandissement (pour l'écran de question en paysage).
  s.setProperty('--vw', `${Math.floor(innerWidth / k)}px`);
}

export function installTabletFit(): void {
  apply();
  addEventListener('resize', apply);
  addEventListener('orientationchange', apply);
}
