/* Écran 9 : fin de session et récompenses. */
import { useEffect, useRef, useState } from 'preact/hooks';
import { avatar, coinIcon, icoAgain, icoChest, mascot, starIcon, stickerArt, trophyIcon } from '../art';
import { chime } from '../audio';
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { confetti } from '../app/effects';
import type { Route } from '../app/routes';
import { Overlay, reducedMotion, Svg } from '../app/ui';
import { BOSS, ISLES, ofIsle } from '../content/isles';
import { VARIANTS } from '../content/pepins';
import { stickerName } from '../content/stickers';
import { nb } from '../content/text';
import { mix } from '../design/color';
import { stageFor } from '../engine/level';
import { pick } from '../engine/random';
import type { EndSummary } from '../engine/rewards';
import type { SessionConfig } from '../engine/session';
import { MiniGrid } from './MiniGrid';

type Pop = 'chest' | 'record' | 'trophy' | 'evolve' | 'level' | { sticker: string };

/** Compte de 0 à `to` après 1 s, comme le prototype. */
function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let cur = 0, t: ReturnType<typeof setTimeout>;
    const step = () => {
      cur = Math.min(to, cur + Math.max(1, Math.ceil(to / 12)));
      setV(cur);
      if (cur < to) t = setTimeout(step, 45);
    };
    t = setTimeout(step, 1000);
    return () => clearTimeout(t);
  }, [to]);
  return <>{v}</>;
}

export function End({ end: E, cfg, back }: { end: EndSummary; cfg: SessionConfig; back: Route }) {
  const p = usePlayer();
  const { go } = useApp();
  const I = ISLES[E.isle];
  const starsRef = useRef<HTMLDivElement>(null);
  const [xpW, setXpW] = useState(E.levelUp ? 0 : Math.round(E.xp0 * 100));
  const [title] = useState(() => {
    const titles = E.stars === 3 ? ['Parfait, {n} !', 'Incroyable, {n} !'] : E.stars === 2 ? ['Bravo, {n} !', 'Très bien, {n} !'] : ['Bien joué, {n} !', 'Tu progresses, {n} !'];
    const tt = E.mode === 'chrono' ? (E.newRec ? ['Nouveau record, {n} !'] : ['Bien joué, {n} !']) : E.mode === 'defi' ? (E.success ? ['Défi réussi, {n} !'] : ['Bien essayé, {n} !']) : titles;
    return nb(pick(tt).replace('{n}', p.name));
  });
  const [pops, setPops] = useState<Pop[] | null>(null);
  const stage = stageFor(p.level);

  useIsleTheme(I.fort, I.clair);
  const next = () => (E.mode === 'defi' ? go({ name: 'home' }) : go({ name: 'isle', n: E.isle }));
  useBack(next);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    [0, 1, 2].forEach((i) => { if (i < E.stars) ts.push(setTimeout(() => chime(i === 2 ? 'combo' : 'ok'), 300 + i * 320)); });
    ts.push(setTimeout(() => setXpW(Math.round(p.xp * 100)), 50));
    if (!reducedMotion()) confetti(starsRef.current);
    const list: Pop[] = [];
    if (E.mode === 'defi' && E.bonus) list.push('chest');
    if (E.mode === 'chrono' && E.newRec) list.push('record');
    if (E.trophy) list.push('trophy');
    if (E.evolved) list.push('evolve');
    else if (E.levelUp) list.push('level');
    for (const k of E.stickers) list.push({ sticker: k });
    ts.push(setTimeout(() => list.length && setPops(list), 2300));
    return () => ts.forEach(clearTimeout);
  }, []);

  useEffect(() => { if (pops?.length) chime('combo'); }, [pops]);

  const sub = E.mode === 'chrono'
    ? `Défi chrono, table de ${E.isle}`
    : E.mode === 'defi'
      ? (E.success ? 'Le coffre est à toi !' : `${E.score} sur ${E.target}. Tu peux réessayer aujourd'hui.`)
      : E.timedOut && !E.trophy
        ? `Le temps est écoulé. ${BOSS[E.isle]} t'attend pour une revanche !`
        : E.trophy
          ? `Tu as battu ${BOSS[E.isle]} !`
          : E.label === 'Gardien'
            ? `Défi du gardien terminé, île ${ofIsle(E.isle)}`
            : `${E.mode === 'traps' ? 'Session pièges' : E.label} terminée, île ${ofIsle(E.isle)}`;

  const timed = E.mode === 'chrono' || E.mode === 'defi';
  const nf = E.fresh.length;

  let popup = null;
  const cur = pops?.[0];
  if (cur) {
    let art, t = '', d = '';
    if (cur === 'trophy') { art = <div style={{ transform: 'scale(1.1)' }}><Svg html={trophyIcon(130)} /></div>; t = 'Trophée gagné !'; d = `L'île ${ofIsle(E.isle)} est conquise.`; }
    else if (cur === 'level') { art = <Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'joie', size: 150 })} />; t = `Niveau ${p.level} !`; d = `${VARIANTS[p.pepin].name} prend des forces.`; }
    else if (cur === 'evolve') { art = <Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'joie', size: 160 })} />; t = 'Ton Pépin grandit !'; d = 'Regarde sa nouvelle pousse.'; }
    else if (cur === 'chest') { art = <div style={{ transform: 'scale(3.2)', margin: '40px 0 34px' }}><Svg html={icoChest(true)} /></div>; t = 'Coffre ouvert !'; d = `+${E.bonus} pièces bonus pour le défi du jour.`; }
    else if (cur === 'record') { art = <Svg html={trophyIcon(120)} />; t = 'Nouveau record !'; d = `${E.score} bonnes réponses en 1 minute. Ton ancien record : ${E.rec}.`; }
    else { art = <div class="sticker"><Svg html={stickerArt(cur.sticker, p, 164)} /></div>; t = 'Nouveau sticker !'; d = `« ${stickerName(cur.sticker)} » rejoint ton album.`; }
    popup = (
      <Overlay onClose={() => setPops(pops!.slice(1))}>
        {art}
        <h2 id="ov-title">{nb(t)}</h2>
        <p>{nb(d)}</p>
        <button class="btn-isle" style={{ marginTop: '6px' }} onClick={() => setPops(pops!.slice(1))}>{nb('Super !')}</button>
      </Overlay>
    );
  }

  return (
    <section class="screen" data-screen="end" aria-label="Fin de session" style={{ background: 'var(--ile-clair)' }}>
      <div class="end-band">
        <h1>{title}</h1>
        <p class="sub">{nb(sub)}</p>
        <div class="stars3" ref={starsRef} role="img" aria-label={`${E.stars} étoile${E.stars > 1 ? 's' : ''} sur 3`}>
          {[0, 1, 2].map((i) => {
            const s = i === 1 ? 80 : 64;
            const html = i < E.stars
              ? starIcon(s)
              : `<svg width="${s}" height="${s}" viewBox="0 0 32 32">${starIcon(32).match(/<path[^>]+>/)![0].replace('fill="#FFC93C"', `fill="${mix(I.fort, '#000000', 0.25)}"`)}</svg>`;
            return <span key={i} class="s" style={{ animationDelay: `${0.25 + i * 0.32}s` }}><Svg html={html} /></span>;
          })}
        </div>
        <div class="end-hero">
          <span class="disc"><Svg html={avatar({ ...p.av, color: p.color, size: 92 })} /></span>
          <span class="m jump"><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'joie', size: 100, noSparkle: true })} /></span>
        </div>
      </div>
      <div class="end-body">
        <div class="end-stats">
          {timed ? (
            <>
              <div class="es"><b><CountUp to={E.score ?? 0} /></b><small>{E.mode === 'defi' ? `sur ${E.target} demandées` : 'bonnes réponses en 1 min'}</small></div>
              <div class="es coin"><b>+<span><CountUp to={E.coinsGain} /></span><Svg html={coinIcon(24)} /></b><small>pièces{E.bonus ? ` dont ${E.bonus} de bonus` : ''}</small></div>
              {E.mode === 'chrono'
                ? <div class="es"><b>{E.newRec ? <Svg html={trophyIcon(30)} /> : E.rec}</b><small>{E.newRec ? 'nouveau record' : 'ton record'}</small></div>
                : <div class="es"><b><Svg html={icoChest(!!E.success)} /></b><small>{E.success ? 'coffre ouvert' : 'coffre fermé'}</small></div>}
            </>
          ) : (
            <>
              <div class="es"><b><CountUp to={E.first} /></b><small>sur 10 du premier coup</small></div>
              <div class="es coin"><b>+<span><CountUp to={E.coinsGain} /></span><Svg html={coinIcon(24)} /></b><small>pièces</small></div>
              <div class="es"><b>+<span><CountUp to={E.starGain} /></span><Svg html={starIcon(24)} /></b><small>{E.starGain ? 'étoiles' : 'déjà gagnées'}</small></div>
            </>
          )}
        </div>
        <button class="end-grid" onClick={() => go({ name: 'grid' })}>
          <MiniGrid mastered={p.mastered} fresh={E.fresh} />
          <span>
            <b>{nf ? `+${nf} case${nf > 1 ? 's' : ''}` : 'Ta grille'}</b>
            <small>{nf ? 'dans ta grille de Pythagore' : 'Rejoue pour la colorier'}</small>
            <span class="xp"><span>Niv. {p.level}</span><span class="bar"><i style={{ width: `${xpW}%` }}></i></span></span>
          </span>
        </button>
        <div class="end-actions">
          <button class="btn-isle" onClick={next}>{E.mode === 'defi' ? "Retour à l'accueil" : E.trophy || E.stepDone ? 'Continuer' : 'Voir mon île'}</button>
          {!(E.mode === 'defi' && E.success) && (
            <button class="btn-again" onClick={() => go({ name: 'question', cfg, back })}>
              <Svg html={icoAgain} />{E.mode === 'defi' ? 'Réessayer' : 'Rejouer'}
            </button>
          )}
        </div>
      </div>
      {popup}
    </section>
  );
}
