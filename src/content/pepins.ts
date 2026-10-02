export type PepinVariant = 'pousse' | 'corail' | 'braise';
export type SproutKind = 'leaf' | 'coral' | 'flame';

export interface PepinDef {
  name: string;
  body: string;
  belly: string;
  sprout: SproutKind;
  leaf: string;
  flower: string;
  desc: string;
}

export const VARIANTS: Record<PepinVariant, PepinDef> = {
  pousse: { name: 'Pousse', body: '#7CC44E', belly: '#E3F4CF', sprout: 'leaf', leaf: '#3F9A3A', flower: '#FFD24A', desc: 'Calme et curieux' },
  corail: { name: 'Corail', body: '#FF9A8A', belly: '#FFE6DF', sprout: 'coral', leaf: '#E2506A', flower: '#FFFFFF', desc: 'Joueur et rieur' },
  braise: { name: 'Braise', body: '#FFB547', belly: '#FFF0CF', sprout: 'flame', leaf: '#FF7A1F', flower: '#FFD24A', desc: 'Rapide et courageux' },
};

export const VARIANT_IDS = Object.keys(VARIANTS) as PepinVariant[];
