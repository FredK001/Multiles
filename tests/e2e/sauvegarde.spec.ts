/* Sauvegarde et restauration de la progression depuis l'espace parent. */
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { handleTransfer, memoryTransferStore } from '../../netlify/lib/transfer';
import { kid, seedProd, solveGate } from '../helpers';

async function openParent(page: Page) {
  await page.locator('#btnParent').click();
  const v = String(solveGate((await page.locator('.gate .q b').textContent())!));
  for (const k of [...v, 'Valider']) await page.locator('.gate .key', { hasText: new RegExp(`^${k}$`) }).click();
  await expect(page.locator('.par-body')).toBeVisible();
}

test('sauvegarder, tout perdre, restaurer : la progression revient', async ({ page }) => {
  await seedProd(page, [kid({ coins: 33, isl: { 1: { steps: 3, trophy: true, stepStars: [3, 3, 3] }, 2: { steps: 3, trophy: false, stepStars: [3, 3, 2] } } }) /* 17 étoiles */]);
  await openParent(page);
  await expect(page.getByText('Aucune sauvegarde enregistrée depuis cet appareil.')).toBeVisible();
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Sauvegarder la progression' }).click();
  const file = await (await dl).path();
  expect((await dl).suggestedFilename()).toMatch(/^multiles-sauvegarde-\d{4}-\d{2}-\d{2}\.json$/);
  await expect(page.getByText("Dernière sauvegarde : aujourd'hui.")).toBeVisible();

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

test('transférer par code vers un autre téléphone', async ({ page }) => {
  // La fonction Netlify est simulée avec sa vraie logique et un stockage en mémoire.
  const store = memoryTransferStore();
  await page.route('**/api/transfer**', async (route) => {
    const req = route.request();
    const res = await handleTransfer(new Request(req.url(), { method: req.method(), body: req.postData() ?? undefined }), store);
    await route.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body: await res.text() });
  });

  await seedProd(page, [kid({ coins: 44, isl: { 1: { steps: 3, trophy: true, stepStars: [3, 3, 3] }, 2: { steps: 3, trophy: true, stepStars: [3, 3, 3] }, 5: { steps: 1, trophy: false, stepStars: [3, 0, 0] } } }) /* 21 étoiles */]);
  await openParent(page);
  await page.getByRole('button', { name: 'Transférer vers un autre téléphone' }).click();
  const code = (await page.locator('.xfer-code').textContent())!;
  expect(code).toMatch(/^[A-Z2-9]{3}-[A-Z2-9]{3}$/);

  // Nouveau téléphone, vide.
  await seedProd(page, []);
  await openParent(page);
  await page.getByRole('button', { name: "J'ai un code de transfert" }).click();
  await page.getByLabel("Code affiché sur l'ancien téléphone").fill('ZZZ-ZZZ');
  await page.getByRole('button', { name: 'Récupérer' }).click();
  await expect(page.getByRole('alert')).toContainText("Ce code n'existe pas");

  await page.getByLabel("Code affiché sur l'ancien téléphone").fill(code.toLowerCase());
  await page.getByRole('button', { name: 'Récupérer' }).click();
  await expect(page.getByRole('alertdialog')).toContainText('Nina');
  // Annuler ne grille pas le code.
  await page.getByRole('button', { name: 'Annuler' }).click();
  await page.getByRole('button', { name: "J'ai un code de transfert" }).click();
  await page.getByLabel("Code affiché sur l'ancien téléphone").fill(code);
  await page.getByRole('button', { name: 'Récupérer' }).click();
  await page.getByRole('button', { name: 'Remplacer' }).click();
  // Restaurée : la copie en ligne est effacée.
  await expect.poll(() => store.size()).toBe(0);
  await page.reload();
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await expect(page.locator('.stat').first()).toContainText('21');
  await expect(page.locator('.stat.coin')).toContainText('44');
});

test('sans connexion, le transfert l\'explique', async ({ page }) => {
  await page.route('**/api/transfer**', (route) => route.abort('internetdisconnected'));
  await seedProd(page, [kid()]);
  await openParent(page);
  await page.getByRole('button', { name: 'Transférer vers un autre téléphone' }).click();
  await expect(page.getByRole('alert')).toContainText('fichier de sauvegarde');
});
