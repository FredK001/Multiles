/* Français au CM1 (homophones) sur le build de production : carte, règle, session complète, grille. */
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

test('CM1 : homophones, règle, session complète, grille Français', async ({ page }) => {
  test.setTimeout(90_000);
  await seedProd(page, [kid()]);
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await openMap(page, 'Français');
  await expect(page.locator('.isle')).toHaveCount(4);
  await expect(page.locator('.isle:not(.locked)')).toHaveCount(2);
  await page.locator('.isle').first().click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Écho');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.fr-card')).toHaveCount(2);
  await expect(page.locator('.fr-card').first()).toContainText('avait');
  await page.getByRole('button', { name: "Je m'entraîne" }).click();

  await expect(page.locator('.fr-blank')).toBeVisible();
  await expect(page.locator('.fr-choices .choice')).toHaveText(['a', 'à']);
  // Premier mot par défaut ; après une erreur, on retient le bon mot de la phrase (elle revient plus tard).
  let errors = 0;
  const learnt = new Map<string, string>();
  for (let i = 0; i < 40 && !(await page.locator('[data-screen="end"]').count()); i++) {
    const sentence = (await page.locator('.q-card .fr-sent').textContent()) ?? '';
    const known = learnt.get(sentence);
    await (known ? page.locator('.fr-choices .choice', { hasText: new RegExp(`^${known}$`) }) : page.locator('.fr-choices .choice').first()).click();
    await page.locator('.fb-sheet').waitFor();
    await expect(page.locator('.fr-word').first()).toBeVisible();
    if (await page.locator('.fb-sheet.help').count()) {
      errors++;
      learnt.set(sentence, ((await page.locator('.fr-word').first().textContent()) ?? '').toLowerCase());
      await expect(page.locator('.fr-rule.ok')).toBeVisible();
      await page.getByRole('button', { name: "J'ai compris" }).click();
    } else await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  expect(errors).toBeGreaterThan(0);
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
  await page.waitForTimeout(2600);
  while (await page.locator('.overlay').count()) await page.locator('.overlay .btn-isle').click();
  await page.locator('.end-grid').click();
  await expect(page.locator('.op-tabs button[aria-pressed="true"]')).toContainText('Français');
  await expect(page.locator('.tchip.fr').first()).toBeVisible();
  await page.locator('.tchip.fr').first().click();
  await expect(page.locator('.cell-sheet .fr-rule.ok')).toBeVisible();
});
