import type {
  SelectedParts,
  ResolvedLayer,
  PoseId,
  ExpressionId,
  PartOffsets,
} from '@/types/character';
import { CATEGORIES } from '@/data/categories';
import { PARTS } from '@/data/parts';

/**
 * Given the current selections, resolve the SVG path for each layer.
 * Returns layers sorted by layerIndex (ascending z-order).
 */
export function resolveLayers(
  selectedParts: SelectedParts,
  poseId: PoseId,
  expressionId: ExpressionId,
  partOffsets?: PartOffsets
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

    const offset = partOffsets?.[category.id];
    layers.push({
      categoryId: category.id,
      layerIndex: category.layerIndex,
      svgPath,
      offsetX: offset?.x ?? 0,
      offsetY: offset?.y ?? 0,
    });
  }

  return layers.sort((a, b) => a.layerIndex - b.layerIndex);
}
