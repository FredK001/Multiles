import type { HTMLAttributes } from 'preact';

/** Propriété `dangerouslySetInnerHTML` pour injecter un SVG directement dans un conteneur
    (préserve les sélecteurs CSS enfants du prototype, ex. `.m.idle svg`, `.shop-stage.house > svg`).
    Ne recevoir que des chaînes produites par les générateurs de src/art. */
export const svgHtml = (svg: string) => ({ dangerouslySetInnerHTML: { __html: svg } });

type ArtProps = { svg: string; class?: string } & Omit<HTMLAttributes<HTMLSpanElement>, 'dangerouslySetInnerHTML'>;

/** Enveloppe neutre (`display:contents`) quand le SVG doit voisiner avec d'autres enfants. */
export function Art({ svg, class: cls, style, ...rest }: ArtProps) {
  return (
    <span
      class={cls}
      style={cls ? style : { display: 'contents' }}
      {...rest}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
