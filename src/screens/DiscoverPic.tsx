/* Découvrir les grandeurs et l'espace (CP) : une courte leçon lue, et des dessins à toucher pour les entendre. */
import { useState } from 'preact/hooks';
import { picArt } from '../art';
import { speak } from '../audio';
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { stepCfg } from '../app/sessions';
import { BackChip, BtnSay, Svg } from '../app/ui';
import { lookOf } from '../content/isles';
import type { GrdId } from '../content/measures';
import { clock, hourText, money, sayEuros, shape, type PicCode } from '../content/picquiz';
import { SERIES, type SeriesId } from '../content/series';
import type { EspId } from '../content/space';
import { nb } from '../content/text';
import { opProg } from '../engine/progress';
import { picSpecOf } from '../engine/picquiz';
import { isleOf } from '../engine/unlock';

const LESSON: Record<GrdId | EspId, string> = {
  pieces: 'Les pièces sont rondes : 1\u00a0€, 2\u00a0€. Les billets sont en papier : 5\u00a0€, 10\u00a0€, 20\u00a0€. Pour savoir combien on a, on lit le nombre écrit dessus : on ne compte pas les pièces.',
  payer: 'Pour compter son argent, on commence par le plus grand billet, puis on ajoute le reste. 10\u00a0€, puis 5\u00a0€ : 15\u00a0€.',
  heure: "La petite aiguille montre l'heure. Quand la grande aiguille est sur le 12, c'est une heure juste : il est 3 heures.",
  demie: "Quand la grande aiguille est sur le 6, c'est la demie. La petite aiguille est entre deux nombres : on dit le plus petit. 7 heures et demie.",
  formes: 'Le carré a 4 côtés pareils. Le rectangle a 2 grands côtés et 2 petits. Le triangle a 3 côtés. Le cercle est tout rond.',
  cotes: "Un côté, c'est un trait droit du bord. Un coin, c'est une pointe : on l'appelle aussi un sommet. Le triangle a 3 côtés et 3 coins.",
  quadri: 'Pour trouver une case : la lettre est en haut, le chiffre est sur le côté. On dit la lettre, puis le chiffre : B3.',
  position: 'Sur, sous, dans, devant, derrière, à gauche, à droite : ces mots disent où est le chat. Touche un dessin pour l\'entendre.',
};

/** Dessins de la leçon et ce qu'on entend en les touchant. */
const EXAMPLES: Record<GrdId | EspId, readonly (readonly [PicCode, string])[]> = {
  pieces: [[money(1), 'La pièce de 1\u00a0€'], [money(2), 'La pièce de 2\u00a0€'], [money(5), 'Le billet de 5\u00a0€'], [money(10), 'Le billet de 10\u00a0€']],
  payer: [[money(10, 5), '10 + 5 = 15\u00a0€'], [money(5, 5), '5 + 5 = 10\u00a0€'], [money(10, 2, 1), '10 + 2 + 1 = 13\u00a0€'], [money(10, 10), '10 + 10 = 20\u00a0€']],
  heure: [[clock(3), hourText(3)], [clock(6), hourText(6)], [clock(9), hourText(9)], [clock(12), hourText(12)]],
  demie: [[clock(7, 30), hourText(7, true)], [clock(2, 30), hourText(2, true)], ['sky:matin', 'Le matin'], ['sky:soir', 'Le soir']],
  formes: [[shape('carre', 0, 0), 'Le carré'], [shape('rectangle', 0, 1), 'Le rectangle'], [shape('triangle', 0, 2), 'Le triangle'], [shape('cercle', 0, 3), 'Le cercle']],
  cotes: [[shape('triangle', 0, 2), '3 côtés, 3 coins'], [shape('carre', 0, 0), '4 côtés, 4 coins'], [shape('rectangle', 0, 1), '4 côtés, 4 coins'], [shape('cercle', 0, 3), 'Ni côté, ni coin']],
  quadri: [['grid:B3', "L'étoile est en B3"], ['grid:D1', "L'étoile est en D1"]],
  position: [
    ['place:table-on', 'Sur la table'], ['place:table-under', 'Sous la table'], ['place:in', 'Dans la boîte'], ['place:front', 'Devant la boîte'],
    ['place:behind', 'Derrière la boîte'], ['place:table-beside', 'À côté de la table'], ['place:left', 'À gauche de la boîte'], ['place:right', 'À droite de la boîte'],
  ],
};

export function DiscoverPic({ s }: { s: SeriesId }) {
  const p = usePlayer();
  const { go } = useApp();
  const sp = picSpecOf(SERIES[s]), I = lookOf(s), lesson = LESSON[sp.set], ex = EXAMPLES[sp.set];
  const [on, setOn] = useState<number | null>(null);
  const back = () => go({ name: 'isle', s });
  useBack(back);
  useIsleTheme(I.fort, I.clair);

  return (
    <section class="screen" data-screen="discover" aria-label="La leçon" style={{ background: 'var(--ile-clair)' }}>
      <div class="isd-band" style={{ paddingBottom: '14px' }}>
        <div class="isd-top" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
          <BackChip id="dscBack" label="Île" aria="Retour à l'île" onClick={back} />
          <div class="ttl" style={{ textAlign: 'center', fontFamily: 'var(--titre)', fontWeight: 600, fontSize: '20px', whiteSpace: 'nowrap' }}>{SERIES[s].title}</div>
          <BtnSay text={sayEuros(lesson)} style={{ justifySelf: 'end', background: '#fff' }} />
        </div>
      </div>
      <div class="dsc-body dsc-eng">
        <p class="fr-rule ok">{nb(lesson)}</p>
        <p class="img-hint">Touche un dessin pour l'entendre.</p>
        <div class="pic-lesson">
          {ex.map(([code, say], i) => (
            <button key={code} class={`img-card pic-ex${on === i ? ' on' : ''}`} onClick={() => { setOn(i); speak([{ text: sayEuros(say), lang: 'fr' }]); }}>
              <Svg html={picArt(code, sp.set === 'quadri' ? 110 : 90, { aid: sp.set === 'cotes' || sp.set === 'quadri', maxW: 220 })} />
              <b>{say}</b>
            </button>
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
