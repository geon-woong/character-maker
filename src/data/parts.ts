import type { PartDefinition } from '@/types/character';
import { withBasePath } from '@/lib/utils/asset-path';

/**
 * All part definitions organized by categoryId -> PartDefinition[]
 *
 * Path pattern: /assets/parts/{category}/{number}.svg|png
 */
const p = (path: string) => withBasePath(path);

export const PARTS: Record<string, PartDefinition[]> = {
  body: [
    {
      id: '01',
      name: '몸 01',
      thumbnail: p('/assets/parts/body/03.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/body/03.png') },
    },
    {
      id: '02',
      name: '몸 02',
      thumbnail: p('/assets/parts/body/04.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/body/04.png') },
    },
  ],
  face: [
    {
      id: '01',
      name: '얼굴 01',
      thumbnail: p('/assets/parts/face/03.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/face/03.png') },
    },
    {
      id: '02',
      name: '얼굴 02',
      thumbnail: p('/assets/parts/face/04.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/face/04.png') },
    },
  ],
  eyes: [
    {
      id: '01',
      name: '눈 01',
      thumbnail: p('/assets/parts/eyes/03.png'),
      variesByExpression: true,
      variants: { 'standing/neutral': p('/assets/parts/eyes/03.png') },
    },
    {
      id: '02',
      name: '눈 02',
      thumbnail: p('/assets/parts/eyes/04.png'),
      variesByExpression: true,
      variants: { 'standing/neutral': p('/assets/parts/eyes/04.png') },
    },
  ],
  nose: [
    {
      id: '01',
      name: '코 01',
      thumbnail: p('/assets/parts/nose/03.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/nose/03.png') },
    },
    {
      id: '02',
      name: '코 02',
      thumbnail: p('/assets/parts/nose/04.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/nose/04.png') },
    },
  ],
  mouth: [
    {
      id: '01',
      name: '입 01',
      thumbnail: p('/assets/parts/mouth/03.png'),
      variesByExpression: true,
      variants: { 'standing/neutral': p('/assets/parts/mouth/03.png') },
    },
    {
      id: '02',
      name: '입 02',
      thumbnail: p('/assets/parts/mouth/04.png'),
      variesByExpression: true,
      variants: { 'standing/neutral': p('/assets/parts/mouth/04.png') },
    },
  ],
  ears: [
    {
      id: '01',
      name: '귀 01',
      thumbnail: p('/assets/parts/ears/03.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/ears/03.png') },
    },
    {
      id: '02',
      name: '귀 02',
      thumbnail: p('/assets/parts/ears/04.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/ears/04.png') },
    },
  ],
  arms: [
    {
      id: '03',
      name: '팔 03',
      thumbnail: p('/assets/parts/arms/03.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/arms/03.png') },
    },
    {
      id: '04',
      name: '팔 04',
      thumbnail: p('/assets/parts/arms/04.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/arms/04.png') },
    },
  ],
  legs: [
    {
      id: '03',
      name: '다리 03',
      thumbnail: p('/assets/parts/legs/03.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/legs/03.png') },
    },
    {
      id: '04',
      name: '다리 04',
      thumbnail: p('/assets/parts/legs/04.png'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/legs/04.png') },
    },
  ],
};
