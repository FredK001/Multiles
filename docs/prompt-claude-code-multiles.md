# Mission : réaliser la PWA Multîles à partir du prototype validé

## Contexte

Multîles est une application mobile pour apprendre les tables de multiplication de 1 à 10. Elle s'adresse à des enfants de 9 ans (CM1), qui l'utilisent seuls, au pouce, en sessions de 3 à 5 minutes.

Le fichier `docs/prototype/multiles-prototype.html` est un prototype haute fidélité **validé écran par écran par le client**. Il est la **référence absolue** pour :
- le design : couleurs, typographie, reliefs, tailles, animations ;
- les textes de l'interface ;
- les illustrations SVG ;
- les parcours ;
- les règles de jeu.

Lis-le en entier avant d'écrire la moindre ligne. En cas de doute sur un comportement, le prototype fait foi. Si le prototype et ce document se contredisent, signale-le-moi au lieu de trancher seul.

À ignorer dans le prototype :
- le panneau de revue à droite (`<aside class="review">`) et tout le code associé (`renderReview`, simulateurs, boutons `data-sim`, `data-tm`, `data-miss`, `data-ef`, `data-ex`, etc.) ;
- les données de démonstration (`SEED`, profils Léa, Noah, Inès, Sami) ;
- la constante `today=4` codée en dur (vendredi), et toute valeur fictive (`mins`, `sessions`, `trapErr`, `records` initiaux).

## Objectif

Une PWA de production :
- installable ;
- 100 % hors ligne après le premier chargement ;
- sans aucun appel réseau à l'usage ;
- fidèle au pixel près au prototype, en portrait 390 px, et utilisable sur tablette.

## Stack attendue

- Vite + TypeScript strict.
- React (ou Preact si tu le juges plus adapté au poids du bundle, à justifier).
- `vite-plugin-pwa` (Workbox) : manifest, service worker en precache de tous les assets, mise à jour avec invite discrète côté parent uniquement, jamais au milieu d'une session enfant.
- Stockage local : IndexedDB, via `idb-keyval` ou Dexie. Appeler `navigator.storage.persist()` au premier lancement. Aucune donnée ne quitte l'appareil.
- Polices Fredoka (500, 600, 700) et Nunito (600 à 900) auto-hébergées en woff2, avec des piles de secours. Pas de Google Fonts en ligne.
- Tests :
  - Vitest pour le moteur de jeu ;
  - Playwright pour les parcours, plus des captures comparatives avec le prototype.
- Aucune librairie d'UI : tout le style vient du prototype (CSS custom properties).

## Architecture souhaitée

- `src/design/` : tokens (variables CSS du `:root` du prototype), styles globaux, utilitaires (`mix`, contraste).
- `src/art/` : composants SVG portés depuis les générateurs du prototype. Mêmes géométries, mêmes couleurs, rendu identique :
  - `mascot` (Pépin : 3 variantes, 4 stades, humeurs, habillage `pepWear`) ;
  - `avatar` (visage, coiffure, peau, cheveux, accessoires, tenues) ;
  - `islandArt` et `decorSvg` (10 îles) ;
  - `bossSvg` (gardiens) ;
  - `houseSvg` et `houseItem` (maison du Pépin) ;
  - `stickerArt` ;
  - les icônes.
- `src/engine/` : logique pure, testable sans DOM :
  - génération des questions (`makeQ`, 4 formats) ;
  - sessions ;
  - chrono ;
  - récompenses ;
  - maîtrise ;
  - pièges ;
  - déblocages ;
  - série de jours et bouées ;
  - défi du jour.
- `src/store/` : modèle de données, persistance IndexedDB, migrations versionnées.
- `src/screens/` : un composant par écran.
- `src/audio/` : carillons WebAudio (`chime`) et lecture à voix haute (`speechSynthesis`, fr-FR).
- Routage par état interne (pas d'URL profonde nécessaire). Le bouton retour Android doit se comporter comme le bouton Retour ou Quitter de chaque écran.

## Écrans à réaliser (tous présents dans le prototype)

1. Qui joue ?
2. Création de profil (Prénom, Avatar, Pépin)
3. Éditeur d'avatar
4. Accueil
5. Carte des îles
6. Détail d'une île, avec Découvrir et Défi chrono
7. Écran de question (4 formats)
8. Feedback bonne réponse / erreur
9. Fin de session et récompenses
10. Grille de Pythagore et pièges
11. Boutique (Moi, Pépin, Maison)
12. Album de stickers et trophées
13. Espace parent

Plus deux écrans complémentaires :
- Découvrir la table ;
- l'écran de question en mode chronométré (défi chrono, défi du jour, gardien).

## Règles de jeu (telles qu'implémentées dans le prototype)

**Îles et étapes**
- Les îles 1, 2, 5 et 10 sont ouvertes au départ.
- Déblocage par nombre de trophées : 3 et 4 → 2 trophées, 6 et 7 → 4, 8 et 9 → 6.
- Chaque île a 3 étapes : ×1 à ×5, ×6 à ×10, toute la table. Une étape s'ouvre quand la précédente est réussie.
- Le gardien (toute la table, 10 questions) s'ouvre après les 3 étapes. Noms : Coquillo, Lianor, Pommax, Sablor, Glaçor, Sucrette, Magmo, Ventor, Nimbo, Astro.

**Session classique**
- 10 questions, formats alternés : pavé, QCM à 3 choix, facteur manquant, vrai/faux.
- Une erreur remet la question en fin de file.

**Étoiles d'une étape**
- Réponses justes du premier coup : 9 ou plus → 3 étoiles ; 7 ou plus → 2 ; sinon 1. Jamais 0.
- Rejouer une étape n'ajoute que l'amélioration.

**Trophée**
- Gardien réussi avec au moins 8 réponses justes du premier coup, et sans dépassement du temps.

**Pièces**
- +1 par bonne réponse (pièce qui vole vers le compteur).
- +2 par étoile en fin de session.
- +20 au défi du jour réussi.
- Les pièces sont conservées si l'enfant quitte en cours de session.

**Niveau du Pépin**
- XP : +0,12 + 0,06 × étoiles par session ; +0,10 + 0,04 × étoiles en mode chrono. Passage de niveau à 1.
- Stades : niveau 5, 12, puis 20.

**Maîtrise (grille)**
- Une multiplication réussie du premier coup est maîtrisée. Sa symétrique se colore aussi.

**Pièges**
- Toute erreur ajoute la multiplication (ou sa symétrique) aux pièges.
- Un piège réussi du premier coup en sort.

**Stickers (3 par île)**
- Lieu : 50 % de chance en fin de session à 3 étoiles.
- Gardien : en le battant.
- Pépin sur l'île : 9 étoiles sur l'île.

**Chrono**
- Défi chrono : 60 s, questions illimitées sur la table, record personnel par table. S'ouvre après l'étape 1.
- Défi du jour : 60 s, objectif 8 bonnes réponses.
- Gardien : durée réglée par le parent (2 min, 3 min, ou sans chrono).
- La barre passe en miel, jamais en rouge, sous 10 s.
- Le chrono est en pause pendant le feedback d'erreur.
- Le feedback de bonne réponse dure 0,65 s en mode chrono et 1,5 s sinon.

**Bouées**
- Une bouée sauve la série en cas de jour manqué.
- On en gagne une tous les 7 jours consécutifs, 2 au maximum.
- Sans bouée, la série repart à 0 mais le record est conservé et affiché.

**Espace parent**
- Verrou : addition de deux nombres de 21 à 49 écrite en lettres, à saisir en chiffres. Nouvelle opération en cas d'erreur, sans blocage.
- Vouvoiement du parent. Tutoiement de l'enfant partout ailleurs.

## Ce qui est simulé dans le prototype et doit devenir réel

- **Dates** : série de jours, semaine affichée, jour manqué et bouée, défi du jour unique par date (réinitialisé à minuit local). Tout est calculé à partir d'un historique de jours joués.
- **Temps de jeu** : mesure réelle du temps actif en session (pause si l'onglet est masqué), agrégé par jour pour l'espace parent. Nombre réel de sessions.
- **Défi du jour** : table tirée de façon déterministe à partir de la date, parmi les tables ouvertes de l'enfant. Le prototype utilise toujours la table de 6.
- **Erreurs récentes** des pièges : compteur réel par multiplication.
- **Répétition intelligente** : le prototype se limite à remettre en file les erreurs et à proposer une session « pièges ». À implémenter : dans les sessions d'étape, environ 20 à 30 % des questions sont tirées parmi les pièges de la table concernée, pondérés par le nombre d'erreurs récentes. Propose-moi l'algorithme avant de le coder.
- **Persistance complète** de tous les champs de profil :
  - nom, couleur, avatar (`av`, y compris `outfit`) ;
  - pépin, `pw`, `house`, `owned` ;
  - étoiles, pièces, niveau, xp ;
  - série, record, bouées ;
  - `isl` ;
  - `mastered`, `traps` ;
  - records ;
  - stickers et stickers vus ;
  - historique de jeu ;
  - réglages.

  Schéma versionné avec migrations.

## Exigences de design (non négociables)

- Couleurs en aplats uniquement, **aucun dégradé**. Ombres plates décalées (`box-shadow: 0 Npx 0 var(--ink)`), contour encre de 3 px, coins très arrondis.
- Texte blanc sur toute surface laiton (`#94660F`). L'or `#F4B731` et l'étoile `#FFC93C` sont décoratifs uniquement, sans texte dessus.
- Règle des zones :
  - couleur de profil : uniquement dans les zones de l'enfant ;
  - couleur d'île : uniquement dans les écrans d'île et de question ;
  - bleu Ballon `#2F5BEA` : bouton principal des écrans « outil ».
- Un seul bouton principal par écran. 3 onglets maximum : Accueil, Ma grille, Trésors.
- Typographie : Fredoka pour les chiffres et les titres, Nunito pour l'interface. Rien sous 15 px. Chiffres de jeu à 62 px, réduits automatiquement si l'expression déborde (`fitExpr`).
- Espaces insécables avant `? ! :` dans tous les textes (fonction `nb`).
- Aucune croix rouge, aucun son négatif, aucune vie perdue, aucun classement entre enfants. Pas de publicité, pas d'achat réel, aucun lien sortant.

## Accessibilité

- WCAG 2.1 AA : contrastes vérifiés (toutes les couleurs fortes sont à 5:1 minimum avec le blanc dans le prototype, à conserver).
- Zones tactiles de 56 px minimum. Seule exception documentée : les cases de la grille de Pythagore, qui ouvrent une feuille de détail aux boutons larges.
- Labels ARIA présents dans le prototype à conserver et à compléter, focus visible, navigation clavier, `prefers-reduced-motion` respecté (aucune animation non essentielle).
- Bouton Écouter (`speechSynthesis`, voix fr-FR) sur chaque consigne enfant. Si aucune voix française n'est disponible hors ligne, masquer le bouton plutôt que de lire en anglais.

## PWA et plateformes

- Manifest :
  - `name` « Multîles », `short_name` « Multîles », `lang` fr ;
  - `display` standalone, `orientation` portrait ;
  - `theme_color` #1E2440, `background_color` #E6F4F2.
- Icônes générées depuis le logo SVG du prototype (`logoMark`) : 192, 512, maskable 512, apple-touch-icon 180.
- Safe areas iOS : déjà gérées dans le prototype via `env(safe-area-inset-*)`, à conserver.
- Débloquer l'`AudioContext` et la synthèse vocale au premier geste utilisateur (contrainte iOS et Chrome).
- Écran de démarrage sobre aux couleurs de l'app.

## Méthode de travail

Avance par phases et **arrête-toi à la fin de chaque phase** pour que je valide :

1. **Socle.** Projet Vite, tokens de design, polices locales, composants SVG portés. Une page de test affiche mascottes, avatars, îles, gardiens et maison, à comparer visuellement avec le prototype via des captures Playwright.
2. **Moteur.** Modèle de données, persistance, moteur de jeu et règles ci-dessus, avec tests unitaires Vitest couvrant chaque règle chiffrée.
3. **Écrans enfant.** Dans l'ordre 1 à 12, plus Découvrir et le mode chrono, branchés sur le moteur réel. Captures comparatives avec le prototype pour chaque écran.
4. **Espace parent** et réglages.
5. **PWA.** Service worker, hors ligne, installation, mise à jour. Audit Lighthouse (PWA, accessibilité, performance), à me présenter.
6. **Tests de bout en bout** Playwright : création de profil, session complète, achat en boutique, défi chrono, verrou parent.

À chaque phase, liste ce que tu as fait, ce qui diffère du prototype et pourquoi, et les questions ouvertes. Ne modifie aucun texte, aucune couleur ni aucune règle de jeu sans me le demander.
