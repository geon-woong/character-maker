'use client';

import { RotateCcw } from 'lucide-react';
import { useCharacterStore } from '@/stores/character-store';
import { STROKE_WIDTH_PRESETS, STROKE_TEXTURE_PRESETS } from '@/lib/utils/constants';
import { DEFAULT_STROKE_SETTINGS } from '@/types/character';
import type { StrokeWidthId, StrokeTextureId } from '@/types/character';
import { cn } from '@/lib/utils/cn';

export function StrokeSettingsPanel() {
  const strokeSettings = useCharacterStore((s) => s.strokeSettings);
  const setStrokeWidth = useCharacterStore((s) => s.setStrokeWidth);
  const setStrokeTexture = useCharacterStore((s) => s.setStrokeTexture);
  const resetStrokeSettings = useCharacterStore((s) => s.resetStrokeSettings);

  const isDefault =
    strokeSettings.widthId === DEFAULT_STROKE_SETTINGS.widthId &&
    strokeSettings.textureId === DEFAULT_STROKE_SETTINGS.textureId;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">선 스타일</span>
        {!isDefault && (
          <button
            onClick={resetStrokeSettings}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RotateCcw className="h-3 w-3" />
            초기화
          </button>
        )}
      </div>

      {/* Width selection */}
      <div>
        <span className="mb-1 block text-xs text-gray-500">굵기</span>
        <div className="flex gap-2">
          {(Object.entries(STROKE_WIDTH_PRESETS) as [StrokeWidthId, { label: string; value: number }][]).map(
            ([id, preset]) => (
              <button
                key={id}
                onClick={() => setStrokeWidth(id)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-lg border-2 px-2 py-2 transition-all',
                  strokeSettings.widthId === id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-400'
                )}
              >
                <svg viewBox="0 0 60 20" className="h-4 w-full">
                  <line
                    x1="5"
                    y1="10"
                    x2="55"
                    y2="10"
                    stroke="#231815"
                    strokeWidth={preset.value / 3}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[10px] text-gray-600">{preset.label}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Texture selection */}
      <div>
        <span className="mb-1 block text-xs text-gray-500">질감</span>
        <div className="flex gap-2">
          {(Object.entries(STROKE_TEXTURE_PRESETS) as [StrokeTextureId, { label: string }][]).map(
            ([id, preset]) => (
              <button
                key={id}
                onClick={() => setStrokeTexture(id)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-lg border-2 px-3 py-2 transition-all',
                  strokeSettings.textureId === id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-400'
                )}
              >
                <svg viewBox="0 0 60 20" className="h-4 w-full">
                  {id === 'rough' && (
                    <defs>
                      <filter id="preview-rough" x="-10%" y="-10%" width="120%" height="120%">
                        <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="3" seed="42" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
                      </filter>
                    </defs>
                  )}
                  <line
                    x1="5"
                    y1="10"
                    x2="55"
                    y2="10"
                    stroke="#231815"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter={id === 'rough' ? 'url(#preview-rough)' : undefined}
                  />
                </svg>
                <span className="text-[10px] text-gray-600">{preset.label}</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
