/* Sauvegarde et restauration de la progression depuis l'espace parent. */
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { kid, seedProd, solveGate } from '../helpers';

async function openParent(page: Page) {
  await page.locator('#btnParent').click();
  const v = String(solveGate((await page.locator('.gate .q b').textContent())!));
  for (const k of [...v, 'Valider']) await page.locator('.gate .key', { hasText: new RegExp(`^${k}$`) }).click();
  await expect(page.locator('.par-body')).toBeVisible();
}

test('sauvegarder, tout perdre, restaurer : la progression revient', async ({ page }) => {
  await seedProd(page, [kid({ stars: 17, coins: 33 })]);
  await openParent(page);
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Sauvegarder la progression' }).click();
  const file = await (await dl).path();
  expect((await dl).suggestedFilename()).toMatch(/^multiles-sauvegarde-\d{4}-\d{2}-\d{2}\.json$/);

  // Appareil vide (autre navigateur, nouveau raccourci…).
  await seedProd(page, []);
  await openParent(page);
  // Un fichier quelconque est refusé sans rien toucher.
  await page.locator('input[type=file]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"a":1}') });
  await expect(page.getByRole('alert')).toHaveText("Ce fichier n'est pas une sauvegarde Multîles.");

  await page.locator('input[type=file]').setInputFiles({ name: 's.json', mimeType: 'application/json', buffer: readFileSync(file) });
  await expect(page.getByRole('alertdialog')).toContainText('Nina');
  await page.getByRole('button', { name: 'Remplacer' }).click();
  await expect(page.locator('.kid', { hasText: 'Nina' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await expect(page.locator('.stat').first()).toContainText('17');
  await expect(page.locator('.stat.coin')).toContainText('33');
});
