/* Question de nombres jusqu'à 100 (CP) : le dessin (barres de dix et cubes, droite graduée) ou les nombres en grand,
   puis la case de la réponse. Les propositions et le pavé sont ceux des calculs. */
import type { ComponentChildren } from 'preact';
import { INK } from '../art/shapes';
import { Svg } from '../app/ui';
import { NUM_SIGNS } from '../engine/numbers';
import type { Question } from '../engine/questions';

const ROD = '#F28C28', CUBE = '#2F6FE4';

/** Barres de dix (a) et cubes (b), comme le matériel de la classe. */
export function tensArt(a: number, b: number, h = 120): string {
  const cell = 10, gap = 6, rodW = cell + 4, w = a * (rodW + gap) + (b ? 2 * (cell + 3) + gap : 0);
  let s = '';
  for (let i = 0; i < a; i++) {
    const x = 4 + i * (rodW + gap);
    s += `<rect x="${x}" y="4" width="${rodW}" height="${10 * cell}" rx="3" fill="${ROD}" stroke="${INK}" stroke-width="2.5"/>`;
    for (let k = 1; k < 10; k++) s += `<path d="M${x} ${4 + k * cell} h${rodW}" stroke="${INK}" stroke-width="1.2"/>`;
  }
  for (let j = 0; j < b; j++) {
    const x = 4 + a * (rodW + gap) + (j % 2) * (cell + 3), y = 4 + 10 * cell - (Math.floor(j / 2) + 1) * (cell + 3) + 3;
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

/** Tour de n cubes (1 à 10), à la même échelle pour toutes les tours : la plus haute est le plus grand nombre. */
export function towerArt(n: number, h = 120): string {
  const cell = 12, top = 4 + (10 - n) * cell;
  let s = '';
  for (let j = 0; j < n; j++) s += `<rect x="4" y="${top + j * cell}" width="${cell + 4}" height="${cell}" rx="2" fill="${CUBE}" stroke="${INK}" stroke-width="1.8"/>`;
  const vw = cell + 12, vh = 10 * cell + 8;
  return `<svg width="${Math.round((vw * h) / vh)}" height="${h}" viewBox="0 0 ${vw} ${vh}" aria-hidden="true">${s}</svg>`;
}

/** Ce qu'affiche une proposition : le nombre, ou le signe pour l'île des signes (réponses 0, 1, 2). */
export const numLabel = (q: Question, c: number): string => (q.num?.set === 'signe' ? NUM_SIGNS[c]! : String(c));
/** Nom d'une proposition pour les lecteurs d'écran. */
export const numAria = (q: Question, c: number): string | undefined => (q.num?.set === 'signe' ? ['plus petit que', 'égal à', 'plus grand que'][c] : undefined);

/** Les tours de cubes de chaque nombre, avec le nombre dessous (jusqu'à 10). */
function Towers({ nums, h }: { nums: number[]; h: number }) {
  return (
    <div class="num-towers" role="img" aria-label={nums.map((n) => `${n} cube${n > 1 ? 's' : ''}`).join(' et ')}>
      {nums.map((n, i) => <span key={i}><Svg html={towerArt(n, h)} /><b>{n}</b></span>)}
    </div>
  );
}

export function NumCard({ q, slot }: { q: Question; slot: ComponentChildren }) {
  const { set, x: a, y: b } = q.num!;
  if (set === 'du') return <div class="num-card"><span role="img" aria-label={`${a} barre${a > 1 ? 's' : ''} de dix et ${b} cube${b > 1 ? 's' : ''}`}><Svg html={tensArt(a, b)} /></span><div class="expr num-ans"><span class="op">=</span>{slot}</div></div>;
  if (set === 'suite') {
    return <div class="expr num-ans">{b === 1 ? <><span>{a}</span><span class="op">→</span>{slot}</> : <>{slot}<span class="op">→</span><span>{a}</span></>}</div>;
  }
  const { z, k = 0 } = q.num!, which = k === 0 ? 'Le plus petit ?' : 'Le plus grand ?';
  if (set === 'pg') return <div class="num-card"><Towers nums={[a, b]} h={120} /><div class="num-ask">{which}</div></div>;
  if (set === 'signe') {
    // Jusqu'à 10, la tour de cubes de chaque nombre est posée au-dessus de lui.
    const cubes = a > 0 && b > 0 && a <= 10 && b <= 10;
    const n = (v: number) => (cubes ? <span class="num-col"><Svg html={towerArt(v, 100)} /><span>{v}</span></span> : <span>{v}</span>);
    return <div class="expr num-ans num-signe" role={cubes ? 'group' : undefined} aria-label={cubes ? `${a} cube${a > 1 ? 's' : ''} et ${b} cube${b > 1 ? 's' : ''}` : undefined}>{n(a)}{slot}{n(b)}</div>;
  }
  if (set === 'vf') return <div class={`expr num-ans num-claim${k >= 2 ? ' words' : ''}`}>{numClaimView(a, b, k)}</div>;
  if (set === 'trois') return <div class="num-card"><div class="expr num-ans three"><span>{a}</span><span>{b}</span><span>{z}</span></div><div class="num-ask">{which}</div></div>;
  if (set === 'comp') return <div class="expr num-ans"><span>{a}</span><span class="op">ou</span><span>{b}</span><span class="op">?</span></div>;
  return <div class="num-card"><span role="img" aria-label={`Droite graduée de ${a} à ${a + 10}, un nombre caché`}><Svg html={lineArt(a, b)} /></span><div class="expr num-ans"><span class="op">?</span><span class="op">=</span>{slot}</div></div>;
}

/** Affirmation du vrai/faux : le signe en grand, ou la phrase. */
function numClaimView(a: number, b: number, k: number) {
  if (k >= 2) return <span>{a} est plus {k === 2 ? 'petit' : 'grand'} que {b}</span>;
  return <><span>{a}</span><span class="op">{k === 0 ? '<' : '>'}</span><span>{b}</span></>;
}
