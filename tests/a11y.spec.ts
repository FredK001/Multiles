/* Audit d'accessibilité axe-core (WCAG 2.1 A et AA) sur tous les écrans, avec des données réelles. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { answer } from './helpers';

const report: string[] = [];

async function audit(page: Page, name: string) {
  await page.waitForTimeout(300);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  for (const v of r.violations) report.push(`${name} : [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length}) ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
}

test('aucune violation WCAG 2.1 AA sur les écrans', async ({ page }) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => {
    const v = { lang: 'fr-FR', localService: true, name: 'Test', voiceURI: 'test', default: true };
    if ('speechSynthesis' in window) speechSynthesis.getVoices = () => [v as unknown as SpeechSynthesisVoice];
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await audit(page, 'Qui joue (vide)');
  await page.locator('#btnAdd').click();
  await audit(page, 'Création : prénom');
  await page.getByLabel('Ton prénom').fill('Lina');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('group', { name: 'Classe' }).getByRole('button', { name: /^CM1 / }).click();
  await audit(page, 'Création : classe');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await audit(page, 'Création : avatar');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.locator('.pep-card').first().click();
  await audit(page, 'Création : Pépin');
  await page.getByRole('button', { name: /C'est parti/ }).click();
  await audit(page, 'Qui joue');
  await page.getByRole('button', { name: 'Jouer avec le profil de Lina' }).click();
  await audit(page, 'Accueil');
  await page.locator('.home-disc').click();
  await audit(page, 'Éditeur');
  await page.getByRole('button', { name: 'Retour' }).click();
  await page.locator('.isles-strip').click();
  await audit(page, 'Carte');
  await page.locator('.isle[aria-label^="Île 1,"]').click();
  await audit(page, 'Île');
  await page.locator('.modes2 .discover').first().click();
  await audit(page, 'Découvrir');
  await page.getByRole('button', { name: "Je m'entraîne" }).click();
  const seen = new Set<string>();
  for (let i = 0; i < 14 && !(await page.locator('[data-screen="end"]').count()); i++) {
    const fmt = await page.locator('.q-answer > div').getAttribute('class');
    if (fmt && !seen.has(fmt)) { seen.add(fmt); await audit(page, `Question (${fmt})`); }
    await answer(page, i !== 1);
    if (await page.locator('.fb-sheet.help').count()) { await audit(page, 'Feedback erreur'); await page.getByRole('button', { name: "J'ai compris" }).click(); }
    else { if (i === 0) await audit(page, 'Feedback juste'); await page.locator('.fb-sheet').waitFor({ state: 'detached' }); }
  }
  await page.locator('[data-screen="end"]').waitFor();
  await page.waitForTimeout(2500);
  await audit(page, 'Fin de session');
  while (await page.locator('.overlay').count()) await page.locator('.overlay .btn-isle').click();
  await page.locator('.end-grid').click();
  await audit(page, 'Grille');
  await page.locator('.tchip').first().click();
  await audit(page, 'Grille : feuille de détail');
  await page.getByRole('button', { name: 'Fermer' }).click();
  await page.locator('.tabbtn', { hasText: 'Trésors' }).click();
  await audit(page, 'Boutique');
  await page.getByRole('button', { name: 'Album' }).click();
  await audit(page, 'Album');
  await page.locator('.stk.off').first().click();
  await audit(page, 'Album : fenêtre');
  console.log(report.length ? report.join('\n') : '  aucune violation');
  expect(report).toEqual([]);
});

test('aucune violation WCAG 2.1 AA sur les écrans du CP', async ({ page }) => {
  test.setTimeout(180_000);
  const rep: string[] = [];
  const check = async (name: string) => {
    await page.waitForTimeout(300);
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    for (const v of r.violations) rep.push(`${name} : [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length}) ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
  };
  await page.addInitScript(() => {
    const v = { lang: 'fr-FR', localService: true, name: 'Test', voiceURI: 'test', default: true };
    if ('speechSynthesis' in window) speechSynthesis.getVoices = () => [v as unknown as SpeechSynthesisVoice];
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#btnAdd').click();
  await page.getByLabel('Ton prénom').fill('Tom');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('group', { name: 'Classe' }).getByRole('button', { name: /^CP / }).click();
  await check('Création : classe CP');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.locator('.pep-card').first().click();
  await page.getByRole('button', { name: /C'est parti/ }).click();
  await page.getByRole('button', { name: 'Jouer avec le profil de Tom' }).click();
  await check('Accueil CP');
  await page.locator('.isles-strip').click();
  await check("Choix de l'opération");
  await page.getByRole('button', { name: /^Plus/ }).click();
  await check('Carte des additions');
  await page.locator('.isle').first().click();
  await check('Île du Lagon');
  await page.locator('.modes2 .discover').first().click();
  await check('Découvrir (CP)');
  await page.getByRole('button', { name: "Je m'entraîne" }).click();
  const seen = new Set<string>();
  for (let i = 0; i < 14 && !(await page.locator('[data-screen="end"]').count()); i++) {
    const fmt = await page.locator('.q-answer > div').getAttribute('class');
    if (fmt && !seen.has(fmt)) { seen.add(fmt); await check(`Question CP (${fmt})`); }
    await answer(page, i !== 1);
    if (await page.locator('.fb-sheet.help').count()) { await check('Aide avec jetons'); await page.getByRole('button', { name: "J'ai compris" }).click(); }
    else await page.locator('.fb-sheet').waitFor({ state: 'detached' });
  }
  await page.locator('[data-screen="end"]').waitFor();
  await page.waitForTimeout(2500);
  await check('Fin de session CP');
  while (await page.locator('.overlay').count()) await page.locator('.overlay .btn-isle').click();
  await page.locator('.end-grid').click();
  await check("Grille : table d'addition");
  await page.locator('.tchip').first().click();
  await check('Grille CP : feuille de détail');
  await page.getByRole('button', { name: 'Fermer' }).click();
  await page.getByRole('group', { name: 'Opération' }).getByRole('button', { name: /Soustractions/ }).click();
  await check('Grille : soustractions');
  await page.locator('.tabbtn', { hasText: 'Trésors' }).click();
  await page.getByRole('button', { name: 'Album' }).click();
  await check('Album CP');
  console.log(rep.length ? rep.join('\n') : '  aucune violation (CP)');
  expect(rep).toEqual([]);
});
