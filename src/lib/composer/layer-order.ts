import type {
  SelectedParts,
  ResolvedLayer,
  PoseId,
  ExpressionId,
  PartTransforms,
} from '@/types/character';
import { CATEGORIES } from '@/data/categories';
import { PARTS } from '@/data/parts';
import { EDITABLE_CATEGORIES, TRANSFORM_PARENT } from '@/lib/utils/constants';

/**
 * Given the current selections, resolve the SVG path for each layer.
 * Editable categories (ears, arms, legs) are split into symmetric left/right layers.
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
    const parentId = TRANSFORM_PARENT[category.id];
    const transform = partTransforms?.[category.id] ?? (parentId ? partTransforms?.[parentId] : undefined);

    if (isEditable && transform) {
      // Symmetric mirroring: X and rotate are inverted for right side
      layers.push({
        categoryId: category.id,
        layerIndex: category.layerIndex,
        svgPath,
        offsetX: transform.x,
        offsetY: transform.y,
        rotate: transform.rotate,
        side: 'left',
      });
      layers.push({
        categoryId: category.id,
        layerIndex: category.layerIndex,
        svgPath,
        offsetX: -transform.x,
        offsetY: transform.y,
        rotate: -transform.rotate,
        side: 'right',
      });
    } else {
      layers.push({
        categoryId: category.id,
        layerIndex: category.layerIndex,
        svgPath,
        offsetX: 0,
        offsetY: 0,
        rotate: 0,
      });
    }
  }

  return layers.sort((a, b) => a.layerIndex - b.layerIndex);
}
