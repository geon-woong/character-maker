import type { ResolvedLayer, PartColors, PartColor, StrokeSettings, SelectedParts, CategoryId } from '@/types/character';
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR, DEFAULT_STROKE_SETTINGS } from '@/types/character';
import { loadSvgText } from './svg-loader';
import { replaceFillColor, replaceStrokeColor, replaceStrokeWidth, svgToDataUri } from './svg-colorizer';
import { applyStrokeTexture } from './svg-texture';
import { COLORABLE_CATEGORIES, MOUTH_FOLLOWS, STROKE_WIDTH_PRESETS } from '@/lib/utils/constants';
import { PARTS } from '@/data/parts';

const DEFAULT_PART_COLOR: PartColor = { fill: DEFAULT_FILL_COLOR, stroke: DEFAULT_STROKE_COLOR };

/**
 * Resolve the effective PartColor for a given category.
 * - eyes: fixed fill color, original stroke
 * - mouth: follows MOUTH_FOLLOWS category color
 * - COLORABLE_CATEGORIES: user-selected or defaults
 * - others: defaults
 */
/** Categories whose SVGs use `fill: none` for stroke-only paths */
const PRESERVE_NONE_CATEGORIES: readonly string[] = ['body', 'body2'];

/** Check if the currently selected part for a category has `colorable: true`. */
function isPartColorable(categoryId: string, selectedParts?: SelectedParts): boolean {
  if (!selectedParts) return false;
  const partId = selectedParts[categoryId as CategoryId];
  if (!partId) return false;
  const categoryParts = PARTS[categoryId as CategoryId];
  if (!categoryParts) return false;
  const part = categoryParts.find((p) => p.id === partId);
  return part?.colorable === true;
}

function resolveColor(
  categoryId: string,
  partColors: PartColors,
  isColorable?: boolean
): { fill: string; stroke: string; skipFill: boolean; skipStroke: boolean; preserveNone: boolean } {
  const preserveNone = PRESERVE_NONE_CATEGORIES.includes(categoryId);

  if (categoryId === 'eyes') {
    return { fill: '', stroke: '', skipFill: true, skipStroke: true, preserveNone };
  }

  if (categoryId === 'mouth') {
    if (isColorable) {
      const color = partColors['mouth'] ?? DEFAULT_PART_COLOR;
      return { fill: color.fill, stroke: color.stroke, skipFill: false, skipStroke: false, preserveNone };
    }
    const bodyColor = partColors[MOUTH_FOLLOWS] ?? DEFAULT_PART_COLOR;
    return { fill: bodyColor.fill, stroke: DEFAULT_STROKE_COLOR, skipFill: false, skipStroke: false, preserveNone };
  }

  if (COLORABLE_CATEGORIES.includes(categoryId as never)) {
    const color = partColors[categoryId as keyof PartColors] ?? DEFAULT_PART_COLOR;
    return { fill: color.fill, stroke: color.stroke, skipFill: false, skipStroke: false, preserveNone };
  }

  return { fill: DEFAULT_FILL_COLOR, stroke: DEFAULT_STROKE_COLOR, skipFill: false, skipStroke: false, preserveNone };
}

/**
 * Takes resolved layers and applies per-category fill + stroke colors,
 * global stroke width, and stroke texture.
 * Returns new layer array with svgPath set to colored Data URIs.
 */
export async function applyColorsToLayers(
  layers: ResolvedLayer[],
  partColors: PartColors,
  strokeSettings: StrokeSettings = DEFAULT_STROKE_SETTINGS,
  selectedParts?: SelectedParts
): Promise<ResolvedLayer[]> {
  return Promise.all(
    layers.map(async (layer) => {
      // Fixed color from ExtraLayer takes priority
      if (layer.fixedColor) {
        try {
          let svgText = await loadSvgText(layer.svgPath);
          const preserveNone = PRESERVE_NONE_CATEGORIES.includes(layer.categoryId);
          svgText = replaceFillColor(svgText, layer.fixedColor.fill, preserveNone);
          svgText = replaceStrokeColor(svgText, layer.fixedColor.stroke);
          if (strokeSettings.widthId !== 'default') {
            const widthPx = STROKE_WIDTH_PRESETS[strokeSettings.widthId].value;
            svgText = replaceStrokeWidth(svgText, widthPx);
          }
          svgText = applyStrokeTexture(svgText, strokeSettings.textureId);
          const dataUri = svgToDataUri(svgText);
          return { ...layer, svgPath: dataUri };
        } catch (error) {
          console.error(`Failed to colorize fixed-color layer ${layer.categoryId}:`, error);
          return layer;
        }
      }

      const colorable = isPartColorable(layer.categoryId, selectedParts);
      const { fill, stroke, skipFill, skipStroke, preserveNone } = resolveColor(layer.categoryId, partColors, colorable);

      try {
        let svgText = await loadSvgText(layer.svgPath);

        // 1. Apply fill color
        if (!skipFill) {
          svgText = replaceFillColor(svgText, fill, preserveNone);
        }

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
