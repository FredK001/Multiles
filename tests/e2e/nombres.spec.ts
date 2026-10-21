/* Nombres jusqu'à 100 au CP sur le build de production : tableau des nombres, barres et cubes, session complète, grille. */
import { expect, test, type Page } from '@playwright/test';
import { kid, seedProd } from '../helpers';

const cpKid = () => {
  const { isle: _i, isl: _l, mastered: _m, traps: _t, trapLog: _g, records: _r, stickers: _s, defiDay: _d, defiPick: _p, stars: _st, ...rest } = kid({ id: 'cp1', name: 'Tom', color: '#C8371D' });
  return { ...rest, grade: 'CP', op: 'add', autoSpeech: false, prog: {} };
};

/** Répond juste en lisant l'énoncé (aria-label de la carte). */
async function answerNum(page: Page) {
  const t = (await page.locator('.num-wrap').getAttribute('data-q'))!;
  let r: number;
  const du = /^(\d+) dizaines? et (\d+) unités?/.exec(t), suite = /juste (après|avant) (\d+)/.exec(t), comp = /plus grand : (\d+) ou (\d+)/.exec(t);
  if (du) r = Number(du[1]) * 10 + Number(du[2]);
  else if (suite) r = Number(suite[2]) + (suite[1] === 'après' ? 1 : -1);
  else if (comp) r = Math.max(Number(comp[1]), Number(comp[2]));
  else throw new Error(`énoncé inattendu : ${t}`);
  if (await page.locator('.pad').count()) {
    for (const d of String(r)) await page.locator('.pad .key', { hasText: new RegExp(`^${d}$`) }).click();
    await page.getByRole('button', { name: 'Valider' }).click();
  } else await page.locator('.choices .choice', { hasText: new RegExp(`^${r}$`) }).click();
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  (page as unknown as { __errors: string[] }).__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errors: string[] }).__errors, 'aucune erreur JavaScript').toEqual([]);
});

test('CP : nombres, tableau des nombres, dizaines et unités sans faute, grille', async ({ page }) => {
  test.setTimeout(90_000);
  await seedProd(page, [cpKid()], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await page.locator('.isles-strip').click();
  await page.locator('.op-card', { hasText: 'Nombres' }).click();
  await expect(page.locator('.isle')).toHaveCount(4);
  await expect(page.locator('.isle:not(.locked)')).toHaveCount(2);
  await page.locator('.isle').first().click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Carrière');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.hundred button')).toHaveCount(100);
  await page.locator('.hundred button', { hasText: /^47$/ }).click();
  await expect(page.locator('.img-hint')).toHaveText('47 : 4 dizaines et 7 unités.');
  await page.getByRole('button', { name: "Je m'entraîne" }).click();
  await expect(page.locator('.num-card svg').first()).toBeVisible();
  await page.screenshot({ path: 'test-results/num-q.png' });
  for (let i = 0; i < 10; i++) {
    await answerNum(page);
    await expect(page.locator('.fb-sheet.ok')).toBeVisible();
    await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
  await page.waitForTimeout(2600);
  while (await page.locator('.overlay').count()) await page.locator('.overlay .btn-isle').click();
  await page.locator('.end-grid').click();
  await expect(page.locator('.op-tabs button[aria-pressed="true"]')).toContainText('Nombres');
  await expect(page.locator('.tbl .tr').first()).toContainText('%');
});

test('CP : avant, après', async ({ page }) => {
  await seedProd(page, [cpKid()], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await page.locator('.isles-strip').click();
  await page.locator('.op-card', { hasText: 'Nombres' }).click();
  await page.locator('.isle').nth(1).click();
  await page.getByRole('button', { name: /Jouer l'étape 1/ }).click();
  await expect(page.locator('.expr.num-ans .op', { hasText: '→' })).toBeVisible();
  await answerNum(page);
  await expect(page.locator('.fb-sheet.ok')).toBeVisible();
});
