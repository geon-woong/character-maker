const svgCache = new Map<string, string>();

/**
 * Fetch an SVG file and cache the raw text.
 * Subsequent calls with the same path return from cache instantly.
 */
export async function loadSvgText(svgPath: string): Promise<string> {
  const cached = svgCache.get(svgPath);
  if (cached) return cached;

  const response = await fetch(svgPath);
  if (!response.ok) {
    throw new Error(`Failed to fetch SVG: ${svgPath} (${response.status})`);
  }
  const text = await response.text();
  svgCache.set(svgPath, text);
  return text;
}

export function clearSvgCache(): void {
  svgCache.clear();
}
