/* Lecture au CP sur le build de production : lire une phrase et toucher le bon dessin ; dictée de mots au clavier de lettres
   (avec la voix, puis sans voix : le dessin remplace la voix). */
import { expect, test, type Page } from '@playwright/test';
import { dictKeys, PICS, READ_SETS } from '../../src/content/reading';
import { kid, seedProd } from '../helpers';

/** Profil CP au format v3, les 5 îles de sons gagnées (phrases et dictée ouvertes jusqu'à « Grandes phrases »). */
const cpKid = () => {
  const { isle: _i, isl: _l, mastered: _m, traps: _t, trapLog: _g, records: _r, stickers: _s, defiDay: _d, defiPick: _p, stars: _st, ...rest } = kid({ id: 'cp1', name: 'Tom', color: '#C8371D' });
  const won = { steps: 3, trophy: true, stepStars: [3, 3, 3] };
  const series = Object.fromEntries(['lec-voy', 'lec-syl1', 'lec-syl2', 'lec-sons', 'lec-mots'].map((id) => [id, won]));
  return { ...rest, grade: 'CP', op: 'lec', autoSpeech: false, prog: { lec: { current: 'lec-phr1', series, mastered: [], traps: [], trapLog: {}, records: {}, stickers: [] } } };
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

/** Ouvre l'île de lecture n° `n` (0 = Baie) et lance l'étape 1. */
async function openIsle(page: Page, n: number, name: string) {
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await page.locator('.isles-strip').click();
  await page.locator('.op-card', { hasText: 'Lire' }).click();
  await expect(page.locator('.isle')).toHaveCount(9);
  await page.locator('.isle').nth(n).click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText(name);
}

/** Bon dessin d'une phrase, d'après le contenu. */
const picOf = (sentence: string): string => PICS[READ_SETS.flatMap((s) => s.items).find((it) => it.w === sentence)!.pic!].label;

/** Mot dicté d'après le dessin (question sans voix). */
const wordOfPic = (label: string): string => {
  const it = READ_SETS.filter((s) => s.kind === 'dictee').flatMap((s) => s.items).find((x) => PICS[x.pic!].label === label)!;
  return it.w;
};

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  (page as unknown as { __errors: string[] }).__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errors: string[] }).__errors, 'aucune erreur JavaScript').toEqual([]);
});

test('CP : phrases, imagier, session complète sans faute, une erreur montre la phrase et son dessin', async ({ page }) => {
  test.setTimeout(90_000);
  await voice(page, true);
  await seedProd(page, [cpKid()], undefined, 3);
  await openIsle(page, 5, 'Kiosque');
  await page.getByRole('button', { name: /Découvrir/ }).click();
  await expect(page.locator('.img-card.phrase')).toHaveCount(READ_SETS[5]!.items.length);
  await page.getByRole('button', { name: "Je m'entraîne" }).click();

  await expect(page.locator('.read-phrase')).toBeVisible();
  await expect(page.locator('.read-pics .choice')).toHaveCount(3);
  // Une erreur exprès sur la première question : l'aide montre la phrase et le bon dessin.
  const first = (await page.locator('.read-phrase').textContent())!;
  const labels = await page.locator('.read-pics .choice').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
  await page.locator('.read-pics .choice').nth(labels.findIndex((l) => l !== picOf(first))).click();
  await expect(page.locator('.fb-sheet.help .read-aid.phrase b')).toHaveText(first);
  await expect(page.locator('.fb-sheet.help .read-aid .read-pic')).toHaveAttribute('aria-label', picOf(first));
  await page.getByRole('button', { name: "J'ai compris" }).click();

  for (let i = 0; i < 40 && !(await page.locator('[data-screen="end"]').count()); i++) {
    const t = (await page.locator('.read-phrase').textContent())!;
    await page.getByRole('button', { name: picOf(t), exact: true }).click();
    await expect(page.locator('.fb-sheet.ok')).toBeVisible();
    await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
});

test('CP : dictée avec la voix, clavier de lettres, effacer, valider', async ({ page }) => {
  test.setTimeout(90_000);
  await voice(page, true);
  await seedProd(page, [cpKid()], undefined, 3);
  await openIsle(page, 6, 'Ardoise');
  await page.getByRole('button', { name: /Jouer l'étape 1/ }).click();

  await expect(page.getByRole('button', { name: 'Réécouter le mot' })).toBeVisible();
  await expect(page.locator('.dict-slot').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Valider' })).toHaveAttribute('aria-disabled', 'true');
  // Erreur exprès : une seule lettre, puis valider ; l'aide épelle le mot et montre le dessin.
  await page.locator('.dict-key').first().click();
  await page.getByRole('button', { name: 'Effacer la dernière lettre' }).click();
  await expect(page.locator('.dict-slot.filled')).toHaveCount(0);
  await page.locator('.dict-key').first().click();
  await page.getByRole('button', { name: 'Valider' }).click();
  const aid = page.locator('.fb-sheet.help .dict-spell');
  await expect(aid).toBeVisible();
  await expect(page.locator('.fb-sheet.help .read-aid .read-pic')).toHaveAttribute('role', 'img');
  await page.getByRole('button', { name: "J'ai compris" }).click();

  // Suite de la session : le mot est retrouvé d'après le contenu (le clavier d'un mot lui est propre).
  for (let i = 0; i < 40 && !(await page.locator('[data-screen="end"]').count()); i++) {
    const keys = [...(await page.locator('.dict-key').allTextContents())].sort().join('');
    const w = READ_SETS[6]!.items.find((it) => dictKeys(it).sort().join('') === keys)!.w;
    for (const l of w) await page.getByRole('button', { name: `Lettre ${l}`, exact: true }).click();
    await page.getByRole('button', { name: 'Valider' }).click();
    await page.locator('.fb-sheet').waitFor();
    if (await page.locator('.fb-sheet.help').count()) await page.getByRole('button', { name: "J'ai compris" }).click();
    else await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
});

test('CP : dictée sans voix française, le dessin remplace la voix ; clavier physique', async ({ page }) => {
  await voice(page, false);
  await seedProd(page, [cpKid()], undefined, 3);
  await openIsle(page, 6, 'Ardoise');
  await page.getByRole('button', { name: /Jouer l'étape 1/ }).click();
  await expect(page.getByRole('button', { name: 'Réécouter le mot' })).toHaveCount(0);
  const pic = page.locator('.q-card .read-pic[role="img"]');
  await expect(pic).toBeVisible();
  await expect(page.locator('.bubble .t')).toHaveText('Écris le mot du dessin.');
  const w = wordOfPic((await pic.getAttribute('aria-label'))!);
  await page.keyboard.type(w);
  await page.keyboard.press('Enter');
  await expect(page.locator('.fb-sheet.ok')).toBeVisible();
});
