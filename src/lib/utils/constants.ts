import type { CategoryId } from '@/types/character';

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1080;
export const CANVAS_EXPORT_SCALE = 1; // 1080px export by default
export const DEFAULT_POSE_ID = 'standing' as const;
export const DEFAULT_EXPRESSION_ID = 'neutral' as const;
export const OFFSET_LIMIT = 20;
export const ROTATION_LIMIT = 10;
export const EDITABLE_CATEGORIES: readonly CategoryId[] = ['ears', 'arms', 'legs','mouth','nose','eyes'];
