/* Écran 12 : album de stickers et trophées. */
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { coinIcon, stickerArt, trophyIcon } from '../art';
import { useProfileTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { BtnSay, Overlay, Svg, TabBar } from '../app/ui';
import { lookOf } from '../content/isles';
import { OP_SIGN, seriesOf, type Op, type SeriesDef } from '../content/series';
import { KINDS, stickerHow, stickerKey, stickerName } from '../content/stickers';
import { nb } from '../content/text';
import { allStickers, opProg, opsOf } from '../engine/progress';
import { tableNum } from '../engine/unlock';

const ALL_OPS: readonly Op[] = ['mul', 'add', 'sub'];
/** Pastille d'une île : numéro de la table, ou signe de l'opération au CP. */
const badge = (d: SeriesDef) => (d.op === 'mul' ? String(tableNum(d.id)) : OP_SIGN[d.op]);

interface Pop { art: ComponentChildren; title: string; text: string }

export function Album() {
  const p = usePlayer();
  const { go, updatePlayer } = useApp();
  const [popup, setPopup] = useState<Pop | null>(null);
  const [seen] = useState(() => p.seen);
  useBack(() => (popup ? setPopup(null) : go({ name: 'home' })));
  useProfileTheme(p.color);

  // Îles de la classe, plus celles d'une autre opération où l'enfant a déjà gagné des stickers.
  const ops = ALL_OPS.filter((op) => opsOf(p).includes(op) || opProg(p, op).stickers.length > 0);
  const list = ops.flatMap((op) => seriesOf(op));
  const won = (d: SeriesDef) => !!opProg(p, d.op).series[d.id]?.trophy;
  const has = (d: SeriesDef, k: string) => opProg(p, d.op).stickers.includes(k);
  // Les stickers affichés sont désormais vus (le badge « Nouveau » ne revient pas).
  useEffect(() => {
    if (allStickers(p).some((k) => !p.seen.includes(k))) void updatePlayer((x) => ({ ...x, seen: allStickers(x) }));
  }, []);

  const tw = list.filter(won).length, total = list.length * 3, have = ops.reduce((t, op) => t + opProg(p, op).stickers.length, 0);
  const tro = (d: SeriesDef) => {
    const w = won(d), I = lookOf(d.id);
    return (
      <button
        key={d.id}
        class={`troph ${w ? '' : 'off'}`}
        aria-label={`Trophée de l'île ${I.of}${w ? ', gagné' : ', à gagner'}`}
        onClick={() => setPopup({
          art: <div style={w ? undefined : { opacity: 0.3, filter: 'grayscale(1)' }}><Svg html={trophyIcon(130)} /></div>,
          title: w ? `Trophée ${I.of.replace(/^de la |^du |^des |^de l'/, '')}` : 'Trophée à gagner',
          text: w ? `Tu as battu ${I.boss}, le gardien de l'île ${I.of}.` : `Bats ${I.boss}, le gardien de l'île ${I.of}.`,
        })}
      >
        <Svg html={trophyIcon(48)} />
        <span class="pl" style={{ background: I.fort }}>{badge(d)}</span>
      </button>
    );
  };
  // Étagère : 5 trophées par rangée.
  const rows = Array.from({ length: Math.ceil(list.length / 5) }, (_, i) => list.slice(i * 5, i * 5 + 5));

  return (
    <section class="screen" data-screen="album" aria-label="Album">
      <div class="topbar tri">
        <span></span>
        <div class="ttl" style={{ fontSize: '26px' }}>Trésors</div>
        <span class="coinpill"><Svg html={coinIcon(26)} />{p.coins}</span>
      </div>
      <div class="seg2">
        <button aria-pressed="false" onClick={() => go({ name: 'shop' })}>Boutique</button>
        <button aria-pressed="true">Album</button>
      </div>
      <div class="alb-scroll">
        <div class="alb-h"><h2>Mes trophées</h2><span>{tw} sur {list.length}</span></div>
        <div class="shelf">
          {rows.map((r, i) => <div key={i} class="shelf-row">{r.map(tro)}</div>)}
        </div>
        <div class="alb-h"><h2>Mes stickers</h2><span>{have} sur {total}</span></div>
        <div class="alb-bar"><i style={{ width: `${(have / total) * 100}%` }}></i></div>
        {list.map((def) => {
          const I = lookOf(def.id), got = KINDS.filter((t) => has(def, stickerKey(def.id, t))).length;
          return (
            <div key={def.id} class="page" style={{ borderColor: 'var(--ink)' }}>
              <div class="page-h"><span class="num" style={{ background: I.fort }}>{badge(def)}</span>{I.name}<small>{got} sur 3</small></div>
              <div class="stk3">
                {KINDS.map((t, i) => {
                  const k = stickerKey(def.id, t), on = has(def, k), nw = on && !seen.includes(k);
                  return on ? (
                    <button
                      key={k}
                      class="stk on"
                      style={{ transform: `rotate(${[-5, 3, -2][i]}deg)` }}
                      aria-label={`Sticker ${stickerName(k)}`}
                      onClick={() => setPopup({ art: <div class="sticker"><Svg html={stickerArt(k, p, 164)} /></div>, title: stickerName(k), text: `Île ${I.of}` })}
                    >
                      {nw && <span class="new">Nouveau</span>}
                      <span class="in"><Svg html={stickerArt(k, p, 94)} /></span>
                    </button>
                  ) : (
                    <button
                      key={k}
                      class="stk off"
                      aria-label="Sticker à trouver"
                      onClick={() => setPopup({ art: <div class="stk off" style={{ width: '150px', height: '150px', fontSize: '56px' }}>?</div>, title: 'Sticker mystère', text: stickerHow(k) })}
                    >
                      ?
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <TabBar current="treasure" />
      {popup && (
        <Overlay onBackdrop={() => setPopup(null)}>
          {popup.art}
          <h2 id="ov-title">{nb(popup.title)}</h2>
          <p>{nb(popup.text)}</p>
          <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
            <BtnSay wrap text={`${popup.title}. ${popup.text}`} />
            <button class="btn-primary" style={{ flex: 1 }} onClick={() => setPopup(null)}>Fermer</button>
          </div>
        </Overlay>
      )}
    </section>
  );
}
