/* Découvrir en français : la règle de la paire, et des phrases exemples pour chacun des deux mots. */
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { stepCfg } from '../app/sessions';
import { BackChip, BtnSay } from '../app/ui';
import { fillBlank } from '../content/french';
import { lookOf } from '../content/isles';
import { SERIES, type SeriesId } from '../content/series';
import { quizOfSeries } from '../engine/french';
import { opProg } from '../engine/progress';
import { isleOf } from '../engine/unlock';

export function DiscoverFr({ s }: { s: SeriesId }) {
  const p = usePlayer();
  const { go } = useApp();
  const quiz = quizOfSeries(SERIES[s]), I = lookOf(s);
  const back = () => go({ name: 'isle', s });
  useBack(back);
  useIsleTheme(I.fort, I.clair);
  // Trois exemples par mot, pris dans l'ordre des phrases.
  const examples = (w: string) => quiz.items.filter((x) => x.a === w).slice(0, 3).map((x) => fillBlank(x.s, w));
  const say = () => quiz.choices.map((w) => `${quiz.rule[w]} ${examples(w).join(' ')}`).join(' ');

  return (
    <section class="screen" data-screen="discover" aria-label="Revoir la règle" style={{ background: 'var(--ile-clair)' }}>
      <div class="isd-band" style={{ paddingBottom: '14px' }}>
        <div class="isd-top" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
          <BackChip id="dscBack" label="Île" aria="Retour à l'île" onClick={back} />
          <div class="ttl" style={{ textAlign: 'center', fontFamily: 'var(--titre)', fontWeight: 600, fontSize: '22px', whiteSpace: 'nowrap' }}>{quiz.title}</div>
          <BtnSay text={say} style={{ justifySelf: 'end', background: '#fff' }} />
        </div>
      </div>
      <div class="dsc-body dsc-eng">
        {quiz.choices.map((w) => (
          <div key={w} class="fr-card">
            <h2><b>{w}</b></h2>
            <p class="fr-rule">{quiz.rule[w]}</p>
            <ul>
              {examples(w).map((x) => <li key={x}>{x}</li>)}
            </ul>
            {quiz.swap[w] && <p class="fr-swap">Essaie « {quiz.swap[w]} » : si ça marche, c'est « {w} ».</p>}
          </div>
        ))}
        <button
          class="btn-isle"
          style={{ marginTop: 0 }}
          onClick={() => go({ name: 'question', cfg: stepCfg(s, Math.min(isleOf(opProg(p, 'fr').series, s).steps, 2)), back: { name: 'isle', s } })}
        >
          Je m'entraîne
        </button>
      </div>
    </section>
  );
}
