/* Découvrir la géométrie (CM1) : la leçon de l'île, avec ses dessins nommés. */
import { geoArt } from '../art';
import { useIsleTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { stepCfg } from '../app/sessions';
import { BackChip, BtnSay, Svg } from '../app/ui';
import { cm, type GeoId, type GeoPic } from '../content/geometry';
import { lookOf } from '../content/isles';
import { GEO_ZONE, SERIES, type SeriesId } from '../content/series';
import { geoSetOfSeries } from '../engine/geometry';
import { opProg } from '../engine/progress';
import { isleOf } from '../engine/unlock';

const LESSON: Record<GeoId, string> = {
  angle: "Un angle droit, c'est le coin d'une feuille ou de l'équerre. Plus fermé qu'un angle droit, l'angle est aigu ; plus ouvert, il est obtus.",
  droite: 'Deux droites parallèles ne se coupent jamais. Deux droites perpendiculaires se coupent en formant un angle droit. Les autres se coupent sans angle droit : elles sont sécantes.',
  figure: 'Le carré a 4 angles droits et 4 côtés égaux ; le rectangle a 4 angles droits ; le losange a 4 côtés égaux. Dans un cercle, le rayon va du centre au cercle ; le diamètre le traverse et mesure deux rayons.',
  sym: "Un axe de symétrie partage une figure en deux moitiés qui se superposent quand on la plie. Le périmètre, c'est la longueur du tour : on additionne tous les côtés.",
};

interface Shown {
  pic: GeoPic;
  name: string;
  note: string;
}

/** Dessins de la leçon, avec leur nom. */
const SHOWN: Record<GeoId, readonly Shown[]> = {
  angle: [
    { pic: { k: 'angle', deg: 90, rot: 0 }, name: 'angle droit', note: "le coin de l'équerre" },
    { pic: { k: 'angle', deg: 45, rot: 0 }, name: 'angle aigu', note: 'plus fermé' },
    { pic: { k: 'angle', deg: 135, rot: 0 }, name: 'angle obtus', note: 'plus ouvert' },
  ],
  droite: [
    { pic: { k: 'lines', l: [{ x: 0, y: -25, t: 0, s0: -85, s1: 85 }, { x: 0, y: 25, t: 0, s0: -85, s1: 85 }] }, name: 'parallèles', note: 'toujours le même écart' },
    { pic: { k: 'lines', l: [{ x: 0, y: 0, t: 0, s0: -85, s1: 85 }, { x: 0, y: 0, t: 90, s0: -60, s1: 60 }] }, name: 'perpendiculaires', note: 'un angle droit' },
    { pic: { k: 'lines', l: [{ x: 0, y: 0, t: 0, s0: -85, s1: 85 }, { x: 0, y: 0, t: 45, s0: -85, s1: 85 }] }, name: 'sécantes', note: 'sans angle droit' },
  ],
  figure: [
    { pic: { k: 'shape', f: 'carre', rot: 0 }, name: 'carré', note: '4 angles droits, 4 côtés égaux' },
    { pic: { k: 'shape', f: 'rect', rot: 0 }, name: 'rectangle', note: '4 angles droits' },
    { pic: { k: 'shape', f: 'losange', rot: 0 }, name: 'losange', note: '4 côtés égaux' },
    { pic: { k: 'shape', f: 'triRect', rot: 0 }, name: 'triangle rectangle', note: 'un angle droit' },
    { pic: { k: 'shape', f: 'triIso', rot: 0 }, name: 'triangle isocèle', note: '2 côtés égaux' },
    { pic: { k: 'shape', f: 'triEqui', rot: 0 }, name: 'triangle équilatéral', note: '3 côtés égaux' },
    { pic: { k: 'circle', seg: 'rayon', rot: 30 }, name: 'rayon', note: 'du centre au cercle' },
    { pic: { k: 'circle', seg: 'diametre', rot: 0 }, name: 'diamètre', note: 'deux rayons' },
  ],
  sym: [
    { pic: { k: 'axis', f: 'rect', rot: 0, ax: [60, 0, 60, -70] }, name: 'axe de symétrie', note: 'les moitiés se superposent' },
    { pic: { k: 'axis', f: 'rect', rot: 0, ax: [0, 0, 120, -70] }, name: "pas d'axe", note: 'la diagonale du rectangle' },
    { pic: { k: 'dims', w: 5, h: 3 }, name: `périmètre : ${cm(16)}`, note: '5 + 3 + 5 + 3' },
    { pic: { k: 'dims', w: 4, h: 4 }, name: `périmètre : ${cm(16)}`, note: '4 côtés de 4 cm' },
  ],
};

export function DiscoverGeo({ s }: { s: SeriesId }) {
  const p = usePlayer();
  const { go } = useApp();
  const set = geoSetOfSeries(SERIES[s]), I = lookOf(s);
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
        <div class="geo-grid">
          {SHOWN[set].map((x) => (
            <div key={x.name + x.note} class="fr-card geo-ex">
              <Svg html={geoArt(x.pic, { fort: GEO_ZONE.fort, clair: GEO_ZONE.clair, size: 110, aid: x.pic.k === 'angle' || x.pic.k === 'lines' })} />
              <b>{x.name}</b>
              <small>{x.note}</small>
            </div>
          ))}
        </div>
        <button
          class="btn-isle"
          style={{ marginTop: 0 }}
          onClick={() => go({ name: 'question', cfg: stepCfg(s, Math.min(isleOf(opProg(p, 'geo').series, s).steps, 2)), back: { name: 'isle', s } })}
        >
          Je m'entraîne
        </button>
      </div>
    </section>
  );
}
