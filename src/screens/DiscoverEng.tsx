/* Découvrir en anglais : l'imagier du thème (dessin, mot, traduction ; on touche une carte pour l'entendre)
   puis les phrases du thème, chacune avec son écoute. */
import { useState } from 'preact/hooks';
import { speak, type SayPart } from '../audio';
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { stepCfg } from '../app/sessions';
import { BackChip, BtnSay, Svg } from '../app/ui';
import { sceneArt } from '../art';
import { themeExamples, type Example } from '../content/english';
import { lookOf } from '../content/isles';
import { SERIES, type SeriesId } from '../content/series';
import { themeOfSeries } from '../engine/english';
import { opProg } from '../engine/progress';
import { isleOf } from '../engine/unlock';
import { WordPic } from './EngQuestion';

const sayOf = (x: Example): SayPart[] => [{ text: x.q, lang: x.fr ? 'fr' : 'en' }, { text: x.a, lang: 'en' }];

export function DiscoverEng({ s }: { s: SeriesId }) {
  const p = usePlayer();
  const { go } = useApp();
  const t = themeOfSeries(SERIES[s]), I = lookOf(s), examples = themeExamples(t);
  const [on, setOn] = useState<number | null>(null);
  const back = () => go({ name: 'isle', s });
  useBack(back);
  useIsleTheme(I.fort, I.clair);
  const sayAll = (): SayPart[] => t.words.map((w) => ({ text: w.en, lang: 'en' }));

  return (
    <section class="screen" data-screen="discover" aria-label="Découvrir les mots" style={{ background: 'var(--ile-clair)' }}>
      <div class="isd-band" style={{ paddingBottom: '14px' }}>
        <div class="isd-top" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
          <BackChip id="dscBack" label="Île" aria="Retour à l'île" onClick={back} />
          <div class="ttl" lang="en" style={{ textAlign: 'center', fontFamily: 'var(--titre)', fontWeight: 600, fontSize: '22px', whiteSpace: 'nowrap' }}>{t.en}</div>
          <BtnSay langs={['en']} text={sayAll} style={{ justifySelf: 'end', background: '#fff' }} />
        </div>
      </div>
      <div class="dsc-body dsc-eng">
        <p class="img-hint">Touche une carte pour entendre le mot.</p>
        <div class="imagier">
          {t.words.map((w, i) => (
            <button
              key={i}
              class={`img-card${on === i ? ' on' : ''}`}
              onClick={() => {
                setOn(i);
                speak([{ text: w.en, lang: 'en' }]);
              }}
            >
              <WordPic theme={t.id} i={i} size={64} />
              <b lang="en">{w.en}</b>
              <small>{w.fr}</small>
            </button>
          ))}
        </div>
        {examples.length > 0 && (
          <div class="phrases">
            <h2>Les phrases</h2>
            {examples.map((x, k) => (
              <div key={k} class="phr">
                {x.scene && <span class="phr-pic" aria-hidden="true"><Svg html={sceneArt(x.scene, 46)} /></span>}
                {x.word !== undefined && (
                  <span class="phr-pic" aria-hidden="true">
                    {Array.from({ length: x.count ?? 1 }, (_, j) => <WordPic key={j} theme={t.id} i={x.word!} size={x.count ? 30 : 46} />)}
                  </span>
                )}
                <span class="phr-txt">
                  <span class={x.fr ? 'fr' : ''} lang={x.fr ? 'fr' : 'en'}>{x.q}</span>
                  <b lang="en">{x.a}</b>
                </span>
                <BtnSay langs={['en']} label={`Écouter : ${x.a}`} text={() => sayOf(x)} />
              </div>
            ))}
          </div>
        )}
        <button
          class="btn-isle"
          style={{ marginTop: 0 }}
          onClick={() => go({ name: 'question', cfg: stepCfg(s, Math.min(isleOf(opProg(p, 'eng').series, s).steps, 2)), back: { name: 'isle', s } })}
        >
          Je m'entraîne
        </button>
      </div>
    </section>
  );
}
