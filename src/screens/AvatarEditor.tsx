/* Éditeur d'avatar (écran 2, étape Avatar, et écran 3). Porté de `makeEditor`. */
import { useRef, useState } from 'preact/hooks';
import { avatar, coinIcon, icoDice } from '../art';
import { useApp } from '../app/context';
import { pop } from '../app/effects';
import { Svg } from '../app/ui';
import { AV, PROFILE_COLORS, TABS, type AvatarLook, type EditorTab, type Option } from '../content/avatar';
import { freeColors, randomizeAvatar } from '../engine/profile';
import type { Profile } from '../store';

export interface Draft {
  name: string;
  color: string;
  av: AvatarLook;
}

export function AvatarEditor({ draft, onChange, owner }: { draft: Draft; onChange: (d: Draft) => void; owner: Profile | null }) {
  const { data, toast } = useApp();
  const [tab, setTab] = useState<EditorTab>('hair');
  const ringRef = useRef<HTMLDivElement>(null);

  const optionsFor = (k: EditorTab): readonly Option[] => {
    if (k === 'color') {
      const free = freeColors(data.profiles, owner);
      return PROFILE_COLORS.filter(([c]) => free.includes(c));
    }
    return AV[k];
  };

  const tile = (k: EditorTab, val: string, label: string, price?: number) => {
    const sel = (k === 'color' ? draft.color : (draft.av as unknown as Record<string, string>)[k]) === val;
    const owned = !price || (!!owner && owner.owned.includes(val));
    const prev = k === 'skin' || k === 'hairColor' || k === 'color'
      ? <span class="sw" style={{ background: val }}></span>
      : <span class="prev"><Svg html={avatar({ ...draft.av, [k]: val, color: draft.color, size: 78 })} /></span>;
    return (
      <button
        key={val}
        class={`tile ${owned ? '' : 'locked'}`}
        aria-pressed={sel}
        aria-label={`${label}${owned ? '' : ', dans la boutique'}`}
        onClick={() => {
          if (!owned) {
            toast('Disponible dans la boutique, avec tes pièces.');
            return;
          }
          if (k === 'color') onChange({ ...draft, color: val });
          else onChange({ ...draft, av: { ...draft.av, [k]: val } });
        }}
      >
        {!owned && <span class="price"><Svg html={coinIcon(18)} />{price}</span>}
        {prev}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div class="ed">
      <div class="ed-top">
        <span></span>
        <div class="ed-mid">
          <div class="ed-ring" ref={ringRef} style={{ '--profil': draft.color }}>
            <Svg html={avatar({ ...draft.av, color: draft.color, size: 142 })} />
          </div>
          <div class="ed-name">{draft.name || 'Toi'}</div>
        </div>
        <button
          class="ed-dice"
          onClick={() => {
            onChange({ ...draft, av: randomizeAvatar(draft.av) });
            pop(ringRef.current);
          }}
        >
          <Svg html={icoDice} />
          <span>Au<br />hasard</span>
        </button>
      </div>
      <div class="ed-tabs" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k} class="tab" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div class="ed-grid">{optionsFor(tab).map(([v, l, p]) => tile(tab, v, l, p))}</div>
    </div>
  );
}
