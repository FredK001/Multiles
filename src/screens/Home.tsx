/* Écran 4 : Accueil. */
import { useEffect, useMemo, useState } from 'preact/hooks';
import { avatar, coinIcon, icoBuoy, icoCheck, icoChest, mascot, resize, starIcon } from '../art';
import { chime } from '../audio';
import { useProfileTheme } from '../app/theme';
import { useApp, usePlayer } from '../app/context';
import { defiCfg, playCurrentCfg } from '../app/sessions';
import { BtnSay, Overlay, Svg, TabBar } from '../app/ui';
import { ISLES, ISLE_IDS, ofIsle } from '../content/isles';
import { DAYS, HELLO, PEP_LINES } from '../content/messages';
import { nb } from '../content/text';
import { dailyTable, defiDone } from '../engine/daily';
import { stageFor } from '../engine/level';
import { pick } from '../engine/random';
import { weekView } from '../engine/streak';
import { currentStep, isleOf, openIsles, trophies } from '../engine/unlock';

export function Home() {
  const p = usePlayer();
  const { go, toast, today, updatePlayer } = useApp();
  const step = currentStep(isleOf(p.isl, p.isle));
  const streak = p.streak.current;
  const hello = useMemo(() => nb(pick(HELLO({ name: p.name, streak, isle: p.isle, step }))), [p.id]);
  const [pepLine, setPepLine] = useState<string | null>(null);
  const [popup, setPopup] = useState<typeof p.pendingStreak>(null);
  const stage = stageFor(p.level);
  const defiTable = p.defiPick?.day === today ? p.defiPick.table : dailyTable(today, openIsles(p.isl));
  const done = defiDone(p.defiDay, today);

  useProfileTheme(p.color);

  // Annonce de série (bouée utilisée ou nouveau départ), comme `missedDay` du prototype.
  useEffect(() => {
    if (!p.pendingStreak) return;
    const ev = p.pendingStreak;
    const t = setTimeout(() => {
      setPopup(ev);
      chime(ev.kind === 'buoy' ? 'combo' : 'help');
      void updatePlayer((x) => ({ ...x, pendingStreak: null }));
    }, 500);
    return () => clearTimeout(t);
  }, [p.pendingStreak]);

  const reactPep = () => {
    setPepLine(nb(pick(PEP_LINES)));
    setTimeout(() => setPepLine((l) => (l ? '' : l)), 1400);
  };
  const pepJoy = pepLine !== null && pepLine !== '';

  const week = weekView(p.days, p.streak, today);
  const buoys = p.streak.buoys;

  let pop = null;
  if (popup) {
    const buoy = popup.kind === 'buoy';
    const t = buoy ? (popup.missed > 1 ? "Tes bouées t'ont sauvé !" : "Ta bouée t'a sauvé !") : 'On repart !';
    const d = buoy
      ? `${popup.missed > 1 ? `Tu n'as pas joué pendant ${popup.missed} jours` : "Hier, tu n'as pas joué"}, mais ta série de ${popup.streak} jours continue. Il te reste ${popup.buoysLeft} bouée${popup.buoysLeft > 1 ? 's' : ''}.`
      : `Ta série recommence aujourd'hui. Ton record reste ${popup.best} jours. Joue aujourd'hui pour lancer une nouvelle série.`;
    pop = (
      <Overlay onClose={() => setPopup(null)}>
        {buoy
          ? <div style={{ transform: 'scale(5)', margin: '56px 0 52px' }}><Svg html={icoBuoy} /></div>
          : <Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'encourage', size: 140 })} />}
        <h2 id="ov-title">{nb(t)}</h2>
        <p>{nb(d)}</p>
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
          <BtnSay wrap text={`${t} ${d}`} />
          <button class="btn-primary" style={{ flex: 1 }} onClick={() => setPopup(null)}>{buoy ? 'Super !' : "C'est parti !"}</button>
        </div>
      </Overlay>
    );
  }

  return (
    <section class="screen" data-screen="home" aria-label="Accueil">
      <div class="home-band">
        <div class="home-top">
          <button class="chip-switch" id="btnSwitch" onClick={() => go({ name: 'who' })}>
            <span class="mini"><Svg html={avatar({ ...p.av, color: p.color, size: 38 })} /></span>Changer de joueur
          </button>
          <BtnSay text={() => (pepLine || hello)} style={{ background: '#fff' }} />
        </div>
        <p class="home-hello" aria-live="polite">{pepLine || hello}</p>
        <div class="home-scene">
          <div class="home-ground"></div>
          <button class="home-disc" aria-label="Modifier mon avatar" onClick={() => go({ name: 'editor', ret: { name: 'home' } })}>
            <Svg html={avatar({ ...p.av, color: p.color, size: 126 })} />
          </button>
          <div
            class={`home-pep m ${pepJoy ? 'jump' : 'idle'}`}
            role="button"
            tabIndex={0}
            aria-label="Faire réagir ton Pépin"
            onClick={reactPep}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), reactPep())}
          >
            <Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, size: 118, ...(pepJoy ? { mood: 'joie' as const } : {}) })} />
          </div>
        </div>
        <div class="home-stats">
          <span class="stat"><Svg html={starIcon(28)} />{p.stars}<span class="sr"> étoiles</span></span>
          <button class="stat coin" aria-label="Pièces, ouvrir la boutique" onClick={() => go({ name: 'shop' })}>
            <Svg html={coinIcon(28)} />{p.coins}
          </button>
          <span class="stat lvl">Niveau {p.level}<span class="bar"><i style={{ width: `${Math.round(p.xp * 100)}%` }}></i></span></span>
        </div>
      </div>
      <div class="home-body">
        <button class="isles-strip" onClick={() => go({ name: 'map' })}>
          <span><b>Mes îles</b><small>{trophies(p.isl)} sur 10 conquises</small></span>
          <span class="dots10">
            {ISLE_IDS.map((n) => (
              <i key={n} style={p.isl[n]?.trophy ? { background: ISLES[n].fort } : n === p.isle ? { background: 'var(--miel)' } : undefined}></i>
            ))}
          </span>
        </button>
        <div class="cards2">
          <button
            class="hcard"
            aria-label={`Série : ${streak} jours. ${buoys} bouée.`}
            onClick={() => toast('Une bouée garde ta série si tu oublies un jour. Tu en gagnes une tous les 7 jours de suite, 2 au maximum.')}
          >
            <span class="h"><b>{streak === 0 ? 'Ta série' : streak + (streak > 1 ? ' jours' : ' jour') + ' de suite'}</b></span>
            {streak === 0 && p.streak.best > 0 && <small>{nb(`Record : ${p.streak.best} jours`)}</small>}
            <span class="joker"><Svg html={icoBuoy} />{buoys} {buoys > 1 ? 'bouées' : 'bouée'}</span>
            <span class="week">
              {week.map((d, i) => (
                <span key={d.day} class={`wd ${d.played ? 'on' : ''} ${d.buoy ? 'buoy' : ''} ${d.today ? 'today' : ''}`}>
                  <i>{d.buoy ? <Svg html={resize(icoBuoy, [22, 22], [16, 16])} /> : d.played ? <Svg html={resize(icoCheck, [22, 22], [13, 13])} /> : null}</i>
                  {DAYS[i]}
                </span>
              ))}
            </span>
          </button>
          <button
            class={`hcard${done ? ' done' : ''}`}
            onClick={() => {
              if (done) {
                toast("Bravo, défi déjà réussi aujourd'hui !");
                return;
              }
              go({ name: 'question', cfg: defiCfg(defiTable), back: { name: 'home' } });
            }}
          >
            <span class="h"><Svg html={icoChest(done)} /><b>Défi du jour</b></span>
            <small>{done ? nb("Réussi ! Un nouveau défi t'attend demain.") : nb(`Table de ${defiTable} : 8 réponses en 1 minute.`)}</small>
          </button>
        </div>
        <button class="btn-play" onClick={() => go({ name: 'question', cfg: playCurrentCfg(p), back: { name: 'home' } })}>
          <b>Jouer</b><small>{`Île ${ofIsle(p.isle)}, étape ${step}`}</small>
        </button>
      </div>
      {pop}
      <TabBar current="home" />
    </section>
  );
}
