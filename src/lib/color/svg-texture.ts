import type { StrokeTextureId } from '@/types/character';

/**
 * SVG filter for rough/hand-drawn stroke texture.
 * Uses feTurbulence + feDisplacementMap to subtly distort paths.
 */
const ROUGH_FILTER_DEF = `<filter id="rough-stroke" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" seed="42" result="noise"/>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
</filter>`;

/**
 * Inject an SVG filter for stroke texture into the SVG defs block.
 * For 'default' texture, returns the SVG unchanged.
 */
export function applyStrokeTexture(svgText: string, textureId: StrokeTextureId): string {
  if (textureId === 'default') return svgText;

  let result = svgText;

  // Inject filter definition into <defs> block
  const defsCloseIndex = result.indexOf('</defs>');
  if (defsCloseIndex !== -1) {
    result =
      result.slice(0, defsCloseIndex) +
      ROUGH_FILTER_DEF +
      result.slice(defsCloseIndex);
  } else {
    // If no <defs> exists, create one after the opening <svg> tag
    const svgTagEnd = result.indexOf('>');
    if (svgTagEnd !== -1) {
      result =
        result.slice(0, svgTagEnd + 1) +
        `<defs>${ROUGH_FILTER_DEF}</defs>` +
        result.slice(svgTagEnd + 1);
    }
  }

  // Apply filter to root SVG element via style rule
  const styleCloseIndex = result.indexOf('</style>');
  if (styleCloseIndex !== -1) {
    result =
      result.slice(0, styleCloseIndex) +
      '\nsvg { filter: url(#rough-stroke); }\n' +
      result.slice(styleCloseIndex);
  }

  return result;
}
