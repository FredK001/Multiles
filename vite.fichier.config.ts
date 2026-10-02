/* Version « un seul fichier » : multiles.html à ouvrir d'un double-clic (sans installation PWA ni service worker). */
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/** Le script est intégré à la page : la CSP « script-src 'self' » le bloquerait. */
const sansCsp: Plugin = {
  name: 'sans-csp',
  transformIndexHtml: (html) => html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n?/, ''),
};

export default defineConfig({
  base: './',
  plugins: [preact(), viteSingleFile(), sansCsp],
  resolve: { alias: { 'virtual:pwa-register': fileURLToPath(new URL('./scripts/pwa-register-vide.ts', import.meta.url)) } },
  // Polices et images intégrées dans le fichier.
  build: { outDir: 'dist-fichier', assetsInlineLimit: 100_000_000, rollupOptions: { input: 'index.html' } },
});
