import type { Category, CategoryId } from '@/types/character';
import { LAYER_Z } from '@/lib/utils/constants';

export const CATEGORIES: readonly Category[] = [
  { id: 'body', name: '몸', layerIndex: LAYER_Z.body, isRequired: true },
  // { id: 'body2', name: '몸2', layerIndex: LAYER_Z.body2, isRequired: false },
  { id: 'ears', name: '귀', layerIndex: LAYER_Z.ears, isRequired: true },
  { id: 'face', name: '얼굴', layerIndex: LAYER_Z.face, isRequired: true },
  // { id: 'ear2', name: '귀2', layerIndex: LAYER_Z.ear2, isRequired: false },
  { id: 'face2', name: '얼굴2', layerIndex: LAYER_Z.face2, isRequired: false },
  { id: 'eyes', name: '눈', layerIndex: LAYER_Z.eyes, isRequired: true },
  { id: 'mouth', name: '입', layerIndex: LAYER_Z.mouth, isRequired: true },
  { id: 'nose', name: '코', layerIndex: LAYER_Z.nose, isRequired: true },
] as const;

export const CATEGORY_MAP: ReadonlyMap<CategoryId, Category> = new Map(
  CATEGORIES.map((c) => [c.id, c])
);

/** Layer rendering order (ascending z-index) */
export const LAYER_ORDER: readonly CategoryId[] = CATEGORIES
  .slice()
  .sort((a, b) => a.layerIndex - b.layerIndex)
  .map((c) => c.id);
