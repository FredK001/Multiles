/* Fractions et décimaux au CM1 sur le build de production : leçon, lire une fraction dessinée, session complète, grille. */
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

test('CM1 : fractions, leçon, lire une fraction sans faute, grille', async ({ page }) => {
  test.setTimeout(90_000);
  await seedProd(page, [kid()]);
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await openMap(page, 'Fractions');
  await expect(page.locator('.isle')).toHaveCount(4);
  await expect(page.locator('.isle:not(.locked)')).toHaveCount(1);
  await page.locator('.isle').first().click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Pâtisserie');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.frac-ex')).toHaveCount(6);
  await page.getByRole('button', { name: "Je m'entraîne" }).click();
  await expect(page.locator('.frac-card svg')).toBeVisible();
  await page.screenshot({ path: 'test-results/frac-q.png' });

  // Bonne réponse : les parts coloriées sur toutes les parts du dessin.
  for (let i = 0; i < 10; i++) {
    const [n, d] = await page.locator('.frac-card svg').evaluate((svg) => {
      const parts = [...svg.querySelectorAll('path, rect')];
      return [parts.filter((p) => p.getAttribute('fill') !== '#fff').length, parts.length];
    });
    await page.locator('.frac-choices .choice', { hasText: new RegExp(`^${n}\\/${d}$`) }).click();
    await expect(page.locator('.fb-sheet.ok')).toBeVisible();
    await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
  await page.goto(page.url().replace(/#.*$/, ''));
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await page.getByRole('button', { name: 'Ma grille' }).click();
  await page.locator('.op-tabs button', { hasText: 'Fractions' }).click();
  await expect(page.locator('.tbl .tr')).toHaveCount(4);
});
