/**
 * Replace all fill color values in SVG text.
 * @param preserveNone - If true, preserves `fill: none` (stroke-only paths).
 *   Use for body SVGs where stroke-only paths should not be filled.
 */
export function replaceFillColor(svgText: string, newFill: string, preserveNone = false): string {
  if (preserveNone) {
    return svgText.replace(
      /(fill:\s*)(#[0-9a-fA-F]{3,8})/gi,
      `$1${newFill}`
    );
  }
  return svgText.replace(
    /(fill:\s*)(none|#[0-9a-fA-F]{3,8})/gi,
    `$1${newFill}`
  );
}

/**
 * Replace all stroke color values in SVG text.
 */
export function replaceStrokeColor(svgText: string, newStroke: string): string {
  return svgText.replace(
    /(stroke:\s*)(#[0-9a-fA-F]{3,8})/gi,
    `$1${newStroke}`
  );
}

/**
 * Replace all stroke-width values in SVG CSS style blocks.
 */
export function replaceStrokeWidth(svgText: string, newWidthPx: number): string {
  return svgText.replace(
    /(stroke-width:\s*)(\d+(?:\.\d+)?px)/gi,
    `$1${newWidthPx}px`
  );
}

/**
 * Convert SVG text to a base64 Data URI for use in <img src> and Canvas drawImage.
 */
export function svgToDataUri(svgText: string): string {
  const encoded = btoa(unescape(encodeURIComponent(svgText)));
  return `data:image/svg+xml;base64,${encoded}`;
}
