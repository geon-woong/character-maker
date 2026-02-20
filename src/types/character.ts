// ===== Category =====
export type CategoryId =
  | 'body'
  | 'body2'
  | 'face'
  | 'face2'
  | 'eyes'
  | 'nose'
  | 'mouth'
  | 'ears'
  | 'ear2';

export interface Category {
  readonly id: CategoryId;
  readonly name: string;
  readonly layerIndex: number;
  readonly isRequired: boolean;
}

// ===== Pose & Expression =====
export type PoseId = 'standing' | 'sitting' | 'lying' | 'bowing';
export type ExpressionId = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';

export type PoseCategory = 'basic' | 'special';

export interface Pose {
  readonly id: PoseId;
  readonly name: string;
  readonly thumbnail: string;
  readonly category: PoseCategory;
}

export interface Expression {
  readonly id: ExpressionId;
  readonly name: string;
  readonly thumbnail: string;
}

// ===== Action (Pose + Expression preset) =====
export type ActionCategory = 'basic' | 'emotion' | 'special';

export interface Action {
  readonly id: string;
  readonly name: string;
  readonly poseId: PoseId;
  readonly expressionId: ExpressionId;
  readonly thumbnail: string;
  readonly category: ActionCategory;
}

// ===== Part =====

/** Extra layer rendered at a different z-index (for composite parts) */
export interface ExtraLayer {
  readonly svgPath: string;
  readonly layerIndex: number;
}

/** Variant value with extra layers for composite rendering */
export interface VariantData {
  readonly svgPath: string;
  readonly extraLayers: readonly ExtraLayer[];
}

export interface PartVariants {
  readonly [poseAndExpression: string]: string | VariantData; // e.g. "standing/neutral" → "/assets/..." or VariantData
}

/** Design-time position override for a part (additive to user transforms) */
export interface PartPosition {
  readonly offsetX?: number;
  readonly offsetY?: number;
  readonly rotate?: number;
}

export interface PartDefinition {
  readonly id: string;
  readonly name: string;
  readonly thumbnail: string;
  readonly variesByExpression: boolean;
  readonly variesByPose: boolean;
  readonly variants: PartVariants;
  /** Direction-specific SVG paths for turnaround (independent of pose/expression variants) */
  readonly directionVariants?: Partial<Record<ViewDirection, string>>;
  /** Position overrides keyed by ViewDirection (e.g. "side") or variant key */
  readonly positionOverrides?: Record<string, PartPosition>;
}

// ===== Selection State =====
export type SelectedParts = Partial<Record<CategoryId, string>>; // categoryId → partId

export type MakerStep = 'parts' | 'action' | 'direction' | 'export';

// ===== View Direction =====
export type ViewDirection = 'front' | 'side' | 'half-side' | 'back';

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
export interface PartColor {
  fill: string;
  stroke: string;
}
export type PartColors = Partial<Record<CategoryId, PartColor>>;
export const DEFAULT_FILL_COLOR = '#ffffff';
export const DEFAULT_STROKE_COLOR = '#231815';

// ===== Stroke Settings (global, character-wide) =====
export type StrokeWidthId = 'thin' | 'default' | 'thick' | 'extra-thick';
export type StrokeTextureId = 'default' | 'rough';

export interface StrokeSettings {
  readonly widthId: StrokeWidthId;
  readonly textureId: StrokeTextureId;
}

export const DEFAULT_STROKE_SETTINGS: StrokeSettings = {
  widthId: 'default',
  textureId: 'default',
};

// ===== Resolved Layer (for preview/export) =====
export interface ResolvedLayer {
  readonly categoryId: CategoryId;
  readonly layerIndex: number;
  readonly svgPath: string;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly rotate: number;
  readonly side?: PartSide;
  readonly isExtra?: boolean;
}
