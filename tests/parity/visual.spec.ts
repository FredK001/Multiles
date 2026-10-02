import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { gallerySections } from '../../src/lab/cases';
import { galleryHtml, type RenderedSection } from '../../src/lab/gallery';
import { runInApp, runInPrototype } from './proto';

const OUT = resolve(process.cwd(), 'test-results/visual');

async function shoot(page: Page, html: string): Promise<Buffer> {
  await page.evaluate((h) => {
    document.body.innerHTML = h;
    document.body.removeAttribute('class');
  }, html);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  return page.screenshot({ fullPage: true, animations: 'disabled' });
}

test('galerie : capture comparée prototype / application', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1200, height: 900 });
  const sections = gallerySections();
  const flat = sections.flatMap((s) => s.cases);
  const build = (svgs: string[]): RenderedSection[] => {
    let i = 0;
    return sections.map((s) => ({ title: s.title, bg: s.bg, items: s.cases.map((c) => ({ label: c.label ?? c.fn, svg: svgs[i++]! })) }));
  };

  const protoSvgs = await runInPrototype(page, flat);
  const protoPng = await shoot(page, galleryHtml(build(protoSvgs)));

  const appSvgs = await runInApp(page, flat);
  const appPng = await shoot(page, galleryHtml(build(appSvgs)));

  const a = PNG.sync.read(protoPng), b = PNG.sync.read(appPng);
  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/galerie-prototype.png`, protoPng);
  writeFileSync(`${OUT}/galerie-app.png`, appPng);
  expect(`${b.width}×${b.height}`).toBe(`${a.width}×${a.height}`);

  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  writeFileSync(`${OUT}/galerie-diff.png`, PNG.sync.write(diff));
  const ratio = n / (a.width * a.height);
  console.log(`  pixels différents : ${n} (${(ratio * 100).toFixed(3)} %)`);
  expect(ratio).toBeLessThan(0.001);
});
