import type { Pose, Expression, Action } from '@/types/character';
import { withBasePath } from '@/lib/utils/asset-path';

const p = (path: string) => withBasePath(path);

// ===== Poses =====

export const POSES: readonly Pose[] = [
  { id: 'standing', name: '서있기', thumbnail: p('/assets/poses/standing.svg'), category: 'basic' },
  { id: 'walking',  name: '걷기',   thumbnail: p('/assets/poses/walking.svg'),  category: 'basic' },
  { id: 'running',  name: '뛰기',   thumbnail: p('/assets/poses/running.svg'),  category: 'basic' },
  { id: 'sitting',  name: '앉기',   thumbnail: p('/assets/poses/sitting.svg'),  category: 'basic' },
  { id: 'lying',    name: '눕기',   thumbnail: p('/assets/poses/lying.svg'),    category: 'basic' },
  { id: 'jumping',  name: '점프',   thumbnail: p('/assets/poses/jumping.svg'),  category: 'special' },
];

// ===== Expressions =====

export const EXPRESSIONS: readonly Expression[] = [
  { id: 'neutral',   name: '기본', thumbnail: p('/assets/expressions/neutral.svg') },
  { id: 'happy',     name: '기쁨', thumbnail: p('/assets/expressions/happy.svg') },
  { id: 'sad',       name: '슬픔', thumbnail: p('/assets/expressions/sad.svg') },
  { id: 'angry',     name: '화남', thumbnail: p('/assets/expressions/angry.svg') },
  { id: 'surprised', name: '놀람', thumbnail: p('/assets/expressions/surprised.svg') },
];

// ===== Action Presets (Pose + Expression combos) =====

export const ACTIONS: readonly Action[] = [
  // 기본 동작
  { id: 'standing-neutral', name: '기본 서있기',   poseId: 'standing', expressionId: 'neutral', thumbnail: p('/assets/actions/standing-neutral.svg'), category: 'basic' },
  { id: 'walking-neutral',  name: '걷기',         poseId: 'walking',  expressionId: 'neutral', thumbnail: p('/assets/actions/walking-neutral.svg'),  category: 'basic' },
  { id: 'running-neutral',  name: '뛰기',         poseId: 'running',  expressionId: 'neutral', thumbnail: p('/assets/actions/running-neutral.svg'),  category: 'basic' },
  { id: 'sitting-neutral',  name: '앉기',         poseId: 'sitting',  expressionId: 'neutral', thumbnail: p('/assets/actions/sitting-neutral.svg'),  category: 'basic' },
  { id: 'lying-neutral',    name: '눕기',         poseId: 'lying',    expressionId: 'neutral', thumbnail: p('/assets/actions/lying-neutral.svg'),    category: 'basic' },

  // 감정 동작
  { id: 'standing-happy',     name: '기쁨',     poseId: 'standing', expressionId: 'happy',     thumbnail: p('/assets/actions/standing-happy.svg'),     category: 'emotion' },
  { id: 'standing-sad',       name: '슬픔',     poseId: 'standing', expressionId: 'sad',       thumbnail: p('/assets/actions/standing-sad.svg'),       category: 'emotion' },
  { id: 'standing-angry',     name: '화남',     poseId: 'standing', expressionId: 'angry',     thumbnail: p('/assets/actions/standing-angry.svg'),     category: 'emotion' },
  { id: 'standing-surprised', name: '놀람',     poseId: 'standing', expressionId: 'surprised', thumbnail: p('/assets/actions/standing-surprised.svg'), category: 'emotion' },

  // 특수 동작
  { id: 'jumping-happy', name: '기쁨 점프',   poseId: 'jumping', expressionId: 'happy', thumbnail: p('/assets/actions/jumping-happy.svg'), category: 'special' },
  { id: 'sitting-sad',   name: '슬픈 앉기',   poseId: 'sitting', expressionId: 'sad',   thumbnail: p('/assets/actions/sitting-sad.svg'),   category: 'special' },
  { id: 'running-happy',  name: '즐거운 뛰기', poseId: 'running', expressionId: 'happy', thumbnail: p('/assets/actions/running-happy.svg'), category: 'special' },
];

// ===== Lookup Maps =====

export const POSE_MAP = new Map(POSES.map((pose) => [pose.id, pose]));
export const EXPRESSION_MAP = new Map(EXPRESSIONS.map((expr) => [expr.id, expr]));
export const ACTION_MAP = new Map(ACTIONS.map((action) => [action.id, action]));
