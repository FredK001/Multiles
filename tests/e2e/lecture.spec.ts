/* Lecture au CP sur le build de production : la voix dit un son, l'enfant touche l'écriture ; sans voix, « trouve la même ». */
import { expect, test, type Page } from '@playwright/test';
import { READ_SETS } from '../../src/content/reading';
import { kid, seedProd } from '../helpers';

/** Profil CP au format v3 (comme dans cp.spec). */
const cpKid = () => {
  const { isle: _i, isl: _l, mastered: _m, traps: _t, trapLog: _g, records: _r, stickers: _s, defiDay: _d, defiPick: _p, stars: _st, ...rest } = kid({ id: 'cp1', name: 'Tom', color: '#C8371D' });
  return { ...rest, grade: 'CP', op: 'add', autoSpeech: false, prog: {} };
};

async function voice(page: Page, on: boolean) {
  await page.addInitScript((withVoice) => {
    const v = withVoice ? [{ lang: 'fr-FR', localService: true, name: 'A', voiceURI: 'a', default: true }] : [];
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices = () => v as unknown as SpeechSynthesisVoice[];
      speechSynthesis.speak = () => {};
    }
  }, on);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  (page as unknown as { __errors: string[] }).__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errors: string[] }).__errors, 'aucune erreur JavaScript').toEqual([]);
});

test('CP : lecture, découvrir, session complète à l’écoute, grille', async ({ page }) => {
  test.setTimeout(90_000);
  await voice(page, true);
  await seedProd(page, [cpKid()], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await page.locator('.isles-strip').click();
  await page.locator('.op-card', { hasText: 'Lire' }).click();
  await expect(page.locator('.isle')).toHaveCount(5);
  await expect(page.locator('.isle:not(.locked)')).toHaveCount(2);
  await page.locator('.isle').first().click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Baie');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.img-card.read')).toHaveCount(9);
  await page.getByRole('button', { name: "Je m'entraîne" }).click();

  await expect(page.locator('.read-listen')).toBeVisible();
  await expect(page.locator('.read-choices .choice')).toHaveCount(3);
  const learnt = new Map<string, string>();
  for (let i = 0; i < 40 && !(await page.locator('[data-screen="end"]').count()); i++) {
    const opts = (await page.locator('.read-choices .choice').allTextContents()).join('|');
    const known = learnt.get(opts);
    await (known ? page.locator('.read-choices .choice', { hasText: new RegExp(`^${known}$`) }) : page.locator('.read-choices .choice').first()).click();
    await page.locator('.fb-sheet').waitFor();
    if (await page.locator('.fb-sheet.help').count()) {
      learnt.set(opts, (await page.locator('.read-aid b').textContent()) ?? '');
      await page.getByRole('button', { name: "J'ai compris" }).click();
    } else await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
  await page.waitForTimeout(2600);
  while (await page.locator('.overlay').count()) await page.locator('.overlay .btn-isle').click();
  await page.locator('.end-grid').click();
  await expect(page.locator('.op-tabs button[aria-pressed="true"]')).toContainText('Lecture');
  await expect(page.locator('.eg-w.read')).toHaveCount(READ_SETS.reduce((n, s) => n + s.items.length, 0));
});

test('CP : sans voix française, la lecture devient « trouve le même mot »', async ({ page }) => {
  await voice(page, false);
  await seedProd(page, [cpKid()], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await page.locator('.isles-strip').click();
  await page.locator('.op-card', { hasText: 'Lire' }).click();
  await page.locator('.isle').nth(1).click();
  await page.getByRole('button', { name: /Jouer l'étape 1/ }).click();
  await expect(page.locator('.read-target')).toBeVisible();
  await expect(page.locator('.read-listen')).toHaveCount(0);
  const target = await page.locator('.read-target').textContent();
  await page.locator('.read-choices .choice', { hasText: new RegExp(`^${target}$`) }).click();
  await expect(page.locator('.fb-sheet.ok')).toBeVisible();
});
