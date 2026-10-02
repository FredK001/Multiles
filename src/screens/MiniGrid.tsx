/* Petite grille de Pythagore de l'écran de fin (cases neuves en miel). */
import { ISLES, type IsleId } from '../content/isles';
import { isMastered } from '../engine/mastery';

export function MiniGrid({ mastered, fresh }: { mastered: readonly string[]; fresh: readonly string[] }) {
  const cells = [];
  for (let r = 1; r <= 10; r++)
    for (let c = 1; c <= 10; c++) {
      const k = `${r}x${c}`, nw = fresh.includes(k), m = isMastered(mastered, r, c);
      const col = ISLES[(mastered.includes(k) ? r : c) as IsleId].fort;
      const style: Record<string, string> = {};
      if (m && !nw) style.background = col;
      if (nw) style.animationDelay = `${1.1 + fresh.indexOf(k) * 0.12}s`;
      cells.push(<i key={k} class={`${m ? 'm' : ''} ${nw ? 'new' : ''}`} style={style}></i>);
    }
  return <div class="mini10" aria-hidden="true">{cells}</div>;
}
