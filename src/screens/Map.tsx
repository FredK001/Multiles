/* Écran 5 : carte des îles. */
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { avatar, icoLock, islandArt, resize, trophyIcon } from '../art';
import { useProfileTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { playCurrentCfg } from '../app/sessions';
import { BackChip, Svg } from '../app/ui';
import { lookOf } from '../content/isles';
import { OP_NAME, OP_SIGN, seriesOf, type Op, type SeriesId } from '../content/series';
import { opProg } from '../engine/progress';
import { currentStep, isOpen, isleOf, missingTrophies, tableNum, trophies } from '../engine/unlock';

const MAP_X = [0.3, 0.7, 0.34, 0.68, 0.3, 0.7, 0.36, 0.66, 0.32, 0.62];

export function MapScreen({ op }: { op: Op }) {
  const p = usePlayer();
  const { go, toast } = useApp();
  const seaRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(390);
  const back = () => go({ name: 'home' });
  useBack(back);
  useProfileTheme(p.color);
  const list = seriesOf(op), mul = op === 'mul';
  const o = opProg(p, op), here = o.current;
  // Hauteur de la mer : 2220 px pour les 10 îles du CM1, comme le prototype.
  const H = 348 + (list.length - 1) * 208;

  const pos = (i: number) => ({ x: MAP_X[i]! * W, y: H - 150 - i * 208 });

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
    sea.scrollTop = pos(Math.max(0, list.findIndex((x) => x.id === here))).y - sea.clientHeight / 2;
    sea.style.scrollBehavior = '';
  }, [W]);

  const pts = list.map((_, i) => pos(i));
  let d = `M${pts[0]!.x} ${pts[0]!.y + 40}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!;
    d += ` C${a.x} ${a.y - 40} ${b.x} ${b.y + 120} ${b.x} ${b.y + 40}`;
  }
  let waves = '';
  for (let i = 0; i < 30 && 60 + i * 72 < H; i++) {
    const x = (i * 97) % W, y = 60 + i * 72;
    waves += `<path class="wave" d="M${x} ${y} q8 -6 16 0 t16 0" fill="none" stroke="#7FC6D3" stroke-width="3" stroke-linecap="round"/>`;
  }
  const trail = `${waves}<path d="${d}" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="1 14" stroke-linecap="round"/>`;
  const t = trophies(o.series, op);
  const curLook = lookOf(here);

  const openIsle = (s: SeriesId) => {
    if (!isOpen(o.series, s)) {
      const miss = missingTrophies(o.series, s);
      toast(`Encore ${miss} trophée${miss > 1 ? 's' : ''} pour ouvrir l'île ${lookOf(s).of} !`);
      return;
    }
    go({ name: 'isle', s });
  };

  return (
    <section class="screen" data-screen="map" aria-label="Carte des îles">
      <div class="map-head">
        <BackChip id="mapBack" label="Retour" aria="Retour" onClick={back} />
        <div class="ttl">{mul ? "L'archipel" : <><b aria-hidden="true" class="ttl-op">{OP_SIGN[op]}</b>{OP_NAME[op]}</>}</div>
        <span class="cnt"><Svg html={trophyIcon(26)} />{t}<span class="sr"> trophées</span></span>
      </div>
      <div class="sea" ref={seaRef}>
        <div class="sea-in" style={mul ? undefined : { height: `${H}px` }}>
          <svg class="trail" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: trail }} />
          {list.map((def, i) => {
            const id = def.id, { x, y } = pos(i), open = isOpen(o.series, id), st = isleOf(o.series, id), I = lookOf(id), need = def.need;
            // Pastille : numéro de la table au CM1, signe de l'opération au CP.
            const num = mul ? String(tableNum(id)) : OP_SIGN[op];
            const name = mul ? `Île ${num}, ${I.name}` : `Île ${I.name}, ${def.title.toLowerCase()}`;
            const label = open
              ? `${name}. ${st.steps} étapes sur 3${st.trophy ? ', trophée gagné' : ''}.`
              : `${name}, fermée. Il faut ${need} trophée${need > 1 ? 's' : ''}.`;
            return (
              <button key={id} class={`isle ${open ? '' : 'locked'}`} style={{ left: `${x}px`, top: `${y - 70}px` }} aria-label={label} onClick={() => openIsle(id)}>
                {id === here && (
                  <span class="here">
                    <span class="pin"><Svg html={avatar({ ...p.av, color: p.color, size: 52 })} /></span>
                    <span class="tip"></span>
                  </span>
                )}
                <Svg html={islandArt(I.motif, !open, I.fort)} />
                <span class="plate"><span class="num" style={{ background: open ? I.fort : '#6B7390' }}>{num}</span>{mul ? I.name : def.title}</span>
                {open ? (
                  <span class="pips" aria-hidden="true">
                    {[0, 1, 2].map((i) => <span key={i} class={`pip ${i < st.steps ? 'on' : ''}`}></span>)}
                    {st.trophy ? <Svg html={trophyIcon(20)} /> : <span class="pip" style={{ borderRadius: '4px' }}></span>}
                  </span>
                ) : (
                  <span class="lockline">
                    <Svg html={resize(icoLock, [26, 28], [18, 20])} />
                    <Svg html={trophyIcon(18)} />
                    {need} trophée{need > 1 ? 's' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div class="map-foot">
        <button class="btn-play slim" onClick={() => go({ name: 'question', cfg: playCurrentCfg(p, op), back: { name: 'map', op } })}>
          <b>Continuer</b>
          <small>{`Île ${curLook.of}, étape ${currentStep(isleOf(o.series, here))}`}</small>
        </button>
      </div>
    </section>
  );
}
