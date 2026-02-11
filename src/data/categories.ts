import type { Category, CategoryId } from '@/types/character';

export const CATEGORIES: readonly Category[] = [
  { id: 'legs', name: '다리', layerIndex: 0, isRequired: true },
  { id: 'arms', name: '팔', layerIndex: 1, isRequired: true },
  { id: 'body', name: '몸', layerIndex: 2, isRequired: true },
  { id: 'body2', name: '몸2', layerIndex: 3, isRequired: false },
  { id: 'ears', name: '귀', layerIndex: 4, isRequired: true },
  { id: 'face', name: '얼굴', layerIndex: 5, isRequired: true },
  { id: 'ear2', name: '귀2', layerIndex: 6, isRequired: false },
  { id: 'face2', name: '얼굴2', layerIndex: 7, isRequired: false },
  { id: 'eyes', name: '눈', layerIndex: 8, isRequired: true },
  { id: 'mouth', name: '입', layerIndex: 9, isRequired: true },
  { id: 'nose', name: '코', layerIndex: 10, isRequired: true },
] as const;

export const CATEGORY_MAP: ReadonlyMap<CategoryId, Category> = new Map(
  CATEGORIES.map((c) => [c.id, c])
);

/** Layer rendering order (ascending z-index) */
export const LAYER_ORDER: readonly CategoryId[] = CATEGORIES
  .slice()
  .sort((a, b) => a.layerIndex - b.layerIndex)
  .map((c) => c.id);
