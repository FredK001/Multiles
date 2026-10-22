/* Division au CM1 sur le build de production : choix « ÷ », île de la Lagune, découvrir, session complète, grille. */
import { expect, test } from '@playwright/test';
import { answer, kid, next, openMap, playOp, seedProd } from '../helpers';

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  (page as unknown as { __errors: string[] }).__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errors: string[] }).__errors, 'aucune erreur JavaScript').toEqual([]);
});

test('CM1 : division, carte, découvrir, session sans faute, grille ÷', async ({ page }) => {
  test.setTimeout(90_000);
  await seedProd(page, [kid()]);
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();

  await openMap(page, 'Divisé');
  await expect(page.locator('.isle')).toHaveCount(10);
  await expect(page.locator('.isle:not(.locked)')).toHaveCount(4);
  await page.locator('.isle').first().click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Lagune');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.dsc-eq b')).toHaveText('1 ÷ 1 = 1');
  await page.getByRole('button', { name: '7 divisé par 1' }).click();
  await expect(page.locator('.dsc-eq b')).toHaveText('7 ÷ 1 = 7');
  await page.getByRole('button', { name: "Je m'entraîne" }).click();

  await expect(page.locator('.expr .op').first()).toHaveText('÷');
  for (let i = 0; i < 10; i++) {
    await answer(page, true);
    await next(page);
  }
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
  await page.waitForTimeout(2600);
  while (await page.locator('.overlay').count()) await page.locator('.overlay .btn-isle').click();
  await page.locator('.end-grid').click();
  await expect(page.locator('.op-tabs button')).toHaveCount(6); // ×, ÷, fractions, géométrie, français, anglais
  await expect(page.locator('.op-tabs button[aria-pressed="true"]')).toContainText('Divisions');
  await expect(page.locator('.tbl .tr').first()).toContainText('50%');

  await page.goto(page.url().replace(/#.*$/, ''));
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await playOp(page, 'Fois');
  await expect(page.locator('.expr .op').first()).toHaveText('×');
});
