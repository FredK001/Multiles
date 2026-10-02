/* Écran 12 : album de stickers et trophées. */
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { coinIcon, stickerArt, trophyIcon } from '../art';
import { useProfileTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { BtnSay, Overlay, Svg, TabBar } from '../app/ui';
import { BOSS, ISLES, ISLE_IDS, ofIsle, type IsleId } from '../content/isles';
import { KINDS, stickerHow, stickerName } from '../content/stickers';
import { nb } from '../content/text';
import { trophies } from '../engine/unlock';

interface Pop { art: ComponentChildren; title: string; text: string }

export function Album() {
  const p = usePlayer();
  const { go, updatePlayer } = useApp();
  const [popup, setPopup] = useState<Pop | null>(null);
  const [seen] = useState(() => p.seen);
  useBack(() => (popup ? setPopup(null) : go({ name: 'home' })));
  useProfileTheme(p.color);

  // Les stickers affichés sont désormais vus (le badge « Nouveau » ne revient pas).
  useEffect(() => {
    if (p.stickers.some((k) => !p.seen.includes(k))) void updatePlayer((x) => ({ ...x, seen: [...x.stickers] }));
  }, []);

  const tw = trophies(p.isl), total = 30, have = p.stickers.length;
  const tro = (n: IsleId) => {
    const won = !!p.isl[n]?.trophy;
    return (
      <button
        key={n}
        class={`troph ${won ? '' : 'off'}`}
        aria-label={`Trophée de l'île ${ofIsle(n)}${won ? ', gagné' : ', à gagner'}`}
        onClick={() => setPopup({
          art: <div style={won ? undefined : { opacity: 0.3, filter: 'grayscale(1)' }}><Svg html={trophyIcon(130)} /></div>,
          title: won ? `Trophée ${ofIsle(n).replace(/^de la |^du |^des |^de l'/, '')}` : 'Trophée à gagner',
          text: won ? `Tu as battu ${BOSS[n]}, le gardien de l'île ${ofIsle(n)}.` : `Bats ${BOSS[n]}, le gardien de l'île ${ofIsle(n)}.`,
        })}
      >
        <Svg html={trophyIcon(48)} />
        <span class="pl" style={{ background: ISLES[n].fort }}>{n}</span>
      </button>
    );
  };

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
        <div class="alb-h"><h2>Mes trophées</h2><span>{tw} sur 10</span></div>
        <div class="shelf">
          <div class="shelf-row">{([1, 2, 3, 4, 5] as IsleId[]).map(tro)}</div>
          <div class="shelf-row">{([6, 7, 8, 9, 10] as IsleId[]).map(tro)}</div>
        </div>
        <div class="alb-h"><h2>Mes stickers</h2><span>{have} sur {total}</span></div>
        <div class="alb-bar"><i style={{ width: `${(have / total) * 100}%` }}></i></div>
        {ISLE_IDS.map((n) => {
          const I = ISLES[n], got = KINDS.filter((t) => p.stickers.includes(`${n}-${t}`)).length;
          return (
            <div key={n} class="page" style={{ borderColor: 'var(--ink)' }}>
              <div class="page-h"><span class="num" style={{ background: I.fort }}>{n}</span>{I.name}<small>{got} sur 3</small></div>
              <div class="stk3">
                {KINDS.map((t, i) => {
                  const k = `${n}-${t}`, on = p.stickers.includes(k), nw = on && !seen.includes(k);
                  return on ? (
                    <button
                      key={k}
                      class="stk on"
                      style={{ transform: `rotate(${[-5, 3, -2][i]}deg)` }}
                      aria-label={`Sticker ${stickerName(k)}`}
                      onClick={() => setPopup({ art: <div class="sticker"><Svg html={stickerArt(k, p, 164)} /></div>, title: stickerName(k), text: `Île ${ofIsle(n)}` })}
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
