'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, RotateCcw } from 'lucide-react';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayers } from '@/lib/composer/layer-order';
import { CATEGORIES } from '@/data/categories';
import { cn } from '@/lib/utils/cn';
import {
  DEFAULT_POSE_ID,
  DEFAULT_EXPRESSION_ID,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  OFFSET_LIMIT,
} from '@/lib/utils/constants';

interface EditModeModalProps {
  onClose: () => void;
}

export function EditModeModal({ onClose }: EditModeModalProps) {
  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partOffsets = useCharacterStore((s) => s.partOffsets);
  const activeCategoryId = useCharacterStore((s) => s.activeCategoryId);
  const setActiveCategory = useCharacterStore((s) => s.setActiveCategory);
  const setPartOffset = useCharacterStore((s) => s.setPartOffset);

  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId);
  const currentOffset = partOffsets[activeCategoryId] ?? { x: 0, y: 0 };
  const hasSelection = selectedParts[activeCategoryId] != null;

  const layers = resolveLayers(
    selectedParts,
    DEFAULT_POSE_ID,
    DEFAULT_EXPRESSION_ID,
    partOffsets
  );

  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // 모달 열릴 때 body 스크롤 비활성화 + ESC 리스너
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleResetOffset = () => {
    setPartOffset(activeCategoryId, 0, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative flex h-[100dvh] w-screen flex-col bg-white lg:h-auto lg:max-h-[90vh] lg:w-auto lg:min-w-[480px] lg:max-w-[560px] lg:rounded-2xl">
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900">위치 편집</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200 px-4 pb-px">
          {CATEGORIES.map((category) => {
            const isActive = activeCategoryId === category.id;
            const hasPart = selectedParts[category.id] != null;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'relative shrink-0 px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-indigo-600'
                    : hasPart
                      ? 'text-gray-700 hover:text-gray-900'
                      : 'text-gray-400'
                )}
                disabled={!hasPart}
              >
                {category.name}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* 프리뷰 */}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
          <div
            className="relative w-full max-w-[320px] rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
            style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
          >
            {layers.map((layer) => {
              const translateXPct = (layer.offsetX / CANVAS_WIDTH) * 100;
              const translateYPct = (layer.offsetY / CANVAS_HEIGHT) * 100;

              return (
                <Image
                  key={`${layer.categoryId}-${layer.svgPath}`}
                  src={layer.svgPath}
                  alt={layer.categoryId}
                  fill
                  className="object-contain"
                  style={{
                    zIndex: layer.layerIndex,
                    transform:
                      layer.offsetX !== 0 || layer.offsetY !== 0
                        ? `translate(${translateXPct}%, ${translateYPct}%)`
                        : undefined,
                  }}
                  sizes="320px"
                  priority
                />
              );
            })}
          </div>
        </div>

        {/* 슬라이더 컨트롤 */}
        <div className="shrink-0 border-t border-gray-200 px-4 py-4">
          {!hasSelection ? (
            <p className="text-center text-sm text-gray-400">
              {activeCategory?.name} 파츠를 먼저 선택하세요
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {/* X축 슬라이더 */}
              <div className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-center text-sm font-medium text-gray-500">
                  X
                </span>
                <input
                  type="range"
                  min={-OFFSET_LIMIT}
                  max={OFFSET_LIMIT}
                  step={1}
                  value={currentOffset.x}
                  onChange={(e) =>
                    setPartOffset(
                      activeCategoryId,
                      Number(e.target.value),
                      currentOffset.y
                    )
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
                />
                <span className="w-10 shrink-0 text-right text-sm tabular-nums text-gray-600">
                  {currentOffset.x}
                </span>
              </div>

              {/* Y축 슬라이더 */}
              <div className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-center text-sm font-medium text-gray-500">
                  Y
                </span>
                <input
                  type="range"
                  min={-OFFSET_LIMIT}
                  max={OFFSET_LIMIT}
                  step={1}
                  value={currentOffset.y}
                  onChange={(e) =>
                    setPartOffset(
                      activeCategoryId,
                      currentOffset.x,
                      Number(e.target.value)
                    )
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
                />
                <span className="w-10 shrink-0 text-right text-sm tabular-nums text-gray-600">
                  {currentOffset.y}
                </span>
              </div>

              {/* 리셋 버튼 */}
              <button
                onClick={handleResetOffset}
                disabled={currentOffset.x === 0 && currentOffset.y === 0}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <RotateCcw className="h-4 w-4" />
                {activeCategory?.name} 위치 초기화
              </button>
            </div>
          )}
        </div>

        {/* ESC 안내 */}
        <div className="shrink-0 border-t border-gray-100 px-4 py-2">
          <p className="text-center text-xs text-gray-400">
            ESC를 눌러 편집 모드를 종료하세요
          </p>
        </div>
      </div>
    </div>
  );
}
