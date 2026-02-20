import type { ResolvedLayer, PartColors, PartColor, StrokeSettings } from '@/types/character';
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR, DEFAULT_STROKE_SETTINGS } from '@/types/character';
import { loadSvgText } from './svg-loader';
import { replaceFillColor, replaceStrokeColor, replaceStrokeWidth, svgToDataUri } from './svg-colorizer';
import { applyStrokeTexture } from './svg-texture';
import { COLORABLE_CATEGORIES, DEFAULT_EYES_COLOR, MOUTH_FOLLOWS, STROKE_WIDTH_PRESETS } from '@/lib/utils/constants';

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
    return { fill: bodyColor.fill, stroke: DEFAULT_STROKE_COLOR, skipStroke: false };
  }

  if (COLORABLE_CATEGORIES.includes(categoryId as never)) {
    const color = partColors[categoryId as keyof PartColors] ?? DEFAULT_PART_COLOR;
    return { fill: color.fill, stroke: color.stroke, skipStroke: false };
  }

  return { fill: DEFAULT_FILL_COLOR, stroke: DEFAULT_STROKE_COLOR, skipStroke: false };
}

/**
 * Takes resolved layers and applies per-category fill + stroke colors,
 * global stroke width, and stroke texture.
 * Returns new layer array with svgPath set to colored Data URIs.
 */
export async function applyColorsToLayers(
  layers: ResolvedLayer[],
  partColors: PartColors,
  strokeSettings: StrokeSettings = DEFAULT_STROKE_SETTINGS
): Promise<ResolvedLayer[]> {
  return Promise.all(
    layers.map(async (layer) => {
      const { fill, stroke, skipStroke } = resolveColor(layer.categoryId, partColors);

      try {
        let svgText = await loadSvgText(layer.svgPath);

        // 1. Apply fill color
        svgText = replaceFillColor(svgText, fill);

        // 2. Apply stroke color
        if (!skipStroke) {
          svgText = replaceStrokeColor(svgText, stroke);
        }

        // 3. Apply stroke width (global)
        if (strokeSettings.widthId !== 'default') {
          const widthPx = STROKE_WIDTH_PRESETS[strokeSettings.widthId].value;
          svgText = replaceStrokeWidth(svgText, widthPx);
        }

        // 4. Apply stroke texture (global)
        svgText = applyStrokeTexture(svgText, strokeSettings.textureId);

        const dataUri = svgToDataUri(svgText);
        return { ...layer, svgPath: dataUri };
      } catch (error) {
        console.error(`Failed to colorize layer ${layer.categoryId}:`, error);
        return layer;
      }
    })
  );
}
