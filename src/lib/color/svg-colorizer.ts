/**
 * Replace all fill color values in SVG text.
 * Handles both `fill: none` and `fill: #hexcolor` in CSS style blocks.
 * Does NOT touch stroke values.
 */
export function replaceFillColor(svgText: string, newFill: string): string {
  return svgText.replace(
    /(fill:\s*)(none|#[0-9a-fA-F]{3,8})/gi,
    `$1${newFill}`
  );
}

/**
 * Convert SVG text to a base64 Data URI for use in <img src> and Canvas drawImage.
 */
export function svgToDataUri(svgText: string): string {
  const encoded = btoa(unescape(encodeURIComponent(svgText)));
  return `data:image/svg+xml;base64,${encoded}`;
}
