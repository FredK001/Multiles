/* Question d'anglais : la carte (dessin, mot montré, phrase) et les réponses (mots, dessins, phrases).
   Le déroulé (session, chrono, pièces, feedback) reste celui de QuestionScreen. */
import { cueArt, icoFalse, icoSay, icoTrue, wordArt } from '../art';
import { speak, type SayPart } from '../audio';
import { Svg } from '../app/ui';
import { themeOf, type ThemeId } from '../content/english';
import { DRILL_BASE } from '../content/series';
import { engAnswer } from '../engine/english';
import type { Question } from '../engine/questions';

/** Dessin d'un mot ; sans dessin, son mot français dans un cadre. */
export function WordPic({ theme, i, size = 120, cls = '' }: { theme: ThemeId; i: number; size?: number; cls?: string }) {
  const w = themeOf(theme).words[i]!, art = w.pic ? wordArt(theme, w.en, size) : null;
  if (art) return <span class={`eng-pic ${cls}`}><Svg html={art} /></span>;
  return <span class={`eng-pic fr ${cls}`} style={{ minHeight: `${Math.round(size * 0.6)}px` }} lang="fr">{w.fr}</span>;
}

/** Texte anglais lu pour la question (après la consigne en français). */
export function engSayParts(q: Question, bubble: string): SayPart[] {
  const e = q.eng!, parts: SayPart[] = [{ text: bubble, lang: 'fr' }];
  if (q.fmt === 'ecoute') return [...parts, { text: e.say, lang: 'en' }];
  if (q.fmt === 'vf') return [...parts, { text: e.options[0]!.text, lang: 'en' }];
  if (e.text) parts.push({ text: e.text, lang: e.textFr ? 'fr' : 'en' });
  return parts;
}

/** Bonne réponse affichée et lue après la question : « giraffe », « Yes, I can. ». */
export const engRight = (q: Question): string => engAnswer(q);

/** Description du dessin pour les lecteurs d'écran (sans donner la réponse au format écoute). */
function picLabel(q: Question): string {
  const e = q.eng!;
  if (e.pic === null) return 'Écoute le mot.';
  const w = themeOf(e.theme).words[e.pic]!;
  const what = e.count ? `${e.count} dessins` : 'un dessin';
  const cue = e.cue === 'like' ? ', avec un visage qui sourit' : e.cue === 'dislike' ? ", avec un visage qui n'aime pas" : e.cue === 'can' ? ', coché' : e.cue === 'cant' ? ', barré' : '';
  return w.pic ? `${what} : ${w.fr}${cue}` : `${w.fr}${cue}`;
}

export function EngCard({ q, revealed }: { q: Question; revealed: boolean }) {
  const e = q.eng!, phrase = q.b > DRILL_BASE;
  if (q.fmt === 'ecoute') {
    return (
      <button class="eng-listen" aria-label="Réécouter le mot" onClick={() => speak([{ text: e.say, lang: 'en' }])}>
        <Svg html={icoSay} />
        <span>Réécouter</span>
      </button>
    );
  }
  const pic = e.pic === null ? null : e.count ? (
    <span class="eng-count">{Array.from({ length: e.count }, (_, k) => <WordPic key={k} theme={e.theme} i={e.pic!} size={56} />)}</span>
  ) : (
    <WordPic theme={e.theme} i={e.pic} size={phrase ? 96 : 130} />
  );
  return (
    <div class={`eng-card${phrase ? ' phrase' : ''}`}>
      {pic && (
        <span class="eng-visual" role="img" aria-label={picLabel(q)}>
          {pic}
          {e.cue && <span class="eng-cue"><Svg html={cueArt(e.cue, 52)} /></span>}
        </span>
      )}
      {q.fmt === 'vf' && <span class={`eng-shown${revealed ? (q.truth ? ' ok' : ' no') : ''}`} lang="en">{e.options[0]!.text}</span>}
      {q.fmt === 'vf' && revealed && !q.truth && <span class="eng-shown ok" lang="en">{engRight(q)}</span>}
      {e.text && <p class={`eng-text${e.textFr ? ' fr' : ''}`} lang={e.textFr ? 'fr' : 'en'}>{e.text}</p>}
    </div>
  );
}

interface Picked {
  value: number | boolean;
  ok: boolean;
}

export function EngAnswers({ q, picked, locked, onPick }: { q: Question; picked: Picked | null; locked: boolean; onPick: (v: number | boolean) => void }) {
  const e = q.eng!;
  if (q.fmt === 'vf') {
    const cls = (v: boolean) => (!picked ? '' : picked.value === v ? (picked.ok ? 'ok' : 'help') : 'off');
    return (
      <div class="vf">
        <button class={`choice ${cls(true)}`} onClick={() => !locked && onPick(true)}><Svg html={icoTrue} />Oui</button>
        <button class={`choice ${cls(false)}`} onClick={() => !locked && onPick(false)}><Svg html={icoFalse} />Non</button>
      </div>
    );
  }
  const cls = (i: number) => (!picked ? '' : i === q.p ? 'ok' : i === picked.value ? 'help' : 'off');
  if (q.fmt === 'ecoute') {
    return (
      <div class="choices eng-pics">
        {e.options.map((o, i) => {
          const w = themeOf(e.theme).words[o.word!]!;
          return (
            <button key={i} class={`choice ${cls(i)}`} aria-label={w.fr} onClick={() => !locked && onPick(i)}>
              <WordPic theme={e.theme} i={o.word!} size={84} />
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div class={`eng-choices${e.options.some((o) => o.text.length > 14) ? ' long' : ''}`}>
      {e.options.map((o, i) => (
        <button key={i} class={`choice ${cls(i)}`} lang="en" onClick={() => !locked && onPick(i)}>{o.text}</button>
      ))}
    </div>
  );
}

/** Aide après une erreur : le dessin et le mot (avec son sens), ou la phrase juste. */
export function EngAid({ q }: { q: Question }) {
  const e = q.eng!, t = themeOf(e.theme);
  if (q.b <= DRILL_BASE) {
    const w = t.words[q.b - 1]!;
    return (
      <div class="eng-aid">
        {w.pic && wordArt(e.theme, w.en) && <WordPic theme={e.theme} i={q.b - 1} size={84} />}
        <span><b lang="en">{w.en}</b><small lang="fr">{w.fr}</small></span>
      </div>
    );
  }
  return (
    <div class="eng-aid phrase">
      {e.text && <span class={`eng-text${e.textFr ? ' fr' : ''}`} lang={e.textFr ? 'fr' : 'en'}>{e.text}</span>}
      <b lang="en">{engRight(q)}</b>
    </div>
  );
}
