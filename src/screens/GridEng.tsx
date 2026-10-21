/* Ma grille en anglais : les mots de chaque thème, en couleur une fois réussis, et les mots ou phrases pièges. */
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { mascot } from '../art';
import { useIsleTheme, useProfileTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { trapsCfg } from '../app/sessions';
import { BtnSay, Svg, TabBar } from '../app/ui';
import { THEMES } from '../content/english';
import { lookOf } from '../content/isles';
import { DRILL_BASE, ENG_ZONE, seriesOf } from '../content/series';
import { nb } from '../content/text';
import { engFactLabel } from '../engine/english';
import { factKey, hasKey, parseFact } from '../engine/keys';
import { stageFor } from '../engine/level';
import { seriesPct } from '../engine/mastery';
import { opProg } from '../engine/progress';
import { isOpen } from '../engine/unlock';
import { WordPic } from './EngQuestion';

/** Clé d'anglais : thème (1 à 18) et mot (1 à 50) ou phrase (51 et plus). */
type Pick = { a: number; b: number };

export function GridEng({ tabs }: { tabs?: ComponentChildren }) {
  const p = usePlayer();
  const { go } = useApp();
  const [sel, setSel] = useState<Pick | null>(null);
  useBack(() => (sel ? setSel(null) : go({ name: 'home' })));
  useProfileTheme(p.color);
  useIsleTheme(ENG_ZONE.fort, ENG_ZONE.clair);
  const o = opProg(p, 'eng'), stage = stageFor(p.level), series = seriesOf('eng');
  const known = (x: Pick) => hasKey(o.mastered, factKey('eng', x.a, x.b));
  const trap = (x: Pick) => hasKey(o.traps, factKey('eng', x.a, x.b));

  const total = THEMES.reduce((n, t) => n + t.words.length, 0);
  const count = THEMES.reduce((n, t, k) => n + t.words.filter((_, i) => known({ a: k + 1, b: i + 1 }) && !trap({ a: k + 1, b: i + 1 })).length, 0);
  const traps = o.traps.flatMap((k) => { const f = parseFact(k); return f && f.op === 'eng' ? [{ a: f.a, b: f.b }] : []; });
  const head = `${count} mots sur ${total}. Touche un dessin pour voir et écouter son mot.`;

  let sheet = null;
  if (sel) {
    const t = THEMES[sel.a - 1]!, s = series[sel.a - 1]!, m = known(sel), tr = trap(sel), word = sel.b <= DRILL_BASE, lbl = engFactLabel(sel.a, sel.b);
    const badge = tr
      ? <span class="cs-badge" style={{ background: 'var(--miel)' }}>{nb("Piège : on s'entraîne")}</span>
      : m ? <span class="cs-badge" style={{ background: 'var(--feuille)', color: '#fff' }}>Réussi</span> : <span class="cs-badge">À découvrir</span>;
    sheet = (
      <div class="cell-sheet">
        <div class="cs-top">
          <div style={{ flex: 1 }}>{badge}</div>
          <BtnSay wrap langs={['en']} style={{ background: 'var(--lagon)' }} text={[{ text: lbl.en.replace(/…/g, ''), lang: 'en' }]} />
        </div>
        <div class="eng-aid">
          {word && <WordPic theme={t.id} i={sel.b - 1} size={96} />}
          <span><b lang="en">{lbl.en}</b>{lbl.fr && <small lang="fr">{lbl.fr}</small>}</span>
        </div>
        {!m && !tr && !isOpen(o.series, s.id) && <p style={{ fontSize: '17px' }}>{nb(`Tu le découvriras sur l'île ${lookOf(s.id).name}.`)}</p>}
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
        <div class="g-head"><p class="g-big">{count} <small>mots sur {total}</small></p></div>
        {THEMES.map((t, k) => {
          const s = series[k]!, open = isOpen(o.series, s.id), v = seriesPct(o.mastered, s.id);
          return (
            <div key={t.id} class={`eg-theme${open ? '' : ' off'}`}>
              <h2><span><span lang="en">{t.en}</span> <small>{t.fr}</small></span><small>{v}%</small></h2>
              <div class="eg-words">
                {t.words.map((w, i) => {
                  const x = { a: k + 1, b: i + 1 }, m = known(x), tr = trap(x);
                  return (
                    <button
                      key={w.en}
                      class={`eg-w ${tr ? 't' : m ? 'm' : ''}`}
                      aria-label={`${w.en}, ${w.fr}${tr ? ', piège' : m ? ', réussi' : ', à découvrir'}`}
                      onClick={() => setSel(x)}
                    >
                      <WordPic theme={t.id} i={i} size={40} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div class="traps">
          {traps.length ? (
            <>
              <div><h2>Mes mots pièges</h2><p class="sub">{nb('Ils reviennent plus souvent. Encore un effort !')}</p></div>
              <div class="trap-chips">
                {traps.map((x) => <button key={`${x.a}e${x.b}`} class="tchip eng" lang="en" onClick={() => setSel(x)}>{engFactLabel(x.a, x.b).en}</button>)}
              </div>
              <button class="btn-primary" onClick={() => go({ name: 'question', cfg: trapsCfg(traps.map((x) => factKey('eng', x.a, x.b))), back: { name: 'grid' } })}>{nb('Entraîner mes pièges')}</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'joie', size: 56, noSparkle: true })} /></span>
              <div><h2>{nb('Aucun piège !')}</h2><p class="sub">{nb('Les mots difficiles apparaîtront ici.')}</p></div>
            </div>
          )}
        </div>
      </div>
      <TabBar current="grid" />
      {sheet}
    </section>
  );
}
