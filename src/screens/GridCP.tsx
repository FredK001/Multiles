/* Ma grille au CP : table d'addition de 0 à 10 (cases colorées une fois réussies), soustractions réussies par série,
   et les calculs pièges à entraîner. */
import { useState } from 'preact/hooks';
import { mascot } from '../art';
import { useIsleTheme, useProfileTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { trapsCfg } from '../app/sessions';
import { BtnSay, Svg, TabBar } from '../app/ui';
import { lookOf } from '../content/isles';
import { equation, tipOf } from '../content/messages';
import { CP_ZONE, OP_NAME, OP_SIGN, OP_SPOKEN, SERIES, seriesOf, type Op } from '../content/series';
import { nb } from '../content/text';
import { factKey, hasKey, parseFact } from '../engine/keys';
import { stageFor } from '../engine/level';
import { seriesPct } from '../engine/mastery';
import { opProg, opsOf } from '../engine/progress';
import { resultOf, seriesForFact } from '../engine/series';
import { AidTokens } from './Aid';

type Cell = { op: 'add' | 'sub'; a: number; b: number };

export function GridCP() {
  const p = usePlayer();
  const { go } = useApp();
  const ops = opsOf(p).filter((x): x is 'add' | 'sub' => x !== 'mul');
  const [op, setOp] = useState<'add' | 'sub'>(p.op === 'sub' ? 'sub' : 'add');
  const [sel, setSel] = useState<Cell | null>(null);
  useBack(() => (sel ? setSel(null) : go({ name: 'home' })));
  useProfileTheme(p.color);
  useIsleTheme(CP_ZONE.fort, CP_ZONE.clair);
  const o = opProg(p, op), stage = stageFor(p.level);
  const known = (c: Cell) => hasKey(o.mastered, factKey(c.op, c.a, c.b));
  const trap = (c: Cell) => hasKey(o.traps, factKey(c.op, c.a, c.b));

  let count = 0;
  const table = [];
  if (op === 'add') {
    table.push(<span key="x" class="h x" aria-hidden="true">+</span>);
    for (let c = 0; c <= 10; c++) table.push(<span key={`h${c}`} class="h" aria-hidden="true">{c}</span>);
    for (let r = 0; r <= 10; r++) {
      table.push(<span key={`r${r}`} class="h r" style={{ background: CP_ZONE.fort }} aria-hidden="true">{r}</span>);
      for (let c = 0; c <= 10; c++) {
        const cell: Cell = { op: 'add', a: r, b: c }, m = known(cell), t = trap(cell);
        if (m && !t) count++;
        const isSel = !!sel && sel.a === r && sel.b === c;
        table.push(
          <button
            key={`${r}+${c}`}
            class={`c ${t ? 't' : m ? 'm' : ''} ${isSel ? 'sel' : ''}`}
            style={m && !t ? { background: CP_ZONE.fort } : undefined}
            aria-label={`${r} plus ${c}${t ? ', piège' : m ? `, ${r + c}, réussie` : ', à découvrir'}`}
            onClick={() => setSel(cell)}
          >
            {m || t ? r + c : ''}
          </button>,
        );
      }
    }
  }
  const traps = o.traps.flatMap((k) => { const f = parseFact(k); return f && f.op === op ? [{ op, a: f.a, b: f.b } as Cell] : []; });
  const head = op === 'add' ? `${count} cases sur 121. Touche une case pour voir son addition.` : `${OP_NAME[op]} réussies par série.`;

  let sheet = null;
  if (sel) {
    const m = known(sel), t = trap(sel), r = resultOf(sel.op, sel.a, sel.b), s = seriesForFact(sel.op, sel);
    const badge = t
      ? <span class="cs-badge" style={{ background: 'var(--miel)' }}>{nb("Piège : on s'entraîne")}</span>
      : m ? <span class="cs-badge" style={{ background: 'var(--feuille)', color: '#fff' }}>Réussie</span> : <span class="cs-badge">À découvrir</span>;
    const eq = m || t ? equation({ ...sel, p: r }) : `${sel.a} ${OP_SIGN[sel.op]} ${sel.b} = ?`;
    sheet = (
      <div class="cell-sheet">
        <div class="cs-top">
          <div style={{ flex: 1 }}>
            {badge}
            <p class="fb-eq" style={{ textAlign: 'left', marginTop: '8px' }}>{eq}</p>
          </div>
          <BtnSay wrap style={{ background: 'var(--lagon)' }} text={m || t ? `${sel.a} ${OP_SPOKEN[sel.op]} ${sel.b} égale ${r}. ${tipOf(sel)}` : `${sel.a} ${OP_SPOKEN[sel.op]} ${sel.b}. À découvrir.`} />
        </div>
        {m || t ? (
          <div class="aid">
            <AidTokens op={sel.op} a={sel.a} b={sel.b} />
            <p class="tip" style={{ fontSize: '16px' }}>{nb(tipOf(sel))}</p>
          </div>
        ) : (
          <p style={{ fontSize: '17px' }}>{nb(`Tu la découvriras en jouant sur l'île ${s ? lookOf(s.id).of : ''}.`)}</p>
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
        <BtnSay style={{ justifySelf: 'end', background: '#fff' }} text={head} />
      </div>
      <div class="grid-scroll">
        {ops.length > 1 && (
          <div class="opts op-tabs" role="group" aria-label="Opération">
            {ops.map((x: Op) => (
              <button key={x} aria-pressed={x === op} onClick={() => { setOp(x as 'add' | 'sub'); setSel(null); }}><b aria-hidden="true">{OP_SIGN[x]}</b>{OP_NAME[x]}</button>
            ))}
          </div>
        )}
        {op === 'add' ? (
          <>
            <div class="g-head"><p class="g-big">{count} <small>cases sur 121</small></p></div>
            <div class="pyth-card">
              <div class="pyth cp" role="group" aria-label="Table d'addition">{table}</div>
              <div class="legend">
                <span><i style={{ background: CP_ZONE.fort }}></i>Réussie</span>
                <span><i style={{ background: 'var(--miel)', borderStyle: 'dashed' }}></i>Piège</span>
                <span><i style={{ background: '#fff', borderColor: '#C9D6DC' }}></i>À découvrir</span>
              </div>
            </div>
            <div class="g-tip">
              <span><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, size: 52 })} /></span>
              <span>{nb("Astuce : 3 + 4 et 4 + 3, c'est pareil. Une case gagnée en colore deux !")}</span>
            </div>
          </>
        ) : (
          <div class="pcard2">
            <h2>{OP_NAME[op]} <small>réussies du premier coup</small></h2>
            <div class="tbl">
              {seriesOf(op).map((d) => {
                const v = seriesPct(o.mastered, d.id);
                return (
                  <div key={d.id} class="tr">
                    <span class="n" style={{ background: CP_ZONE.fort }} aria-hidden="true">{OP_SIGN[op]}</span>
                    <span>
                      <span class="lb"><span>{SERIES[d.id].title}</span><span>{v}%</span></span>
                      <span class="bar"><i style={{ width: `${v}%`, background: CP_ZONE.fort }}></i></span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div class="traps">
          {traps.length ? (
            <>
              <div><h2>Mes calculs pièges</h2><p class="sub">{nb('Ils reviennent plus souvent. Encore un effort !')}</p></div>
              <div class="trap-chips">
                {traps.map((c) => <button key={`${c.a}${c.op}${c.b}`} class="tchip" onClick={() => setSel(c)}>{c.a} {OP_SIGN[c.op]} {c.b}</button>)}
              </div>
              <button class="btn-primary" onClick={() => go({ name: 'question', cfg: trapsCfg(traps.map((c) => factKey(c.op, c.a, c.b))), back: { name: 'grid' } })}>{nb('Entraîner mes pièges')}</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'joie', size: 56, noSparkle: true })} /></span>
              <div><h2>{nb('Aucun piège !')}</h2><p class="sub">{nb('Les calculs difficiles apparaîtront ici.')}</p></div>
            </div>
          )}
        </div>
      </div>
      <TabBar current="grid" />
      {sheet}
    </section>
  );
}
