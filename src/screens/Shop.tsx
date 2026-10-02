/* Écran 11 : boutique (Moi, Pépin, Maison). Achat en deux temps, pièces gagnées en jouant uniquement. */
import type { ComponentChildren } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { avatar, coinIcon, houseSvg, itemArt, mascot } from '../art';
import { chime } from '../audio';
import { useProfileTheme } from '../app/theme';
import { useApp, useBack, usePlayer } from '../app/context';
import { confetti, pop } from '../app/effects';
import { Svg, TabBar } from '../app/ui';
import { CATS, SHOP, type ShopCat } from '../content/shop';
import { nb } from '../content/text';
import { stageFor } from '../engine/level';
import { buy, isWorn, wear } from '../engine/profile';

export function Shop() {
  const p = usePlayer();
  const { go, toast, updatePlayer } = useApp();
  const [cat, setCat] = useState<ShopCat>('moi');
  const [selId, setSelId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const coinsRef = useRef<HTMLSpanElement>(null);
  useBack(() => go({ name: 'home' }));
  useProfileTheme(p.color);

  const items = SHOP[cat], sel = items.find((i) => i.id === selId) ?? null;
  const stage = stageFor(p.level);
  const trying = !!sel && !p.owned.includes(sel.id);

  let stageEl;
  if (cat === 'maison') {
    stageEl = (
      <div class="shop-stage house" ref={stageRef}>
        <svg viewBox="0 0 340 190" preserveAspectRatio="xMidYMid slice" role="img" aria-label="La maison de ton Pépin" dangerouslySetInnerHTML={{ __html: houseSvg(p, sel?.id).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') }} />
        {trying && <span class="tag">Essai</span>}
      </div>
    );
  } else {
    const av = { ...p.av }, pw = { ...p.pw };
    if (sel && cat === 'moi') (av as Record<string, unknown>)[sel.slot!] = sel.id;
    if (sel && cat === 'pepin') (pw as Record<string, unknown>)[sel.slot!] = sel.id.slice(2);
    stageEl = (
      <div class="shop-stage" ref={stageRef}>
        <span class="ground"></span>
        <span class="disc"><Svg html={avatar({ ...av, color: p.color, size: 128 })} /></span>
        <span class="pp m idle"><Svg html={mascot({ variant: p.pepin, stage, wear: pw, size: 116 })} /></span>
        {trying && <span class="tag">Essai</span>}
      </div>
    );
  }

  let btn: ComponentChildren = "Touche un objet pour l'essayer", disabled = true, hint = '';
  if (sel) {
    const own = p.owned.includes(sel.id), worn = own && isWorn(cat, sel, p);
    if (own) {
      disabled = false;
      btn = worn ? (cat === 'maison' ? 'Ranger' : 'Enlever') : cat === 'maison' ? 'Installer' : 'Mettre';
    } else if (p.coins >= sel.price) {
      disabled = false;
      btn = confirm ? "Oui, je l'achète" : <>Acheter pour {sel.price} <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: coinIcon(22).replace('<svg ', '<svg style="vertical-align:-4px" ') }} /></>;
      hint = confirm ? nb(`Il te restera ${p.coins - sel.price} pièces.`) : '';
    } else {
      btn = nb(`Encore ${sel.price - p.coins} pièces`);
      hint = nb('Chaque bonne réponse te rapporte une pièce !');
    }
  }

  const onBuy = () => {
    if (!sel) return;
    if (!p.owned.includes(sel.id)) {
      if (p.coins < sel.price) return;
      if (!confirm) {
        setConfirm(true);
        return;
      }
      if (!buy(cat, sel, p).ok) return;
      // Achat calculé sur le profil à jour du store.
      void updatePlayer((x) => { const r = buy(cat, sel, x); return r.ok ? r.profile : x; });
      setConfirm(false);
      chime('combo');
      requestAnimationFrame(() => {
        confetti(stageRef.current);
        pop(coinsRef.current);
      });
      toast(`${sel.name} : à toi !`);
      return;
    }
    void updatePlayer((x) => wear(cat, sel, x, !isWorn(cat, sel, x)));
  };

  return (
    <section class="screen" data-screen="shop" aria-label="Boutique">
      <div class="topbar tri">
        <span></span>
        <div class="ttl" style={{ fontSize: '26px' }}>Trésors</div>
        <span class="coinpill" ref={coinsRef}><Svg html={coinIcon(26)} /><span>{p.coins}</span></span>
      </div>
      <div class="seg2">
        <button aria-pressed="true">Boutique</button>
        <button aria-pressed="false" onClick={() => go({ name: 'album' })}>Album</button>
      </div>
      {stageEl}
      <div class="cat3" role="tablist">
        {CATS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={cat === k} onClick={() => { setCat(k); setSelId(null); setConfirm(false); }}>{l}</button>
        ))}
      </div>
      <div class="shop-grid">
        {items.map((it) => {
          const own = p.owned.includes(it.id), worn = own && isWorn(cat, it, p);
          return (
            <button
              key={it.id}
              class="item"
              aria-pressed={selId === it.id}
              aria-label={`${it.name}${own ? (worn ? ', porté' : ', à toi') : `, ${it.price} pièces`}`}
              onClick={() => { setSelId(it.id); setConfirm(false); }}
            >
              <span class="art"><Svg html={itemArt(cat, it, p)} /></span>
              <span>{it.name}</span>
              {own
                ? <span class={`own ${worn ? 'worn' : ''}`}>{worn ? (cat === 'maison' ? 'Installé' : 'Porté') : 'À toi'}</span>
                : <span class="pr"><Svg html={coinIcon(16)} />{it.price}</span>}
            </button>
          );
        })}
      </div>
      <div class="shop-foot">
        <button class="btn-primary" aria-disabled={disabled ? 'true' : 'false'} onClick={onBuy}>{btn}</button>
        <p class="hint" aria-live="polite">{hint}</p>
      </div>
      <TabBar current="treasure" />
    </section>
  );
}
