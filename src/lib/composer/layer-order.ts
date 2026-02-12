import type {
  SelectedParts,
  ResolvedLayer,
  PoseId,
  ExpressionId,
  PartTransforms,
  PartPosition,
  ViewDirection,
  CategoryId,
} from '@/types/character';
import { CATEGORIES } from '@/data/categories';
import { PARTS } from '@/data/parts';
import { EDITABLE_CATEGORIES, TRANSFORM_PARENT, HIDDEN_CATEGORIES_BY_DIRECTION } from '@/lib/utils/constants';

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

/**
 * Look up design-time position override for a part.
 * Checks direction key first (e.g. "side-left"), then variant key (e.g. "side-standing/default").
 */
function getPositionOverride(
  categoryId: CategoryId,
  partId: string,
  direction: ViewDirection,
  variantKey: string
): PartPosition | undefined {
  const categoryParts = PARTS[categoryId];
  if (!categoryParts) return undefined;
  const part = categoryParts.find((p) => p.id === partId);
  if (!part?.positionOverrides) return undefined;
  return part.positionOverrides[direction] ?? part.positionOverrides[variantKey];
}

/**
 * Resolve layers filtered by view direction, with design-time position overrides applied.
 * For 'back' direction, facial categories (eyes, nose, mouth, face2) are removed.
 * Position overrides from part data are additive to user transforms.
 */
export function resolveLayersForDirection(
  selectedParts: SelectedParts,
  poseId: PoseId,
  expressionId: ExpressionId,
  partTransforms: PartTransforms | undefined,
  direction: ViewDirection
): ResolvedLayer[] {
  const allLayers = resolveLayers(selectedParts, poseId, expressionId, partTransforms);
  const hiddenCategories = HIDDEN_CATEGORIES_BY_DIRECTION[direction];

  const filtered = hiddenCategories.length === 0
    ? allLayers
    : allLayers.filter((layer) => !hiddenCategories.includes(layer.categoryId));

  if (direction === 'front') return filtered;

  const variantKey = `${poseId}/default`;

  return filtered.map((layer) => {
    const partId = selectedParts[layer.categoryId];
    if (!partId) return layer;

    const override = getPositionOverride(layer.categoryId, partId, direction, variantKey);
    if (!override) return layer;

    return {
      ...layer,
      offsetX: layer.offsetX + (override.offsetX ?? 0),
      offsetY: layer.offsetY + (override.offsetY ?? 0),
      rotate: layer.rotate + (override.rotate ?? 0),
    };
  });
}
