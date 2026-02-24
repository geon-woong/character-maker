'use client';

import { useCallback, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useCharacterStore } from '@/stores/character-store';
import { CATEGORIES } from '@/data/categories';
import { PARTS } from '@/data/parts';
import { FILL_PRESETS, STROKE_PRESETS, PALETTE_PRESETS } from '@/lib/utils/color-presets';
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from '@/types/character';
import { COLORABLE_CATEGORIES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

export function ColorPalette() {
  const activeCategoryId = useCharacterStore((s) => s.activeCategoryId);
  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partColors = useCharacterStore((s) => s.partColors);
  const setPartColor = useCharacterStore((s) => s.setPartColor);
  const applyColorToAll = useCharacterStore((s) => s.applyColorToAll);
  const applyPalette = useCharacterStore((s) => s.applyPalette);
  const resetPartColor = useCharacterStore((s) => s.resetPartColor);
  const recentFillColors = useCharacterStore((s) => s.recentFillColors);
  const recentStrokeColors = useCharacterStore((s) => s.recentStrokeColors);

  const [applyToAll, setApplyToAll] = useState(false);

  const category = CATEGORIES.find((c) => c.id === activeCategoryId);
  const isColorable = useMemo(() => {
    if (COLORABLE_CATEGORIES.includes(activeCategoryId)) return true;
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
      const color = { fill, stroke: currentStroke };
      if (applyToAll) {
        applyColorToAll(color);
      } else {
        setPartColor(activeCategoryId, color);
      }
    },
    [activeCategoryId, currentStroke, setPartColor, applyColorToAll, applyToAll]
  );

  const handleStrokePreset = useCallback(
    (stroke: string) => {
      const color = { fill: currentFill, stroke };
      if (applyToAll) {
        applyColorToAll(color);
      } else {
        setPartColor(activeCategoryId, color);
      }
    },
    [activeCategoryId, currentFill, setPartColor, applyColorToAll, applyToAll]
  );

  const handleCustomFill = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = { fill: e.target.value, stroke: currentStroke };
      if (applyToAll) {
        applyColorToAll(color);
      } else {
        setPartColor(activeCategoryId, color);
      }
    },
    [activeCategoryId, currentStroke, setPartColor, applyColorToAll, applyToAll]
  );

  const handleCustomStroke = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = { fill: currentFill, stroke: e.target.value };
      if (applyToAll) {
        applyColorToAll(color);
      } else {
        setPartColor(activeCategoryId, color);
      }
    },
    [activeCategoryId, currentFill, setPartColor, applyColorToAll, applyToAll]
  );

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

      {/* 추천 팔레트 */}
      <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
        <span className="text-xs font-medium text-gray-600">추천 팔레트</span>
        <div className="flex flex-wrap gap-2">
          {PALETTE_PRESETS.map((preset) => {
            const bodyColor = preset.colors.body;
            const faceColor = preset.colors.face;
            return (
              <button
                key={preset.id}
                onClick={() => applyPalette(preset.colors)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                title={preset.name}
              >
                <div className="flex -space-x-1">
                  <div
                    className="h-4 w-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: bodyColor?.fill }}
                  />
                  <div
                    className="h-4 w-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: faceColor?.fill }}
                  />
                </div>
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 전체 적용 체크박스 */}
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={applyToAll}
          onChange={(e) => setApplyToAll(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-xs text-gray-600">전체 부위에 적용</span>
      </label>

      {/* 채우기 영역 */}
      <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full border border-gray-300" style={{ backgroundColor: currentFill }} />
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
                  : 'border-gray-200 hover:border-gray-400',
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
                      : 'border-gray-200 hover:border-gray-400',
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 선 영역 */}
      <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full border-2 border-gray-300" style={{ borderColor: currentStroke }} />
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
                  : 'border-gray-200 hover:border-gray-400',
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
                      : 'border-gray-200 hover:border-gray-400',
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 초기화 버튼 */}
      <button
        onClick={handleReset}
        className="flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <RotateCcw className="h-3 w-3" />
        초기화
      </button>
    </div>
  );
}
