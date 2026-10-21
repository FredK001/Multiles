/* Ma grille en lecture (CP) : chaque son, syllabe ou petit mot, en couleur une fois réussi ; touche pour l'entendre. */
import type { ComponentChildren } from 'preact';
import { mascot } from '../art';
import { speak } from '../audio';
import { useApp, usePlayer } from '../app/context';
import { trapsCfg } from '../app/sessions';
import { BtnSay, Svg, TabBar } from '../app/ui';
import { READ_SETS, sayOf } from '../content/reading';
import { nb } from '../content/text';
import { factKey, parseFact } from '../engine/keys';
import { stageFor } from '../engine/level';
import { opProg } from '../engine/progress';
import { readFactLabel } from '../engine/reading';

export function GridRead({ tabs }: { tabs?: ComponentChildren }) {
  const p = usePlayer();
  const { go } = useApp();
  const o = opProg(p, 'lec'), stage = stageFor(p.level), done = new Set<string>(o.mastered), hard = new Set<string>(o.traps);
  const total = READ_SETS.reduce((n, s) => n + s.items.length, 0);
  const count = READ_SETS.reduce((n, s, k) => n + s.items.filter((_, i) => done.has(factKey('lec', k + 1, i + 1))).length, 0);
  const traps = o.traps.flatMap((k) => { const f = parseFact(k); return f && f.op === 'lec' ? [{ a: f.a, b: f.b }] : []; });
  const say = (text: string) => speak([{ text, lang: 'fr' }]);

  return (
    <section class="screen" data-screen="grid" aria-label="Ma grille">
      <div class="topbar tri">
        <span></span>
        <div class="ttl" style={{ fontSize: '26px' }}>Ma grille</div>
        <BtnSay style={{ justifySelf: 'end', background: '#fff' }} text={`${count} sur ${total}. Touche un mot pour l'entendre.`} />
      </div>
      <div class="grid-scroll">
        {tabs}
        <div class="g-head"><p class="g-big">{count} <small>sur {total}</small></p></div>
        {READ_SETS.map((s, k) => (
          <div key={s.id} class="eg-theme">
            <h2><span>{s.title}</span></h2>
            <div class="eg-words">
              {s.items.map((it, i) => {
                const key = factKey('lec', k + 1, i + 1), t = hard.has(key), m = done.has(key);
                return (
                  <button key={i} class={`eg-w read ${t ? 't' : m ? 'm' : ''}`} onClick={() => say(sayOf(it))}>
                    <span aria-hidden="true">{it.w}</span>
                    <span class="sr">{it.w}{t ? ', piège' : m ? ', réussi' : ', à découvrir'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div class="traps">
          {traps.length ? (
            <>
              <div><h2>Mes pièges</h2><p class="sub">{nb('Ils reviennent plus souvent. Encore un effort !')}</p></div>
              <div class="trap-chips">
                {traps.map((x) => <button key={`${x.a}l${x.b}`} class="tchip" onClick={() => say(readFactLabel(x.a, x.b).say)}>{readFactLabel(x.a, x.b).w}</button>)}
              </div>
              <button class="btn-primary" onClick={() => go({ name: 'question', cfg: trapsCfg(traps.map((x) => factKey('lec', x.a, x.b))), back: { name: 'grid' } })}>{nb('Entraîner mes pièges')}</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'joie', size: 56, noSparkle: true })} /></span>
              <div><h2>{nb('Aucun piège !')}</h2><p class="sub">{nb('Les sons difficiles apparaîtront ici.')}</p></div>
            </div>
          )}
        </div>
      </div>
      <TabBar current="grid" />
    </section>
  );
}
