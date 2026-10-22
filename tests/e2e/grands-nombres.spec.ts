/* Grands nombres au CM1 sur le build de production : leçon (tableau des classes), lire les nombres sans faute, grille. */
import { expect, test } from '@playwright/test';
import { BIG_SETS } from '../../src/content/bignums';
import { kid, openMap, seedProd } from '../helpers';

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  (page as unknown as { __errors: string[] }).__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errors: string[] }).__errors, 'aucune erreur JavaScript').toEqual([]);
});

test('CM1 : grands nombres, leçon, lire les nombres sans faute, grille', async ({ page }) => {
  test.setTimeout(90_000);
  await seedProd(page, [kid()]);
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await openMap(page, 'Nombres');
  await expect(page.locator('.isle')).toHaveCount(4);
  await expect(page.locator('.isle:not(.locked)')).toHaveCount(1);
  await page.locator('.isle').first().click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Observatoire');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.wr-class')).toHaveCount(3);
  await page.getByRole('button', { name: "Je m'entraîne" }).click();
  await expect(page.locator('.wr-card .frac-q')).toBeVisible();
  await page.screenshot({ path: 'test-results/big-q.png' });

  // Bonne réponse : retrouvée dans le contenu d'après l'énoncé affiché.
  const items = BIG_SETS[0]!.items;
  for (let i = 0; i < 10; i++) {
    const text = (await page.locator('.wr-card .frac-q').textContent())!;
    const it = items.find((x) => x.q === text)!;
    expect(it, text).toBeTruthy();
    await page.locator('.wr-choices .choice').filter({ hasText: new RegExp(`^${it.a.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}$`) }).click();
    await expect(page.locator('.fb-sheet.ok')).toBeVisible();
    await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
  await page.goto(page.url().replace(/#.*$/, ''));
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await page.getByRole('button', { name: 'Ma grille' }).click();
  await page.locator('.op-tabs button', { hasText: 'Grands nombres' }).click();
  await expect(page.locator('.tbl .tr')).toHaveCount(4);
});
