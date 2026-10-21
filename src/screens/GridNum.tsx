/* Ma grille en nombres (CP) : la part réussie de chaque île, et les questions pièges. */
import type { ComponentChildren } from 'preact';
import { mascot } from '../art';
import { useApp, usePlayer } from '../app/context';
import { trapsCfg } from '../app/sessions';
import { BtnSay, Svg, TabBar } from '../app/ui';
import { lookOf } from '../content/isles';
import { NUM_ZONE, seriesOf } from '../content/series';
import { nb } from '../content/text';
import { parseFact } from '../engine/keys';
import { stageFor } from '../engine/level';
import { seriesDone, seriesPct } from '../engine/mastery';
import { opProg } from '../engine/progress';

export function GridNum({ tabs }: { tabs?: ComponentChildren }) {
  const p = usePlayer();
  const { go } = useApp();
  const o = opProg(p, 'num'), stage = stageFor(p.level), list = seriesOf('num'), done = seriesDone(o.mastered, 'num');
  const traps = o.traps.filter((k) => parseFact(k)?.op === 'num');

  return (
    <section class="screen" data-screen="grid" aria-label="Ma grille">
      <div class="topbar tri">
        <span></span>
        <div class="ttl" style={{ fontSize: '26px' }}>Ma grille</div>
        <BtnSay style={{ justifySelf: 'end', background: '#fff' }} text={`${done} îles de nombres réussies sur ${list.length}.`} />
      </div>
      <div class="grid-scroll">
        {tabs}
        <div class="pcard2">
          <h2>Nombres <small>réussis du premier coup</small></h2>
          <div class="tbl">
            {list.map((d) => {
              const v = seriesPct(o.mastered, d.id);
              return (
                <div key={d.id} class="tr">
                  <span class="n" style={{ background: NUM_ZONE.fort }} aria-hidden="true">123</span>
                  <span>
                    <span class="lb"><span>{d.title} · {lookOf(d.id).name}</span><span>{v}%</span></span>
                    <span class="bar"><i style={{ width: `${v}%`, background: NUM_ZONE.fort }}></i></span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div class="traps">
          {traps.length ? (
            <>
              <div><h2>Mes pièges</h2><p class="sub">{nb(`${traps.length} question${traps.length > 1 ? 's reviennent' : ' revient'} plus souvent.`)}</p></div>
              <button class="btn-primary" onClick={() => go({ name: 'question', cfg: trapsCfg(traps), back: { name: 'grid' } })}>{nb('Entraîner mes pièges')}</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'joie', size: 56, noSparkle: true })} /></span>
              <div><h2>{nb('Aucun piège !')}</h2><p class="sub">{nb('Les questions difficiles apparaîtront ici.')}</p></div>
            </div>
          )}
        </div>
      </div>
      <TabBar current="grid" />
    </section>
  );
}
