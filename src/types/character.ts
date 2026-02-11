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

export interface SymmetricTransform {
  readonly x: number;
  readonly y: number;
  readonly rotate: number;
}

export type PartTransforms = Partial<Record<CategoryId, SymmetricTransform>>;

export const DEFAULT_SYMMETRIC_TRANSFORM: SymmetricTransform = { x: 0, y: 0, rotate: 0 };

// ===== Part Color =====
export type PartColors = Partial<Record<CategoryId, string>>; // categoryId → hex fill color
export const DEFAULT_FILL_COLOR = '#ffffff';

// ===== Resolved Layer (for preview/export) =====
export interface ResolvedLayer {
  readonly categoryId: CategoryId;
  readonly layerIndex: number;
  readonly svgPath: string;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly rotate: number;
  readonly side?: PartSide;
}
