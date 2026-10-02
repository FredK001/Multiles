import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Page } from '@playwright/test';
import type { ArtCase } from '../../src/lab/cases';

export const PROTOTYPE_URL = pathToFileURL(resolve(process.cwd(), 'docs/prototype/multiles-prototype.html')).href;

/** Exécute les cas dans le prototype : ses fonctions et constantes sont des globales du script. */
export async function runInPrototype(page: Page, cases: ArtCase[]): Promise<string[]> {
  await page.goto(PROTOTYPE_URL);
  return page.evaluate((cs) => cs.map((c) => {
    // eval indirect : accède à la portée lexicale globale du script du prototype
    const target = (0, eval)(c.fn) as unknown;
    return typeof target === 'function' ? (target as (...a: unknown[]) => string)(...(c.args ?? [])) : String(target);
  }), cases);
}

export async function runInApp(page: Page, cases: ArtCase[]): Promise<string[]> {
  await page.goto('/lab.html');
  await page.waitForFunction(() => 'window' in globalThis && '__lab' in window);
  return page.evaluate((cs) => window.__lab.run(cs), cases);
}

/** Les identifiants de clipPath dépendent du nombre d'avatars déjà dessinés : on les neutralise. */
export const normalizeIds = (svg: string): string => svg.replace(/id="t\d+"/g, 'id="t#"').replace(/url\(#t\d+\)/g, 'url(#t#)');
