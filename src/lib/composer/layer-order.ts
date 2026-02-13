import type {
  SelectedParts,
  ResolvedLayer,
  PoseId,
  ExpressionId,
  PartTransforms,
  PartPosition,
  PartDefinition,
  ViewDirection,
  CategoryId,
  ExtraLayer,
  VariantData,
} from '@/types/character';
import { CATEGORIES } from '@/data/categories';
import { PARTS } from '@/data/parts';
import { EDITABLE_CATEGORIES, TRANSFORM_PARENT, HIDDEN_CATEGORIES_BY_DIRECTION } from '@/lib/utils/constants';

/**
 * Build the variant key for a part based on its variesByPose/variesByExpression flags.
 *
 *   variesByPose + variesByExpression: "{poseId}/{expressionId}"
 *   variesByPose only:                "{poseId}/default"
 *   variesByExpression only:          "any/{expressionId}"
 *   neither:                          "any/default"
 */
function buildVariantKey(
  part: PartDefinition,
  poseId: PoseId,
  expressionId: ExpressionId
): string {
  const pose = part.variesByPose ? poseId : 'any';
  const expression = part.variesByExpression ? expressionId : 'default';
  return `${pose}/${expression}`;
}

/**
 * Resolve the variant key with fallback chain for graceful degradation
 * when assets are not yet available for a specific pose/expression combo.
 *
 * Fallback order:
 *   1. Exact key (e.g. "sitting/happy")
 *   2. Standing fallback (e.g. "standing/happy")
 *   3. Neutral fallback (e.g. "sitting/neutral" or "sitting/default")
 *   4. Standing+neutral fallback (e.g. "standing/neutral" or "standing/default")
 *   5. First available variant
 */
function resolveVariantKey(
  part: PartDefinition,
  poseId: PoseId,
  expressionId: ExpressionId
): string | undefined {
  const exactKey = buildVariantKey(part, poseId, expressionId);
  if (part.variants[exactKey]) return exactKey;

  // Fallback: try standing pose with same expression
  if (part.variesByPose && poseId !== 'standing') {
    const standingKey = buildVariantKey(
      { ...part, variesByPose: true },
      'standing',
      expressionId
    );
    if (part.variants[standingKey]) return standingKey;
  }

  // Fallback: try same pose with neutral expression
  if (part.variesByExpression && expressionId !== 'neutral') {
    const neutralKey = buildVariantKey(
      { ...part, variesByExpression: true },
      poseId,
      'neutral'
    );
    if (part.variants[neutralKey]) return neutralKey;
  }

  // Fallback: standing + neutral
  const defaultKey = part.variesByPose
    ? (part.variesByExpression ? 'standing/neutral' : 'standing/default')
    : (part.variesByExpression ? 'any/neutral' : 'any/default');
  if (part.variants[defaultKey]) return defaultKey;

  // Last resort: first available variant
  const keys = Object.keys(part.variants);
  return keys.length > 0 ? keys[0] : undefined;
}

/**
 * Parse a variant value into svgPath + optional extraLayers.
 * Supports both plain string paths and VariantData objects.
 */
function parseVariantValue(value: string | VariantData): {
  svgPath: string;
  extraLayers?: readonly ExtraLayer[];
} {
  if (typeof value === 'string') return { svgPath: value };
  return value;
}

/**
 * Given the current selections, resolve the SVG path for each layer.
 * Editable categories (ears) are split into symmetric left/right layers.
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

    const variantKey = resolveVariantKey(part, poseId, expressionId);
    if (!variantKey) continue;

    const variantValue = part.variants[variantKey];
    if (!variantValue) continue;
    const { svgPath, extraLayers } = parseVariantValue(variantValue);

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

    // Process extra layers for composite parts
    if (extraLayers) {
      for (const extra of extraLayers) {
        if (isEditable && transform) {
          layers.push({
            categoryId: category.id,
            layerIndex: extra.layerIndex,
            svgPath: extra.svgPath,
            offsetX: transform.x,
            offsetY: transform.y,
            rotate: transform.rotate,
            side: 'left',
            isExtra: true,
          });
          layers.push({
            categoryId: category.id,
            layerIndex: extra.layerIndex,
            svgPath: extra.svgPath,
            offsetX: -transform.x,
            offsetY: transform.y,
            rotate: -transform.rotate,
            side: 'right',
            isExtra: true,
          });
        } else {
          layers.push({
            categoryId: category.id,
            layerIndex: extra.layerIndex,
            svgPath: extra.svgPath,
            offsetX: 0,
            offsetY: 0,
            rotate: 0,
            isExtra: true,
          });
        }
      }
    }
  }

  return layers.sort((a, b) => a.layerIndex - b.layerIndex);
}

/**
 * Look up design-time position override for a part.
 * Checks direction key first (e.g. "side"), then variant key.
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
 * Look up direction-specific SVG path from directionVariants.
 */
function getDirectionVariant(
  categoryId: CategoryId,
  partId: string,
  direction: ViewDirection
): string | undefined {
  const categoryParts = PARTS[categoryId];
  if (!categoryParts) return undefined;
  const part = categoryParts.find((p) => p.id === partId);
  if (!part?.directionVariants) return undefined;
  return part.directionVariants[direction];
}

/**
 * Resolve layers filtered by view direction.
 * - Uses directionVariants when available (turnaround images replace CSS transforms)
 * - Falls back to default variant + positionOverrides for face parts
 * - Hides facial categories for 'back' direction
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
    // Extra layers skip direction variant replacement (already purpose-specific SVGs)
    if (layer.isExtra) return layer;

    const partId = selectedParts[layer.categoryId];
    if (!partId) return layer;

    // Check for direction-specific image (turnaround)
    const directionSvg = getDirectionVariant(layer.categoryId, partId, direction);
    if (directionSvg) {
      return { ...layer, svgPath: directionSvg };
    }

    // Fall back to position overrides (for face parts like eyes, nose, mouth)
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
