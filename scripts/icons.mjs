/* Génère les icônes PWA depuis le logo du prototype (logoMark), rendu par le navigateur.
   Usage : npm run icons  →  public/icons/*.png */
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const OUT = 'public/icons';
const LAGON = '#E6F4F2';

/** [fichier, taille, fond, part du logo dans l'icône] */
const ICONS = [
  ['icon-192.png', 192, null, 1],
  ['icon-512.png', 512, null, 1],
  // Masquable : fond plein et logo dans la zone sûre (cercle central de 80 %).
  ['icon-maskable-512.png', 512, LAGON, 0.72],
  // iOS n'accepte pas la transparence : fond plein, logo avec marge.
  ['apple-touch-icon-180.png', 180, LAGON, 0.84],
  ['favicon-32.png', 32, null, 1],
];

mkdirSync(OUT, { recursive: true });
const server = await createServer({ server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:5199/lab.html');
  await page.waitForFunction(() => '__lab' in window);
  for (const [file, size, bg, ratio] of ICONS) {
    const logo = Math.round(size * ratio);
    const [svg] = await page.evaluate((s) => window.__lab.run([{ fn: 'logoMark', args: [s] }]), logo);
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${bg ?? 'transparent'}">${svg}</body></html>`);
    await page.screenshot({ path: `${OUT}/${file}`, omitBackground: !bg });
    console.log(`  ${OUT}/${file}`);
  }
} finally {
  await browser.close();
  await server.close();
}
