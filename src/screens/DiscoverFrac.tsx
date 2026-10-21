/* Découvrir les fractions et décimaux (CM1) : la leçon de l'île, avec des dessins ou des exemples corrigés. */
import { fractionArt } from '../art';
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { stepCfg } from '../app/sessions';
import { BackChip, BtnSay, Svg } from '../app/ui';
import { fracSetOf, fracWords, type FracId } from '../content/fractions';
import { lookOf } from '../content/isles';
import { SERIES, type SeriesId } from '../content/series';
import { fracSetOfSeries } from '../engine/fractions';
import { opProg } from '../engine/progress';
import { isleOf } from '../engine/unlock';

const LESSON: Record<FracId, string> = {
  lire: "Une fraction se lit avec deux nombres : en bas, le nombre de parts égales (le dénominateur) ; en haut, le nombre de parts prises (le numérateur).",
  unite: "Quand le numérateur est plus petit que le dénominateur, la fraction est plus petite que 1. Égaux : elle vaut 1. Plus grand : elle dépasse 1.",
  dix: "Un dixième s'écrit 0,1 et un centième 0,01. Le premier chiffre après la virgule compte les dixièmes, le deuxième les centièmes.",
  comp: "Pour comparer deux nombres à virgule : d'abord la partie entière, puis les dixièmes, puis les centièmes. Plus de chiffres ne veut pas dire plus grand !",
};

const SHOWN = [{ n: 1, d: 2 }, { n: 1, d: 4 }, { n: 3, d: 4 }, { n: 2, d: 3 }, { n: 5, d: 8 }, { n: 7, d: 10 }];

export function DiscoverFrac({ s }: { s: SeriesId }) {
  const p = usePlayer();
  const { go } = useApp();
  const set = fracSetOfSeries(SERIES[s]), I = lookOf(s), ex = fracSetOf(set).items.filter((_, i) => i % 3 === 0).slice(0, 5);
  const back = () => go({ name: 'isle', s });
  useBack(back);
  useIsleTheme(I.fort, I.clair);

  return (
    <section class="screen" data-screen="discover" aria-label="Revoir la leçon" style={{ background: 'var(--ile-clair)' }}>
      <div class="isd-band" style={{ paddingBottom: '14px' }}>
        <div class="isd-top" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
          <BackChip id="dscBack" label="Île" aria="Retour à l'île" onClick={back} />
          <div class="ttl" style={{ textAlign: 'center', fontFamily: 'var(--titre)', fontWeight: 600, fontSize: '20px', whiteSpace: 'nowrap' }}>{SERIES[s].title}</div>
          <BtnSay text={LESSON[set]} style={{ justifySelf: 'end', background: '#fff' }} />
        </div>
      </div>
      <div class="dsc-body dsc-eng">
        <p class="fr-rule ok">{LESSON[set]}</p>
        {set === 'lire' ? (
          <div class="frac-grid">
            {SHOWN.map((f) => (
              <div key={`${f.n}/${f.d}`} class="fr-card frac-ex">
                <Svg html={fractionArt(f.n, f.d, 80)} />
                <b>{f.n}/{f.d}</b>
                <small>{fracWords(f)}</small>
              </div>
            ))}
          </div>
        ) : (
          <div class="phrases">
            <h2>Exemples</h2>
            {ex.map((x) => (
              <div key={x.q + x.a} class="phr">
                <span class="phr-txt"><span>{x.q}</span><b>{x.a}</b></span>
              </div>
            ))}
          </div>
        )}
        <button
          class="btn-isle"
          style={{ marginTop: 0 }}
          onClick={() => go({ name: 'question', cfg: stepCfg(s, Math.min(isleOf(opProg(p, 'frac').series, s).steps, 2)), back: { name: 'isle', s } })}
        >
          Je m'entraîne
        </button>
      </div>
    </section>
  );
}
