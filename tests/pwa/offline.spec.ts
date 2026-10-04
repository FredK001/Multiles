import { expect, test } from '@playwright/test';
import { answer, next, playOp } from '../helpers';

const PROD = 'http://localhost:4173';
/** Racine d'un domaine et sous-dossier : l'app doit fonctionner aux deux adresses. */
const HOSTS = [PROD, 'http://localhost:4174/sous-dossier'];

test('manifest et icônes conformes', async ({ request }) => {
  const m = await (await request.get(`${PROD}/manifest.webmanifest`)).json();
  expect(m).toMatchObject({ name: 'Multîles', short_name: 'Multîles', lang: 'fr', display: 'standalone', orientation: 'portrait', theme_color: '#1E2440', background_color: '#E6F4F2', start_url: './' });
  expect(m.icons.map((i: { sizes: string; purpose: string }) => `${i.sizes}/${i.purpose}`)).toEqual(['192x192/any', '512x512/any', '512x512/maskable']);
  for (const i of [...m.icons.map((x: { src: string }) => x.src), 'icons/apple-touch-icon-180.png']) expect((await request.get(`${PROD}/${i}`)).status()).toBe(200);
});

for (const HOST of HOSTS) test(`100 % hors ligne après le premier chargement, sans appel réseau externe (${HOST})`, async ({ page, context }) => {
  const external: string[] = [];
  page.on('request', (r) => { if (!r.url().startsWith(HOST) && !r.url().startsWith('data:')) external.push(r.url()); });
  await page.goto(HOST + '/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Qui joue/ })).toBeVisible();
  // Polices auto-hébergées bien chargées hors ligne
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('700 40px Fredoka') && document.fonts.check('800 17px Nunito'))).toBe(true);

  await page.getByRole('button', { name: 'Nouveau joueur' }).click();
  await page.getByLabel('Ton prénom').fill('Lou');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('group', { name: 'Classe' }).getByRole('button', { name: /^CM1 / }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.locator('.pep-card').first().click();
  await page.getByRole('button', { name: /C'est parti/ }).click();
  await page.getByRole('button', { name: 'Jouer avec le profil de Lou' }).click();
  await playOp(page);
  for (let i = 0; i < 10; i++) { await answer(page); await next(page); }
  await expect(page.locator('[data-screen="end"]')).toBeVisible();

  // Données conservées après rechargement hors ligne
  await page.reload();
  await expect(page.getByRole('button', { name: 'Jouer avec le profil de Lou' })).toBeVisible();
  expect(external).toEqual([]);
});

for (const HOST of HOSTS) test(`Chrome considère l'app comme installable (${HOST})`, async ({ page }) => {
  await page.goto(HOST + '/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  const cdp = await page.context().newCDPSession(page);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  expect(installabilityErrors).toEqual([]);
});
