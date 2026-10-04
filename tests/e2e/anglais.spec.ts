/* Anglais au CM1 sur le build de production : choix « × ou anglais », carte des 18 îles,
   une session complète (mots, écoute, vrai/faux), sans erreur JavaScript, et retour à la multiplication. */
import { expect, test, type Page } from '@playwright/test';
import { kid, openMap, playOp, seedProd } from '../helpers';

/** Voix française et anglaise installées (la synthèse elle-même ne parle pas pendant le test). */
async function voices(page: Page) {
  await page.addInitScript(() => {
    const v = [{ lang: 'fr-FR', localService: true, name: 'A', voiceURI: 'a', default: true }, { lang: 'en-GB', localService: true, name: 'D', voiceURI: 'd', default: false }];
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices = () => v as unknown as SpeechSynthesisVoice[];
      speechSynthesis.speak = () => {};
    }
  });
}

/** Répond en touchant la première proposition ; après une erreur, « J'ai compris ». Renvoie le nombre d'erreurs. */
async function playThrough(page: Page): Promise<number> {
  let errors = 0;
  for (let i = 0; i < 40 && !(await page.locator('[data-screen="end"]').count()); i++) {
    await page.locator('.q-answer .choice').first().click();
    await page.locator('.fb-sheet').waitFor();
    if (await page.locator('.fb-sheet.help').count()) {
      errors++;
      await page.getByRole('button', { name: "J'ai compris" }).click();
    } else await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  return errors;
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  (page as unknown as { __errors: string[] }).__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errors: string[] }).__errors, 'aucune erreur JavaScript').toEqual([]);
});

test('CM1 : anglais choisi, carte des 18 îles, session complète, retour aux tables', async ({ page }) => {
  test.setTimeout(90_000); // une session entière, avec des erreurs (aide affichée à chaque fois)
  await voices(page);
  await seedProd(page, [kid()]);
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await expect(page.locator('.btn-play small')).toHaveText('× ou EN ?');
  await expect(page.locator('.isles-strip small')).toHaveText('0 sur 28 conquises');

  // Carte d'anglais : Hello, School, Toys ouvertes ; Family demande 1 trophée.
  await openMap(page, 'Anglais');
  await expect(page.locator('.map-head .ttl')).toContainText('Anglais');
  await expect(page.locator('.isle')).toHaveCount(18);
  await expect(page.locator('.isle:not(.locked)')).toHaveCount(3);
  await page.locator('.isle[aria-label^="Île Family,"]').click();
  await expect(page.locator('.toast')).toHaveText("Encore 1 trophée pour ouvrir l'île Family !");
  await page.locator('.isle[aria-label^="Île Hello,"]').click();
  await expect(page.locator('[data-screen="isle"] h1')).toHaveText('Hello');
  await expect(page.locator('.boss b')).toHaveText('Le gardien Mister Hi');

  // Étape 1 : 10 questions sur la première moitié des mots.
  await page.getByRole('button', { name: "Jouer l'étape 1" }).click();
  await expect(page.locator('.scr-q.eng')).toBeVisible();
  await expect(page.locator('.q-place span')).toHaveText('Hello');
  const errors = await playThrough(page);
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
  expect(errors).toBeGreaterThan(0); // la première proposition n'est pas toujours la bonne

  // L'anglais est mémorisé comme dernier choix ; les tables restent intactes.
  await page.waitForTimeout(2600);
  while (await page.locator('.overlay').count()) await page.locator('.overlay .btn-isle').click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('button', { name: 'Carte' }).click();
  await page.getByRole('button', { name: 'Retour' }).click();
  await page.locator('.btn-play').click();
  await expect(page.locator('.op-card.last')).toContainText('Anglais');
  await page.locator('#opsBack').click();
  await playOp(page, 'Fois');
  await expect(page.locator('.expr .op').first()).toHaveText('×');
});

test('sans voix anglaise : pas de question d’écoute', async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    const v = [{ lang: 'fr-FR', localService: true, name: 'A', voiceURI: 'a', default: true }];
    if ('speechSynthesis' in window) speechSynthesis.getVoices = () => v as unknown as SpeechSynthesisVoice[];
  });
  await seedProd(page, [kid()]);
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await playOp(page, 'Anglais');
  for (let i = 0; i < 12 && !(await page.locator('[data-screen="end"]').count()); i++) {
    await expect(page.locator('.eng-listen')).toHaveCount(0);
    await page.locator('.q-answer .choice').first().click();
    await page.locator('.fb-sheet').waitFor();
    if (await page.locator('.fb-sheet.help').count()) await page.getByRole('button', { name: "J'ai compris" }).click();
    else await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
});
