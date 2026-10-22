/* Grammaire et accords au CM1 (dans le français) sur le build de production : îles ouvertes par les trophées,
   leçon, nature des mots (mot en couleur), accords à trois réponses. */
import { expect, test } from '@playwright/test';
import { kid, openMap, seedProd } from '../helpers';

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  (page as unknown as { __errors: string[] }).__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errors: string[] }).__errors, 'aucune erreur JavaScript').toEqual([]);
});

/** Profil CM1 au format v3, avec les trophées de a/à et et/est (2 trophées de français). */
const cmKid = () => {
  const { isle: _i, isl: _l, mastered: _m, traps: _t, trapLog: _g, records: _r, stickers: _s, defiDay: _d, defiPick: _p, stars: _st, ...rest } = kid();
  const won = { steps: 3, trophy: true, stepStars: [3, 3, 3] };
  return { ...rest, grade: 'CM1', op: 'fr', autoSpeech: false, prog: { fr: { current: 'fr-a', series: { 'fr-a': won, 'fr-et': won }, mastered: [], traps: [], trapLog: {}, records: {}, stickers: [] } } };
};

test('CM1 : nature des mots, leçon et mot en couleur', async ({ page }) => {
  test.setTimeout(90_000);
  await seedProd(page, [cmKid()], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await openMap(page, 'Français');
  await expect(page.locator('.isle')).toHaveCount(12);
  await page.locator('.isle[aria-label^="Île Atelier"]').click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Atelier');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.fr-lesson')).toHaveCount(5);
  await page.getByRole('button', { name: "Je m'entraîne" }).click();

  await expect(page.locator('.q-card .fr-focus')).toBeVisible();
  await expect(page.locator('.fr-choices.three .choice')).toHaveCount(3);
  await page.screenshot({ path: 'test-results/nature-q.png' });
  // Une réponse au hasard : juste, ou l'aide montre la carte de la bonne nature.
  await page.locator('.fr-choices .choice').first().click();
  await page.locator('.fb-sheet').waitFor();
  await expect(page.locator('.fb-eq.fr')).toContainText('» est un');
  if (await page.locator('.fb-sheet.help').count()) {
    await expect(page.locator('.aid .fr-rule.ok b')).toBeVisible();
    await page.screenshot({ path: 'test-results/nature-help.png' });
  }
});

test('CM1 : accord sujet-verbe, le verbe donné et trois formes', async ({ page }) => {
  await seedProd(page, [cmKid()], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await openMap(page, 'Français');
  await page.locator('.isle[aria-label^="Île Kiosque"]').click();
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.fr-lesson')).toHaveCount(4);
  await page.getByRole('button', { name: "Je m'entraîne" }).click();
  await expect(page.locator('.fr-verb')).toContainText('Verbe');
  await expect(page.locator('.fr-blank')).toBeVisible();
  await expect(page.locator('.fr-choices.three .choice')).toHaveCount(3);
  await page.locator('.fr-choices .choice').first().click();
  await page.locator('.fb-sheet').waitFor();
  await expect(page.locator('.fr-word').first()).toBeVisible();
});
