/* Géométrie au CM1 sur le build de production : carte, leçon dessinée, session complète, grille. */
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

test('CM1 : géométrie, les angles, leçon, session complète, grille', async ({ page }) => {
  test.setTimeout(120_000);
  await seedProd(page, [kid()]);
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await openMap(page, 'Géométrie');
  await expect(page.locator('.isle')).toHaveCount(4);
  await expect(page.locator('.isle:not(.locked)')).toHaveCount(1);
  await page.locator('.isle').first().click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Équerre');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.geo-ex')).toHaveCount(3);
  await expect(page.locator('.geo-ex b')).toHaveText(['angle droit', 'angle aigu', 'angle obtus']);
  await page.getByRole('button', { name: "Je m'entraîne" }).click();
  await page.screenshot({ path: 'test-results/geo-q.png' });

  // Première réponse par défaut ; après une erreur, on retient la bonne réponse (la question revient en fin de session).
  let errors = 0;
  const learnt = new Map<string, string>();
  for (let i = 0; i < 40 && !(await page.locator('[data-screen="end"]').count()); i++) {
    const key = await page.locator('.q-card .geo-card').innerHTML();
    // Le dessin est décrit sans donner la réponse.
    if (await page.locator('.geo-pic').count()) await expect(page.locator('.geo-pic')).toHaveAttribute('role', 'img');
    const known = learnt.get(key);
    await (known ? page.locator('.geo-choices .choice', { hasText: known }) : page.locator('.geo-choices .choice').first()).click();
    await page.locator('.fb-sheet').waitFor();
    if (await page.locator('.fb-sheet.help').count()) {
      errors++;
      learnt.set(key, (await page.locator('.fb-sheet .fb-eq').textContent()) ?? '');
      await expect(page.locator('#fbTip')).not.toBeEmpty();
      await page.getByRole('button', { name: "J'ai compris" }).click();
    } else await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
  expect(errors).toBeLessThan(40);
  await page.goto(page.url().replace(/#.*$/, ''));
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await page.getByRole('button', { name: 'Ma grille' }).click();
  await page.locator('.op-tabs button', { hasText: 'Géométrie' }).click();
  await expect(page.locator('.tbl .tr')).toHaveCount(4);
});
