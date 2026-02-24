export interface ColorPreset {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export const FILL_PRESETS: readonly ColorPreset[] = [
  { id: 'white', name: '흰색', color: '#ffffff' },
  { id: 'cream', name: '크림', color: '#fff8e7' },
  { id: 'peach', name: '피치', color: '#ffdab9' },
  { id: 'pink', name: '핑크', color: '#ffb6c1' },
  { id: 'lavender', name: '라벤더', color: '#e6e6fa' },
  { id: 'skyblue', name: '하늘', color: '#87ceeb' },
  { id: 'mint', name: '민트', color: '#98fb98' },
  { id: 'yellow', name: '노랑', color: '#fff44f' },
  { id: 'orange', name: '주황', color: '#ffa500' },
  { id: 'gray', name: '회색', color: '#d3d3d3' },
  { id: 'brown', name: '갈색', color: '#deb887' },
  { id: 'black', name: '검정', color: '#333333' },
];

export const STROKE_PRESETS: readonly ColorPreset[] = [
  { id: 'default', name: '기본', color: '#231815' },
  { id: 'black', name: '검정', color: '#000000' },
  { id: 'dark-brown', name: '짙은갈색', color: '#3e2723' },
  { id: 'brown', name: '갈색', color: '#795548' },
  { id: 'dark-gray', name: '진회색', color: '#424242' },
  { id: 'gray', name: '회색', color: '#757575' },
  { id: 'navy', name: '남색', color: '#1a237e' },
  { id: 'dark-red', name: '짙은빨강', color: '#b71c1c' },
  { id: 'dark-green', name: '짙은초록', color: '#1b5e20' },
  { id: 'purple', name: '보라', color: '#4a148c' },
];

import type { CategoryId, PartColor } from '@/types/character';

export interface PalettePreset {
  readonly id: string;
  readonly name: string;
  readonly colors: Partial<Record<CategoryId, PartColor>>;
}

const s = '#231815'; // 기본 선 색상

export const PALETTE_PRESETS: readonly PalettePreset[] = [
  {
    id: 'default',
    name: '기본',
    colors: {
      body: { fill: '#ffffff', stroke: s },
      body2: { fill: '#ffffff', stroke: s },
      face: { fill: '#ffffff', stroke: s },
      face2: { fill: '#ffffff', stroke: s },
      ears: { fill: '#ffffff', stroke: s },
      nose: { fill: '#ffffff', stroke: s },
    },
  },
  {
    id: 'warm',
    name: '따뜻한',
    colors: {
      body: { fill: '#ffdab9', stroke: '#8b5e3c' },
      body2: { fill: '#ffdab9', stroke: '#8b5e3c' },
      face: { fill: '#ffe4c9', stroke: '#8b5e3c' },
      face2: { fill: '#ffe4c9', stroke: '#8b5e3c' },
      ears: { fill: '#ffdab9', stroke: '#8b5e3c' },
      nose: { fill: '#ffe4c9', stroke: '#8b5e3c' },
    },
  },
  {
    id: 'cool',
    name: '차가운',
    colors: {
      body: { fill: '#d6eaf8', stroke: '#2c3e50' },
      body2: { fill: '#d6eaf8', stroke: '#2c3e50' },
      face: { fill: '#e8f0fe', stroke: '#2c3e50' },
      face2: { fill: '#e8f0fe', stroke: '#2c3e50' },
      ears: { fill: '#d6eaf8', stroke: '#2c3e50' },
      nose: { fill: '#e8f0fe', stroke: '#2c3e50' },
    },
  },
  {
    id: 'dark',
    name: '다크',
    colors: {
      body: { fill: '#4a4a4a', stroke: '#1a1a1a' },
      body2: { fill: '#4a4a4a', stroke: '#1a1a1a' },
      face: { fill: '#5a5a5a', stroke: '#1a1a1a' },
      face2: { fill: '#5a5a5a', stroke: '#1a1a1a' },
      ears: { fill: '#4a4a4a', stroke: '#1a1a1a' },
      nose: { fill: '#5a5a5a', stroke: '#1a1a1a' },
    },
  },
  {
    id: 'pastel',
    name: '파스텔',
    colors: {
      body: { fill: '#fce4ec', stroke: '#ad1457' },
      body2: { fill: '#fce4ec', stroke: '#ad1457' },
      face: { fill: '#fff3e0', stroke: '#ad1457' },
      face2: { fill: '#fff3e0', stroke: '#ad1457' },
      ears: { fill: '#e8f5e9', stroke: '#ad1457' },
      nose: { fill: '#fff3e0', stroke: '#ad1457' },
    },
  },
  {
    id: 'fantasy',
    name: '판타지',
    colors: {
      body: { fill: '#e1bee7', stroke: '#4a148c' },
      body2: { fill: '#e1bee7', stroke: '#4a148c' },
      face: { fill: '#f3e5f5', stroke: '#4a148c' },
      face2: { fill: '#f3e5f5', stroke: '#4a148c' },
      ears: { fill: '#ce93d8', stroke: '#4a148c' },
      nose: { fill: '#f3e5f5', stroke: '#4a148c' },
    },
  },
];
