/* Niveau CP sur le build de production : création, choix de l'opération mémorisé, session complète
   sans nombre négatif, coexistence avec un enfant de CM1, changement de classe sans perte. */
import { expect, test, type Page } from '@playwright/test';
import { answer, kid, next, openMap, playOp, PROD, seedProd, solveGate } from '../helpers';

/** Profil CP au format v3. */
const cpKid = (over: Record<string, unknown> = {}) => {
  const { isle: _i, isl: _l, mastered: _m, traps: _t, trapLog: _g, records: _r, stickers: _s, defiDay: _d, defiPick: _p, stars: _st, ...rest } = kid({ id: 'cp1', name: 'Tom', color: '#C8371D' });
  return { ...rest, grade: 'CP', op: 'add', autoSpeech: false, prog: {}, ...over };
};

async function openParent(page: Page) {
  await page.locator('#btnParent').click();
  const v = String(solveGate((await page.locator('.gate .q b').textContent())!));
  for (const k of [...v, 'Valider']) await page.locator('.gate .key', { hasText: new RegExp(`^${k}$`) }).click();
  await expect(page.locator('.par-body')).toBeVisible();
}

/** Joue une session complète en répondant juste ; renvoie tous les nombres affichés dans les calculs. */
async function playSession(page: Page): Promise<number[]> {
  const seen: number[] = [];
  for (let i = 0; i < 14 && !(await page.locator('[data-screen="end"]').count()); i++) {
    await page.locator('.expr[aria-label]').waitFor();
    const text = await page.locator('.expr').innerText();
    seen.push(...(text.match(/-?\d+/g) ?? []).map(Number));
    expect(text).not.toContain('×');
    await answer(page, true);
    await next(page);
  }
  await page.locator('[data-screen="end"]').waitFor();
  return seen;
}

test('CP : création, choix de l\'opération mémorisé, soustractions sans nombre négatif', async ({ page }) => {
  await page.goto(PROD + '/');
  await page.getByRole('button', { name: 'Nouveau joueur' }).click();
  await page.getByLabel('Ton prénom').fill('Tom');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('group', { name: 'Classe' }).getByRole('button', { name: /^CP / }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.locator('.pep-card').first().click();
  await page.getByRole('button', { name: /C'est parti/ }).click();
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();

  // « Jouer » passe par le choix de l'opération.
  await expect(page.locator('.btn-play small')).toHaveText('+ ou − ?');
  await page.locator('.btn-play').click();
  await expect(page.locator('[data-screen="ops"]')).toBeVisible();
  await page.getByRole('group', { name: 'Opération' }).getByRole('button', { name: /^Moins/ }).click();
  await expect(page.locator('.expr .op').first()).toHaveText('−');
  const numbers = await playSession(page);
  expect(numbers.length).toBeGreaterThan(20);
  expect(numbers.every((n) => n >= 0 && n <= 10)).toBe(true);
  await expect(page.locator('.end-band .sub')).toContainText('île de la Banquise');

  // Le dernier choix est mis en avant au retour.
  await page.getByRole('button', { name: /Continuer|Voir mon île/ }).click();
  await page.locator('.isd-top .btn-chip').click();
  await page.locator('#mapBack').click();
  await page.locator('.btn-play').click();
  await expect(page.getByRole('button', { name: /^Moins/ })).toHaveAccessibleName(/Dernier choix/);
  await expect(page.getByRole('button', { name: /^Plus/ })).not.toHaveAccessibleName(/Dernier choix/);
});

test('CP : la série jusqu\'à 20 s\'ouvre avec le trophée de la série jusqu\'à 10', async ({ page }) => {
  const won = { steps: 3, trophy: true, stepStars: [3, 3, 3] };
  await seedProd(page, [cpKid({ prog: { add: { current: 'add-10', series: { 'add-10': won }, mastered: [], traps: [], trapLog: {}, records: {}, stickers: [] } } })], undefined, 3);
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await page.locator('.isles-strip').click();
  await page.getByRole('button', { name: /^Plus/ }).click();
  await expect(page.locator('.isle.locked')).toHaveCount(0);
  await page.locator('#mapBack').click();
  await page.locator('.isles-strip').click();
  await page.getByRole('button', { name: /^Moins/ }).click();
  await expect(page.locator('.isle.locked')).toHaveCount(1);
  await page.locator('.isle.locked').click();
  await expect(page.locator('.toast')).toContainText('Encore 1 trophée');
});

test('CP et CM1 sur le même appareil ; changer de classe garde la progression', async ({ page }) => {
  const mulProg = { current: 'mul-5', series: { 'mul-5': { steps: 1, trophy: false, stepStars: [3, 0, 0] } }, mastered: ['5x1', '5x2'], traps: [], trapLog: {}, records: {}, stickers: [] };
  const nina = { ...cpKid({ id: 'cm1', name: 'Nina', color: '#0D7A5F', grade: 'CM1', op: 'mul', prog: { mul: mulProg } }) };
  await seedProd(page, [nina, cpKid()], undefined, 3);

  // Nina (CM1) : Jouer passe par le choix « × ou anglais », puis la multiplication de son île.
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await expect(page.locator('.btn-play small')).toHaveText('× ou EN ?');
  await playOp(page, 'Fois');
  await expect(page.locator('.expr .op').first()).toHaveText('×');
  await page.locator('#btnQuit').click();
  await page.locator('#btnSwitch').click();

  // Tom (CP) : choix de l'opération, îles du CP.
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await expect(page.locator('.isles-strip small')).toHaveText('0 sur 4 conquises');
  await page.locator('#btnSwitch').click();

  // Nina passe en CP puis revient en CM1 : sa progression en multiplication est intacte.
  await openParent(page);
  const row = page.locator('.prow', { hasText: 'Nina' });
  await row.getByRole('group', { name: 'Classe de Nina' }).getByRole('button', { name: 'CP' }).click();
  await expect(page.locator('.toast')).toContainText('Nina passe en CP');
  await row.getByRole('group', { name: 'Classe de Nina' }).getByRole('button', { name: 'CM1' }).click();
  await page.getByRole('button', { name: "Fermer l'espace parent" }).click();
  await page.getByRole('button', { name: 'Jouer avec le profil de Nina' }).click();
  await expect(page.locator('.home-stats .stat').first()).toContainText('3');
  await openMap(page, 'Fois');
  await expect(page.locator('.map-foot small')).toHaveText('Île de la Glace, étape 2');
});

test('CP : la lecture à voix haute se règle par profil', async ({ page }) => {
  await seedProd(page, [cpKid({ autoSpeech: true })], undefined, 3);
  await openParent(page);
  const sw = page.getByRole('switch', { name: 'Lecture à voix haute pour Tom' });
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  await page.reload();
  await openParent(page);
  await expect(page.getByRole('switch', { name: 'Lecture à voix haute pour Tom' })).toHaveAttribute('aria-checked', 'false');
});
