'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { X, RotateCcw } from 'lucide-react';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayersForDirection } from '@/lib/composer/layer-order';
import { applyColorsToLayers } from '@/lib/color/apply-colors';
import { CATEGORIES } from '@/data/categories';
import { cn } from '@/lib/utils/cn';
import type { ResolvedLayer } from '@/types/character';
import { DEFAULT_SYMMETRIC_TRANSFORM } from '@/types/character';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  OFFSET_LIMIT,
  ROTATION_LIMIT,
  EDITABLE_CATEGORIES,
  X_LOCKED_CATEGORIES,
} from '@/lib/utils/constants';

interface EditModeModalProps {
  onClose: () => void;
}

const EDITABLE_CATEGORY_LIST = CATEGORIES.filter((c) =>
  EDITABLE_CATEGORIES.includes(c.id)
);

function buildPreviewTransform(layer: { offsetX: number; offsetY: number; rotate: number }) {
  const parts: string[] = [];
  if (layer.offsetX !== 0 || layer.offsetY !== 0) {
    const tx = (layer.offsetX / CANVAS_WIDTH) * 100;
    const ty = (layer.offsetY / CANVAS_HEIGHT) * 100;
    parts.push(`translate(${tx}%, ${ty}%)`);
  }
  if (layer.rotate !== 0) parts.push(`rotate(${layer.rotate}deg)`);
  return parts.length > 0 ? parts.join(' ') : undefined;
}

export function EditModeModal({ onClose }: EditModeModalProps) {
  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partTransforms = useCharacterStore((s) => s.partTransforms);
  const partColors = useCharacterStore((s) => s.partColors);
  const strokeSettings = useCharacterStore((s) => s.strokeSettings);
  const activePoseId = useCharacterStore((s) => s.activePoseId);
  const activeExpressionId = useCharacterStore((s) => s.activeExpressionId);
  const setSymmetricTransform = useCharacterStore((s) => s.setSymmetricTransform);
  const resetPartTransform = useCharacterStore((s) => s.resetPartTransform);

  const [editCategoryId, setEditCategoryId] = useState(EDITABLE_CATEGORY_LIST[0]?.id ?? 'ears');
  const [coloredLayers, setColoredLayers] = useState<ResolvedLayer[]>([]);

  const editCategory = CATEGORIES.find((c) => c.id === editCategoryId);
  const currentTransform = partTransforms[editCategoryId] ?? DEFAULT_SYMMETRIC_TRANSFORM;
  const hasSelection = selectedParts[editCategoryId] != null;

  const baseLayers = useMemo(
    () => resolveLayersForDirection(selectedParts, activePoseId, activeExpressionId, partTransforms, 'front'),
    [selectedParts, activePoseId, activeExpressionId, partTransforms]
  );

  useEffect(() => {
    let cancelled = false;

    if (baseLayers.length === 0) {
      setColoredLayers([]);
      return;
    }

    applyColorsToLayers(baseLayers, partColors, strokeSettings, selectedParts).then((result) => {
      if (!cancelled) setColoredLayers(result);
    });

    return () => {
      cancelled = true;
    };
  }, [baseLayers, partColors, strokeSettings, selectedParts]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleReset = () => {
    resetPartTransform(editCategoryId);
  };

  const isDefault =
    currentTransform.x === 0 &&
    currentTransform.y === 0 &&
    currentTransform.rotate === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative flex h-[100dvh] w-screen flex-col bg-white lg:h-auto lg:max-h-[90vh] lg:w-auto lg:min-w-[520px] lg:max-w-[600px] lg:rounded-2xl">
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

        {/* 카테고리 탭 (귀, 팔, 다리만) */}
        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200 px-4 pb-px">
          {EDITABLE_CATEGORY_LIST.map((category) => {
            const isActive = editCategoryId === category.id;
            const hasPart = selectedParts[category.id] != null;

            return (
              <button
                key={category.id}
                onClick={() => setEditCategoryId(category.id)}
                className={cn(
                  'relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors',
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
            className="relative w-full max-w-[280px] rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
            style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
          >
            {coloredLayers.map((layer) => {
              const key = `${layer.categoryId}-${layer.side ?? 'full'}`;

              if (layer.side === 'right') {
                return (
                  <div
                    key={key}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: layer.layerIndex,
                      clipPath: 'inset(0 0 0 50%)',
                      transform: buildPreviewTransform(layer),
                      transformOrigin: '50% 50%',
                    }}
                  >
                    <Image
                      src={layer.svgPath}
                      alt={layer.categoryId}
                      fill
                      unoptimized
                      className="object-contain"
                      style={{ transform: 'scaleX(-1)', transformOrigin: '50% 50%' }}
                      sizes="280px"
                      priority
                    />
                  </div>
                );
              }

              return (
                <Image
                  key={key}
                  src={layer.svgPath}
                  alt={layer.categoryId}
                  fill
                  unoptimized
                  className="object-contain"
                  style={{
                    zIndex: layer.layerIndex,
                    clipPath: layer.side === 'left' ? 'inset(0 50% 0 0)' : undefined,
                    transform: buildPreviewTransform(layer),
                    transformOrigin: '50% 50%',
                  }}
                  sizes="280px"
                  priority
                />
              );
            })}
          </div>
        </div>

        {/* 슬라이더 컨트롤 */}
        <div className="shrink-0 border-t border-gray-200 px-4 py-3">
          {!hasSelection ? (
            <p className="text-center text-sm text-gray-400">
              {editCategory?.name} 파츠를 먼저 선택하세요
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {/* X (중앙 정렬 부위는 잠금) */}
              {!X_LOCKED_CATEGORIES.includes(editCategoryId) && (
                <SliderRow
                  label="X"
                  min={-OFFSET_LIMIT}
                  max={OFFSET_LIMIT}
                  value={currentTransform.x}
                  onChange={(v) => setSymmetricTransform(editCategoryId, { x: v })}
                />
              )}
              {/* Y */}
              <SliderRow
                label="Y"
                min={-OFFSET_LIMIT}
                max={OFFSET_LIMIT}
                value={currentTransform.y}
                onChange={(v) => setSymmetricTransform(editCategoryId, { y: v })}
              />
              {/* 회전 */}
              <SliderRow
                label="회전"
                min={-ROTATION_LIMIT}
                max={ROTATION_LIMIT}
                value={currentTransform.rotate}
                onChange={(v) => setSymmetricTransform(editCategoryId, { rotate: v })}
                unit="°"
              />

              {/* 리셋 */}
              <button
                onClick={handleReset}
                disabled={isDefault}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <RotateCcw className="h-4 w-4" />
                {editCategory?.name} 전체 초기화
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

function SliderRow({
  label,
  min,
  max,
  value,
  onChange,
  unit = '',
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-right text-xs font-medium text-gray-500">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
      />
      <span className="w-12 shrink-0 text-right text-sm tabular-nums text-gray-600">
        {value}{unit}
      </span>
    </div>
  );
}
