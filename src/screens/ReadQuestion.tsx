/* Question de lecture (CP) : réécouter le son (ou voir l'écriture à retrouver), trois écritures, l'aide.
   Îles de phrases : la phrase à lire, trois dessins. Îles de dictée : la voix (ou le dessin), le clavier de lettres. */
import { useEffect, useRef, useState } from 'preact/hooks';
import { icoErase, icoSay, readPicArt } from '../art';
import { speak } from '../audio';
import { BtnSay, Svg, useCanSpeak } from '../app/ui';
import { PICS, spell, type PicId } from '../content/reading';
import type { Question } from '../engine/questions';
import { dictMax, dictOk, dictType } from '../engine/reading';

/** Dit le son, le mot ou la phrase de la question. */
export const sayRead = (q: Question): void => speak([{ text: q.read!.say, lang: 'fr' }]);

/** Dictée : la voix dit le mot (sinon, le dessin est montré). */
export const dictHeard = (q: Question): boolean => q.fmt === 'dictee' && !q.read!.seen;

/** Dessin d'une phrase ou d'un mot, décrit pour les lecteurs d'écran (sauf s'il est dans un bouton déjà nommé). */
export function ReadPic({ id, size = 96, named = true }: { id: PicId; size?: number; named?: boolean }) {
  return <span class="read-pic" {...(named ? { role: 'img', 'aria-label': PICS[id].label } : {})}><Svg html={readPicArt(id, size)} /></span>;
}

export function ReadCard({ q }: { q: Question }) {
  const r = q.read!, voice = useCanSpeak('fr');
  if (r.kind === 'phrase') return <p class="read-phrase">{r.target}</p>;
  // Dictée sans voix (ou voix disparue en cours de question) : le dessin du mot remplace la voix.
  if (r.kind === 'dictee' && (r.seen || !voice)) return <ReadPic id={r.pic!} size={120} />;
  if (q.fmt === 'qcm') return <p class="read-target">{r.target}</p>;
  return (
    <button class="eng-listen read-listen" aria-label={r.kind === 'dictee' ? 'Réécouter le mot' : 'Réécouter'} onClick={() => sayRead(q)}>
      <Svg html={icoSay} />
      <span>Réécouter</span>
    </button>
  );
}

interface Picked {
  value: number | boolean;
  ok: boolean;
}

export function ReadAnswers({ q, picked, locked, onPick }: { q: Question; picked: Picked | null; locked: boolean; onPick: (v: number) => void }) {
  const cls = (i: number) => (!picked ? '' : i === q.p ? 'ok' : i === picked.value ? 'help' : 'off');
  if (q.read!.kind === 'phrase') {
    return (
      <div class="choices read-pics">
        {q.read!.options.map((id, i) => (
          <button key={id} class={`choice ${cls(i)}`} aria-label={PICS[id as PicId].label} onClick={() => !locked && onPick(i)}>
            <ReadPic id={id as PicId} size={84} named={false} />
          </button>
        ))}
      </div>
    );
  }
  return (
    <div class="choices read-choices">
      {q.read!.options.map((w, i) => (
        <button key={w} class={`choice ${cls(i)}`} onClick={() => !locked && onPick(i)}>{w}</button>
      ))}
    </div>
  );
}

/** Dictée : la case-réponse (une case par lettre), le clavier de lettres, Effacer et Valider.
    Clavier physique : les lettres du clavier, Retour arrière, Entrée. */
export function DictAnswers({ q, locked, mark, onCheck }: { q: Question; locked: boolean; mark: '' | 'ok' | 'help'; onCheck: (ok: boolean) => void }) {
  const r = q.read!, n = dictMax(r);
  const [typed, setTypedState] = useState('');
  // Saisie à jour tout de suite : une lettre suivie d'Entrée au clavier peut arriver avant le nouveau rendu.
  const now = useRef('');
  const setTyped = (v: string) => { now.current = v; setTypedState(v); };
  useEffect(() => setTyped(''), [q]);
  const add = (l: string) => !locked && setTyped(dictType(r, now.current, l));
  const erase = () => !locked && setTyped([...now.current].slice(0, -1).join(''));
  const validate = () => !locked && now.current && onCheck(dictOk(r, now.current));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (locked || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.normalize('NFC').toLowerCase();
      if (r.options.includes(k)) add(k);
      else if (e.key === 'Backspace') erase();
      else if (e.key === 'Enter' && now.current) { e.preventDefault(); validate(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const letters = [...typed];
  return (
    <div class="dict">
      <div class={`dict-slots ${mark}`} aria-hidden="true">
        {Array.from({ length: n }, (_, i) => <span key={i} class={`dict-slot${letters[i] ? ' filled' : ''}`}>{letters[i] ?? ''}</span>)}
      </div>
      <p class="sr" aria-live="polite">{typed ? `Tu as écrit : ${spell(typed)}.` : `Ta réponse est vide. Le mot a ${n} lettres.`}</p>
      <div class="dict-keys">
        {r.options.map((l) => (
          <button key={l} class="key dict-key" aria-label={`Lettre ${l}`} onClick={() => add(l)}>{l}</button>
        ))}
      </div>
      <div class="dict-row">
        <button class="key erase" aria-label="Effacer la dernière lettre" onClick={erase}><Svg html={icoErase} /><span>Effacer</span></button>
        <button class="key go" aria-disabled={typed && !locked ? 'false' : 'true'} onClick={validate}>Valider</button>
      </div>
    </div>
  );
}

/** Aide : la bonne écriture en grand, à réécouter ; la phrase et son dessin ; le mot dicté épelé, avec son dessin. */
export function ReadAid({ q }: { q: Question }) {
  const r = q.read!;
  if (r.kind === 'phrase') {
    return (
      <div class="read-aid phrase">
        <ReadPic id={r.pic!} size={84} />
        <b>{r.target}</b>
        <BtnSay label="Écouter la phrase" text={() => [{ text: r.target, lang: 'fr' }]} />
      </div>
    );
  }
  if (r.kind === 'dictee') {
    return (
      <div class="read-aid dictee">
        <ReadPic id={r.pic!} size={84} />
        <b class="dict-spell" role="img" aria-label={`${r.target} : ${spell(r.target)}`}>
          {[...r.target].map((l, i) => <span key={i} aria-hidden="true">{l}</span>)}
        </b>
        <BtnSay label={`Écouter « ${r.target} »`} text={() => [{ text: r.target, lang: 'fr' }, { text: spell(r.target), lang: 'fr' }]} />
      </div>
    );
  }
  return (
    <div class="read-aid">
      <b>{r.target}</b>
      <button class="btn-say" aria-label={`Écouter « ${r.say} »`} onClick={() => sayRead(q)}><Svg html={icoSay} /><span>Écouter</span></button>
    </div>
  );
}
