'use client';

import { useCallback, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { useCharacterStore } from '@/stores/character-store';
import { CATEGORIES } from '@/data/categories';
import { PARTS } from '@/data/parts';
import { FILL_PRESETS, STROKE_PRESETS, RAINBOW_FILL_PRESETS, RAINBOW_STROKE_PRESETS } from '@/lib/utils/color-presets';
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from '@/types/character';
import { COLORABLE_CATEGORIES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

export function ColorPalette() {
  const activeCategoryId = useCharacterStore((s) => s.activeCategoryId);
  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partColors = useCharacterStore((s) => s.partColors);
  const setPartColor = useCharacterStore((s) => s.setPartColor);
  const applyColorToAll = useCharacterStore((s) => s.applyColorToAll);
  const resetPartColor = useCharacterStore((s) => s.resetPartColor);
  const recentFillColors = useCharacterStore((s) => s.recentFillColors);
  const recentStrokeColors = useCharacterStore((s) => s.recentStrokeColors);

  const category = CATEGORIES.find((c) => c.id === activeCategoryId);
  const isColorable = useMemo(() => {
    if (COLORABLE_CATEGORIES.includes(activeCategoryId)) return true;
    // Check per-part colorable flag (e.g. specific mouth parts)
    const partId = selectedParts[activeCategoryId];
    if (!partId) return false;
    const parts = PARTS[activeCategoryId];
    if (!parts) return false;
    const part = parts.find((p) => p.id === partId);
    return part?.colorable === true;
  }, [activeCategoryId, selectedParts]);

  const currentFill = useMemo(
    () => partColors[activeCategoryId]?.fill ?? DEFAULT_FILL_COLOR,
    [partColors, activeCategoryId]
  );

  const currentStroke = useMemo(
    () => partColors[activeCategoryId]?.stroke ?? DEFAULT_STROKE_COLOR,
    [partColors, activeCategoryId]
  );

  const handleFillPreset = useCallback(
    (fill: string) => {
      setPartColor(activeCategoryId, { fill, stroke: currentStroke });
    },
    [activeCategoryId, currentStroke, setPartColor]
  );

  const handleStrokePreset = useCallback(
    (stroke: string) => {
      setPartColor(activeCategoryId, { fill: currentFill, stroke });
    },
    [activeCategoryId, currentFill, setPartColor]
  );

  const handleCustomFill = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPartColor(activeCategoryId, { fill: e.target.value, stroke: currentStroke });
    },
    [activeCategoryId, currentStroke, setPartColor]
  );

  const handleCustomStroke = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPartColor(activeCategoryId, { fill: currentFill, stroke: e.target.value });
    },
    [activeCategoryId, currentFill, setPartColor]
  );

  const handleApplyToAll = useCallback(() => {
    applyColorToAll({ fill: currentFill, stroke: currentStroke });
  }, [currentFill, currentStroke, applyColorToAll]);

  const handleReset = useCallback(() => {
    resetPartColor(activeCategoryId);
  }, [activeCategoryId, resetPartColor]);

  if (!isColorable) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
      {/* 헤더 */}
      <span className="text-sm font-medium text-gray-700">
        {category?.name} 색상
      </span>

      {/* 채우기 영역 */}
      <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full border border-gray-300"
            style={{ backgroundColor: currentFill }}
          />
          <span className="text-xs font-medium text-gray-600">채우기</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleFillPreset(preset.color)}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-all',
                currentFill.toLowerCase() === preset.color.toLowerCase()
                  ? 'border-indigo-500 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-gray-400'
              )}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            />
          ))}
          <label
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white hover:border-gray-400"
            title="직접 선택"
          >
            <span className="text-xs text-gray-400">+</span>
            <input
              type="color"
              value={currentFill}
              onChange={handleCustomFill}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
        {recentFillColors.length > 0 && (
          <div>
            <span className="mb-1 block text-xs text-gray-400">최근 사용</span>
            <div className="flex flex-wrap gap-2">
              {recentFillColors.map((color) => (
                <button
                  key={`recent-fill-${color}`}
                  onClick={() => handleFillPreset(color)}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-all',
                    currentFill.toLowerCase() === color.toLowerCase()
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-400'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
        <div>
          <span className="mb-1 block text-xs text-gray-400">추천</span>
          <div className="flex flex-wrap gap-2">
            {RAINBOW_FILL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleFillPreset(preset.color)}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all',
                  currentFill.toLowerCase() === preset.color.toLowerCase()
                    ? 'border-indigo-500 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-gray-400'
                )}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 선 영역 */}
      <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full border-2 border-gray-300"
            style={{ borderColor: currentStroke }}
          />
          <span className="text-xs font-medium text-gray-600">선</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {STROKE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleStrokePreset(preset.color)}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-all',
                currentStroke.toLowerCase() === preset.color.toLowerCase()
                  ? 'border-indigo-500 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-gray-400'
              )}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            />
          ))}
          <label
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white hover:border-gray-400"
            title="직접 선택"
          >
            <span className="text-xs text-gray-400">+</span>
            <input
              type="color"
              value={currentStroke}
              onChange={handleCustomStroke}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
        {recentStrokeColors.length > 0 && (
          <div>
            <span className="mb-1 block text-xs text-gray-400">최근 사용</span>
            <div className="flex flex-wrap gap-2">
              {recentStrokeColors.map((color) => (
                <button
                  key={`recent-stroke-${color}`}
                  onClick={() => handleStrokePreset(color)}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-all',
                    currentStroke.toLowerCase() === color.toLowerCase()
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-400'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
        <div>
          <span className="mb-1 block text-xs text-gray-400">추천</span>
          <div className="flex flex-wrap gap-2">
            {RAINBOW_STROKE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleStrokePreset(preset.color)}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all',
                  currentStroke.toLowerCase() === preset.color.toLowerCase()
                    ? 'border-indigo-500 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-gray-400'
                )}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={handleApplyToAll}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          전체 적용
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <RotateCcw className="h-3 w-3" />
          초기화
        </button>
      </div>
    </div>
  );
}
