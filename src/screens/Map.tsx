/* Écran 5 : carte des îles. */
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { avatar, icoLock, islandArt, resize, trophyIcon } from '../art';
import { useProfileTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { playCurrentCfg } from '../app/sessions';
import { BackChip, Svg } from '../app/ui';
import { ISLES, ISLE_IDS, ofIsle, type IsleId } from '../content/isles';
import { currentStep, isOpen, isleOf, missingTrophies, REQ, trophies } from '../engine/unlock';

const H = 2220;
const MAP_X = [0.3, 0.7, 0.34, 0.68, 0.3, 0.7, 0.36, 0.66, 0.32, 0.62];

export function MapScreen() {
  const p = usePlayer();
  const { go, toast } = useApp();
  const seaRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(390);
  const back = () => go({ name: 'home' });
  useBack(back);
  useProfileTheme(p.color);

  const pos = (n: number) => ({ x: MAP_X[n - 1]! * W, y: H - 150 - (n - 1) * 208 });

  useLayoutEffect(() => {
    const sea = seaRef.current;
    if (!sea) return;
    const w = sea.clientWidth || 390;
    if (w !== W) {
      setW(w);
      return;
    }
    // La carte s'ouvre centrée sur l'île en cours.
    sea.style.scrollBehavior = 'auto';
    sea.scrollTop = pos(p.isle).y - sea.clientHeight / 2;
    sea.style.scrollBehavior = '';
  }, [W]);

  const pts = ISLE_IDS.map((n) => pos(n));
  let d = `M${pts[0]!.x} ${pts[0]!.y + 40}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!;
    d += ` C${a.x} ${a.y - 40} ${b.x} ${b.y + 120} ${b.x} ${b.y + 40}`;
  }
  let waves = '';
  for (let i = 0; i < 30; i++) {
    const x = (i * 97) % W, y = 60 + i * 72;
    waves += `<path class="wave" d="M${x} ${y} q8 -6 16 0 t16 0" fill="none" stroke="#7FC6D3" stroke-width="3" stroke-linecap="round"/>`;
  }
  const trail = `${waves}<path d="${d}" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="1 14" stroke-linecap="round"/>`;
  const t = trophies(p.isl);

  const openIsle = (n: IsleId) => {
    if (!isOpen(p.isl, n)) {
      const miss = missingTrophies(p.isl, n);
      toast(`Encore ${miss} trophée${miss > 1 ? 's' : ''} pour ouvrir l'île ${ofIsle(n)} !`);
      return;
    }
    go({ name: 'isle', n });
  };

  return (
    <section class="screen" data-screen="map" aria-label="Carte des îles">
      <div class="map-head">
        <BackChip id="mapBack" label="Retour" aria="Retour" onClick={back} />
        <div class="ttl">L'archipel</div>
        <span class="cnt"><Svg html={trophyIcon(26)} />{t}<span class="sr"> trophées</span></span>
      </div>
      <div class="sea" ref={seaRef}>
        <div class="sea-in">
          <svg class="trail" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: trail }} />
          {ISLE_IDS.map((n) => {
            const { x, y } = pos(n), open = isOpen(p.isl, n), st = isleOf(p.isl, n), I = ISLES[n];
            const label = open
              ? `Île ${n}, ${I.name}. ${st.steps} étapes sur 3${st.trophy ? ', trophée gagné' : ''}.`
              : `Île ${n}, ${I.name}, fermée. Il faut ${REQ[n]} trophées.`;
            return (
              <button key={n} class={`isle ${open ? '' : 'locked'}`} style={{ left: `${x}px`, top: `${y - 70}px` }} aria-label={label} onClick={() => openIsle(n)}>
                {n === p.isle && (
                  <span class="here">
                    <span class="pin"><Svg html={avatar({ ...p.av, color: p.color, size: 52 })} /></span>
                    <span class="tip"></span>
                  </span>
                )}
                <Svg html={islandArt(n, !open)} />
                <span class="plate"><span class="num" style={{ background: open ? I.fort : '#6B7390' }}>{n}</span>{I.name}</span>
                {open ? (
                  <span class="pips" aria-hidden="true">
                    {[0, 1, 2].map((i) => <span key={i} class={`pip ${i < st.steps ? 'on' : ''}`}></span>)}
                    {st.trophy ? <Svg html={trophyIcon(20)} /> : <span class="pip" style={{ borderRadius: '4px' }}></span>}
                  </span>
                ) : (
                  <span class="lockline">
                    <Svg html={resize(icoLock, [26, 28], [18, 20])} />
                    <Svg html={trophyIcon(18)} />
                    {REQ[n]} trophées
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div class="map-foot">
        <button class="btn-play slim" onClick={() => go({ name: 'question', cfg: playCurrentCfg(p), back: { name: 'map' } })}>
          <b>Continuer</b>
          <small>{`Île ${ofIsle(p.isle)}, étape ${currentStep(isleOf(p.isl, p.isle))}`}</small>
        </button>
      </div>
    </section>
  );
}
