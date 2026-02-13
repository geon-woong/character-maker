import type { CategoryId, ViewDirection } from '@/types/character';

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1080;
export const CANVAS_EXPORT_SCALE = 1; // 1080px export by default
export const DEFAULT_POSE_ID = 'standing' as const;
export const DEFAULT_EXPRESSION_ID = 'neutral' as const;
export const OFFSET_LIMIT = 20;
export const ROTATION_LIMIT = 10;
export const EDITABLE_CATEGORIES: readonly CategoryId[] = ['ears', 'mouth', 'nose', 'eyes'];

/** 편집모드에서 X축 이동이 잠긴 카테고리 (중앙 정렬 부위) */
export const X_LOCKED_CATEGORIES: readonly CategoryId[] = ['mouth', 'nose'];

/** Categories that show the color palette UI */
export const COLORABLE_CATEGORIES: readonly CategoryId[] = ['body', 'body2', 'face', 'face2', 'ears', 'nose'];

/** Default fill color for eyes (fixed, not user-changeable) */
export const DEFAULT_EYES_COLOR = '#040000';

/** Mouth follows this category's color */
export const MOUTH_FOLLOWS: CategoryId = 'face';

/** 일괄 색상 변경에서 제외되는 카테고리 */
export const BULK_COLOR_EXCLUDED: readonly CategoryId[] = ['eyes', 'nose', 'mouth'];

/** Mutually exclusive category groups — selecting one clears others in the same group */
export const EXCLUSIVE_GROUPS: readonly CategoryId[][] = [];

/** Get other category IDs in the same exclusive group */
export function getExclusiveSiblings(categoryId: CategoryId): CategoryId[] {
  for (const group of EXCLUSIVE_GROUPS) {
    if (group.includes(categoryId)) {
      return group.filter((id) => id !== categoryId);
    }
  }
  return [];
}

/** Child categories inherit transform from parent */
export const TRANSFORM_PARENT: Partial<Record<CategoryId, CategoryId>> = {
  body2: 'body',
  face2: 'face',
};

// ===== View Direction =====

/** Categories hidden for specific view directions */
export const HIDDEN_CATEGORIES_BY_DIRECTION: Record<ViewDirection, readonly CategoryId[]> = {
  front: [],
  back: ['eyes', 'nose', 'mouth', 'face2'],
  side: [],
  'half-side': [],
};

/** CSS container transform per direction (side/half-side use actual images, no CSS transform) */
export const DIRECTION_CSS_TRANSFORMS: Record<ViewDirection, string> = {
  front: 'none',
  back: 'scaleX(-1)',
  side: 'none',
  'half-side': 'none',
};

/** Direction labels (Korean) */
export const DIRECTION_LABELS: Record<ViewDirection, string> = {
  front: '정면',
  back: '뒷면',
  side: '측면',
  'half-side': '반측면',
};

/** All view directions in display order */
export const ALL_DIRECTIONS: readonly ViewDirection[] = ['front', 'half-side', 'side', 'back'];
