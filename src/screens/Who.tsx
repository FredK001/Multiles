/* Écran 1 : Qui joue ? */
import { avatar, icoParentLock, icoPlus, logoMark, mascot } from '../art';
import { useApp } from '../app/context';
import { BtnSay, Svg } from '../app/ui';
import { nb } from '../content/text';
import { MAX_PROFILES } from '../store';

export function Who() {
  const { data, go, selectPlayer, freshId, setFreshId } = useApp();
  const profiles = data.profiles;
  return (
    <section class="screen" data-screen="who" aria-label="Qui joue ?">
      <div class="who-logo"><span><Svg html={logoMark(30)} /></span>Multîles</div>
      <div class="who-head">
        <span></span>
        <h1>{nb('Qui joue ?')}</h1>
        <BtnSay text="Qui joue ? Touche ta carte." />
      </div>
      <div class="who-grid">
        {profiles.map((p) => (
          <button
            key={p.id}
            class={`pcard ${p.id === freshId ? 'fresh' : ''}`}
            style={{ '--c': p.color }}
            aria-label={`Jouer avec le profil de ${p.name}`}
            onAnimationEnd={() => p.id === freshId && setFreshId(null)}
            onClick={() => {
              selectPlayer(p.id);
              setTimeout(() => go({ name: 'home' }), 120);
            }}
          >
            <span class="disc"><Svg html={avatar({ ...p.av, color: p.color, size: 118 })} /></span>
            <span class="pep"><Svg html={mascot({ variant: p.pepin, stage: 2, size: 46, wear: p.pw })} /></span>
            <span class="nm">{p.name}</span>
          </button>
        ))}
        {profiles.length < MAX_PROFILES && (
          <button class="pcard add" id="btnAdd" onClick={() => go({ name: 'create' })}>
            <span class="plus"><Svg html={icoPlus} /></span>
            <span class="nm">Nouveau joueur</span>
          </button>
        )}
      </div>
      <div class="who-foot">
        <button class="btn-chip" id="btnParent" onClick={() => go({ name: 'parent' })}>
          <Svg html={icoParentLock} />
          Espace parent
        </button>
      </div>
    </section>
  );
}
