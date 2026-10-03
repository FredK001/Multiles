/* Écran 10 : grille de Pythagore et pièges. */
import { useState } from 'preact/hooks';
import { mascot } from '../art';
import { useProfileTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { trapsCfg } from '../app/sessions';
import { BtnSay, Svg, TabBar } from '../app/ui';
import { ISLES, ofIsle, type IsleId } from '../content/isles';
import { tipFor } from '../content/messages';
import { nb } from '../content/text';
import { applyIsleTheme } from '../design/theme';
import { parseKey } from '../engine/keys';
import { stageFor } from '../engine/level';
import { gridCount, isMastered, isTrap } from '../engine/mastery';
import { opProg } from '../engine/progress';
import { isOpen, tableId } from '../engine/unlock';
import { AidGrid } from './Aid';
import { GridCP } from './GridCP';

export function Grid() {
  const p = usePlayer();
  return p.op === 'mul' ? <GridTable /> : <GridCP />;
}

function GridTable() {
  const p = usePlayer();
  const { go } = useApp();
  const [sel, setSel] = useState<[number, number] | null>(null);
  useBack(() => (sel ? setSel(null) : go({ name: 'home' })));
  useProfileTheme(p.color);
  const stage = stageFor(p.level);
  const o = opProg(p, 'mul');

  const count = gridCount(o.mastered, o.traps);
  const tally: Record<number, number> = {};
  const head = [<span key="x" class="h x" aria-hidden="true">×</span>];
  for (let c = 1; c <= 10; c++) head.push(<span key={`h${c}`} class="h" aria-hidden="true">{c}</span>);
  const rows = [];
  for (let r = 1; r <= 10; r++) {
    let full = true;
    for (let c = 1; c <= 10; c++) if (!isMastered(o.mastered, r, c)) full = false;
    rows.push(<span key={`r${r}`} class={`h r ${full ? 'full' : ''}`} style={{ background: ISLES[r as IsleId].fort }} aria-hidden="true">{r}</span>);
    for (let c = 1; c <= 10; c++) {
      const m = isMastered(o.mastered, r, c), t = isTrap(o.traps, r, c), own = o.mastered.includes(`${r}x${c}` as never) ? r : c;
      if (m && !t) tally[own] = (tally[own] ?? 0) + 1;
      const isSel = !!sel && sel[0] === r && sel[1] === c;
      const hl = !!sel && !isSel && (sel[0] === r || sel[1] === c) && !m && !t;
      rows.push(
        <button
          key={`${r}x${c}`}
          class={`c ${t ? 't' : m ? 'm' : ''} ${isSel ? 'sel' : ''} ${hl ? 'hl' : ''}`}
          style={m && !t ? { background: ISLES[own as IsleId].fort } : undefined}
          aria-label={`${r} fois ${c}${t ? ', piège' : m ? `, ${r * c}, maîtrisée` : ', à découvrir'}`}
          onClick={() => setSel([r, c])}
        >
          {m || t ? r * c : ''}
        </button>,
      );
    }
  }
  const traps = o.traps.map(parseKey);

  let sheet = null;
  if (sel) {
    const [r, c] = sel, m = isMastered(o.mastered, r, c), t = isTrap(o.traps, r, c);
    const open = isOpen(o.series, tableId(r)) || isOpen(o.series, tableId(c));
    applyIsleTheme(ISLES[r as IsleId].fort, ISLES[r as IsleId].clair);
    const badge = t
      ? <span class="cs-badge" style={{ background: 'var(--miel)' }}>{nb("Piège : on s'entraîne")}</span>
      : m
        ? <span class="cs-badge" style={{ background: 'var(--feuille)', color: '#fff' }}>Maîtrisée</span>
        : <span class="cs-badge">{open ? 'À découvrir' : `Sur l'île ${ofIsle(r as IsleId)}`}</span>;
    sheet = (
      <div class="cell-sheet">
        <div class="cs-top">
          <div style={{ flex: 1 }}>
            {badge}
            <p class="fb-eq" style={{ textAlign: 'left', marginTop: '8px' }}>{r} × {c} = {m || t ? r * c : '?'}</p>
          </div>
          <BtnSay wrap style={{ background: 'var(--lagon)' }} text={m || t ? `${r} fois ${c} égale ${r * c}. ${tipFor(r, c)}` : `${r} fois ${c}. À découvrir.`} />
        </div>
        {m || t ? (
          <div class="aid">
            <div class="aid-top"><span>{r} rangées de {c}</span><span>{r * c} en tout</span></div>
            <AidGrid rows={r} cols={c} />
            <p class="tip" style={{ fontSize: '16px' }}>{nb(tipFor(r, c))}</p>
          </div>
        ) : (
          <p style={{ fontSize: '17px' }}>{nb(`Tu la découvriras en jouant sur l'île ${ofIsle(r as IsleId)}${r !== c ? ` ou ${ofIsle(c as IsleId)}` : ''}.`)}</p>
        )}
        <button class="btn-primary" onClick={() => setSel(null)}>Fermer</button>
      </div>
    );
  }

  return (
    <section class="screen" data-screen="grid" aria-label="Ma grille">
      <div class="topbar tri">
        <span></span>
        <div class="ttl" style={{ fontSize: '26px' }}>Ma grille</div>
        <BtnSay style={{ justifySelf: 'end', background: '#fff' }} text={`${count}  cases sur 100. Touche une case pour voir sa multiplication.`} />
      </div>
      <div class="grid-scroll">
        <div class="g-head"><p class="g-big">{count} <small>cases sur 100</small></p></div>
        <div class="g-bar" aria-hidden="true">
          {Object.keys(tally).map(Number).sort((a, b) => a - b).map((r) => <i key={r} style={{ width: `${tally[r]}%`, background: ISLES[r as IsleId].fort }}></i>)}
        </div>
        <div class="pyth-card">
          <div class="pyth" role="group" aria-label="Grille de Pythagore">{head}{rows}</div>
          <div class="legend">
            <span><i style={{ background: '#2E7A2F' }}></i>Maîtrisée</span>
            <span><i style={{ background: 'var(--miel)', borderStyle: 'dashed' }}></i>Piège</span>
            <span><i style={{ background: '#fff', borderColor: '#C9D6DC' }}></i>À découvrir</span>
          </div>
        </div>
        <div class="g-tip">
          <span><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, size: 52 })} /></span>
          <span>{nb("Astuce : 7 × 8 et 8 × 7, c'est pareil. Une case gagnée en colore deux !")}</span>
        </div>
        <div class="traps">
          {traps.length ? (
            <>
              <div><h2>Mes multiplications pièges</h2><p class="sub">{nb('Elles reviennent plus souvent. Encore un effort !')}</p></div>
              <div class="trap-chips">
                {traps.map(([a, b]) => <button key={`${a}x${b}`} class="tchip" onClick={() => setSel([a, b])}>{a} × {b}</button>)}
              </div>
              <button class="btn-primary" onClick={() => go({ name: 'question', cfg: trapsCfg(o.traps), back: { name: 'grid' } })}>{nb('Entraîner mes pièges')}</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'joie', size: 56, noSparkle: true })} /></span>
              <div><h2>{nb('Aucun piège !')}</h2><p class="sub">{nb('Les multiplications difficiles apparaîtront ici.')}</p></div>
            </div>
          )}
        </div>
      </div>
      <TabBar current="grid" />
      {sheet}
    </section>
  );
}
