import type {
  SelectedParts,
  ResolvedLayer,
  PoseId,
  ExpressionId,
  PartTransforms,
} from '@/types/character';
import { DEFAULT_PART_TRANSFORM } from '@/types/character';
import { CATEGORIES } from '@/data/categories';
import { PARTS } from '@/data/parts';
import { EDITABLE_CATEGORIES } from '@/lib/utils/constants';

/**
 * Given the current selections, resolve the SVG path for each layer.
 * Editable categories (ears, arms, legs) are split into left/right layers.
 * Returns layers sorted by layerIndex (ascending z-order).
 */
export function resolveLayers(
  selectedParts: SelectedParts,
  poseId: PoseId,
  expressionId: ExpressionId,
  partTransforms?: PartTransforms
): ResolvedLayer[] {
  const layers: ResolvedLayer[] = [];

  for (const category of CATEGORIES) {
    const partId = selectedParts[category.id];
    if (!partId) continue;

    const categoryParts = PARTS[category.id];
    if (!categoryParts) continue;

    const part = categoryParts.find((p) => p.id === partId);
    if (!part) continue;

    const variantKey = part.variesByExpression
      ? `${poseId}/${expressionId}`
      : `${poseId}/default`;

    const svgPath = part.variants[variantKey];
    if (!svgPath) continue;

    const isEditable = EDITABLE_CATEGORIES.includes(category.id);
    const transform = partTransforms?.[category.id];

    if (isEditable && transform) {
      const left = transform.left ?? DEFAULT_PART_TRANSFORM;
      const right = transform.right ?? DEFAULT_PART_TRANSFORM;

      layers.push({
        categoryId: category.id,
        layerIndex: category.layerIndex,
        svgPath,
        offsetX: left.x,
        offsetY: left.y,
        skewX: left.skewX,
        skewY: left.skewY,
        side: 'left',
      });
      layers.push({
        categoryId: category.id,
        layerIndex: category.layerIndex,
        svgPath,
        offsetX: right.x,
        offsetY: right.y,
        skewX: right.skewX,
        skewY: right.skewY,
        side: 'right',
      });
    } else {
      layers.push({
        categoryId: category.id,
        layerIndex: category.layerIndex,
        svgPath,
        offsetX: 0,
        offsetY: 0,
        skewX: 0,
        skewY: 0,
        side: isEditable ? undefined : undefined,
      });
    }
  }

  return layers.sort((a, b) => a.layerIndex - b.layerIndex);
}
