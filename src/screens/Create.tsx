/* Écran 2 : création de profil (Prénom, Avatar, Pépin). */
import { useEffect, useRef, useState } from 'preact/hooks';
import { icoCheck, mascot } from '../art';
import { speak } from '../audio';
import { useApp, useBack } from '../app/context';
import { BackChip, BtnSay, Svg } from '../app/ui';
import { VARIANTS, VARIANT_IDS, type PepinVariant } from '../content/pepins';
import { CP_ZONE, GRADE_DESC, GRADES, type Grade } from '../content/series';
import { nb } from '../content/text';
import { cleanName, createProfile, defaultAvatar, freeColors } from '../engine/profile';
import { AvatarEditor, type Draft } from './AvatarEditor';

export function Create() {
  const { data, store, go, setFreshId, route } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [draft, setDraft] = useState<Draft>(() => ({ name: '', color: freeColors(data.profiles)[0] ?? '#C8371D', av: defaultAvatar() }));
  const [grade, setGrade] = useState<Grade | null>(null);
  const [pepin, setPepin] = useState<PepinVariant | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const back = route.name === 'create' ? () => (step === 1 ? go({ name: 'who' }) : setStep(step - 1)) : () => {};
  useBack(back);

  useEffect(() => {
    if (step === 1) setTimeout(() => inputRef.current?.focus(), 50);
  }, [step]);

  const next1 = () => {
    if (!name.trim()) return;
    setDraft({ ...draft, name: cleanName(name) });
    setStep(2);
  };

  const done = async () => {
    if (!pepin || !grade) return;
    const p = createProfile({ name: draft.name, color: draft.color, av: draft.av, pepin, grade });
    await store.addProfile(p);
    setFreshId(p.id);
    go({ name: 'who' });
  };

  const labels = ['Prénom', 'Classe', 'Avatar', 'Pépin'];
  return (
    <section class="screen" data-screen="create" aria-label="Nouveau joueur">
      <div class="topbar">
        <BackChip id="crBack" label="Retour" aria="Retour" onClick={back} />
        <div class="stepper">
          {labels.map((l, i) => (
            <span key={l} class={`st ${i + 1 < step ? 'done' : i + 1 === step ? 'now' : ''}`}><i></i>{l}</span>
          ))}
        </div>
      </div>

      <div class="pane" hidden={step !== 1}>
        <div class="buddy">
          <div class="m idle"><Svg html={mascot({ stage: 2, mood: 'neutre' })} /></div>
          <div class="bubble">
            <p class="t">{nb("Salut ! Comment tu t'appelles ?")}</p>
            <BtnSay text="Salut ! Comment tu t'appelles ? Écris ton prénom." />
          </div>
        </div>
        <input
          ref={inputRef}
          class="name-input"
          type="text"
          maxLength={12}
          autoComplete="off"
          autoCapitalize="words"
          spellcheck={false}
          placeholder="Ton prénom"
          aria-label="Ton prénom"
          value={name}
          onInput={(e) => setName(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && next1()}
        />
        <p class="name-help">Juste ton prénom, rien d'autre.</p>
        <button class="btn-primary" aria-disabled={name.trim() ? 'false' : 'true'} onClick={next1}>Suivant</button>
      </div>

      {step === 2 && (
        <div class="pane">
          <div class="buddy" style={{ gridTemplateColumns: '1fr 56px' }}>
            <div>
              <h2 class="pane-title">{nb('Tu es en quelle classe ?')}</h2>
              <p style={{ fontSize: '16px', color: 'var(--ink-2)', marginTop: '4px' }}>Demande à un grand si tu ne sais pas.</p>
            </div>
            <BtnSay text="Tu es en quelle classe ? Au CP, les additions et les soustractions. Au CM1, les tables de multiplication." />
          </div>
          <div class="pep-list" role="group" aria-label="Classe">
            {GRADES.map((g) => {
              const on = grade === g;
              return (
                <button
                  key={g}
                  class="pep-card"
                  aria-pressed={on}
                  onClick={() => {
                    setGrade(g);
                    speak(`${g}. ${GRADE_DESC[g]}.`);
                  }}
                >
                  <span class="gsign" aria-hidden="true" style={{ background: g === 'CP' ? CP_ZONE.fort : 'var(--ballon)' }}>{g === 'CP' ? '+−' : '×'}</span>
                  <span><b>{g}</b><span class="tr">{GRADE_DESC[g]}</span></span>
                  <span class="chk">{on && <Svg html={icoCheck} />}</span>
                </button>
              );
            })}
          </div>
          <p class="name-help">{nb('Le parent pourra changer la classe plus tard.')}</p>
          <button class="btn-primary" aria-disabled={grade ? 'false' : 'true'} style={{ marginTop: 'auto' }} onClick={() => grade && setStep(3)}>Suivant</button>
        </div>
      )}

      {step === 3 && (
        <div class="pane">
          <AvatarEditor draft={draft} onChange={setDraft} owner={null} />
          <button class="btn-primary" onClick={() => setStep(4)}>Suivant</button>
        </div>
      )}

      {step === 4 && (
        <div class="pane">
          <div class="buddy" style={{ gridTemplateColumns: '1fr 56px' }}>
            <div>
              <h2 class="pane-title">Choisis ton Pépin</h2>
              <p style={{ fontSize: '16px', color: 'var(--ink-2)', marginTop: '4px' }}>Il va grandir avec toi.</p>
            </div>
            <BtnSay text="Choisis ton Pépin. Il va grandir avec toi." />
          </div>
          <div class="pep-list">
            {VARIANT_IDS.map((k) => {
              const v = VARIANTS[k], on = pepin === k;
              return (
                <button
                  key={k}
                  class="pep-card"
                  aria-pressed={on}
                  onClick={() => {
                    setPepin(k);
                    speak(`${v.name}. ${v.desc}.`);
                  }}
                >
                  <span><Svg html={mascot({ variant: k, stage: 2, mood: on ? 'joie' : 'neutre', size: 108, noSparkle: true })} /></span>
                  <span><b>{v.name}</b><span class="tr">{v.desc}</span></span>
                  <span class="chk">{on && <Svg html={icoCheck} />}</span>
                </button>
              );
            })}
          </div>
          <button class="btn-primary" aria-disabled={pepin ? 'false' : 'true'} style={{ marginTop: 'auto' }} onClick={() => void done()}>
            {nb("C'est parti !")}
          </button>
        </div>
      )}
    </section>
  );
}
