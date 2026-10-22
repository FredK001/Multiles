/* Mesures au CM1 sur le build de production : leçon, longueurs sans faute, horloge dessinée et décrite, grille. */
import { expect, test } from '@playwright/test';
import { MES_SETS } from '../../src/content/measures';
import { kid, openMap, seedProd } from '../helpers';

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  (page as unknown as { __errors: string[] }).__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errors: string[] }).__errors, 'aucune erreur JavaScript').toEqual([]);
});

test('CM1 : mesures, leçon, longueurs sans faute, grille', async ({ page }) => {
  test.setTimeout(90_000);
  await seedProd(page, [kid()]);
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await openMap(page, 'Mesures');
  await expect(page.locator('.isle')).toHaveCount(4);
  await expect(page.locator('.isle:not(.locked)')).toHaveCount(1);
  await page.locator('.isle').first().click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Chantier');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.phr')).not.toHaveCount(0);
  await page.getByRole('button', { name: "Je m'entraîne" }).click();
  await expect(page.locator('.wr-card .frac-q')).toBeVisible();

  const items = MES_SETS[0]!.items;
  for (let i = 0; i < 10; i++) {
    const text = (await page.locator('.wr-card .frac-q').textContent())!;
    const it = items.find((x) => x.q === text)!;
    expect(it, text).toBeTruthy();
    await page.locator('.wr-choices .choice').filter({ hasText: new RegExp(`^${it.a}$`) }).click();
    await expect(page.locator('.fb-sheet.ok')).toBeVisible();
    await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
  await page.goto(page.url().replace(/#.*$/, ''));
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await page.getByRole('button', { name: 'Ma grille' }).click();
  await page.locator('.op-tabs button', { hasText: 'Mesures' }).click();
  await expect(page.locator('.tbl .tr')).toHaveCount(4);
});

test('CM1 : l’horloge de l’île des heures est dessinée et décrite', async ({ page }) => {
  // Île des heures ouverte : un trophée de mesures suffit (need = 1). Profil CM1 au format v3, comme dans cp.spec.
  const { isle: _i, isl: _l, mastered: _m, traps: _t, trapLog: _g, records: _r, stickers: _s, defiDay: _d, defiPick: _p, stars: _st, ...rest } = kid();
  const won = { steps: 3, trophy: true, stepStars: [3, 3, 3] };
  const mes = { current: 'mes-long', series: { 'mes-long': won }, mastered: [], traps: [], trapLog: {}, records: {}, stickers: [] };
  await seedProd(page, [{ ...rest, grade: 'CM1', op: 'mes', autoSpeech: false, prog: { mes } }], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await openMap(page, 'Mesures');
  await page.locator('.isle', { hasText: 'Horloge' }).click();
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.wr-clocks [role="img"]')).toHaveCount(4);
  await expect(page.locator('.wr-clocks [role="img"]').first()).toHaveAttribute('aria-label', /petite aiguille est sur le 3/);
});
