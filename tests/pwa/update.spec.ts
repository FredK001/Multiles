import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { solveGate as solve } from '../helpers';

const PROD = 'http://localhost:4173';

async function unlockParent(page: Page) {
  await page.locator('#btnParent').click();
  const v = String(solve((await page.locator('.gate .q b').textContent())!));
  for (const k of [...v, 'Valider']) await page.locator('.gate .key', { hasText: new RegExp(`^${k}$`) }).click();
}

test('nouvelle version : invite discrète dans l\'espace parent uniquement', async ({ page }) => {
  const sw = 'dist/sw.js', original = readFileSync(sw, 'utf8');
  try {
    await page.goto(PROD);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload(); // l'app est désormais contrôlée par le service worker, comme au retour d'un utilisateur
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    // Publication d'une nouvelle version du service worker.
    appendFileSync(sw, `\n// version de test ${Date.now()}\n`);
    await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r?.update(); });
    await expect.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting), { timeout: 15_000 }).toBe(true);

    // Côté enfant : aucune invite.
    await expect(page.getByText('Mise à jour disponible')).toHaveCount(0);
    // Côté parent : invite visible, installation à la demande.
    await unlockParent(page);
    await expect(page.getByText('Mise à jour disponible')).toBeVisible();
    await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: 'Mettre à jour maintenant' }).click()]);
    await expect.poll(() => page.evaluate(async () => !(await navigator.serviceWorker.getRegistration())?.waiting)).toBe(true);
  } finally {
    writeFileSync(sw, original);
  }
});
