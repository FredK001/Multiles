/* Écran 3 : éditeur d'avatar. */
import { useEffect, useRef, useState } from 'preact/hooks';
import { useApp, useBack, usePlayer } from '../app/context';
import type { Route } from '../app/routes';
import { BackChip } from '../app/ui';
import { AvatarEditor, type Draft } from './AvatarEditor';

export function Editor({ ret }: { ret: Route }) {
  const p = usePlayer();
  const { go, toast, updatePlayer } = useApp();
  const [draft, setDraft] = useState<Draft>({ name: p.name, color: p.color, av: { ...p.av } });
  const saved = useRef<ReturnType<typeof setTimeout> | null>(null);
  const back = () => go(ret);
  useBack(back);
  useEffect(() => () => { if (saved.current) clearTimeout(saved.current); }, []);
  return (
    <section class="screen" data-screen="editor" aria-label="Mon avatar">
      <div class="topbar tri">
        <BackChip id="edBack" label="Retour" aria="Retour" onClick={back} />
        <div class="ttl">Mon avatar</div>
        <span></span>
      </div>
      <div class="pane">
        <AvatarEditor draft={draft} onChange={setDraft} owner={p} />
        <button
          class="btn-primary"
          id="edSave"
          onClick={() => {
            if (saved.current) return;
            void updatePlayer((x) => ({ ...x, av: { ...draft.av }, color: draft.color }));
            toast('Ton avatar est enregistré.');
            saved.current = setTimeout(back, 700);
          }}
        >
          Enregistrer
        </button>
      </div>
    </section>
  );
}
