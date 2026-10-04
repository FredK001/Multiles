/* Règles vérifiées à travers l'interface (build de production) : gardien et trophée, déblocage
   des îles, sticker du gardien, bouées et série, bouton Écouter, bouton retour Android. */
import { expect, test, type Page } from '@playwright/test';
import { answer, kid, next, seedProd, openMap } from '../helpers';

const won = { steps: 3, trophy: true, stepStars: [3, 3, 3] };
const openKid = async (page: Page, name = 'Nina') => {
  await page.getByRole('button', { name: `Jouer avec le profil de ${name}` }).click();
  await page.locator('[data-screen="home"]').waitFor();
};

test('gardien battu : trophée, sticker, île suivante débloquée', async ({ page }) => {
  // 1 trophée déjà gagné (Jungle) ; le Verger (île 3) demande 2 trophées.
  await seedProd(page, [kid({ isl: { 1: { steps: 3, trophy: false, stepStars: [3, 3, 2] }, 2: won } })]);
  await openKid(page);
  await expect(page.locator('.isles-strip small')).toHaveText('1 sur 28 conquises');
  await openMap(page);
  await page.locator('.isle[aria-label^="Île 3,"]').click();
  await expect(page.locator('.toast')).toHaveText("Encore 1 trophée pour ouvrir l'île du Verger !");
  await page.locator('.isle[aria-label^="Île 1,"]').click();
  await page.locator('.boss').click();
  await expect(page.locator('.boss small')).toHaveText('Toute la table en 2 minutes');
  await page.getByRole('button', { name: 'Défier Coquillo' }).click();
  await expect(page.locator('.q-place small')).toHaveText('Gardien');
  for (let i = 0; i < 12 && !(await page.locator('[data-screen="end"]').count()); i++) { await answer(page, i !== 0); await next(page); }
  await expect(page.locator('.end-band .sub')).toHaveText('Tu as battu Coquillo !');
  await expect(page.locator('.overlay h2')).toHaveText('Trophée gagné !', { timeout: 5000 });
  while (await page.locator('.overlay').count()) await page.locator('.overlay .btn-isle').click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.locator('.boss small')).toHaveText('Battu ! Tu peux le défier encore.');
  await page.getByRole('button', { name: 'Carte' }).click();
  await expect(page.locator('.map-head .cnt')).toContainText('2');
  await page.locator('.isle[aria-label^="Île 3,"]').click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Verger');
  // Sticker du gardien dans l'album, après rechargement.
  await page.reload();
  await openKid(page);
  await page.locator('.tabbtn', { hasText: 'Trésors' }).click();
  await page.getByRole('button', { name: 'Album' }).click();
  await expect(page.getByRole('button', { name: 'Sticker Coquillo le gardien' })).toBeVisible();
  await expect(page.locator('.alb-h span').first()).toHaveText('2 sur 28');
});

test('gardien raté (7 du premier coup) : pas de trophée, revanche possible', async ({ page }) => {
  await seedProd(page, [kid({ isl: { 1: { steps: 3, trophy: false, stepStars: [3, 3, 3] } } })], { sound: true, bossTime: 0 });
  await openKid(page);
  await openMap(page);
  await page.locator('.isle[aria-label^="Île 1,"]').click();
  await page.locator('.boss').click();
  await expect(page.locator('.boss small')).toHaveText('Toute la table, sans chrono');
  await page.getByRole('button', { name: 'Défier Coquillo' }).click();
  await expect(page.locator('.q-count')).toHaveText('Question 1 sur 10'); // pas de chrono
  for (let i = 0; i < 14 && !(await page.locator('[data-screen="end"]').count()); i++) { await answer(page, i >= 3); await next(page); }
  await expect(page.locator('.end-band .sub')).toHaveText('Défi du gardien terminé, île de la Plage');
  await expect(page.getByRole('button', { name: 'Rejouer' })).toBeVisible();
  await page.waitForTimeout(2600);
  await expect(page.locator('.overlay h2', { hasText: 'Trophée' })).toHaveCount(0);
});

test('bouée : sauve la série un jour manqué, annoncée une seule fois', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 2, 10));
  await seedProd(page, [kid({ streak: { current: 3, best: 3, buoys: 1, lastDay: '2026-09-30', buoyDays: [], checkedDay: '2026-09-30' } })]);
  await openKid(page);
  await expect(page.locator('.overlay h2')).toHaveText("Ta bouée t'a sauvé !");
  await expect(page.locator('.overlay p')).toHaveText("Hier, tu n'as pas joué, mais ta série de 3 jours continue. Il te reste 0 bouée.");
  await page.getByRole('button', { name: 'Super !' }).click();
  await expect(page.locator('.joker')).toContainText('0 bouée');
  await expect(page.locator('.wd.buoy')).toHaveCount(1);
  await page.reload();
  await openKid(page);
  await page.waitForTimeout(800);
  await expect(page.locator('.overlay')).toHaveCount(0);
});

test('sans bouée : la série repart à 0, le record reste affiché', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 2, 10));
  await seedProd(page, [kid({ streak: { current: 4, best: 4, buoys: 0, lastDay: '2026-09-29', buoyDays: [], checkedDay: '2026-09-29' } })]);
  await openKid(page);
  await expect(page.locator('.overlay h2')).toHaveText('On repart !');
  await expect(page.locator('.overlay p')).toContainText('Ton record reste 4 jours.');
  await page.getByRole('button', { name: "C'est parti !" }).click();
  await expect(page.locator('.hcard').first()).toContainText('Ta série');
  await expect(page.locator('.hcard').first()).toContainText('Record : 4 jours');
});

test('Écouter : masqué sans voix française, visible avec', async ({ browser }) => {
  for (const [voices, count] of [[[], 0], [[{ lang: 'fr-FR', localService: true, name: 'Amélie', voiceURI: 'a', default: true }], 1]] as const) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.addInitScript((v) => { if ('speechSynthesis' in window) speechSynthesis.getVoices = () => v as unknown as SpeechSynthesisVoice[]; }, voices);
    await page.goto('http://localhost:4173/');
    await expect(page.locator('.who-head .btn-say')).toHaveCount(count);
    await ctx.close();
  }
});

test('bouton retour Android : même effet que Retour / Quitter', async ({ page }) => {
  await seedProd(page, [kid()]);
  await openKid(page);
  await openMap(page);
  await page.locator('.isle[aria-label^="Île 1,"]').click();
  await page.getByRole('button', { name: "Jouer l'étape 1" }).click();
  await answer(page);
  await page.goBack(); // Quitter la session : la pièce gagnée est conservée
  await expect(page.locator('[data-screen="isle"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-screen="map"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await expect(page.locator('.stat.coin')).toHaveText('51');
  await page.goBack(); // sur l'accueil : rien
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await openMap(page);
  await page.goBack();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
});
