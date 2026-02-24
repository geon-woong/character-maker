'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Move, RotateCcw } from 'lucide-react';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayersForDirection } from '@/lib/composer/layer-order';
import { applyColorsToLayers } from '@/lib/color/apply-colors';
import type { PoseId, ExpressionId, ResolvedLayer, FaceOffset } from '@/types/character';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FACE_MOVABLE_CATEGORIES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

interface DraggableCharacterPreviewProps {
  className?: string;
  poseId?: PoseId;
  expressionId?: ExpressionId;
}

function buildTransformStyle(
  layer: { offsetX: number; offsetY: number; rotate: number },
  scale: number
) {
  const parts: string[] = [];
  if (layer.offsetX !== 0 || layer.offsetY !== 0) {
    const tx = layer.offsetX * scale;
    const ty = layer.offsetY * scale;
    parts.push(`translate(${tx}px, ${ty}px)`);
  }
  if (layer.rotate !== 0) parts.push(`rotate(${layer.rotate}deg)`);
  return parts.length > 0 ? parts.join(' ') : undefined;
}

export function DraggableCharacterPreview({ className, poseId, expressionId }: DraggableCharacterPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const [coloredLayers, setColoredLayers] = useState<ResolvedLayer[]>([]);
  const [dragEnabled, setDragEnabled] = useState(false);

  // 드래그 상태
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initOffset: FaceOffset;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      if (width > 0) setPreviewWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partTransforms = useCharacterStore((s) => s.partTransforms);
  const partColors = useCharacterStore((s) => s.partColors);
  const faceOffset = useCharacterStore((s) => s.faceOffset);
  const strokeSettings = useCharacterStore((s) => s.strokeSettings);
  const setFaceOffset = useCharacterStore((s) => s.setFaceOffset);
  const resetFaceOffset = useCharacterStore((s) => s.resetFaceOffset);

  const effectivePoseId = poseId ?? 'standing';
  const effectiveExpressionId = expressionId ?? 'neutral';

  const baseLayers = useMemo(
    () => resolveLayersForDirection(selectedParts, effectivePoseId, effectiveExpressionId, partTransforms, 'front', faceOffset),
    [selectedParts, effectivePoseId, effectiveExpressionId, partTransforms, faceOffset]
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

  const hasAnySelection = coloredLayers.length > 0;
  const scale = useMemo(() => {
    if (!previewWidth) return 1;
    return previewWidth / CANVAS_WIDTH;
  }, [previewWidth]);

  const hasFaceOffset = faceOffset.x !== 0 || faceOffset.y !== 0;

  // 드래그 핸들러
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initOffset: { ...faceOffset },
    };
  }, [faceOffset]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = (e.clientX - dragRef.current.startX) / scale;
    const dy = (e.clientY - dragRef.current.startY) / scale;
    setFaceOffset({
      x: dragRef.current.initOffset.x + dx,
      y: dragRef.current.initOffset.y + dy,
    });
  }, [scale, setFaceOffset]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50">
      {/* 드래그 모드 토글 바 */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setDragEnabled(!dragEnabled)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
            dragEnabled
              ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <Move className="h-3.5 w-3.5" />
          위치 조정
        </button>
        {(dragEnabled && hasFaceOffset) && (
          <button
            onClick={resetFaceOffset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            초기화
          </button>
        )}
      </div>

      {/* 프리뷰 영역 */}
      <div className="py-8">
        <div
          className={cn('relative overflow-hidden', className)}
          style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
          ref={containerRef}
        >
          {!hasAnySelection && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
              파츠를 선택하세요
            </div>
          )}

          {coloredLayers.map((layer) => {
            const key = `${layer.categoryId}-${layer.layerIndex}-${layer.side ?? 'full'}`;
            const isFaceMovable = FACE_MOVABLE_CATEGORIES.includes(layer.categoryId);

            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: layer.layerIndex,
                  clipPath:
                    layer.side === 'right'
                      ? 'inset(0 0 0 50%)'
                      : layer.side === 'left'
                        ? 'inset(0 50% 0 0)'
                        : undefined,
                  transform: buildTransformStyle(layer, scale),
                  transformOrigin: '50% 50%',
                  filter: dragEnabled && isFaceMovable
                    ? 'drop-shadow(0 0 3px rgba(99, 102, 241, 0.6))'
                    : undefined,
                  transition: 'filter 0.15s ease',
                }}
              >
                <Image
                  src={layer.svgPath}
                  alt={layer.categoryId}
                  fill
                  unoptimized
                  className="object-contain"
                  style={
                    layer.side === 'right'
                      ? { transform: 'scaleX(-1)', transformOrigin: '50% 50%' }
                      : undefined
                  }
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                />
              </div>
            );
          })}

          {/* 드래그 캡처 레이어 */}
          {dragEnabled && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 9999,
                cursor: dragRef.current ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          )}
        </div>
      </div>
    </div>
  );
}
