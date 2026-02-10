// ===== Category =====
export type CategoryId =
  | 'body'
  | 'face'
  | 'eyes'
  | 'nose'
  | 'mouth'
  | 'ears'
  | 'arms'
  | 'legs';

export interface Category {
  readonly id: CategoryId;
  readonly name: string;
  readonly layerIndex: number;
  readonly isRequired: boolean;
}

// ===== Pose & Expression =====
export type PoseId = 'standing'; // MVP: single pose only
export type ExpressionId = 'neutral'; // MVP: single expression only

export interface Pose {
  readonly id: PoseId;
  readonly name: string;
}

export interface Expression {
  readonly id: ExpressionId;
  readonly name: string;
}

// ===== Part =====
export interface PartVariants {
  readonly [poseAndExpression: string]: string; // e.g. "standing/neutral" → "/assets/..."
}

export interface PartDefinition {
  readonly id: string;
  readonly name: string;
  readonly thumbnail: string;
  readonly variesByExpression: boolean;
  readonly variants: PartVariants;
}

// ===== Selection State =====
export type SelectedParts = Partial<Record<CategoryId, string>>; // categoryId → partId

export type MakerStep = 'parts' | 'export';

// ===== Part Transform =====
export type PartSide = 'left' | 'right';

export interface PartTransform {
  readonly x: number;
  readonly y: number;
  readonly skewX: number;
  readonly skewY: number;
}

export interface SidedPartTransform {
  readonly left: PartTransform;
  readonly right: PartTransform;
}

export type PartTransforms = Partial<Record<CategoryId, SidedPartTransform>>;

export const DEFAULT_PART_TRANSFORM: PartTransform = { x: 0, y: 0, skewX: 0, skewY: 0 };

// ===== Resolved Layer (for preview/export) =====
export interface ResolvedLayer {
  readonly categoryId: CategoryId;
  readonly layerIndex: number;
  readonly svgPath: string;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly skewX: number;
  readonly skewY: number;
  readonly side?: PartSide;
}
