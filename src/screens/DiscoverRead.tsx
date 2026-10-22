/* Découvrir en lecture (CP) : toutes les écritures de l'île ; on touche une carte pour l'entendre.
   Îles de phrases et de dictée : un imagier (le dessin et la phrase, ou le dessin et le mot). */
import { useState } from 'preact/hooks';
import { speak } from '../audio';
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { stepCfg } from '../app/sessions';
import { BackChip, BtnSay } from '../app/ui';
import { lookOf } from '../content/isles';
import { kindOf, PICS, sayOf } from '../content/reading';
import { SERIES, type SeriesId } from '../content/series';
import { opProg } from '../engine/progress';
import { readOfSeries } from '../engine/reading';
import { ReadPic } from './ReadQuestion';
import { isleOf } from '../engine/unlock';

export function DiscoverRead({ s }: { s: SeriesId }) {
  const p = usePlayer();
  const { go } = useApp();
  const set = readOfSeries(SERIES[s]), I = lookOf(s), kind = kindOf(set);
  const [on, setOn] = useState<number | null>(null);
  const back = () => go({ name: 'isle', s });
  useBack(back);
  useIsleTheme(I.fort, I.clair);

  return (
    <section class="screen" data-screen="discover" aria-label={kind === 'phrase' ? 'Découvrir les phrases' : kind === 'dictee' ? 'Découvrir les mots' : 'Découvrir les sons'} style={{ background: 'var(--ile-clair)' }}>
      <div class="isd-band" style={{ paddingBottom: '14px' }}>
        <div class="isd-top" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
          <BackChip id="dscBack" label="Île" aria="Retour à l'île" onClick={back} />
          <div class="ttl" style={{ textAlign: 'center', fontFamily: 'var(--titre)', fontWeight: 600, fontSize: '22px', whiteSpace: 'nowrap' }}>{set.title}</div>
          <BtnSay text={() => set.items.map((it) => ({ text: kind === 'dictee' ? it.w : sayOf(it), lang: 'fr' as const }))} style={{ justifySelf: 'end', background: '#fff' }} />
        </div>
      </div>
      <div class="dsc-body dsc-eng">
        <p class="img-hint">Touche une carte pour l'entendre.</p>
        <div class="imagier">
          {set.items.map((it, i) => (
            <button
              key={i}
              class={`img-card read${kind === 'son' ? '' : ` ${kind}`}${on === i ? ' on' : ''}`}
              {...(it.pic ? { 'aria-label': `${it.w} : ${PICS[it.pic].label}` } : {})}
              onClick={() => { setOn(i); speak([{ text: kind === 'dictee' ? it.w : sayOf(it), lang: 'fr' }]); }}
            >
              {it.pic && <ReadPic id={it.pic} size={kind === 'phrase' ? 72 : 64} named={false} />}
              <b>{it.w}</b>
            </button>
          ))}
        </div>
        <button
          class="btn-isle"
          style={{ marginTop: 0 }}
          onClick={() => go({ name: 'question', cfg: stepCfg(s, Math.min(isleOf(opProg(p, 'lec').series, s).steps, 2)), back: { name: 'isle', s } })}
        >
          Je m'entraîne
        </button>
      </div>
    </section>
  );
}
