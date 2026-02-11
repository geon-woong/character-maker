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
