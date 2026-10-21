/* Ma grille en français : la part réussie de chaque paire d'homophones, et les phrases pièges. */
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { mascot } from '../art';
import { useIsleTheme, useProfileTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { trapsCfg } from '../app/sessions';
import { BtnSay, Svg, TabBar } from '../app/ui';
import { ALL_QUIZZES, fillBlank, ruleOf } from '../content/french';
import { lookOf } from '../content/isles';
import { FR_ZONE, seriesOf } from '../content/series';
import { nb } from '../content/text';
import { factKey, parseFact } from '../engine/keys';
import { stageFor } from '../engine/level';
import { seriesDone, seriesPct } from '../engine/mastery';
import { opProg } from '../engine/progress';

type Item = { a: number; b: number };

export function GridFr({ tabs }: { tabs?: ComponentChildren }) {
  const p = usePlayer();
  const { go } = useApp();
  const [sel, setSel] = useState<Item | null>(null);
  useBack(() => (sel ? setSel(null) : go({ name: 'home' })));
  useProfileTheme(p.color);
  useIsleTheme(FR_ZONE.fort, FR_ZONE.clair);
  const o = opProg(p, 'fr'), stage = stageFor(p.level), list = seriesOf('fr');
  const traps = o.traps.flatMap((k) => { const f = parseFact(k); return f && f.op === 'fr' ? [{ a: f.a, b: f.b }] : []; });
  const done = seriesDone(o.mastered, 'fr');
  const itemOf = (x: Item) => ({ quiz: ALL_QUIZZES[x.a - 1]!, item: ALL_QUIZZES[x.a - 1]!.items[x.b - 1]! });

  let sheet = null;
  if (sel) {
    const { quiz, item } = itemOf(sel), full = fillBlank(item.s, item.a);
    sheet = (
      <div class="cell-sheet">
        <div class="cs-top">
          <div style={{ flex: 1 }}>
            <span class="cs-badge" style={{ background: 'var(--miel)' }}>{nb("Piège : on s'entraîne")}</span>
            <p class="fr-sent" style={{ textAlign: 'left', marginTop: '8px' }}>{full}</p>
          </div>
          <BtnSay wrap style={{ background: 'var(--lagon)' }} text={`${full} ${ruleOf(quiz, item)}`} />
        </div>
        <p class="fr-rule ok">{ruleOf(quiz, item)}</p>
        <button class="btn-primary" onClick={() => setSel(null)}>Fermer</button>
      </div>
    );
  }

  return (
    <section class="screen" data-screen="grid" aria-label="Ma grille">
      <div class="topbar tri">
        <span></span>
        <div class="ttl" style={{ fontSize: '26px' }}>Ma grille</div>
        <BtnSay style={{ justifySelf: 'end', background: '#fff' }} text={`${done} îles de français maîtrisées sur ${list.length}.`} />
      </div>
      <div class="grid-scroll">
        {tabs}
        <div class="g-head"><p class="g-big">{done} <small>îles sur {list.length}</small></p></div>
        <div class="pcard2">
          <h2>Français <small>phrases réussies du premier coup</small></h2>
          <div class="tbl">
            {list.map((d) => {
              const v = seriesPct(o.mastered, d.id);
              return (
                <div key={d.id} class="tr">
                  <span class="n" style={{ background: FR_ZONE.fort }} aria-hidden="true">Aa</span>
                  <span>
                    <span class="lb"><span>{d.title} · {lookOf(d.id).name}</span><span>{v}%</span></span>
                    <span class="bar"><i style={{ width: `${v}%`, background: FR_ZONE.fort }}></i></span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div class="traps">
          {traps.length ? (
            <>
              <div><h2>Mes phrases pièges</h2><p class="sub">{nb('Elles reviennent plus souvent. Encore un effort !')}</p></div>
              <div class="trap-chips">
                {traps.map((x) => <button key={`${x.a}f${x.b}`} class="tchip fr" onClick={() => setSel(x)}>{itemOf(x).item.s.replace(/___/g, '…')}</button>)}
              </div>
              <button class="btn-primary" onClick={() => go({ name: 'question', cfg: trapsCfg(traps.map((x) => factKey('fr', x.a, x.b))), back: { name: 'grid' } })}>{nb('Entraîner mes pièges')}</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'joie', size: 56, noSparkle: true })} /></span>
              <div><h2>{nb('Aucun piège !')}</h2><p class="sub">{nb('Les phrases difficiles apparaîtront ici.')}</p></div>
            </div>
          )}
        </div>
      </div>
      <TabBar current="grid" />
      {sheet}
    </section>
  );
}
