import type { CategoryId, ExpressionId, ExpressionEffect, PartColor } from '@/types/character';
import { withBasePath } from '@/lib/utils/asset-path';
import { LAYER_Z } from '@/lib/utils/constants';

const p = (path: string) => withBasePath(path);

const EXPRESSION_COLOR: PartColor = { fill: '#FF6B6B', stroke: '#231815' };

/**
 * Category-level expression effects (shared across all parts in a category).
 *
 * - overlay: adds extra layer(s) on top of the base part
 * - replace: swaps the base part's svgPath entirely
 *
 * neutral is omitted — no effect needed (base part shown as-is).
 */
export const EXPRESSION_EFFECTS: Partial<
  Record<CategoryId, Partial<Record<ExpressionId, ExpressionEffect>>>
> = {
  mouth: {
    happy: { mode: 'overlay', extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/smile.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }] },
    sad: { mode: 'overlay', extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/sad.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }] },
    angry: { mode: 'overlay', extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/angry.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }] },
    surprised: { mode: 'overlay', extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/teasing.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }] },
  },
  eyes: {
    sad: { mode: 'replace', svgPath: p('/assets/parts/eyes/expression/sad.svg') },
    angry: { mode: 'replace', svgPath: p('/assets/parts/eyes/expression/angry.svg') },
    surprised: { mode: 'replace', svgPath: p('/assets/parts/eyes/expression/surprised.svg') },
  },
};
