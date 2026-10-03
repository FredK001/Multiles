/* Écran 13 : espace parent (vouvoiement). Verrou, suivi réel, profils, réglages. */
import { useEffect, useRef, useState } from 'preact/hooks';
import { avatar, icoClose, icoErase } from '../art';
import { useApp, useBack } from '../app/context';
import { Svg } from '../app/ui';
import { ISLES, ISLE_IDS } from '../content/isles';
import { cleanName } from '../engine/profile';
import { checkStreak } from '../engine/streak';
import { checkForUpdate, useUpdate } from '../pwa';
import { gateQuestion, gateSolved, newGate, type Gate } from '../engine/gate';
import { rowPct, tablesDone } from '../engine/mastery';
import { hardList, totalSessions, weekMinutes } from '../engine/stats';
import {
  BackupError, forgetTransfer, formatCode, FutureVersionError, lastBackupText, makeBackup, MAX_PROFILES, readBackup, receiveTransfer, sendTransfer, TransferError,
  type AppData, type BossTime, type Profile,
} from '../store';

const DEFAULT_MSG = 'Cette étape évite que les enfants entrent ici par hasard.';
const WRONG_MSG = "Ce n'est pas le bon résultat. Voici une nouvelle opération.";

function GateView({ onOpen }: { onOpen: () => void }) {
  const [gate, setGate] = useState<Gate>(() => newGate());
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState(DEFAULT_MSG);
  const press = (k: string) => {
    if (k === 'del') setInput((v) => v.slice(0, -1));
    else if (k === 'ok') {
      if (gateSolved(gate, input)) return onOpen();
      // Nouvelle opération en cas d'erreur, sans blocage.
      setGate(newGate());
      setInput('');
      setMsg(WRONG_MSG);
    } else if (input.length < 3) setInput((v) => v + k);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('del');
      else if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) press('ok');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });
  return (
    <div class="gate">
      <div class="q">Pour continuer, écrivez en chiffres le résultat de :<b>{gateQuestion(gate)}</b></div>
      <div class="ans" aria-live="polite">{input || ' '}</div>
      <p class="msg" role="status">{msg}</p>
      <div class="pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <button key={n} class="key" onClick={() => press(String(n))}>{n}</button>)}
        <button class="key erase" aria-label="Effacer" onClick={() => press('del')}><Svg html={icoErase} /><span>Effacer</span></button>
        <button class="key" onClick={() => press('0')}>0</button>
        <button class="key go" onClick={() => press('ok')}>Valider</button>
      </div>
    </div>
  );
}

function ProfileRow({ k, onAction, edit }: { k: Profile; edit: 'rename' | 'del' | null; onAction: (a: string, name?: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (edit === 'rename') {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [edit]);
  return (
    <div class="prow" style={{ '--c': k.color }}>
      <span class="mini"><Svg html={avatar({ ...k.av, color: k.color, size: 42 })} /></span>
      {edit === 'rename' ? (
        <>
          <input
            class="rename"
            ref={inputRef}
            defaultValue={k.name}
            maxLength={12}
            aria-label="Nouveau prénom"
            onKeyDown={(e) => e.key === 'Enter' && onAction('save', e.currentTarget.value)}
          />
          <button class="btn-sm" onClick={() => onAction('save', inputRef.current?.value)}>OK</button>
        </>
      ) : (
        <>
          <b style={{ fontSize: '16px' }}>{k.name}</b>
          <button class="btn-sm" onClick={() => onAction('rename')}>Renommer</button>
          <button class="btn-sm danger" onClick={() => onAction('del')}>Supprimer</button>
        </>
      )}
      {edit === 'del' && (
        <div class="confirm">
          Supprimer le profil de {k.name} et toute sa progression{' '}? Cette action est définitive.
          <div class="acts">
            <button class="btn-sm" onClick={() => onAction('cancel')}>Annuler</button>
            <button class="btn-sm dangerfill" onClick={() => onAction('delok')}>Supprimer</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Enregistre le fichier : feuille de partage sur mobile (« Enregistrer dans Fichiers »), téléchargement sinon. */
async function saveFile(name: string, text: string): Promise<boolean> {
  const file = new File([text], name, { type: 'application/json' });
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return false;
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return true;
}

// Le transfert passe par la fonction Netlify : absent de la version fichier (multiles.html ouvert en local).
const CAN_TRANSFER = location.protocol.startsWith('http');

const readError = (e: unknown, fallback: string) =>
  e instanceof BackupError || e instanceof TransferError ? e.message
    : e instanceof FutureVersionError ? "Cette sauvegarde vient d'une version plus récente de Multîles. Mettez l'application à jour, puis réessayez."
    : fallback;

function BackupCard() {
  const { data, store, selectPlayer, toast, today } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<AppData | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);
  const [code, setCode] = useState('');
  /** Code dont la progression attend confirmation : effacé du serveur une fois restaurée. */
  const [received, setReceived] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (entering) codeRef.current?.focus(); }, [entering]);

  const save = async () => {
    const { name, text } = makeBackup(store.get());
    if (await saveFile(name, text)) {
      await store.update((d) => ({ ...d, lastBackup: today }));
      toast('Sauvegarde enregistrée.');
    }
  };
  const pick = async (input: HTMLInputElement) => {
    const f = input.files?.[0];
    input.value = '';
    if (!f) return;
    setMsg('');
    try {
      setPending(readBackup(await f.text()));
      setReceived(null);
    } catch (e) {
      setMsg(readError(e, 'Ce fichier ne peut pas être lu.'));
    }
  };
  const send = async () => {
    setMsg('');
    setEntering(false);
    setBusy(true);
    // Un seul code à la fois : l'ancien ne doit pas laisser une copie en ligne.
    if (sent) void forgetTransfer(sent);
    setSent(null);
    try {
      setSent(await sendTransfer(makeBackup(store.get()).text));
    } catch (e) {
      setMsg(readError(e, 'Le transfert a échoué.'));
    } finally {
      setBusy(false);
    }
  };
  const receive = async () => {
    setMsg('');
    setBusy(true);
    try {
      setPending(await receiveTransfer(code));
      setReceived(code);
      setEntering(false);
      setCode('');
    } catch (e) {
      setMsg(readError(e, 'Le transfert a échoué.'));
    } finally {
      setBusy(false);
    }
  };
  const restore = async () => {
    if (!pending) return;
    // Réglages propres à l'appareil : conservés.
    const { persistAsked, lastBackup } = store.get();
    const next = { ...pending, persistAsked, lastBackup };
    selectPlayer(null);
    await store.update(() => next);
    setPending(null);
    if (received) void forgetTransfer(received);
    setReceived(null);
    toast((await store.flush()) ? 'Progression restaurée.' : "La progression est restaurée, mais n'a pas pu être enregistrée sur l'appareil.");
  };
  const names = pending?.profiles.map((k) => k.name).join(', ') || 'aucun profil';

  return (
    <div class="pcard2">
      <h2>Sauvegarde</h2>
      <p style={{ fontSize: '15px', color: 'var(--ink-2)' }}>
        La progression est enregistrée uniquement sur cet appareil.{' '}
        {CAN_TRANSFER ? 'Pour changer de téléphone, transférez-la avec un code. Gardez aussi une copie dans un fichier, par précaution.' : 'Gardez-en une copie dans un fichier pour la retrouver dans un autre navigateur ou sur un autre téléphone.'}
      </p>
      <p class="bk-last">{lastBackupText(data.lastBackup, today)}</p>
      <div class="bk-acts">
        <button class="btn-sm" onClick={() => void save()}>Sauvegarder la progression</button>
        <button class="btn-sm" onClick={() => fileRef.current?.click()}>Restaurer une sauvegarde</button>
      </div>
      {/* Pas de filtre « accept » : iOS grise parfois les .json enregistrés depuis un autre navigateur. */}
      <input ref={fileRef} type="file" hidden onChange={(e) => void pick(e.currentTarget)} />
      {CAN_TRANSFER && (
        <div class="bk-acts">
          <button class="btn-sm" disabled={busy} onClick={() => void send()}>Transférer vers un autre téléphone</button>
          <button class="btn-sm" disabled={busy} aria-expanded={entering} aria-controls="xfer-form" onClick={() => { setEntering(!entering); setMsg(''); }}>J'ai un code de transfert</button>
        </div>
      )}
      {CAN_TRANSFER && <p class="bk-last">Le transfert fait passer la progression (prénoms compris) par notre serveur. Elle y est effacée dès qu'elle est restaurée, et au plus tard après 24 heures.</p>}
      {sent && (
        <div class="xfer">
          <span>Code de transfert</span>
          <b class="xfer-code">{formatCode(sent)}</b>
          <span>Sur le nouveau téléphone, ouvrez Multîles, puis l'espace parent, et touchez « J'ai un code de transfert ». Le code est valable 24 heures.</span>
        </div>
      )}
      {entering && (
        <form id="xfer-form" class="xfer-in" onSubmit={(e) => { e.preventDefault(); void receive(); }}>
          <label for="xfer-code">Code affiché sur l'ancien téléphone</label>
          <span class="row">
            <input
              ref={codeRef} id="xfer-code" class="rename" value={code} maxLength={16} placeholder="K7F-29Q"
              autocomplete="off" autocapitalize="characters" spellcheck={false} enterKeyHint="go"
              onInput={(e) => setCode(e.currentTarget.value)}
            />
            <button class="btn-sm" type="submit" disabled={busy || !code.trim()}>Récupérer</button>
          </span>
        </form>
      )}
      {busy && <p class="bk-last" aria-hidden="true">Connexion au service de transfert…</p>}
      {/* Zone d'annonce invisible et toujours présente : les lecteurs d'écran lisent ce qui y apparaît. */}
      <p class="bk-live" role="status">{busy ? 'Connexion au service de transfert…' : sent ? `Code de transfert : ${formatCode(sent)}` : ''}</p>
      {msg && <p role="alert" style={{ fontSize: '15px', color: '#A3261E' }}>{msg}</p>}
      {pending && (
        <div class="confirm" role="alertdialog" aria-label="Confirmer la restauration">
          <span>Remplacer toute la progression de cet appareil par celle de la sauvegarde ({names}) ? Les profils actuels seront remplacés.</span>
          <span class="acts">
            <button class="btn-sm" onClick={() => setPending(null)}>Annuler</button>
            <button class="btn-sm dangerfill" onClick={() => void restore()}>Remplacer</button>
          </span>
        </div>
      )}
    </div>
  );
}

export function Parent() {
  const { data, store, go, player, selectPlayer, toast, today } = useApp();
  const [open, setOpen] = useState(false);
  const [psel, setPsel] = useState(0);
  const [pedit, setPedit] = useState<{ id: string; mode: 'rename' | 'del' } | null>(null);
  const close = () => go({ name: 'who' });
  useBack(close);
  const update = useUpdate();
  const bodyRef = useRef<HTMLDivElement>(null);
  // App mise en arrière-plan : l'espace se reverrouille (un enfant peut reprendre l'appareil).
  useEffect(() => {
    const onVis = () => { if (document.hidden) setOpen(false); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
  useEffect(() => { if (open) bodyRef.current?.focus(); }, [open]);

  const profiles = data.profiles, settings = data.settings;
  const sel = Math.min(psel, Math.max(0, profiles.length - 1));
  const p = profiles[sel];

  const onOpen = () => {
    setOpen(true);
    checkForUpdate();
    setPsel(Math.max(0, profiles.findIndex((x) => x.id === player?.id)));
  };

  const act = (k: Profile) => (a: string, name?: string) => {
    if (a === 'rename') setPedit({ id: k.id, mode: 'rename' });
    if (a === 'del') setPedit({ id: k.id, mode: 'del' });
    if (a === 'cancel') setPedit(null);
    if (a === 'save') {
      const v = (name ?? '').trim();
      if (v) void store.updateProfile(k.id, (x) => ({ ...x, name: cleanName(v) }));
      setPedit(null);
    }
    if (a === 'delok') {
      void store.removeProfile(k.id);
      if (player?.id === k.id) selectPlayer(null);
      setPedit(null);
      if (k.id === p?.id) setPsel(0);
      else if (p) setPsel(Math.max(0, profiles.filter((x) => x.id !== k.id).findIndex((x) => x.id === p.id)));
      toast('Profil supprimé.');
    }
  };

  let body = null;
  if (open) {
    const mins = p ? weekMinutes(p.days, today) : [];
    const tot = mins.reduce((a, b) => a + b, 0), mx = Math.max(20, ...mins);
    const hard = p ? hardList(p, today) : [];
    // Série à jour des jours manqués (sans l'enregistrer : c'est l'enfant qui la verra à l'accueil).
    const streak = p ? checkStreak(p.streak, today).streak.current : 0;
    body = (
      <div class="par-body" ref={bodyRef} tabIndex={-1}>
        {update.available && (
          <div class="pcard2" role="status">
            <h2>Mise à jour disponible</h2>
            <p style={{ fontSize: '15px', color: 'var(--ink-2)' }}>Une nouvelle version de Multîles est prête. La progression des enfants est conservée.</p>
            <button class="btn-sm" style={{ justifySelf: 'start' }} onClick={update.install}>Mettre à jour maintenant</button>
          </div>
        )}
        <div class="kids" role="group" aria-label="Enfant">
          {profiles.map((k, i) => (
            <button key={k.id} class="kid" aria-pressed={i === sel} onClick={() => { setPsel(i); setPedit(null); }}>
              <span class="mini"><Svg html={avatar({ ...k.av, color: k.color, size: 38 })} /></span>{k.name}
            </button>
          ))}
        </div>
        {p && (
          <>
            <div class="pcard2">
              <h2>Cette semaine <small>du lundi à aujourd'hui</small></h2>
              <div class="kpis">
                <div class="kpi"><b>{tot} min</b><small>de jeu</small></div>
                <div class="kpi"><b>{tablesDone(p.mastered)}/10</b><small>tables maîtrisées</small></div>
                <div class="kpi"><b>{streak}</b><small>jour{streak > 1 ? 's' : ''} de suite</small></div>
              </div>
              <div class="week-bars" role="img" aria-label={`Minutes par jour : ${['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map((d, i) => `${d} ${mins[i]}`).join(', ')}`}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <span key={i} class="wb">
                    <span class="v">{mins[i] ? mins[i] : ''}</span>
                    <i class={mins[i] ? '' : 'zero'} style={{ height: `${mins[i] ? Math.round((mins[i]! / mx) * 72) : 4}px` }}></i>
                    {d}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '14px', color: 'var(--ink-2)' }}>{totalSessions(p.days)} sessions depuis le début. Une session dure 3 à 5 minutes.</p>
            </div>
            <div class="pcard2">
              <h2>Tables <small>part des multiplications réussies</small></h2>
              <div class="tbl">
                {ISLE_IDS.map((r) => {
                  const v = rowPct(p.mastered, r);
                  return (
                    <div key={r} class="tr">
                      <span class="n" style={{ background: ISLES[r].fort }}>{r}</span>
                      <span>
                        <span class="lb"><span>{v === 100 ? 'Maîtrisée' : v ? 'En cours' : 'Pas commencée'}</span><span>{v}%</span></span>
                        <span class="bar"><i style={{ width: `${v}%`, background: ISLES[r].fort }}></i></span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div class="pcard2">
              <h2>Multiplications difficiles <small>{hard.length}</small></h2>
              {hard.length ? (
                <>
                  <div class="hard">
                    {hard.map((h) => (
                      <div key={h.key} class="row">
                        <span class="eq">{h.a} × {h.b}</span>
                        <small>{h.errors} erreur{h.errors > 1 ? 's' : ''} récente{h.errors > 1 ? 's' : ''}</small>
                        <small>{h.a * h.b}</small>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--ink-2)' }}>Elles reviennent plus souvent dans les sessions de {p.name}. Vous pouvez les réviser ensemble dans « Ma grille ».</p>
                </>
              ) : (
                <p style={{ fontSize: '15px', color: 'var(--ink-2)' }}>Aucune pour le moment.</p>
              )}
            </div>
          </>
        )}
        <div class="pcard2">
          <h2>Profils <small>{profiles.length} sur 4</small></h2>
          {profiles.map((k) => <ProfileRow key={k.id} k={k} edit={pedit?.id === k.id ? pedit.mode : null} onAction={act(k)} />)}
          {profiles.length < MAX_PROFILES && (
            <button class="btn-sm" style={{ justifySelf: 'start' }} onClick={() => go({ name: 'create' })}>+ Ajouter un enfant</button>
          )}
        </div>
        <div class="pcard2">
          <h2>Réglages</h2>
          <div class="setrow">
            <span>Sons<small>Carillons des bonnes réponses</small></span>
            <button class="switch" role="switch" aria-checked={settings.sound} aria-label="Sons" onClick={() => void store.setSettings({ sound: !settings.sound })}></button>
          </div>
          <div class="setrow">
            <span>Temps du gardien<small>Pour le défi de fin d'île</small></span>
            <span class="opts">
              {([[2, '2 min'], [3, '3 min'], [0, 'Sans']] as [BossTime, string][]).map(([v, l]) => (
                <button key={v} aria-pressed={settings.bossTime === v} onClick={() => void store.setSettings({ bossTime: v })}>{l}</button>
              ))}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ink-2)' }}>Pas de publicité, pas d'achat intégré, pas de classement entre enfants. Les pièces se gagnent uniquement en jouant.</p>
        </div>
        <BackupCard />
      </div>
    );
  }

  return (
    <section class="screen" data-screen="parent" aria-label="Espace parent">
      <div class="par-head">
        <h1>Espace parent</h1>
        <button class="btn-chip" aria-label="Fermer l'espace parent" onClick={close}><Svg html={icoClose} />Fermer</button>
      </div>
      {open ? body : <GateView onOpen={onOpen} />}
    </section>
  );
}
