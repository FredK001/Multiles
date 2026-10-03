/* Découvrir au CP : les « maisons des nombres ». Addition : toutes les façons de faire n.
   Soustraction : on part de n et on enlève 1, 2, 3… Les jetons sont ceux de l'aide (Mandarine, bleu, barrés). */
import { chime } from '../audio';
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { stepCfg } from '../app/sessions';
import { BackChip, BtnSay, useAutoSay } from '../app/ui';
import { lookOf } from '../content/isles';
import { OP_SIGN, OP_SPOKEN, SERIES, type SeriesId } from '../content/series';
import { opProg } from '../engine/progress';
import { isleOf } from '../engine/unlock';

export function DiscoverCP({ s, m }: { s: SeriesId; m: number }) {
  const p = usePlayer();
  const { go } = useApp();
  const def = SERIES[s], I = lookOf(s), add = def.op === 'add';
  const sp = def.spec.kind === 'range' ? def.spec : { min: 0, max: 10, termMax: 10 };
  const back = () => go({ name: 'isle', s });
  useBack(back);
  useIsleTheme(I.fort, I.clair);

  // Nombres proposés : 1 à 10 (jusqu'à 10) ou 11 à 20 (jusqu'à 20).
  const chips = Array.from({ length: 10 }, (_, i) => Math.max(1, sp.min) + i);
  const n = chips.includes(m) ? m : chips[0]!;
  // Lignes : a + b = n (termes de 0 à 10), ou n − b (b de 0 ou 1 à 10).
  const rows = add
    ? Array.from({ length: 11 }, (_, a) => a).filter((a) => n - a >= 0 && n - a <= 10).map((a) => ({ a, b: n - a, r: n }))
    : Array.from({ length: 11 }, (_, b) => b).filter((b) => b <= n && (n <= 10 || b >= 1)).map((b) => ({ a: n, b, r: n - b }));
  const d = Math.max(8, Math.min(18, Math.floor(Math.min(220 / n, 300 / rows.length)) - 3));
  const w = OP_SPOKEN[def.op];
  const intro = add ? `Toutes les façons de faire ${n}.` : `On part de ${n} et on enlève.`;
  const say = () => `${intro} ${rows.map((x) => `${x.a} ${w} ${x.b} égale ${x.r}`).join('. ')}.`;
  useAutoSay(intro, n);

  return (
    <section class="screen" data-screen="discover" aria-label="Découvrir les nombres" style={{ background: 'var(--ile-clair)' }}>
      <div class="isd-band" style={{ paddingBottom: '14px' }}>
        <div class="isd-top" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
          <BackChip id="dscBack" label="Île" aria="Retour à l'île" onClick={back} />
          <div class="ttl" style={{ textAlign: 'center', fontFamily: 'var(--titre)', fontWeight: 600, fontSize: '22px', whiteSpace: 'nowrap' }}>{OP_SIGN[def.op]} {def.title}</div>
          <BtnSay text={say} style={{ justifySelf: 'end', background: '#fff' }} />
        </div>
      </div>
      <div class="dsc-body">
        <div class="dsc-eq">
          <b>{n}</b>
          <span>{intro}</span>
        </div>
        <ul class="sr">{rows.map((x, i) => <li key={i}>{x.a} {w} {x.b} égale {x.r}</li>)}</ul>
        <div class="viz" key={n} aria-hidden="true">
          {rows.map((x, i) => (
            <div key={i} class="vrow">
              <span class="vdots cp" style={{ '--d': `${d}px`, '--g': '3px' }}>
                {Array.from({ length: x.a + (add ? x.b : 0) }, (_, j) => <i key={j} class={add ? (j < x.a ? '' : 'b') : j >= x.a - x.b ? 'out' : ''}></i>)}
              </span>
              <span class="vtot">{x.a} {OP_SIGN[def.op]} {x.b} = {x.r}</span>
            </div>
          ))}
        </div>
        <div class="mchips">
          {chips.map((k) => (
            <button
              key={k}
              class="mchip"
              aria-pressed={k === n}
              aria-label={add ? `Les façons de faire ${k}` : `Partir de ${k}`}
              onClick={() => {
                go({ name: 'discover', s, m: k });
                chime('ok');
              }}
            >
              {k}
            </button>
          ))}
        </div>
        <button
          class="btn-isle"
          style={{ marginTop: 0 }}
          onClick={() => go({ name: 'question', cfg: stepCfg(s, Math.min(isleOf(opProg(p, def.op).series, s).steps, 2)), back: { name: 'isle', s } })}
        >
          Je m'entraîne
        </button>
      </div>
    </section>
  );
}
