/* Mise en page de la galerie d'atelier. Fonction pure, sans import :
   elle sert à afficher la même galerie dans lab.html et dans le prototype (tests visuels). */

export interface RenderedSection {
  title: string;
  bg?: string;
  items: { label: string; svg: string }[];
}

const CSS = `
.lab{max-width:1200px;margin:0 auto;padding:24px 16px 48px;display:grid;gap:28px}
.lab h1{font-family:var(--titre);font-weight:700;font-size:34px;line-height:1.1}
.lab h2{font-family:var(--titre);font-weight:600;font-size:22px;margin-bottom:10px}
.lab .grid{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end}
.lab figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px;background:#fff;border:3px solid var(--ink);border-radius:18px;padding:10px;min-width:96px}
.lab figure.wide{flex:1 1 340px}
.lab figure.wide svg{width:100%;height:auto}
.lab figcaption{font-size:15px;color:var(--ink-2);text-align:center}
.lab .type{background:#fff;border:3px solid var(--ink);border-radius:18px;padding:12px 16px;display:grid;gap:4px}
.lab .t5{font-family:var(--titre);font-weight:500;font-size:28px}
.lab .t6{font-family:var(--titre);font-weight:600;font-size:28px}
.lab .t7{font-family:var(--titre);font-weight:700;font-size:62px;line-height:1}
.lab .u6{font-family:var(--ui);font-weight:600;font-size:18px}
.lab .u7{font-family:var(--ui);font-weight:700;font-size:18px}
.lab .u8{font-family:var(--ui);font-weight:800;font-size:18px}
.lab .u9{font-family:var(--ui);font-weight:900;font-size:18px}
`;

export function galleryHtml(sections: RenderedSection[]): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const wide = (svg: string) => /viewBox="0 0 (390|340) /.test(svg);
  return `<style>${CSS}</style><main class="lab">
<h1>Atelier Multîles</h1>
<div class="type">
  <span class="t5">Fredoka 500 — Qui joue ?</span>
  <span class="t6">Fredoka 600 — L'archipel des Multîles</span>
  <span class="t7">7 <span style="color:#BF3A1A">×</span> 8 = 56</span>
  <span class="u6">Nunito 600 — Juste ton prénom, rien d'autre.</span>
  <span class="u7">Nunito 700 — Chaque bonne réponse te rapporte une pièce !</span>
  <span class="u8">Nunito 800 — Touche pour continuer · Nœud · Écouteurs · Glaçor</span>
  <span class="u9">Nunito 900 — 1 234 pièces</span>
</div>
${sections.map((s) => `<section><h2>${esc(s.title)}</h2><div class="grid">${s.items.map((it) => `<figure class="${wide(it.svg) ? 'wide' : ''}" style="${s.bg ? `background:${s.bg}` : ''}">${it.svg}<figcaption>${esc(it.label)}</figcaption></figure>`).join('')}</div></section>`).join('\n')}
</main>`;
}
