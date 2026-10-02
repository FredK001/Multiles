import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Chemins relatifs : l'app fonctionne à la racine d'un domaine comme dans un sous-dossier.
  base: './',
  plugins: [
    preact(),
    VitePWA({
      // Mise à jour sur invite uniquement (espace parent), jamais au milieu d'une session enfant.
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'Multîles',
        short_name: 'Multîles',
        description: 'Apprendre les tables de multiplication de 1 à 10, en jouant.',
        lang: 'fr',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1E2440',
        background_color: '#E6F4F2',
        categories: ['education', 'kids'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Précache de tous les fichiers : 100 % hors ligne après le premier chargement.
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        skipWaiting: false,
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: {
    target: 'es2020',
    // La page d'atelier (lab.html) n'est servie qu'en développement.
    rollupOptions: { input: { main: 'index.html' } },
  },
});
