import type { PartColor, PartDefinition } from '@/types/character';
import { withBasePath } from '@/lib/utils/asset-path';
import { LAYER_Z } from '@/lib/utils/constants';

/** Placeholder fixed color for mouth expression overlays (adjust as needed) */
const EXPRESSION_COLOR: PartColor = { fill: '#FF6B6B', stroke: '#231815' };

/**
 * All part definitions organized by categoryId -> PartDefinition[]
 *
 * Variant key patterns:
 *   variesByPose=true:  "{poseId}/default"     (body, body2)
 *   variesByExpression: "any/{expressionId}"    (eyes, mouth)
 *   neither:            "any/default"           (face, face2, nose, ears, ear2)
 *
 * Direction-specific images use `directionVariants` (independent of pose/expression).
 */
const p = (path: string) => withBasePath(path);

export const PARTS: Record<string, PartDefinition[]> = {
  body: [
    {
      id: '01',
      name: '몸 01',
      thumbnail: p('/assets/parts/body/01.svg'),
      variesByExpression: false,
      variesByPose: true,
      variants: {
        'standing/default': p('/assets/parts/body/01.svg'),
        'sitting/default': p('/assets/parts/body/posture/01_sit.svg'),
        'lying/default': p('/assets/parts/body/posture/01_lay.svg'),
        'bowing/default': {
          svgPath: p('/assets/parts/body/posture/01_bow.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/body/extra/01_bow.svg'), layerIndex: LAYER_Z.bodyExtra }],
        },
      },
      directionVariants: {
        side: p('/assets/parts/body/turnaround/01_side.svg'),
        'half-side': p('/assets/parts/body/turnaround/01_halfside.svg'),
      },
    },
    {
      id: '02',
      name: '몸 02',
      thumbnail: p('/assets/parts/body/02.svg'),
      variesByExpression: false,
      variesByPose: true,
      variants: {
        'standing/default': p('/assets/parts/body/02.svg'),
        'sitting/default': p('/assets/parts/body/posture/02_sit.svg'),
        'lying/default': p('/assets/parts/body/posture/02_lay.svg'),
        'bowing/default': {
          svgPath: p('/assets/parts/body/posture/02_bow.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/body/extra/02_bow.svg'), layerIndex: LAYER_Z.bodyExtra }],
        },
      },
      directionVariants: {
        side: p('/assets/parts/body/turnaround/02_side.svg'),
        'half-side': p('/assets/parts/body/turnaround/02_halfside.svg'),
      },
    },
  ],
  face: [
    {
      id: '01',
      name: '얼굴 01',
      thumbnail: p('/assets/parts/face/01.svg'),
      variesByExpression: false,
      variesByPose: false,
      variants: { 'any/default': p('/assets/parts/face/01.svg') },
    },
    {
      id: '02',
      name: '얼굴 02',
      thumbnail: p('/assets/parts/face/02.svg'),
      variesByExpression: false,
      variesByPose: false,
      variants: { 'any/default': p('/assets/parts/face/02.svg') },
    },
  ],
  eyes: [
    {
      id: '01',
      name: '눈 01',
      thumbnail: p('/assets/parts/eyes/01.svg'),
      variesByExpression: true,
      variesByPose: false,
      variants: {
        'any/neutral': p('/assets/parts/eyes/01.svg'),
      },
      sideOffsets: {
        side: { right: { offsetX: -300 } },
        'half-side': { left: { offsetX: -40 }, right: { offsetX: -40 } },
      },
    },
    {
      id: '02',
      name: '눈 02',
      thumbnail: p('/assets/parts/eyes/02.svg'),
      variesByExpression: true,
      variesByPose: false,
      variants: {
        'any/neutral': p('/assets/parts/eyes/02.svg')
      },
      sideOffsets: {
        side: { right: { offsetX: -300 } },
        'half-side': { left: { offsetX: -40 }, right: { offsetX: -40 } },
      },
    },
    {
      id: '03',
      name: '눈 03',
      thumbnail: p('/assets/parts/eyes/03.svg'),
      variesByExpression: true,
      variesByPose: false,
      variants: {
        'any/neutral': p('/assets/parts/eyes/03.svg'),
      },
      sideOffsets: {
        side: { right: { offsetX: -300 } },
        'half-side': { left: { offsetX: -40 }, right: { offsetX: -40 } },
      },
    },
    {
      id: '04',
      name: '눈 04',
      thumbnail: p('/assets/parts/eyes/04.svg'),
      variesByExpression: true,
      variesByPose: false,
      variants: {
        'any/neutral': p('/assets/parts/eyes/04.svg'),
      },
      sideOffsets: {
        side: { right: { offsetX: -300 } },
        'half-side': { left: { offsetX: -40 }, right: { offsetX: -40 } },
      },
    },
  ],
  nose: [
    {
      id: '01',
      name: '코 01',
      thumbnail: p('/assets/parts/nose/01.svg'),
      variesByExpression: false,
      variesByPose: false,
      variants: { 'any/default': p('/assets/parts/nose/01.svg') },
      positionOverrides: {
        side: { offsetX: -300 },
        'half-side': { offsetX: -40 },
      },
    },
    {
      id: '02',
      name: '코 02',
      thumbnail: p('/assets/parts/nose/02.svg'),
      variesByExpression: false,
      variesByPose: false,
      variants: { 'any/default': p('/assets/parts/nose/02.svg') },
      positionOverrides: {
        side: { offsetX: -300 },
        'half-side': { offsetX: -40 },
      },
    },
    {
      id: '03',
      name: '코 03',
      thumbnail: p('/assets/parts/nose/03.svg'),
      variesByExpression: false,
      variesByPose: false,
      variants: { 'any/default': p('/assets/parts/nose/03.svg') },
      positionOverrides: {
        side: { offsetX: -300 },
        'half-side': { offsetX: -40 },
      },
    },
  ],
  mouth: [
    {
      id: '01',
      name: '입 01',
      thumbnail: p('/assets/parts/mouth/01.svg'),
      variesByExpression: true,
      variesByPose: false,
      variants: {
        'any/neutral': p('/assets/parts/mouth/01.svg'),
        'any/happy': {
          svgPath: p('/assets/parts/mouth/01.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/smile.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/sad': {
          svgPath: p('/assets/parts/mouth/01.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/sad.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/angry': {
          svgPath: p('/assets/parts/mouth/01.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/angry.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/surprised': {
          svgPath: p('/assets/parts/mouth/01.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/teasing.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
      },
      sideOffsets: {
        side: { right: { offsetX: -300 } },
        'half-side': { left: { offsetX: -40 }, right: { offsetX: -40 } },
      },
    },
    {
      id: '02',
      name: '입 02',
      thumbnail: p('/assets/parts/mouth/02.svg'),
      variesByExpression: true,
      variesByPose: false,
      variants: {
        'any/neutral': p('/assets/parts/mouth/02.svg'),
        'any/happy': {
          svgPath: p('/assets/parts/mouth/02.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/smile.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/sad': {
          svgPath: p('/assets/parts/mouth/02.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/sad.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/angry': {
          svgPath: p('/assets/parts/mouth/02.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/angry.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/surprised': {
          svgPath: p('/assets/parts/mouth/02.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/teasing.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
      },
      sideOffsets: {
        side: { right: { offsetX: -300 } },
        'half-side': { left: { offsetX: -40 }, right: { offsetX: -40 } },
      },
    },
    {
      id: '03',
      name: '입 03',
      thumbnail: p('/assets/parts/mouth/03.svg'),
      variesByExpression: true,
      variesByPose: false,
      colorable: true,
      variants: {
        'any/neutral': p('/assets/parts/mouth/03.svg'),
        'any/happy': {
          svgPath: p('/assets/parts/mouth/03.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/smile.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/sad': {
          svgPath: p('/assets/parts/mouth/03.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/sad.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/angry': {
          svgPath: p('/assets/parts/mouth/03.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/angry.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/surprised': {
          svgPath: p('/assets/parts/mouth/03.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/teasing.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
      },
      sideOffsets: {
        side: { right: { offsetX: -300 } },
        'half-side': { left: { offsetX: -40 }, right: { offsetX: -40 } },
      },
    },
    {
      id: '04',
      name: '입 04',
      thumbnail: p('/assets/parts/mouth/04.svg'),
      variesByExpression: true,
      variesByPose: false,
      variants: {
        'any/neutral': p('/assets/parts/mouth/04.svg'),
        'any/happy': {
          svgPath: p('/assets/parts/mouth/04.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/smile.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/sad': {
          svgPath: p('/assets/parts/mouth/04.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/sad.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/angry': {
          svgPath: p('/assets/parts/mouth/04.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/angry.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
        'any/surprised': {
          svgPath: p('/assets/parts/mouth/04.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/mouth/expression/teasing.svg'), layerIndex: LAYER_Z.mouthExpression, fixedColor: EXPRESSION_COLOR }],
        },
      },
      sideOffsets: {
        side: { right: { offsetX: -300 } },
        'half-side': { left: { offsetX: -40 }, right: { offsetX: -40 } },
      },
    },
  ],
  // body2: [
  //   {
  //     id: '01',
  //     name: '몸2 01',
  //     thumbnail: p('/assets/parts/body2/01.svg'),
  //     variesByExpression: false,
  //     variesByPose: true,
  //     variants: { 'standing/default': p('/assets/parts/body2/01.svg') },
  //   },
  // ],
  face2: [
    {
      id: '01',
      name: '얼굴2 01',
      thumbnail: p('/assets/parts/face2/01.svg'),
      variesByExpression: false,
      variesByPose: false,
      variants: { 'any/default': p('/assets/parts/face2/01.svg') },
      sideOffsets: {
        side: { right: { offsetX: -250 } },
        'half-side': { left: { offsetX: -40 }, right: { offsetX: -40 } },
      },
    },
    {
      id: '02',
      name: '얼굴2 02',
      thumbnail: p('/assets/parts/face2/02.svg'),
      variesByExpression: false,
      variesByPose: false,
      variants: { 'any/default': p('/assets/parts/face2/02.svg') },
      sideOffsets: {
        side: { right: { offsetX: -250 } },
        'half-side': { left: { offsetX: -30 }, right: { offsetX: -30 } },
      },
    },
  ],
  ears: [
    {
      id: '01',
      name: '귀 01',
      thumbnail: p('/assets/parts/ears/01.svg'),
      variesByExpression: false,
      variesByPose: false,
      variants: { 'any/default': p('/assets/parts/ears/01.svg') },
    },
    {
      id: '02',
      name: '귀 02',
      thumbnail: p('/assets/parts/ears/02.svg'),
      variesByExpression: false,
      variesByPose: false,
      variants: { 'any/default': p('/assets/parts/ears/02.svg') },
    },
    {
      id: '03',
      name: '귀 03',
      thumbnail: p('/assets/parts/ears/03.svg'),
      variesByExpression: false,
      variesByPose: false,
      variants: {
        'any/default': {
          svgPath: p('/assets/parts/ears/03.svg'),
          extraLayers: [{ svgPath: p('/assets/parts/ears/extra/03.svg'), layerIndex: LAYER_Z.earsExtra }],
        },
      },
    },
    {
      id: '04',
      name: '귀 04',
      thumbnail: p('/assets/parts/ears/04.svg'),
      variesByExpression: false,
      variesByPose: false,
      variants: {
        'any/default': p('/assets/parts/ears/04.svg'),
      },
    },
  ],
};
