import type { PartDefinition } from '@/types/character';
import { withBasePath } from '@/lib/utils/asset-path';

/**
 * All part definitions organized by categoryId -> PartDefinition[]
 *
 * Path pattern: /assets/parts/{category}/{number}.svg
 */
const p = (path: string) => withBasePath(path);

export const PARTS: Record<string, PartDefinition[]> = {
  body: [
    {
      id: '01',
      name: '몸 01',
      thumbnail: p('/assets/parts/body/01.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/body/01.svg') },
    },
    {
      id: '02',
      name: '몸 02',
      thumbnail: p('/assets/parts/body/02.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/body/02.svg') },
    },
  ],
  face: [
    {
      id: '01',
      name: '얼굴 01',
      thumbnail: p('/assets/parts/face/01.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/face/01.svg') },
    },
    {
      id: '02',
      name: '얼굴 02',
      thumbnail: p('/assets/parts/face/02.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/face/02.svg') },
    },
  ],
  eyes: [
    {
      id: '01',
      name: '눈 01',
      thumbnail: p('/assets/parts/eyes/01.svg'),
      variesByExpression: true,
      variants: { 'standing/neutral': p('/assets/parts/eyes/01.svg') },
    },
    {
      id: '02',
      name: '눈 02',
      thumbnail: p('/assets/parts/eyes/02.svg'),
      variesByExpression: true,
      variants: { 'standing/neutral': p('/assets/parts/eyes/02.svg') },
    },
  ],
  nose: [
    {
      id: '01',
      name: '코 01',
      thumbnail: p('/assets/parts/nose/01.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/nose/01.svg') },
    },
    {
      id: '02',
      name: '코 02',
      thumbnail: p('/assets/parts/nose/02.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/nose/02.svg') },
    },
  ],
  mouth: [
    {
      id: '01',
      name: '입 01',
      thumbnail: p('/assets/parts/mouth/01.svg'),
      variesByExpression: true,
      variants: { 'standing/neutral': p('/assets/parts/mouth/01.svg') },
    },
    {
      id: '02',
      name: '입 02',
      thumbnail: p('/assets/parts/mouth/02.svg'),
      variesByExpression: true,
      variants: { 'standing/neutral': p('/assets/parts/mouth/02.svg') },
    },
  ],
  ears: [
    {
      id: '01',
      name: '귀 01',
      thumbnail: p('/assets/parts/ears/01.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/ears/01.svg') },
    },
    {
      id: '02',
      name: '귀 02',
      thumbnail: p('/assets/parts/ears/02.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/ears/02.svg') },
    },
  ],
  arms: [
    {
      id: '01',
      name: '팔 01',
      thumbnail: p('/assets/parts/arms/01.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/arms/01.svg') },
    },
    {
      id: '02',
      name: '팔 02',
      thumbnail: p('/assets/parts/arms/02.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/arms/02.svg') },
    },
  ],
  legs: [
    {
      id: '01',
      name: '다리 01',
      thumbnail: p('/assets/parts/legs/01.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/legs/01.svg') },
    },
    {
      id: '02',
      name: '다리 02',
      thumbnail: p('/assets/parts/legs/02.svg'),
      variesByExpression: false,
      variants: { 'standing/default': p('/assets/parts/legs/02.svg') },
    },
  ],
};
