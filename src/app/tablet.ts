/* Tablette : l'app (dessinée pour une colonne de téléphone de 600 px au plus) est agrandie d'un facteur --k
   pour remplir l'écran ; en paysage, l'écran de question s'élargit (deux colonnes, voir app.css).
   Sur téléphone, --k reste à 1 : rien ne change. */

/** Taille de référence de la colonne en portrait ; hauteurs de référence en paysage (mise en page large). */
const REF_W = 600, REF_H = 880, LAND_H = 720, LAND_H_PHONE = 560;
const MAX_K = 1.8, MIN_K_PHONE = 0.62;

/** Facteur d'agrandissement pour un écran w × h. */
export function tabletScale(w: number, h: number): number {
  if (w < 640) return 1;
  // Paysage : la hauteur décide. Un téléphone couché (moins de 600 px de haut) passe sous 1 :
  // la mise en page large y tient en entier, un peu réduite, au lieu d'une colonne qui déborde.
  if (w > h) {
    const phone = h < 600, k = h / (phone ? LAND_H_PHONE : LAND_H);
    return Math.round(Math.min(MAX_K, Math.max(phone ? MIN_K_PHONE : 1, phone ? Math.min(1, k) : k)) * 100) / 100;
  }
  return Math.round(Math.min(MAX_K, Math.max(1, Math.min(w / REF_W, h / REF_H))) * 100) / 100;
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
