import type { Pose, Expression } from '@/types/character';

export const POSES: readonly Pose[] = [
  { id: 'standing', name: '서있기' },
] as const;

export const EXPRESSIONS: readonly Expression[] = [
  { id: 'neutral', name: '기본' },
] as const;
