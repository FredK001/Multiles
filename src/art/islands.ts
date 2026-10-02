/* Îles (carte, détail, stickers), décors de bandeau et gardiens. Portés du prototype à l'identique. */
import { ISLES, type DecorKind, type IsleId } from '../content/isles';
import { mix } from '../design/color';
import { INK, sparkle } from './shapes';

/** Décor en silhouette du bandeau de question. */
export function decorSvg(kind: DecorKind, fort: string): string {
  const d = mix(fort, '#000000', 0.28), l = mix(fort, '#FFFFFF', 0.22), w = 'viewBox="0 0 390 84" preserveAspectRatio="xMidYMax slice"';
  if (kind === 'volcan') return `<svg ${w}><path d="M0 84 L46 52 L84 84Z" fill="${d}"/><path d="M120 84 L188 22 L214 22 L282 84Z" fill="${d}"/><path d="M188 22 L201 32 L214 22Z" fill="${l}"/><circle cx="214" cy="10" r="8" fill="${l}"/><circle cx="230" cy="4" r="6" fill="${l}"/><path d="M300 84 L346 46 L390 74 V84Z" fill="${d}"/></svg>`;
  if (kind === 'glace') return `<svg ${w}><path d="M10 84 L52 30 L70 46 L104 84Z" fill="${l}"/><path d="M52 30 L60 60 L70 46Z" fill="${d}"/><path d="M250 84 L300 18 L322 40 L370 84Z" fill="${l}"/><path d="M300 18 L310 58 L322 40Z" fill="${d}"/><rect x="0" y="76" width="390" height="8" fill="${d}"/></svg>`;
  if (kind === 'plage') return `<svg ${w}><path d="M0 70 Q48 60 96 70 T192 70 T288 70 T390 70 V84 H0Z" fill="${d}"/><path d="M300 74 Q304 40 296 20" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/><path d="M296 20 Q276 8 258 22 Q278 20 296 20 Q316 4 336 18 Q314 18 296 20Z" fill="${d}"/><circle cx="60" cy="26" r="12" fill="${l}"/></svg>`;
  if (kind === 'jungle') return `<svg ${w}><ellipse cx="30" cy="70" rx="40" ry="18" transform="rotate(-25 30 70)" fill="${d}"/><ellipse cx="96" cy="76" rx="34" ry="14" transform="rotate(15 96 76)" fill="${l}"/><ellipse cx="300" cy="64" rx="44" ry="18" transform="rotate(30 300 64)" fill="${d}"/><ellipse cx="360" cy="72" rx="36" ry="14" transform="rotate(-20 360 72)" fill="${l}"/></svg>`;
  if (kind === 'verger') return `<svg ${w}><rect x="52" y="46" width="8" height="38" fill="${d}"/><circle cx="56" cy="40" r="24" fill="${d}"/><rect x="316" y="40" width="8" height="44" fill="${d}"/><circle cx="320" cy="34" r="26" fill="${d}"/><circle cx="310" cy="30" r="5" fill="${l}"/><circle cx="330" cy="42" r="5" fill="${l}"/><circle cx="48" cy="36" r="5" fill="${l}"/></svg>`;
  if (kind === 'desert') return `<svg ${w}><path d="M0 84 Q80 40 170 84Z" fill="${d}"/><path d="M220 84 L270 34 L320 84Z" fill="${d}"/><path d="M270 34 L290 84 H320Z" fill="${l}"/><rect x="350" y="42" width="10" height="42" rx="5" fill="${d}"/><path d="M355 62 H342 V50" fill="none" stroke="${d}" stroke-width="8" stroke-linecap="round"/></svg>`;
  if (kind === 'bonbon') return `<svg ${w}><rect x="58" y="40" width="5" height="44" fill="${l}"/><circle cx="60" cy="34" r="18" fill="${d}"/><circle cx="60" cy="34" r="9" fill="none" stroke="${l}" stroke-width="4"/><rect x="318" y="30" width="5" height="54" fill="${l}"/><circle cx="320" cy="26" r="22" fill="${d}"/><circle cx="320" cy="26" r="11" fill="none" stroke="${l}" stroke-width="4"/></svg>`;
  if (kind === 'collines') return `<svg ${w}><path d="M0 84 Q70 30 150 84Z" fill="${d}"/><path d="M200 84 Q290 20 390 84Z" fill="${d}"/><rect x="286" y="20" width="10" height="30" fill="${l}"/><path d="M291 20 L291 0 M291 20 L311 20 M291 20 L291 40 M291 20 L271 20" stroke="${l}" stroke-width="6" stroke-linecap="round"/></svg>`;
  if (kind === 'nuages') return `<svg ${w}><circle cx="50" cy="60" r="20" fill="${l}"/><circle cx="76" cy="54" r="24" fill="${l}"/><circle cx="104" cy="62" r="16" fill="${l}"/><circle cx="300" cy="40" r="16" fill="${d}"/><path d="M292 54 L296 66 H304 L308 54" fill="${d}"/><circle cx="350" cy="70" r="14" fill="${l}"/></svg>`;
  if (kind === 'espace') return `<svg ${w}><circle cx="70" cy="58" r="22" fill="${l}"/><ellipse cx="70" cy="58" rx="36" ry="8" fill="none" stroke="${d}" stroke-width="5"/><circle cx="320" cy="40" r="14" fill="${d}"/><circle cx="180" cy="20" r="3" fill="${l}"/><circle cx="240" cy="62" r="3" fill="${l}"/><circle cx="130" cy="34" r="2.5" fill="${l}"/><circle cx="360" cy="74" r="3" fill="${l}"/></svg>`;
  return '';
}

/** Île vue de la carte (180 × 130), grisée si fermée. */
export function islandArt(n: IsleId, locked: boolean): string {
  const I = ISLES[n], f = locked ? '#9AA2B6' : I.fort, d = mix(f, '#000000', 0.25), l = mix(f, '#FFFFFF', 0.5), sand = locked ? '#D7DBE4' : '#F3DDA6', g = locked ? '#B9BFCC' : null;
  const C = (c: string) => (locked ? g! : c), o = `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"`;
  let m = '';
  if (n === 1) m = `<path d="M98 82 Q104 58 94 34" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M98 82 Q104 58 94 34" fill="none" stroke="${C('#B07A3A')}" stroke-width="4" stroke-linecap="round"/>${[-40, 0, 35, 70].map((a) => `<ellipse cx="94" cy="34" rx="22" ry="7" transform="rotate(${a} 94 34) translate(16 0)" fill="${C('#3F9A3A')}" ${o}/>`).join('')}<circle cx="128" cy="80" r="7" fill="${C('#FFC93C')}" ${o}/>`;
  if (n === 2) m = `<ellipse cx="72" cy="58" rx="12" ry="30" transform="rotate(-20 72 58)" fill="${l}" ${o}/><ellipse cx="96" cy="48" rx="13" ry="36" fill="${C('#3F9A3A')}" ${o}/><ellipse cx="120" cy="60" rx="12" ry="28" transform="rotate(22 120 60)" fill="${l}" ${o}/><circle cx="136" cy="42" r="8" fill="${C('#FF7A1F')}" ${o}/>`;
  if (n === 3) m = ([[66, 40], [112, 34]] as const).map(([x, y]) => `<rect x="${x - 4}" y="${y + 14}" width="8" height="30" fill="${C('#8A5A2B')}" ${o}/><circle cx="${x}" cy="${y}" r="22" fill="${C('#3F9A3A')}" ${o}/><circle cx="${x - 8}" cy="${y - 4}" r="5" fill="${C('#E2506A')}" ${o}/><circle cx="${x + 8}" cy="${y + 6}" r="5" fill="${C('#E2506A')}" ${o}/>`).join('');
  if (n === 4) m = `<path d="M60 84 L92 34 L124 84Z" fill="${l}" ${o}/><path d="M92 34 L106 84 H124Z" fill="${d}" ${o}/><rect x="132" y="44" width="10" height="40" rx="5" fill="${C('#3F9A3A')}" ${o}/><path d="M137 62 H126 V52" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M137 62 H126 V52" fill="none" stroke="${C('#3F9A3A')}" stroke-width="4" stroke-linecap="round"/>`;
  if (n === 5) m = `<path d="M52 84 L80 30 L100 56 L112 40 L132 84Z" fill="#fff" ${o}/><path d="M80 30 L88 70 L100 56Z" fill="${l}"/><path d="M112 40 L116 70 L132 84Z" fill="${l}"/><path d="M58 84 Q58 66 72 66 Q86 66 86 84Z" fill="#fff" ${o}/>`;
  if (n === 6) m = ([[72, 36, '#FF8FA3'], [112, 30, '#FFC93C']] as const).map(([x, y, c]) => `<rect x="${x - 3}" y="${y + 16}" width="6" height="${84 - y - 16}" fill="#fff" ${o}/><circle cx="${x}" cy="${y}" r="18" fill="${C(c)}" ${o}/><path d="M${x} ${y} m-9 0 a9 9 0 1 1 9 9" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`).join('');
  if (n === 7) m = `<path d="M56 86 L84 30 L104 30 L132 86Z" fill="${d}" ${o}/><path d="M84 30 L94 40 L104 30Z" fill="${C('#FF9A2E')}" ${o}/><path d="M92 38 Q90 52 96 60 Q100 50 98 38Z" fill="${C('#FF9A2E')}" ${o}/><circle cx="104" cy="16" r="8" fill="#fff" ${o}/><circle cx="118" cy="8" r="6" fill="#fff" ${o}/>`;
  if (n === 8) m = `<path d="M40 86 Q74 40 108 86Z" fill="${l}" ${o}/><rect x="112" y="40" width="12" height="44" fill="#fff" ${o}/><path d="M112 40 L118 30 L124 40Z" fill="${d}" ${o}/>${[0, 90, 180, 270].map((a) => `<rect x="116" y="8" width="5" height="24" rx="2" transform="rotate(${a + 20} 118 32)" fill="#fff" ${o}/>`).join('')}`;
  if (n === 9) m = `<circle cx="70" cy="62" r="14" fill="#fff" ${o}/><circle cx="88" cy="54" r="18" fill="#fff" ${o}/><circle cx="108" cy="64" r="12" fill="#fff" ${o}/><circle cx="128" cy="28" r="16" fill="${C('#FF8FA3')}" ${o}/><path d="M120 42 L124 54 H132 L136 42" fill="none" ${o}/><rect x="122" y="54" width="12" height="8" fill="${C('#B07A3A')}" ${o}/>`;
  if (n === 10) m = `<circle cx="76" cy="54" r="22" fill="${l}" ${o}/><ellipse cx="76" cy="54" rx="34" ry="8" fill="none" stroke="${INK}" stroke-width="6"/><ellipse cx="76" cy="54" rx="34" ry="8" fill="none" stroke="${C('#FFC93C')}" stroke-width="3"/><path d="M118 80 V44 Q124 26 130 44 V80Z" fill="#fff" ${o}/><circle cx="124" cy="52" r="4" fill="${l}" ${o}/>${sparkle(146, 30, 6, locked ? '#fff' : '#FFC93C')}`;
  return `<svg class="art" width="180" height="130" viewBox="0 0 180 130" aria-hidden="true">
    <ellipse cx="90" cy="100" rx="86" ry="26" fill="#C9ECF1"/>
    <path d="M14 94 C14 72 56 64 90 64 C128 64 166 72 166 94 C166 114 122 122 90 122 C54 122 14 114 14 94Z" fill="${sand}" stroke="${INK}" stroke-width="3"/>
    <path d="M28 90 C28 66 62 58 90 58 C120 58 152 66 152 88 C152 102 120 106 90 106 C58 106 28 104 28 90Z" fill="${f}" stroke="${INK}" stroke-width="3"/>
    ${m}</svg>`;
}

/** Gardien de l'île (carré 120), grisé si pas encore accessible. */
export function bossSvg(n: IsleId, size: number, locked: boolean): string {
  const f = locked ? '#9AA2B6' : ISLES[n].fort, d = mix(f, '#000000', 0.3), l = mix(f, '#FFFFFF', 0.55);
  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
  <ellipse cx="60" cy="112" rx="40" ry="5" fill="${INK}" opacity=".15"/>
  <path d="M30 34 L24 12 L44 26Z M90 34 L96 12 L76 26Z" fill="${d}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 20 C92 20 104 44 104 70 C104 98 86 110 60 110 C34 110 16 98 16 70 C16 44 28 20 60 20Z" fill="${f}" stroke="${INK}" stroke-width="3.5"/>
  <ellipse cx="60" cy="88" rx="28" ry="16" fill="${l}"/>
  <path d="M35 52 Q44 45 53 51 M85 52 Q76 45 67 51" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="44" cy="64" r="9" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="76" cy="64" r="9" fill="#fff" stroke="${INK}" stroke-width="3"/>
  <circle cx="46" cy="66" r="4.5" fill="${INK}"/><circle cx="74" cy="66" r="4.5" fill="${INK}"/>
  <path d="M46 82 Q60 92 74 82" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M54 84 L56 90 L58 85Z" fill="#fff" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`;
}
