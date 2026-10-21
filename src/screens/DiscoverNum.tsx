/* Découvrir les nombres jusqu'à 100 (CP) : le tableau des nombres, une dizaine par ligne ; on touche une case pour l'entendre. */
import { useState } from 'preact/hooks';
import { speak } from '../audio';
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { stepCfg } from '../app/sessions';
import { BackChip, BtnSay } from '../app/ui';
import { lookOf } from '../content/isles';
import { SERIES, type SeriesId } from '../content/series';
import { opProg } from '../engine/progress';
import { isleOf } from '../engine/unlock';

export function DiscoverNum({ s }: { s: SeriesId }) {
  const p = usePlayer();
  const { go } = useApp();
  const I = lookOf(s);
  const [on, setOn] = useState<number | null>(null);
  const back = () => go({ name: 'isle', s });
  useBack(back);
  useIsleTheme(I.fort, I.clair);
  const tens = on === null ? null : Math.floor(on / 10);

  return (
    <section class="screen" data-screen="discover" aria-label="Le tableau des nombres" style={{ background: 'var(--ile-clair)' }}>
      <div class="isd-band" style={{ paddingBottom: '14px' }}>
        <div class="isd-top" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
          <BackChip id="dscBack" label="Île" aria="Retour à l'île" onClick={back} />
          <div class="ttl" style={{ textAlign: 'center', fontFamily: 'var(--titre)', fontWeight: 600, fontSize: '22px', whiteSpace: 'nowrap' }}>Les nombres</div>
          <BtnSay text="Touche un nombre pour l'entendre. Sur une ligne, les nombres ont la même dizaine." style={{ justifySelf: 'end', background: '#fff' }} />
        </div>
      </div>
      <div class="dsc-body dsc-eng">
        <p class="img-hint">{on === null ? 'Touche un nombre pour l\'entendre.' : `${on} : ${tens} dizaine${tens! > 1 ? 's' : ''} et ${on % 10} unité${on % 10 > 1 ? 's' : ''}.`}</p>
        <div class="hundred" role="group" aria-label="Tableau des nombres de 1 à 100">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
            <button key={n} class={`${n % 10 === 0 ? 'ten' : ''}${on === n ? ' on' : ''}`} onClick={() => { setOn(n); speak([{ text: String(n), lang: 'fr' }]); }}>{n}</button>
          ))}
        </div>
        <button
          class="btn-isle"
          style={{ marginTop: 0 }}
          onClick={() => go({ name: 'question', cfg: stepCfg(s, Math.min(isleOf(opProg(p, SERIES[s].op).series, s).steps, 2)), back: { name: 'isle', s } })}
        >
          Je m'entraîne
        </button>
      </div>
    </section>
  );
}
