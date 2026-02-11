import type { ResolvedLayer, PartColors } from '@/types/character';
import { DEFAULT_FILL_COLOR } from '@/types/character';
import { loadSvgText } from './svg-loader';
import { replaceFillColor, svgToDataUri } from './svg-colorizer';

/**
 * Takes resolved layers and applies per-category fill colors.
 * Returns new layer array with svgPath set to colored Data URIs.
 */
export async function applyColorsToLayers(
  layers: ResolvedLayer[],
  partColors: PartColors
): Promise<ResolvedLayer[]> {
  return Promise.all(
    layers.map(async (layer) => {
      const fill = partColors[layer.categoryId] ?? DEFAULT_FILL_COLOR;

      try {
        const svgText = await loadSvgText(layer.svgPath);
        const colorized = replaceFillColor(svgText, fill);
        const dataUri = svgToDataUri(colorized);

        return { ...layer, svgPath: dataUri };
      } catch (error) {
        console.error(`Failed to colorize layer ${layer.categoryId}:`, error);
        return layer;
      }
    })
  );
}
