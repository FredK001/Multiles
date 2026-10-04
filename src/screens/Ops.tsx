/* Choix de l'opération : deux grandes cartes (+ et − au CP, × et anglais au CM1), avant de jouer ou d'ouvrir la carte.
   La dernière opération choisie est mise en avant et mémorisée dans le profil. */
import { starIcon } from '../art';
import { useProfileTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { playCurrentCfg } from '../app/sessions';
import { BackChip, BtnSay, Svg, useAutoSay } from '../app/ui';
import { OP_SIGN, OP_SINGULAR, OP_WORD, zoneOf, type Op } from '../content/series';
import { opProg, opsOf } from '../engine/progress';
import { totalStars } from '../engine/unlock';

export function OpsScreen({ then }: { then: 'play' | 'map' }) {
  const p = usePlayer();
  const { go, updatePlayer } = useApp();
  const back = () => go({ name: 'home' });
  useBack(back);
  useProfileTheme(p.color);
  const ops = opsOf(p);
  const say = `${ops.map((op) => OP_WORD[op]).join(' ou ')} ? Touche une carte.`;
  useAutoSay(say);

  const choose = (op: Op) => {
    void updatePlayer((x) => ({ ...x, op }));
    go(then === 'play' ? { name: 'question', cfg: playCurrentCfg(p, op), back: { name: 'home' } } : { name: 'map', op });
  };

  return (
    <section class="screen" data-screen="ops" aria-label="Choix de l'opération">
      <div class="topbar tri">
        <BackChip id="opsBack" label="Retour" aria="Retour à l'accueil" onClick={back} />
        <div class="ttl">{then === 'play' ? 'Jouer' : 'Mes îles'}</div>
        <BtnSay text={say} style={{ justifySelf: 'end' }} />
      </div>
      <div class="pane">
        <div class="ops-cards" role="group" aria-label="Opération">
          {ops.map((op) => {
            const last = op === p.op, stars = totalStars(opProg(p, op).series);
            return (
              <button key={op} class={`op-card${last ? ' last' : ''}`} aria-label={`${OP_WORD[op]} : ${OP_SINGULAR[op].toLowerCase()}. ${stars} étoile${stars > 1 ? 's' : ''}.${last ? ' Dernier choix.' : ''}`} onClick={() => choose(op)}>
                {last && <span class="now" aria-hidden="true">Dernier choix</span>}
                <span class={`op-sign${op === 'eng' ? ' txt' : ''}`} aria-hidden="true" style={{ background: zoneOf(op) }}>{OP_SIGN[op]}</span>
                <span aria-hidden="true">
                  <b>{OP_WORD[op]}</b>
                  <small lang={op === 'eng' ? 'en' : undefined}>{op === 'eng' ? 'English' : OP_SINGULAR[op]}</small>
                  <span class="op-stars"><Svg html={starIcon(26)} />{stars}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
