/* Écrans 7 et 8 : question (4 formats), feedback, et mode chronométré (défi chrono, défi du jour, gardien). */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { coinIcon, decorSvg, icoBulb, icoClock, icoErase, icoFalse, icoQuit, icoTrue, mascot, type Mood } from '../art';
import { chime } from '../audio';
import { useApp, useBack, usePlayer } from '../app/context';
import { confetti, flyCoin, pop } from '../app/effects';
import type { Route } from '../app/routes';
import { planFor } from '../app/sessions';
import { BtnSay, Svg } from '../app/ui';
import { ISLES } from '../content/isles';
import { fill, goodAnswers, HELP_TITLES, MSG, OK_TITLES, spoken, tipFor } from '../content/messages';
import { nb } from '../content/text';
import { useIsleTheme } from '../app/theme';
import { stageFor } from '../engine/level';
import { expected, isCorrect, typeDigit, type Question as Q } from '../engine/questions';
import { pick } from '../engine/random';
import { creditCoin, finishSession, recordQuit } from '../engine/rewards';
import { OK_FEEDBACK_MS, Session, type SessionConfig } from '../engine/session';
import { ActiveClock, Countdown, fmtTime } from '../engine/timer';
import { AidGrid } from './Aid';

type Feedback =
  | { ok: true; title: string; sub: string; eq: string; combo: number | null; delay: number }
  | { ok: false; title: string; eq: string; q: Q };

export function QuestionScreen({ cfg, back }: { cfg: SessionConfig; back: Route }) {
  const p = usePlayer();
  const { go, store, today } = useApp();
  const I = ISLES[cfg.isle];
  const [session] = useState(() => new Session(cfg, planFor(cfg, p, today)));
  const [, setTick] = useState(0);
  const render = () => setTick((t) => t + 1);
  const [coinsShown, setCoinsShown] = useState(p.coins);
  const [input, setInput] = useState('');
  const [locked, setLocked] = useState(false);
  const [mark, setMark] = useState<'' | 'ok' | 'help'>('');
  const [picked, setPicked] = useState<{ value: number | boolean; ok: boolean } | null>(null);
  const [buddy, setBuddy] = useState<{ mood: Mood; anim: string }>({ mood: 'neutre', anim: 'idle' });
  const [bubble, setBubble] = useState('');
  const [fb, setFb] = useState<Feedback | null>(null);
  const [left, setLeft] = useState(cfg.timed ?? 0);

  const [initialCountdown] = useState(() => (cfg.timed ? new Countdown(cfg.timed, performance.now()) : null));
  const countdown = useRef<Countdown | null>(initialCountdown);
  /** Étape du cycle de question : verrou synchrone contre les doubles réponses et doubles « continuer ». */
  const phase = useRef<'asking' | 'feedback' | 'done'>('asking');
  const clock = useRef(new ActiveClock());
  const helpPause = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const alive = useRef(true);
  const exprRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const icoRef = useRef<HTMLSpanElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useIsleTheme(I.fort, I.clair);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(() => alive.current && fn(), ms));
  const stage = stageFor(p.level);
  const q = session.cur;

  const nextQ = () => {
    const n = session.next();
    if (!n) return endSession();
    phase.current = 'asking';
    setInput('');
    setLocked(false);
    setMark('');
    setPicked(null);
    setBuddy({ mood: 'neutre', anim: 'idle' });
    setBubble(fill(pick(MSG[n.fmt]), n, p.name));
    render();
  };

  const endSession = () => {
    if (!alive.current) return;
    alive.current = false;
    const now = performance.now();
    clock.current.pause(now);
    const fresh = store.get().profiles.find((x) => x.id === p.id);
    if (!fresh) return go(back);
    const { profile, end } = finishSession(fresh, session, { today, activeMs: clock.current.elapsed(now) });
    void store.updateProfile(p.id, () => profile);
    go({ name: 'end', end, cfg, back });
  };

  const quit = () => {
    if (!alive.current) return go(back);
    alive.current = false;
    const now = performance.now();
    clock.current.pause(now);
    void store.updateProfile(p.id, (x) => recordQuit(x, { today, activeMs: clock.current.elapsed(now) }));
    go(back);
  };
  useBack(quit);

  const timeUp = () => {
    phase.current = 'done';
    session.expire();
    setFb(null);
    setLocked(true);
    setBuddy({ mood: 'joie', anim: 'jump' });
    setBubble(nb(cfg.mode === 'boss' ? 'Le temps est écoulé ! On fait le bilan.' : `Fini ! ${goodAnswers(session.good)}.`));
    later(endSession, 1300);
  };

  // Démarrage : chrono, temps actif, première question.
  useEffect(() => {
    clock.current.start(performance.now());
    nextQ();
    const onVis = () => {
      const now = performance.now();
      if (document.hidden) {
        clock.current.pause(now);
        countdown.current?.pause(now);
      } else {
        clock.current.start(now);
        if (!helpPause.current) countdown.current?.resume(now);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    const tick = cfg.timed
      ? setInterval(() => {
          const c = countdown.current!;
          if (!alive.current || session.timeUp || c.paused) return;
          const l = c.left(performance.now());
          setLeft(l);
          if (l <= 0) timeUp();
        }, 250)
      : null;
    return () => {
      alive.current = false;
      if (tick) clearInterval(tick);
      timers.current.forEach(clearTimeout);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Développement uniquement : impose la question affichée (captures comparées au prototype).
  if (import.meta.env.DEV) {
    (window as unknown as { __multilesQuestion?: (q: Q) => void }).__multilesQuestion = (fq: Q) => {
      session.cur = fq;
      setInput('');
      setLocked(false);
      setMark('');
      setPicked(null);
      setBuddy({ mood: 'neutre', anim: 'idle' });
      setBubble(fill(pick(MSG[fq.fmt]), fq, p.name));
      render();
    };
  }

  // Chiffres de jeu à 62 px, réduits si l'expression déborde (fitExpr).
  useLayoutEffect(() => {
    const e = exprRef.current;
    if (!e) return;
    const box = e.parentElement!;
    let fs = 62;
    e.style.setProperty('--fs', '62px');
    e.style.setProperty('--sw', '96px');
    e.style.setProperty('--sh', '84px');
    while (e.scrollWidth > box.clientWidth - 24 && fs > 34) {
      fs -= 2;
      e.style.setProperty('--fs', fs + 'px');
      e.style.setProperty('--sw', Math.round(fs * 1.45) + 'px');
      e.style.setProperty('--sh', Math.round(fs * 1.3) + 'px');
    }
  });

  const continueQ = () => {
    // Un seul passage par feedback : toucher la feuille annule l'avance automatique.
    if (phase.current !== 'feedback' || !alive.current) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setFb(null);
    if (countdown.current) {
      helpPause.current = false;
      const now = performance.now();
      countdown.current.resume(now);
      if (countdown.current.expired(now)) return timeUp();
    }
    nextQ();
  };

  const check = (ok: boolean, value?: number | boolean) => {
    if (!q || phase.current !== 'asking' || session.finished) return;
    phase.current = 'feedback';
    setLocked(true);
    if (q.fmt !== 'vf') setInput(String(expected(q)));
    setMark(ok ? 'ok' : 'help');
    if (value !== undefined) setPicked({ value, ok });
    const out = session.answer(ok);
    if (ok) {
      setBuddy({ mood: 'joie', anim: 'jump' });
      void store.updateProfile(p.id, creditCoin);
      requestAnimationFrame(() =>
        flyCoin(slotRef.current, icoRef.current, () => {
          setCoinsShown((c) => c + 1);
          pop(pillRef.current);
        }),
      );
      const combo = out.comboMilestone ? session.combo : null;
      const delay = cfg.timed ? OK_FEEDBACK_MS.timed : OK_FEEDBACK_MS.classic;
      const sub = cfg.endless
        ? cfg.target ? `${session.good} sur ${cfg.target}` : goodAnswers(session.good)
        : session.done < session.total ? `Encore ${session.remaining} question${session.remaining > 1 ? 's' : ''}` : 'Dernière réponse !';
      setFb({ ok: true, title: fill(pick(OK_TITLES), q, p.name), sub: nb(sub), eq: `${q.a} × ${q.b} = ${q.p}`, combo, delay });
      chime(combo ? 'combo' : 'ok');
      requestAnimationFrame(() => confetti(sheetRef.current));
      later(continueQ, delay);
    } else {
      setBuddy({ mood: 'encourage', anim: 'idle' });
      setFb({ ok: false, title: fill(pick(HELP_TITLES), q, p.name), eq: `${q.a} × ${q.b} = ${q.p}`, q });
      chime('help');
      if (countdown.current) {
        helpPause.current = true;
        countdown.current.pause(performance.now());
        setLeft(countdown.current.left(performance.now()));
      }
    }
    render();
  };

  const key = (k: string) => {
    if (!q || locked) return;
    if (k === 'del') {
      const v = input.slice(0, -1);
      setInput(v);
      setBuddy({ mood: v ? 'pense' : 'neutre', anim: 'idle' });
      return;
    }
    if (k === 'ok') {
      if (input) check(isCorrect(q, Number(input)));
      return;
    }
    const v = typeDigit(input, k);
    setInput(v);
    if (v) setBuddy({ mood: 'pense', anim: 'idle' });
  };

  // Clavier physique : chiffres, Effacer, Valider ; Entrée ou Espace pour passer le feedback.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (fb && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        continueQ();
        return;
      }
      if (!q || locked || fb || !(q.fmt === 'pave' || q.fmt === 'manquant')) return;
      if (/^[0-9]$/.test(e.key)) key(e.key);
      else if (e.key === 'Backspace') key('del');
      else if (e.key === 'Enter') key('ok');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  /* ---------- Rendu ---------- */
  const T = countdown.current;
  const progress = T ? (
    <span class={`tbar ${left <= Countdown.LOW_SECONDS ? 'low' : ''}`}><i style={{ width: `${(left / T.total) * 100}%` }}></i></span>
  ) : (
    Array.from({ length: session.total }, (_, i) => <span key={i} class={`seg ${i < session.done ? 'done' : i === session.done ? 'now' : ''}`}></span>)
  );
  const countText = `Question ${Math.min(session.done + 1, session.total)} sur ${session.total}`;
  const qCount = T ? (
    <>
      <span class="clock"><Svg html={icoClock} />{fmtTime(left)}{T.paused && helpPause.current ? <> <small>(pause)</small></> : null}</span>
      <span>{cfg.target ? `${session.good} sur ${cfg.target}` : cfg.endless ? goodAnswers(session.good) : countText}</span>
    </>
  ) : countText;

  const slot = (
    <span class={`slot ${input ? 'filled' : ''} ${mark}`} id="slot" ref={slotRef}>
      {input ? <span class="d" key={input}>{input}</span> : <span>?</span>}
    </span>
  );
  let expr = null;
  if (q) {
    if (q.fmt === 'pave' || q.fmt === 'qcm') expr = <><span>{q.a}</span><span class="op">×</span><span>{q.b}</span><span class="op">=</span>{slot}</>;
    if (q.fmt === 'manquant') expr = <><span>{q.a}</span><span class="op">×</span>{slot}<span class="op">=</span><span>{q.p}</span></>;
    if (q.fmt === 'vf') expr = <><span>{q.a}</span><span class="op">×</span><span>{q.b}</span><span class="op">=</span><span class={`shown ${mark ? 'ok' : ''}`} id="shown" ref={slotRef}>{mark && !q.truth ? q.p : q.shown}</span></>;
  }

  let answer = null;
  if (q && (q.fmt === 'pave' || q.fmt === 'manquant')) {
    answer = (
      <div class="pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <button key={n} class="key" onClick={() => key(String(n))}>{n}</button>)}
        <button class="key erase" aria-label="Effacer" onClick={() => key('del')}><Svg html={icoErase} /><span>Effacer</span></button>
        <button class="key" onClick={() => key('0')}>0</button>
        <button class="key go" aria-disabled={input && !locked ? 'false' : 'true'} onClick={() => key('ok')}>Valider</button>
      </div>
    );
  }
  if (q && q.fmt === 'qcm') {
    answer = (
      <div class="choices">
        {q.choices!.map((c) => {
          const cls = !picked ? '' : c === q.p ? 'ok' : c === picked.value ? 'help' : 'off';
          return <button key={c} class={`choice ${cls}`} onClick={() => !locked && check(isCorrect(q, c), c)}>{c}</button>;
        })}
      </div>
    );
  }
  if (q && q.fmt === 'vf') {
    const cls = (v: boolean) => (!picked ? '' : picked.value === v ? (picked.ok ? 'ok' : 'help') : 'off');
    answer = (
      <div class="vf">
        <button class={`choice ${cls(true)}`} onClick={() => !locked && check(isCorrect(q, true), true)}><Svg html={icoTrue} />Vrai</button>
        <button class={`choice ${cls(false)}`} onClick={() => !locked && check(isCorrect(q, false), false)}><Svg html={icoFalse} />Faux</button>
      </div>
    );
  }

  let sheet = null;
  if (fb && fb.ok) {
    sheet = (
      <div class="fb-sheet ok" ref={sheetRef} role="status" aria-live="assertive" onClick={continueQ}>
        <div class="fb-row">
          <div class="m jump"><Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'joie', size: 86, noSparkle: true })} /></div>
          <div><p class="fb-title">{fb.title}</p><p class="fb-sub">{fb.sub}</p></div>
        </div>
        <p class="fb-eq">{fb.eq}</p>
        {fb.combo && <span class="combo">{nb(`${fb.combo} d'affilée !`)}</span>}
        <div class="fb-auto"><i style={{ animationDuration: `${fb.delay}ms` }}></i></div>
        <p class="fb-skip">Touche pour continuer</p>
      </div>
    );
  } else if (fb && !fb.ok) {
    const fq = fb.q, tip = nb(tipFor(fq.a, fq.b));
    sheet = (
      <div class="fb-sheet help" role="status" aria-live="assertive">
        <div class="fb-help-row">
          <div class="m" style={{ width: '72px', height: '76px', display: 'grid', placeItems: 'end center' }}>
            <Svg html={mascot({ variant: p.pepin, stage, wear: p.pw, mood: 'encourage', size: 72 })} />
          </div>
          <div style={{ flex: 1 }}><p class="fb-title" style={{ fontSize: '28px' }}>{fb.title}</p><p class="fb-sub">{nb('La bonne réponse :')}</p></div>
          <BtnSay wrap id="fbSay" label="Écouter l'astuce" style={{ background: '#fff' }} text={`${fb.title} ${fq.a} fois ${fq.b} égale ${fq.p}. ${tip}`} />
        </div>
        <p class="fb-eq">{fb.eq}</p>
        <div class="aid">
          <div class="aid-top"><span>{fq.a} rangées de {fq.b}</span><span>{fq.p} en tout</span></div>
          <AidGrid rows={fq.a} cols={fq.b} />
          <p class="tip"><span class="bulb"><Svg html={icoBulb} /></span><span id="fbTip">{tip}</span></p>
        </div>
        <p class="fb-sub" style={{ textAlign: 'center' }}>{cfg.timed ? 'Le chrono est en pause pendant que tu regardes.' : 'Elle reviendra plus tard dans la session.'}</p>
        <button class="btn-got" onClick={(e) => { e.stopPropagation(); continueQ(); }}>J'ai compris</button>
      </div>
    );
  }

  return (
    <section class="screen scr-q" data-screen="question" aria-label="Question">
      <header class="q-band">
        <div class="q-top">
          <button class="btn-chip" id="btnQuit" aria-label="Quitter la session" onClick={quit}>
            <Svg html={icoQuit} />
            Quitter
          </button>
          <div class="q-place"><span>{I.name}</span><small>{cfg.label}</small></div>
          <div class="pill-star coin" id="starPill" ref={pillRef}>
            <span ref={icoRef}><Svg html={coinIcon(30)} /></span>
            <span class="n">{coinsShown}</span>
            <span class="sr">pièces</span>
          </div>
        </div>
        <div class="q-progress" aria-hidden="true">{progress}</div>
        <div class="q-count">{qCount}</div>
        <div class="decor"><Svg html={decorSvg(I.decor, I.fort)} /></div>
      </header>
      <div class="q-sheet">
        <div class="buddy">
          <div class={`m ${buddy.anim}`} key={buddy.anim + buddy.mood}>
            <Svg html={mascot({ variant: p.pepin, mood: buddy.mood, stage, wear: p.pw })} />
          </div>
          <div class="bubble">
            <p class="t" aria-live="polite">{bubble}</p>
            <BtnSay
              id="btnSayQ"
              label="Écouter la question"
              text={() => (q ? (locked ? bubble : `${bubble} ${spoken(q)}`) : bubble)}
            />
          </div>
        </div>
        <div class="q-card">
          <div class="expr" ref={exprRef} role="img" aria-label={q ? spoken(q) : undefined}>{expr}</div>
        </div>
        <div class="q-answer">{answer}</div>
      </div>
      {sheet}
    </section>
  );
}
