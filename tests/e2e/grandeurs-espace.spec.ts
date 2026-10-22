/* Grandeurs (monnaie, heure) et espace (formes, quadrillage, position) au CP sur le build de production :
   leçon en dessins, session complète sans faute, grille. */
import { expect, test, type Page } from '@playwright/test';
import { kid, seedProd } from '../helpers';

const cpKid = () => {
  const { isle: _i, isl: _l, mastered: _m, traps: _t, trapLog: _g, records: _r, stickers: _s, defiDay: _d, defiPick: _p, stars: _st, ...rest } = kid({ id: 'cp1', name: 'Tom', color: '#C8371D' });
  return { ...rest, grade: 'CP', op: 'add', autoSpeech: false, prog: {} };
};

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  (page as unknown as { __errors: string[] }).__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errors: string[] }).__errors, 'aucune erreur JavaScript').toEqual([]);
});

/** L'heure juste : lit la petite aiguille (description du dessin), ou touche l'horloge demandée. */
async function answerClock(page: Page) {
  const card = page.locator('.pic-card [role="img"]');
  if (await card.count()) {
    const h = /petite aiguille est sur le (\d+)/.exec((await card.getAttribute('aria-label'))!)![1]!;
    await page.locator('.pic-choices .choice', { hasText: new RegExp(`^${h} heures?$`) }).click();
  } else {
    const h = /montre (\d+) heure/.exec((await page.locator('.bubble .t').textContent())!)![1]!;
    await page.locator(`.pic-choices .choice[aria-label*="petite aiguille est sur le ${h},"]`).click();
  }
}

/** Les formes : touche la forme nommée, ou nomme la forme dessinée (rond, 3 sommets, 4 côtés égaux ou non). */
async function answerShape(page: Page) {
  const ask = (await page.locator('.bubble .t').textContent())!;
  const touch = /^Touche (?:le|la) ([a-zé]+)\./.exec(ask);
  if (touch) {
    await page.locator(`.pic-choices .choice[aria-label="Un ${touch[1]}"]`).click();
    return;
  }
  if (await page.locator('.pic-big').count()) {
    await page.locator('.pic-choices .choice', { hasText: /^un cercle$/ }).click();
    return;
  }
  const name = await page.locator('.pic-card svg').evaluate((svg) => {
    if (svg.querySelector('circle')) return 'un cercle';
    const nums = (svg.querySelector('path')!.getAttribute('d') ?? '').match(/-?\d+(\.\d+)?/g)!.map(Number);
    const pts = Array.from({ length: nums.length / 2 }, (_, i) => [nums[2 * i]!, nums[2 * i + 1]!] as const);
    if (pts.length === 3) return 'un triangle';
    const side = (i: number) => Math.hypot(pts[i]![0] - pts[(i + 1) % 4]![0], pts[i]![1] - pts[(i + 1) % 4]![1]);
    return Math.abs(side(0) - side(1)) < 1 ? 'un carré' : 'un rectangle';
  });
  await page.locator('.pic-choices .choice', { hasText: new RegExp(`^${name}$`) }).click();
}

async function play10(page: Page, answer: (page: Page) => Promise<void>) {
  for (let i = 0; i < 10; i++) {
    await answer(page);
    await expect(page.locator('.fb-sheet.ok')).toBeVisible();
    await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
}

test("CP : monnaie et heure, leçon de l'horloge, l'heure juste sans faute, grille", async ({ page }) => {
  test.setTimeout(90_000);
  await seedProd(page, [cpKid()], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await page.locator('.isles-strip').click();
  await page.locator('.op-card', { hasText: 'Mesurer' }).click();
  await expect(page.locator('.isle')).toHaveCount(4);
  await expect(page.locator('.isle:not(.locked)')).toHaveCount(2);
  await page.locator('.isle').nth(2).click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Horloge');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.pic-ex')).toHaveCount(4);
  await page.getByRole('button', { name: "Je m'entraîne" }).click();
  await expect(page.locator('.scr-q.pic')).toBeVisible();
  await page.screenshot({ path: 'test-results/grd-q.png' });
  await play10(page, answerClock);
  await page.waitForTimeout(2600);
  while (await page.locator('.overlay').count()) await page.locator('.overlay .btn-isle').click();
  await page.locator('.end-grid').click();
  await expect(page.locator('.op-tabs button[aria-pressed="true"]')).toContainText('Monnaie et heure');
  await expect(page.locator('.tbl .tr')).toHaveCount(4);
});

test('CP : la monnaie, une question dessinée et son aide', async ({ page }) => {
  await seedProd(page, [cpKid()], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await page.locator('.isles-strip').click();
  await page.locator('.op-card', { hasText: 'Mesurer' }).click();
  await page.locator('.isle').first().click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Tirelire');
  await page.getByRole('button', { name: /Jouer l'étape 1/ }).click();
  // Une mauvaise réponse ouvre l'aide (dessin et astuce).
  const choices = page.locator('.pic-choices .choice');
  await expect(choices).toHaveCount(3);
  for (let i = 0; i < 3 && !(await page.locator('.fb-sheet.help').count()); i++) {
    await choices.nth(i).click();
    if (await page.locator('.fb-sheet.ok').count()) await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  await expect(page.locator('.fb-sheet.help .pic-aid svg')).toBeVisible();
  await expect(page.locator('#fbTip')).not.toBeEmpty();
});

test('CP : les formes, leçon, reconnaître sans faute, grille', async ({ page }) => {
  test.setTimeout(90_000);
  await seedProd(page, [cpKid()], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await page.locator('.isles-strip').click();
  await page.locator('.op-card', { hasText: 'Formes' }).click();
  await expect(page.locator('.isle')).toHaveCount(4);
  await expect(page.locator('.isle:not(.locked)')).toHaveCount(2);
  await page.locator('.isle').first().click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Mosaïque');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.pic-ex')).toHaveCount(4);
  await page.getByRole('button', { name: "Je m'entraîne" }).click();
  await page.screenshot({ path: 'test-results/esp-q.png' });
  await play10(page, answerShape);
  await page.goto(page.url().replace(/#.*$/, ''));
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await page.getByRole('button', { name: 'Ma grille' }).click();
  await page.locator('.op-tabs button', { hasText: 'Formes et espace' }).click();
  await expect(page.locator('.tbl .tr')).toHaveCount(4);
});

test('CP : se repérer, le chat et la boîte', async ({ page }) => {
  await seedProd(page, [cpKid()], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await page.locator('.isles-strip').click();
  await page.locator('.op-card', { hasText: 'Formes' }).click();
  await page.locator('.isle').nth(3).click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Cabane');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.pic-ex')).toHaveCount(8);
  await page.getByRole('button', { name: "Je m'entraîne" }).click();
  await expect(page.locator('.pic-choices .choice')).toHaveCount(3);
});
