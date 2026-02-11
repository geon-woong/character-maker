'use client';

import { useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { useCharacterStore } from '@/stores/character-store';
import { CATEGORIES } from '@/data/categories';
import { COLOR_PRESETS } from '@/lib/utils/color-presets';
import { DEFAULT_FILL_COLOR } from '@/types/character';
import { cn } from '@/lib/utils/cn';

export function ColorPalette() {
  const activeCategoryId = useCharacterStore((s) => s.activeCategoryId);
  const partColors = useCharacterStore((s) => s.partColors);
  const setPartColor = useCharacterStore((s) => s.setPartColor);
  const applyColorToAll = useCharacterStore((s) => s.applyColorToAll);
  const resetPartColor = useCharacterStore((s) => s.resetPartColor);

  const category = CATEGORIES.find((c) => c.id === activeCategoryId);
  const currentFill = partColors[activeCategoryId] ?? DEFAULT_FILL_COLOR;

  const handlePresetClick = useCallback(
    (fill: string) => {
      setPartColor(activeCategoryId, fill);
    },
    [activeCategoryId, setPartColor]
  );

  const handleCustomColor = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPartColor(activeCategoryId, e.target.value);
    },
    [activeCategoryId, setPartColor]
  );

  const handleApplyToAll = useCallback(() => {
    applyColorToAll(currentFill);
  }, [currentFill, applyColorToAll]);

  const handleReset = useCallback(() => {
    resetPartColor(activeCategoryId);
  }, [activeCategoryId, resetPartColor]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {category?.name} 색상
        </span>
        <div
          className="h-6 w-6 rounded-full border border-gray-300"
          style={{ backgroundColor: currentFill }}
        />
      </div>

      {/* 프리셋 스와치 */}
      <div className="flex flex-wrap gap-2">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset.fill)}
            className={cn(
              'h-8 w-8 rounded-full border-2 transition-all',
              currentFill.toLowerCase() === preset.fill.toLowerCase()
                ? 'border-indigo-500 ring-2 ring-indigo-200'
                : 'border-gray-200 hover:border-gray-400'
            )}
            style={{ backgroundColor: preset.fill }}
            title={preset.name}
          />
        ))}

        {/* 자유 색상 선택기 */}
        <label
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white hover:border-gray-400"
          title="직접 선택"
        >
          <span className="text-xs text-gray-400">+</span>
          <input
            type="color"
            value={currentFill}
            onChange={handleCustomColor}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
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
