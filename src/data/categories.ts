import type { Category, CategoryId } from '@/types/character';

export const CATEGORIES: readonly Category[] = [
  { id: 'legs', name: '다리', layerIndex: 0, isRequired: true },  // 최하단
  { id: 'arms', name: '팔', layerIndex: 1, isRequired: true },
  { id: 'body', name: '몸', layerIndex: 2, isRequired: true },
  { id: 'ears', name: '귀', layerIndex: 3, isRequired: true },
  { id: 'face', name: '얼굴', layerIndex: 4, isRequired: true },  // 몸/귀 위
  { id: 'eyes', name: '눈', layerIndex: 5, isRequired: true },
  { id: 'nose', name: '코', layerIndex: 6, isRequired: true },
  { id: 'mouth', name: '입', layerIndex: 7, isRequired: true },  // 최상단
] as const;

export const CATEGORY_MAP: ReadonlyMap<CategoryId, Category> = new Map(
  CATEGORIES.map((c) => [c.id, c])
);

/** Layer rendering order (ascending z-index) */
export const LAYER_ORDER: readonly CategoryId[] = CATEGORIES
  .slice()
  .sort((a, b) => a.layerIndex - b.layerIndex)
  .map((c) => c.id);
