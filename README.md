# Multîles

Application web progressive (PWA) pour apprendre les tables de multiplication de 1 à 10, destinée aux enfants de 9 ans. Installable, 100 % hors ligne après le premier chargement, aucune donnée ne quitte l'appareil.

Référence de design et de règles : `docs/prototype/multiles-prototype.html` (prototype validé) et `docs/prompt-claude-code-multiles.md`.

## Commandes

| Commande | Effet |
|---|---|
| `npm install` | Installe les dépendances. |
| `npm run dev` | Serveur de développement : http://localhost:5173 (atelier des illustrations : `/lab.html`). |
| `npm run build` | Build de production dans `dist/` (avec service worker et manifest). |
| `npm run preview` | Sert le build : http://localhost:4173. |
| `npm test` | Tests unitaires Vitest (moteur de jeu et stockage). |
| `npm run test:e2e` | Tests Playwright : parcours, parité avec le prototype, PWA, accessibilité. Première fois : `npx playwright install chromium`. |
| `npm run icons` | Régénère les icônes de `public/icons/` depuis le logo. |

Les captures comparées avec le prototype sont écrites dans `test-results/screens/` (prototype | application | différences).

## Organisation

- `src/design/` : jetons de couleur, polices auto-hébergées, styles du prototype.
- `src/art/` : illustrations SVG portées du prototype (Pépin, avatar, îles, gardiens, maison, stickers, icônes).
- `src/content/` : catalogues et textes (îles, boutique, messages).
- `src/engine/` : logique de jeu pure (questions, sessions, récompenses, maîtrise, pièges, série, défi du jour, chrono).
- `src/store/` : modèle de données, IndexedDB, migrations versionnées.
- `src/screens/`, `src/app/` : écrans et navigation interne.
- `src/audio/` : carillons WebAudio et lecture à voix haute (fr-FR, masquée sans voix française).

## Déploiement

Le build est un site statique (`dist/`), à déposer tel quel. Les chemins sont relatifs : il fonctionne à la racine d'un domaine comme dans un sous-dossier. Le HTTPS est obligatoire pour l'installation.

En-têtes de cache conseillés chez l'hébergeur, pour que les mises à jour arrivent vite :

- `sw.js`, `index.html`, `manifest.webmanifest` : `Cache-Control: no-cache`
- `assets/*` (noms avec empreinte) : `Cache-Control: public, max-age=31536000, immutable`

Une nouvelle version est proposée au parent dans l'espace parent (« Mettre à jour maintenant »), jamais pendant une session de l'enfant.
