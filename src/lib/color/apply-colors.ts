import type { ResolvedLayer, PartColors, PartColor } from '@/types/character';
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from '@/types/character';
import { loadSvgText } from './svg-loader';
import { replaceFillColor, replaceStrokeColor, svgToDataUri } from './svg-colorizer';
import { COLORABLE_CATEGORIES, DEFAULT_EYES_COLOR, MOUTH_FOLLOWS } from '@/lib/utils/constants';

const DEFAULT_PART_COLOR: PartColor = { fill: DEFAULT_FILL_COLOR, stroke: DEFAULT_STROKE_COLOR };

/**
 * Resolve the effective PartColor for a given category.
 * - eyes: fixed fill color, original stroke
 * - mouth: follows MOUTH_FOLLOWS category color
 * - COLORABLE_CATEGORIES: user-selected or defaults
 * - others: defaults
 */
function resolveColor(
  categoryId: string,
  partColors: PartColors
): { fill: string; stroke: string; skipStroke: boolean } {
  if (categoryId === 'eyes') {
    return { fill: DEFAULT_EYES_COLOR, stroke: DEFAULT_STROKE_COLOR, skipStroke: true };
  }

  if (categoryId === 'mouth') {
    const bodyColor = partColors[MOUTH_FOLLOWS] ?? DEFAULT_PART_COLOR;
    return { fill: bodyColor.fill, stroke: bodyColor.stroke, skipStroke: false };
  }

  if (COLORABLE_CATEGORIES.includes(categoryId as never)) {
    const color = partColors[categoryId as keyof PartColors] ?? DEFAULT_PART_COLOR;
    return { fill: color.fill, stroke: color.stroke, skipStroke: false };
  }

  return { fill: DEFAULT_FILL_COLOR, stroke: DEFAULT_STROKE_COLOR, skipStroke: false };
}

/**
 * Takes resolved layers and applies per-category fill + stroke colors.
 * Returns new layer array with svgPath set to colored Data URIs.
 */
export async function applyColorsToLayers(
  layers: ResolvedLayer[],
  partColors: PartColors
): Promise<ResolvedLayer[]> {
  return Promise.all(
    layers.map(async (layer) => {
      const { fill, stroke, skipStroke } = resolveColor(layer.categoryId, partColors);

      try {
        const svgText = await loadSvgText(layer.svgPath);
        let colorized = replaceFillColor(svgText, fill);
        if (!skipStroke) {
          colorized = replaceStrokeColor(colorized, stroke);
        }
        const dataUri = svgToDataUri(colorized);

        return { ...layer, svgPath: dataUri };
      } catch (error) {
        console.error(`Failed to colorize layer ${layer.categoryId}:`, error);
        return layer;
      }
    })
  );
}
