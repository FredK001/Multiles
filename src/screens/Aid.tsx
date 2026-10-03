/* Quadrillage d'aide « a rangées de b » (feuille d'erreur et grille). */
export function AidGrid({ rows, cols }: { rows: number; cols: number }) {
  const d = Math.max(8, Math.min(18, Math.floor(Math.min(290 / cols, 118 / rows)) - 3));
  return (
    <div class="aid-grid" style={{ '--d': `${d}px`, gridTemplateColumns: `repeat(${cols},${d}px)` }}>
      {Array.from({ length: rows * cols }, (_, i) => <i key={i} class={Math.floor(i / cols) % 2 ? 'alt' : ''}></i>)}
    </div>
  );
}

/** Aide du CP : des jetons rangés en cadres de 10 (2 rangées de 5).
    Addition : a jetons, puis b d'une autre couleur. Soustraction : a jetons, dont les b derniers barrés. */
export function AidTokens({ op, a, b }: { op: 'add' | 'sub'; a: number; b: number }) {
  const total = op === 'add' ? a + b : a;
  const kind = (i: number) => (op === 'add' ? (i < a ? 'a' : i < total ? 'b' : '') : i < a - b ? 'a' : i < a ? 'out' : '');
  return (
    <div class="tens">
      {Array.from({ length: Math.max(1, Math.ceil(total / 10)) }, (_, f) => (
        <div key={f} class="ten">
          {Array.from({ length: 10 }, (_, k) => <i key={k} class={kind(f * 10 + k)}></i>)}
        </div>
      ))}
    </div>
  );
}
