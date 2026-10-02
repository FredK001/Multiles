/* Quadrillage d'aide « a rangées de b » (feuille d'erreur et grille). */
export function AidGrid({ rows, cols }: { rows: number; cols: number }) {
  const d = Math.max(8, Math.min(18, Math.floor(Math.min(290 / cols, 118 / rows)) - 3));
  return (
    <div class="aid-grid" style={{ '--d': `${d}px`, gridTemplateColumns: `repeat(${cols},${d}px)` }}>
      {Array.from({ length: rows * cols }, (_, i) => <i key={i} class={Math.floor(i / cols) % 2 ? 'alt' : ''}></i>)}
    </div>
  );
}
