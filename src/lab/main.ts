import '../design';
import { gallerySections, type ArtCase } from './cases';
import { galleryHtml } from './gallery';
import { runCase } from './registry';

declare global {
  interface Window {
    __lab: { run(cases: ArtCase[]): string[]; show(html: string): void };
  }
}

const root = document.getElementById('lab')!;

window.__lab = {
  run: (cases) => cases.map(runCase),
  show: (html) => { root.innerHTML = html; },
};

root.innerHTML = galleryHtml(
  gallerySections().map((s) => ({
    title: s.title,
    bg: s.bg,
    items: s.cases.map((c) => ({ label: c.label ?? c.fn, svg: runCase(c) })),
  })),
);
