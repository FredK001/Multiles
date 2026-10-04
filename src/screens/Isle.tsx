/* Écran 6 : détail d'une île (Découvrir, Défi chrono, 3 étapes, gardien). */
import { useState } from 'preact/hooks';
import { bossSvg, icoClock, icoDiscover, icoLock, islandArt, resize, starIcon, starSmall, trophyIcon } from '../art';
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { bossCfg, chronoCfg, stepCfg } from '../app/sessions';
import { Svg } from '../app/ui';
import { BackChip } from '../app/ui';
import { lookOf } from '../content/isles';
import { OP_SIGN, SERIES, type SeriesId } from '../content/series';
import { nb } from '../content/text';
import { opProg } from '../engine/progress';
import { timedRules } from '../engine/session';
import { bossOpen, chronoOpen, defaultSelection, isleOf, isleStars } from '../engine/unlock';

export function IsleScreen({ s }: { s: SeriesId }) {
  const p = usePlayer();
  const { go, toast, data } = useApp();
  const def = SERIES[s], mul = def.op === 'mul', eng = def.op === 'eng', I = lookOf(s), n = I.motif, o = opProg(p, def.op), st = isleOf(o.series, s);
  const [sel, setSel] = useState(() => defaultSelection(st));
  const back = () => go({ name: 'map', op: def.op });
  useBack(back);
  useIsleTheme(I.fort, I.clair);

  const bossTime = data.settings.bossTime;
  const prog = st.steps + (st.trophy ? 1 : 0);
  const rec = o.records[s], chrOpen = chronoOpen(st), bOpen = bossOpen(st);
  const here = { name: 'isle' as const, s };
  const minutes = timedRules(def.op).seconds / 60;
  const label = sel === 3 ? `Défier ${I.boss}` : sel < st.steps ? `Rejouer l'étape ${sel + 1}` : `Jouer l'étape ${sel + 1}`;

  return (
    <section class="screen" data-screen="isle" aria-label="Détail de l'île" style={{ background: 'var(--ile-clair)' }}>
      <div class="isd-band">
        <div class="isd-top">
          <BackChip id="isdBack" label="Carte" aria="Retour à la carte" onClick={back} />
          <span></span>
          <span class="cnt"><Svg html={starIcon(26)} />{isleStars(st)}/9</span>
        </div>
        <div class="isd-hero">
          <Svg html={islandArt(n, false, I.fort)} />
          <h1 lang={eng ? 'en' : undefined}>{I.name}</h1>
          {mul ? <p>{def.title}</p> : <p class="isd-op"><b aria-hidden="true">{OP_SIGN[def.op]}</b>{def.title}</p>}
        </div>
        <div class="isd-prog">
          <span>{prog} sur 4</span>
          <span class="bar"><i style={{ width: `${prog * 25}%` }}></i></span>
          {st.trophy && <Svg html={trophyIcon(30)} />}
        </div>
      </div>
      <div class="isd-body">
        <div class={eng ? 'modes2 one' : 'modes2'}>
          {/* Découvrir en anglais (imagier) : à venir. */}
          {!eng && <button class="discover" onClick={() => go({ name: 'discover', s, m: def.spec.kind === 'range' ? Math.max(1, def.spec.min) : 1 })}>
            <span class="ic"><Svg html={icoDiscover} /></span>
            <span><b>Découvrir</b><small>{mul ? 'Voir la table avant de jouer' : 'Voir les nombres avant de jouer'}</small></span>
          </button>}
          <button
            class={`discover${chrOpen ? '' : ' lock'}`}
            onClick={() => {
              if (!chrOpen) {
                toast("Le défi chrono s'ouvre après l'étape 1.");
                return;
              }
              go({ name: 'question', cfg: chronoCfg(s), back: here });
            }}
          >
            <span class="ic chr"><Svg html={chrOpen ? resize(icoClock, [18, 18], [26, 26]) : resize(icoLock, [26, 28], [20, 22])} /></span>
            <span><b>Défi chrono</b><small>{chrOpen ? (rec ? nb(`Ton record : ${rec}`) : `${minutes} minute${minutes > 1 ? 's' : ''}, bats ton record`) : "Après l'étape 1"}</small></span>
          </button>
        </div>
        <div class="steps3">
          {[0, 1, 2].map((i) => {
            const open = i <= st.steps, done = i < st.steps;
            const rg = def.stepLabels[i]!;
            const stars = st.stepStars[i] ?? 0;
            return (
              <button
                key={i}
                class={`stp ${open ? '' : 'lock'}`}
                aria-pressed={sel === i}
                aria-label={`Étape ${i + 1}, ${rg}${done ? `, ${stars} étoiles` : open ? '' : ', fermée'}`}
                onClick={() => {
                  if (i > st.steps) {
                    toast(`Réussis l'étape ${i} d'abord.`);
                    return;
                  }
                  setSel(i);
                }}
              >
                {open && !done && <span class="now">À toi</span>}
                <span class="n">{open ? i + 1 : <Svg html={resize(icoLock, [26, 28], [16, 18])} />}</span>
                <span class="rg">{rg}</span>
                <span class="st3">{[0, 1, 2].map((k) => <Svg key={k} html={starSmall(done && k < stars)} />)}</span>
              </button>
            );
          })}
        </div>
        <button
          class={`boss${bOpen ? '' : ' lock'}`}
          aria-pressed={sel === 3}
          onClick={() => {
            if (!bOpen) {
              toast("Le gardien t'attend après les 3 étapes.");
              return;
            }
            setSel(3);
          }}
        >
          <Svg html={bossSvg(n, 92, !bOpen, I.fort)} />
          <span>
            <b>Le gardien {I.boss}</b>
            <small>{bOpen ? (st.trophy ? nb('Battu ! Tu peux le défier encore.') : `${mul ? 'Toute la table' : eng ? 'Tout le thème' : 'Toute la série'}${bossTime ? ` en ${bossTime} minutes` : ', sans chrono'}`) : 'Finis les 3 étapes pour le défier.'}</small>
          </span>
          <Svg html={bOpen ? trophyIcon(40) : icoLock} />
        </button>
        <button
          class="btn-isle"
          onClick={() => go({ name: 'question', cfg: sel === 3 ? bossCfg(s, bossTime) : stepCfg(s, sel), back: here })}
        >
          {label}
        </button>
      </div>
    </section>
  );
}
