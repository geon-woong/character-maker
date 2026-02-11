export interface ColorPreset {
  readonly id: string;
  readonly name: string;
  readonly fill: string;
}

export const COLOR_PRESETS: readonly ColorPreset[] = [
  { id: 'white', name: '흰색', fill: '#ffffff' },
  { id: 'cream', name: '크림', fill: '#fff8e7' },
  { id: 'peach', name: '피치', fill: '#ffdab9' },
  { id: 'pink', name: '핑크', fill: '#ffb6c1' },
  { id: 'lavender', name: '라벤더', fill: '#e6e6fa' },
  { id: 'skyblue', name: '하늘', fill: '#87ceeb' },
  { id: 'mint', name: '민트', fill: '#98fb98' },
  { id: 'yellow', name: '노랑', fill: '#fff44f' },
  { id: 'orange', name: '주황', fill: '#ffa500' },
  { id: 'gray', name: '회색', fill: '#d3d3d3' },
  { id: 'brown', name: '갈색', fill: '#deb887' },
  { id: 'black', name: '검정', fill: '#333333' },
];
