/* Découvrir la table : chaque ligne est un paquet, la colonne de droite compte de n en n. */
import { chime } from '../audio';
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { stepCfg } from '../app/sessions';
import { BackChip, BtnSay } from '../app/ui';
import { ISLES } from '../content/isles';
import { SERIES, type SeriesId } from '../content/series';
import { DiscoverCP } from './DiscoverCP';
import { opProg } from '../engine/progress';
import { isleOf, tableNum } from '../engine/unlock';

export function Discover({ s, m }: { s: SeriesId; m: number }) {
  return SERIES[s].op === 'mul' ? <DiscoverTable s={s} m={m} /> : <DiscoverCP s={s} m={m} />;
}

function DiscoverTable({ s, m }: { s: SeriesId; m: number }) {
  const p = usePlayer();
  const { go } = useApp();
  const n = tableNum(s), I = ISLES[n];
  const back = () => go({ name: 'isle', s });
  useBack(back);
  useIsleTheme(I.fort, I.clair);

  const d = Math.max(10, Math.min(22, Math.floor(Math.min(250 / n, 230 / Math.max(m, 4))) - 4));
  const say = () => {
    const counts = Array.from({ length: m }, (_, i) => n * (i + 1)).join(', ');
    return `${n} fois ${m}, c'est ${m} paquet${m > 1 ? 's' : ''} de ${n}. On compte : ${counts}. ${n} fois ${m} égale ${n * m}.`;
  };

  return (
    <section class="screen" data-screen="discover" aria-label="Découvrir la table" style={{ background: 'var(--ile-clair)' }}>
      <div class="isd-band" style={{ paddingBottom: '14px' }}>
        <div class="isd-top" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
          <BackChip id="dscBack" label="Île" aria="Retour à l'île" onClick={back} />
          <div class="ttl" style={{ textAlign: 'center', fontFamily: 'var(--titre)', fontWeight: 600, fontSize: '22px', whiteSpace: 'nowrap' }}>La table de {n}</div>
          <BtnSay text={say} style={{ justifySelf: 'end', background: '#fff' }} />
        </div>
      </div>
      <div class="dsc-body">
        <div class="dsc-eq">
          <b>{n} <span class="op">×</span> {m} = {n * m}</b>
          <span>{m === 1 ? `1 paquet de ${n}` : `${m} paquets de ${n}`}</span>
        </div>
        <div class="viz" key={m} aria-hidden="true">
          {Array.from({ length: m }, (_, i) => (
            <div key={i} class="vrow" style={{ animationDelay: '0s' }}>
              <span class="vdots" style={{ '--d': `${d}px` }}>{Array.from({ length: n }, (_, j) => <i key={j}></i>)}</span>
              <span class="vtot">{n * (i + 1)}</span>
            </div>
          ))}
        </div>
        <div class="mchips">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((k) => (
            <button
              key={k}
              class="mchip"
              aria-pressed={k === m}
              aria-label={`${n} fois ${k}`}
              onClick={() => {
                go({ name: 'discover', s, m: k });
                chime('ok');
              }}
            >
              ×{k}<small>{n * k}</small>
            </button>
          ))}
        </div>
        <button
          class="btn-isle"
          style={{ marginTop: 0 }}
          onClick={() => {
            const i = Math.min(isleOf(opProg(p, 'mul').series, s).steps, 2);
            go({ name: 'question', cfg: stepCfg(s, i), back: { name: 'isle', s } });
          }}
        >
          Je m'entraîne
        </button>
      </div>
    </section>
  );
}
