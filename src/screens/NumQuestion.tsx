/* Question de nombres jusqu'à 100 (CP) : le dessin (barres de dix et cubes, droite graduée) ou les nombres en grand,
   puis la case de la réponse. Les propositions et le pavé sont ceux des calculs. */
import type { ComponentChildren } from 'preact';
import { INK } from '../art/shapes';
import { Svg } from '../app/ui';
import type { Question } from '../engine/questions';

const ROD = '#F28C28', CUBE = '#2F6FE4';

/** Barres de dix (a) et cubes (b), comme le matériel de la classe. */
export function tensArt(a: number, b: number, h = 120): string {
  const cell = 10, gap = 6, rodW = cell + 4, w = a * (rodW + gap) + (b ? 2 * (cell + 3) + gap : 0);
  let s = '';
  for (let i = 0; i < a; i++) {
    const x = 4 + i * (rodW + gap);
    s += `<rect x="${x}" y="4" width="${rodW}" height="${10 * cell + 4}" rx="3" fill="${ROD}" stroke="${INK}" stroke-width="2.5"/>`;
    for (let k = 1; k < 10; k++) s += `<path d="M${x} ${4 + 2 + k * cell} h${rodW}" stroke="${INK}" stroke-width="1.2"/>`;
  }
  for (let j = 0; j < b; j++) {
    const x = 4 + a * (rodW + gap) + (j % 2) * (cell + 3), y = 4 + 10 * cell + 4 - (Math.floor(j / 2) + 1) * (cell + 3);
    s += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${CUBE}" stroke="${INK}" stroke-width="2"/>`;
  }
  const vw = Math.max(w + 8, 40), vh = 10 * cell + 12;
  return `<svg width="${Math.round((vw * h) / vh)}" height="${h}" viewBox="0 0 ${vw} ${vh}" aria-hidden="true">${s}</svg>`;
}

/** Droite graduée de a à a + 10, le nombre b caché sous un « ? ». */
export function lineArt(a: number, b: number): string {
  const x = (n: number) => 20 + (n - a) * 30;
  let s = `<path d="M10 40 H330" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M322 32 L332 40 L322 48" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  for (let n = a; n <= a + 10; n++) s += `<path d="M${x(n)} ${n === a || n === a + 10 ? 26 : 32} V48" stroke="${INK}" stroke-width="${n === a || n === a + 10 ? 4 : 2.5}"/>`;
  const lbl = (n: number, t: string, col = INK) => `<text x="${x(n)}" y="76" text-anchor="middle" font-family="Fredoka Variable, sans-serif" font-weight="700" font-size="20" fill="${col}">${t}</text>`;
  s += lbl(a, String(a)) + lbl(a + 10, String(a + 10));
  s += `<circle cx="${x(b)}" cy="40" r="9" fill="#FFC93C" stroke="${INK}" stroke-width="3"/>` + lbl(b, '?', '#B04A00');
  return `<svg width="340" height="88" viewBox="0 0 340 88" aria-hidden="true" style="max-width:100%;height:auto">${s}</svg>`;
}

export function NumCard({ q, slot }: { q: Question; slot: ComponentChildren }) {
  const { set, x: a, y: b } = q.num!;
  if (set === 'du') return <div class="num-card"><Svg html={tensArt(a, b)} /><div class="expr num-ans"><span class="op">=</span>{slot}</div></div>;
  if (set === 'suite') {
    return <div class="expr num-ans">{b === 1 ? <><span>{a}</span><span class="op">→</span>{slot}</> : <>{slot}<span class="op">→</span><span>{a}</span></>}</div>;
  }
  if (set === 'comp') return <div class="expr num-ans"><span>{a}</span><span class="op">ou</span><span>{b}</span><span class="op">?</span></div>;
  return <div class="num-card"><Svg html={lineArt(a, b)} /><div class="expr num-ans"><span class="op">?</span><span class="op">=</span>{slot}</div></div>;
}
