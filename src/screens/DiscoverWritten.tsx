/* Découvrir les grands nombres et les mesures (CM1) : la leçon de l'île, un tableau ou des horloges, des exemples corrigés. */
import { clockArt, clockLabel } from '../art';
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { stepCfg } from '../app/sessions';
import { BackChip, BtnSay, Svg } from '../app/ui';
import type { BigId } from '../content/bignums';
import { lookOf } from '../content/isles';
import type { MesId } from '../content/measures';
import { MES_ZONE, SERIES, type SeriesId } from '../content/series';
import { fmtHour, sayMaths, thin } from '../content/written';
import { opProg } from '../engine/progress';
import { isleOf } from '../engine/unlock';
import { writtenItems, writtenSetOfSeries } from '../engine/written';

const LESSON: Record<BigId | MesId, string> = {
  lire: 'On range les chiffres par classes de trois, en partant de la droite : la classe des unités, celle des mille, celle des millions. On lit chaque classe, puis son nom.',
  chiffre: 'Chaque chiffre a une valeur selon sa place. Dans 4 532, le chiffre des centaines est 5, mais le nombre de centaines est 45 : on lit tout ce qui est à gauche.',
  calc: 'Multiplier par 10, 100 ou 1 000, c\'est écrire 1, 2 ou 3 zéros à droite d\'un nombre entier. Diviser par 10 un nombre qui finit par 0, c\'est enlever ce zéro.',
  reste: 'Dans 47 ÷ 5, on cherche combien de fois 5 tient dans 47 : 9 fois, car 5 × 9 = 45. Il reste 2. Le reste est toujours plus petit que le diviseur.',
  long: '1 km = 1 000 m ; 1 m = 100 cm ; 1 cm = 10 mm. Pour passer à une unité plus petite, on multiplie ; à une unité plus grande, on divise.',
  masse: '1 kg = 1 000 g. 1 L = 100 cL = 1 000 mL, et 1 cL = 10 mL. On mesure les masses en grammes, les contenances en litres.',
  heure: 'La petite aiguille montre les heures, la grande les minutes, de 5 en 5. 1 h = 60 min, et 1 min = 60 s : une heure n\'a pas 100 minutes !',
  pb: 'Avant de comparer ou de calculer, on met les deux mesures dans la même unité. Et on vérifie que la réponse est vraisemblable.',
};

/** Le tableau des classes : 2 504 300 = 2 millions, 504 mille, 300 unités. */
const CLASSES: readonly [string, string][] = [['millions', '2'], ['mille', '504'], ['unités', '300']];
/** Horloges de la leçon de l'heure. */
const CLOCKS: readonly [number, number][] = [[3, 0], [10, 30], [2, 15], [7, 45]];

export function DiscoverWritten({ s }: { s: SeriesId }) {
  const p = usePlayer();
  const { go } = useApp();
  const def = SERIES[s], set = writtenSetOfSeries(def), I = lookOf(s);
  const ex = writtenItems(def).filter((it, i) => i % 3 === 0 && !it.clock).slice(0, 5);
  const back = () => go({ name: 'isle', s });
  useBack(back);
  useIsleTheme(I.fort, I.clair);

  return (
    <section class="screen" data-screen="discover" aria-label="Revoir la leçon" style={{ background: 'var(--ile-clair)' }}>
      <div class="isd-band" style={{ paddingBottom: '14px' }}>
        <div class="isd-top" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
          <BackChip id="dscBack" label="Île" aria="Retour à l'île" onClick={back} />
          <div class="ttl" style={{ textAlign: 'center', fontFamily: 'var(--titre)', fontWeight: 600, fontSize: '20px', whiteSpace: 'nowrap' }}>{def.title}</div>
          <BtnSay text={sayMaths(LESSON[set])} style={{ justifySelf: 'end', background: '#fff' }} />
        </div>
      </div>
      <div class="dsc-body dsc-eng">
        <p class="fr-rule ok">{thin(LESSON[set])}</p>
        {(set === 'lire' || set === 'chiffre') && (
          <div class="wr-classes" role="img" aria-label="Tableau des classes : 2 millions, 504 mille, 300 unités. Le nombre s'écrit 2 504 300.">
            {CLASSES.map(([name, v]) => (
              <span key={name} class="wr-class"><small>{name}</small><b>{v}</b></span>
            ))}
          </div>
        )}
        {set === 'heure' && (
          <div class="frac-grid wr-clocks">
            {CLOCKS.map(([h, m]) => (
              <div key={`${h}:${m}`} class="fr-card frac-ex wr-ex">
                <span role="img" aria-label={clockLabel(h, m)}><Svg html={clockArt(h, m, 90, MES_ZONE.fort)} /></span>
                <b>{fmtHour(h, m)}</b>
              </div>
            ))}
          </div>
        )}
        <div class="phrases">
          <h2>Exemples</h2>
          {ex.map((x) => (
            <div key={x.q + x.a} class="phr">
              <span class="phr-txt"><span>{x.q}</span><b>{x.a}</b></span>
            </div>
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
