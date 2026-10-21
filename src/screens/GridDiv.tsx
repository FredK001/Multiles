/* Ma grille en division : la part réussie de chaque table à l'envers, et les divisions pièges. */
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { mascot } from '../art';
import { useIsleTheme, useProfileTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { trapsCfg } from '../app/sessions';
import { BtnSay, Svg, TabBar } from '../app/ui';
import { lookOf } from '../content/isles';
import { equation, tipOf } from '../content/messages';
import { DIV_ZONE, seriesOf } from '../content/series';
import { nb } from '../content/text';
import { factKey, parseFact } from '../engine/keys';
import { stageFor } from '../engine/level';
import { seriesDone, seriesPct } from '../engine/mastery';
import { opProg } from '../engine/progress';
import { tableNum } from '../engine/unlock';
import { AidGrid } from './Aid';

type Div = { a: number; b: number };

export function GridDiv({ tabs }: { tabs?: ComponentChildren }) {
  const p = usePlayer();
  const { go } = useApp();
  const [sel, setSel] = useState<Div | null>(null);
  useBack(() => (sel ? setSel(null) : go({ name: 'home' })));
  useProfileTheme(p.color);
  useIsleTheme(DIV_ZONE.fort, DIV_ZONE.clair);
  const o = opProg(p, 'div'), stage = stageFor(p.level), list = seriesOf('div');
  const traps = o.traps.flatMap((k) => { const f = parseFact(k); return f && f.op === 'div' ? [{ a: f.a, b: f.b }] : []; });
  const done = seriesDone(o.mastered, 'div');
  const head = `${done} tables à l'envers maîtrisées sur 10.`;

  let sheet = null;
  if (sel) {
    const q = { op: 'div' as const, a: sel.a, b: sel.b, p: sel.a / sel.b };
    sheet = (
      <div class="cell-sheet">
        <div class="cs-top">
          <div style={{ flex: 1 }}>
            <span class="cs-badge" style={{ background: 'var(--miel)' }}>{nb("Piège : on s'entraîne")}</span>
            <p class="fb-eq" style={{ textAlign: 'left', marginTop: '8px' }}>{equation(q)}</p>
          </div>
          <BtnSay wrap style={{ background: 'var(--lagon)' }} text={`${q.a} divisé par ${q.b} égale ${q.p}. ${tipOf(q)}`} />
        </div>
        <div class="aid">
          <div class="aid-top"><span>{q.a} en {q.b} rangée{q.b > 1 ? 's' : ''}</span><span>{q.p} par rangée</span></div>
          <AidGrid rows={q.b} cols={q.p} />
          <p class="tip" style={{ fontSize: '16px' }}>{nb(tipOf(q))}</p>
        </div>
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
        {tabs}
        <div class="g-head"><p class="g-big">{done} <small>tables à l'envers sur 10</small></p></div>
        <div class="pcard2">
          <h2>Divisions <small>réussies du premier coup</small></h2>
          <div class="tbl">
            {list.map((d) => {
              const v = seriesPct(o.mastered, d.id);
              return (
                <div key={d.id} class="tr">
                  <span class="n" style={{ background: DIV_ZONE.fort }} aria-hidden="true">÷{tableNum(d.id)}</span>
                  <span>
                    <span class="lb"><span>{d.title} · {lookOf(d.id).name}</span><span>{v}%</span></span>
                    <span class="bar"><i style={{ width: `${v}%`, background: DIV_ZONE.fort }}></i></span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div class="g-tip">
          <span><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, size: 52 })} /></span>
          <span>{nb('Astuce : pour 56 ÷ 7, cherche dans la table de 7 le nombre qui donne 56 : 7 × 8 = 56.')}</span>
        </div>
        <div class="traps">
          {traps.length ? (
            <>
              <div><h2>Mes divisions pièges</h2><p class="sub">{nb('Elles reviennent plus souvent. Encore un effort !')}</p></div>
              <div class="trap-chips">
                {traps.map((x) => <button key={`${x.a}d${x.b}`} class="tchip" onClick={() => setSel(x)}>{x.a} ÷ {x.b}</button>)}
              </div>
              <button class="btn-primary" onClick={() => go({ name: 'question', cfg: trapsCfg(traps.map((x) => factKey('div', x.a, x.b))), back: { name: 'grid' } })}>{nb('Entraîner mes pièges')}</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'joie', size: 56, noSparkle: true })} /></span>
              <div><h2>{nb('Aucun piège !')}</h2><p class="sub">{nb('Les divisions difficiles apparaîtront ici.')}</p></div>
            </div>
          )}
        </div>
      </div>
      <TabBar current="grid" />
      {sheet}
    </section>
  );
}
