/* Parcours de bout en bout sur le build de production : création de profil, session complète,
   achat en boutique, défi chrono, défi du jour, verrou parent. */
import { expect, test, type Page } from '@playwright/test';
import { answer, kid, next, PROD, seedProd, solveGate as solve, openMap, playOp } from '../helpers';



async function createKid(page: Page, name: string, pepin = 0, grade: 'CP' | 'CM1' = 'CM1') {
  await page.getByRole('button', { name: 'Nouveau joueur' }).click();
  await expect(page.getByRole('button', { name: 'Suivant' })).toHaveAttribute('aria-disabled', 'true');
  await page.getByLabel('Ton prénom').fill(name);
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expect(page.getByRole('button', { name: 'Suivant' })).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('group', { name: 'Classe' }).getByRole('button', { name: new RegExp(`^${grade} `) }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.locator('.ed-tabs .tab', { hasText: 'Coiffure' }).click();
  await page.getByRole('button', { name: 'Bouclé' }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expect(page.getByRole('button', { name: /C'est parti/ })).toHaveAttribute('aria-disabled', 'true');
  await page.locator('.pep-card').nth(pepin).click();
  await page.getByRole('button', { name: /C'est parti/ }).click();
}

async function openKid(page: Page, name: string) {
  await page.getByRole('button', { name: `Jouer avec le profil de ${name}` }).click();
  await page.locator('[data-screen="home"]').waitFor();
}

const coins = async (page: Page) => Number(await page.locator('.stat.coin').innerText());

const seed = (page: Page, profile: Record<string, unknown>) => seedProd(page, [profile]);


test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  (page as unknown as { __errors: string[] }).__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errors: string[] }).__errors, 'aucune erreur JavaScript').toEqual([]);
});

test('création de profil : prénom, avatar, Pépin, puis accueil', async ({ page }) => {
  await page.goto(PROD + '/');
  await createKid(page, '  zoé ');
  await expect(page.locator('.pcard', { hasText: 'Zoé' })).toBeVisible();
  await openKid(page, 'Zoé');
  await expect(page.locator('.home-hello')).toContainText('Zoé');
  expect(await coins(page)).toBe(50);
  await expect(page.locator('.joker')).toContainText('1 bouée');
  // Le profil survit au rechargement.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Jouer avec le profil de Zoé' })).toBeVisible();
});

test('session complète : étoiles, pièces, grille, île suivante', async ({ page }) => {
  await page.goto(PROD + '/');
  await createKid(page, 'Léo');
  await openKid(page, 'Léo');
  await playOp(page);
  await expect(page.locator('.q-place small')).toHaveText('Étape 1');
  let asked = 0;
  for (let i = 0; i < 14 && !(await page.locator('[data-screen="end"]').count()); i++) {
    await answer(page, i !== 2); // une erreur : la question revient en fin de file
    asked++;
    await next(page);
  }
  expect(asked).toBe(11);
  await expect(page.locator('[data-screen="end"]')).toBeVisible();
  await expect(page.locator('.stars3')).toHaveAttribute('aria-label', '3 étoiles sur 3'); // 9 du premier coup
  await expect(page.locator('.es').first()).toContainText('9');
  await page.waitForTimeout(2600);
  while (await page.locator('.overlay').count()) await page.locator('.overlay .btn-isle').click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.locator('[data-screen="isle"] .stp').nth(1)).toContainText('À toi');
  await page.getByRole('button', { name: 'Carte' }).click();
  await page.getByRole('button', { name: 'Retour' }).click();
  expect(await coins(page)).toBe(50 + 10 + 6); // +1 par bonne réponse, +2 par étoile
  await page.locator('.tabbtn', { hasText: 'Ma grille' }).click();
  // Maîtrisées : 1×1…1×5 sauf celle ratée (devenue piège). 1×1 colore 1 case, les autres 2 (avec leur symétrique).
  await expect(page.locator('.tchip')).toHaveCount(1);
  const missed = Number((await page.locator('.tchip').innerText()).split('×')[1]);
  await expect(page.locator('.g-big')).toContainText(`${missed === 1 ? 8 : 7} cases sur 100`);
});

test('achat en boutique en deux temps, persistant', async ({ page }) => {
  await seed(page, kid({ coins: 50 }));
  await openKid(page, 'Nina');
  await page.locator('.stat.coin').click();
  await page.locator('.cat3 button', { hasText: 'Pépin' }).click();
  await page.getByRole('button', { name: /Couronne, 150 pièces/ }).click();
  await expect(page.locator('.shop-foot .btn-primary')).toHaveText('Encore 100 pièces');
  await expect(page.locator('.shop-foot .btn-primary')).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('button', { name: /Lunettes rondes, 40 pièces/ }).click();
  await expect(page.locator('.shop-stage .tag')).toHaveText('Essai');
  await page.locator('.shop-foot .btn-primary').click();
  await expect(page.locator('.shop-foot .btn-primary')).toHaveText("Oui, je l'achète");
  await expect(page.locator('.shop-foot .hint')).toHaveText('Il te restera 10 pièces.');
  await page.locator('.shop-foot .btn-primary').click();
  await expect(page.locator('.toast')).toHaveText('Lunettes rondes : à toi !');
  await expect(page.locator('.coinpill')).toContainText('10');
  await expect(page.getByRole('button', { name: 'Lunettes rondes, porté' })).toBeVisible();
  await page.reload();
  await openKid(page, 'Nina');
  expect(await coins(page)).toBe(10);
  await page.locator('.stat.coin').click();
  await page.locator('.cat3 button', { hasText: 'Pépin' }).click();
  await page.getByRole('button', { name: 'Lunettes rondes, porté' }).click();
  await page.locator('.shop-foot .btn-primary', { hasText: 'Enlever' }).click();
  await expect(page.getByRole('button', { name: 'Lunettes rondes, à toi' })).toBeVisible();
});

test('défi chrono : 60 s, questions illimitées, nouveau record', async ({ page }) => {
  await page.clock.install();
  await seed(page, kid({ isl: { 1: { steps: 1, trophy: false, stepStars: [2, 0, 0] } }, records: { 1: 3 } }));
  await openKid(page, 'Nina');
  await openMap(page);
  await page.locator('.isle[aria-label^="Île 1,"]').click();
  await expect(page.locator('.modes2 .discover').nth(1)).toContainText('Ton record : 3');
  await page.locator('.modes2 .discover').nth(1).click();
  await expect(page.locator('.q-count .clock')).toContainText('1:00');
  for (let i = 0; i < 5; i++) {
    await answer(page);
    await page.locator('.fb-sheet.ok').waitFor();
    await page.clock.runFor(700); // feedback de 0,65 s en mode chrono
  }
  await expect(page.locator('.q-count')).toContainText('5 bonnes réponses');
  // Erreur : le chrono se met en pause pendant l'aide.
  await answer(page, false);
  await expect(page.locator('.q-count')).toContainText('(pause)');
  const t = await page.locator('.clock').innerText();
  await page.clock.runFor(10_000);
  await expect(page.locator('.clock')).toHaveText(t);
  await page.getByRole('button', { name: "J'ai compris" }).click();
  await page.clock.runFor(61_000);
  await page.clock.runFor(1_500);
  await expect(page.locator('[data-screen="end"] h1')).toHaveText('Nouveau record, Nina !');
  await page.clock.runFor(3_000);
  await expect(page.locator('.overlay h2')).toHaveText('Nouveau record !');
  await page.locator('.overlay .btn-isle').click();
  await page.getByRole('button', { name: 'Voir mon île' }).click();
  await expect(page.locator('.modes2 .discover').nth(1)).toContainText('Ton record : 5');
});

test('défi du jour : 8 bonnes réponses, coffre et bonus, une fois par jour', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 2, 10));
  await seed(page, kid({ defiPick: { day: '2026-10-02', table: 5 } }));
  await openKid(page, 'Nina');
  await expect(page.locator('.hcard').nth(1)).toContainText('Table de 5 : 8 réponses en 1 minute.');
  await page.locator('.hcard').nth(1).click();
  for (let i = 0; i < 8; i++) { await answer(page); await next(page); }
  await expect(page.locator('[data-screen="end"] h1')).toHaveText('Défi réussi, Nina !');
  await page.waitForTimeout(2600);
  await expect(page.locator('.overlay p')).toHaveText('+20 pièces bonus pour le défi du jour.');
  await page.locator('.overlay .btn-isle').click();
  await page.getByRole('button', { name: "Retour à l'accueil" }).click();
  expect(await coins(page)).toBe(50 + 8 + 20);
  await expect(page.locator('.hcard.done')).toContainText("Réussi ! Un nouveau défi t'attend demain.");
});

test('verrou parent : nouvelle opération en cas d\'erreur, accès, réglages enregistrés', async ({ page }) => {
  await seed(page, kid());
  await page.locator('#btnParent').click();
  const q = page.locator('.gate .q b');
  const type = async (v: string) => { for (const k of [...v, 'Valider']) await page.locator('.gate .key', { hasText: new RegExp(`^${k}$`) }).click(); };
  await type(String(solve((await q.textContent())!) + 1));
  await expect(page.locator('.gate .msg')).toHaveText("Ce n'est pas le bon résultat. Voici une nouvelle opération.");
  await expect(page.locator('.par-body')).toHaveCount(0);
  await type(String(solve((await q.textContent())!)));
  await expect(page.locator('.par-body')).toBeVisible();
  await expect(page.locator('.kid', { hasText: 'Nina' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Sans' }).click();
  await page.getByRole('switch', { name: 'Sons' }).click();
  await page.getByRole('button', { name: 'Renommer' }).click();
  await page.getByLabel('Nouveau prénom').fill('ninon');
  await page.getByLabel('Nouveau prénom').press('Enter');
  await expect(page.locator('.prow b')).toHaveText('Ninon');
  await page.getByRole('button', { name: "Fermer l'espace parent" }).click();
  // Fermer reverrouille.
  await page.locator('#btnParent').click();
  await expect(page.locator('.gate')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Jouer avec le profil de Ninon' })).toBeVisible();
  await page.locator('#btnParent').click();
  await type(String(solve((await q.textContent())!)));
  await expect(page.getByRole('button', { name: 'Sans' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('switch', { name: 'Sons' })).toHaveAttribute('aria-checked', 'false');
});

test('toucher le feedback vert ne saute pas de question', async ({ page }) => {
  await seed(page, kid());
  await openKid(page, 'Nina');
  await playOp(page);
  await answer(page);
  await page.locator('.fb-sheet.ok').click({ force: true });
  await page.waitForTimeout(2000);
  await expect(page.locator('.q-count')).toHaveText('Question 2 sur 10');
});
