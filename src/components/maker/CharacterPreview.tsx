'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayersForDirection } from '@/lib/composer/layer-order';
import { applyColorsToLayers } from '@/lib/color/apply-colors';
import type { PoseId, ExpressionId, ResolvedLayer } from '@/types/character';
import { CANVAS_WIDTH, CANVAS_HEIGHT, DEFAULT_POSE_ID, DEFAULT_EXPRESSION_ID } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

interface CharacterPreviewProps {
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

export function CharacterPreview({ className, poseId, expressionId }: CharacterPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const [coloredLayers, setColoredLayers] = useState<ResolvedLayer[]>([]);

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
  const strokeSettings = useCharacterStore((s) => s.strokeSettings);

  const effectivePoseId = poseId ?? DEFAULT_POSE_ID;
  const effectiveExpressionId = expressionId ?? DEFAULT_EXPRESSION_ID;

  const baseLayers = useMemo(
    () => resolveLayersForDirection(selectedParts, effectivePoseId, effectiveExpressionId, partTransforms, 'front'),
    [selectedParts, effectivePoseId, effectiveExpressionId, partTransforms]
  );

  useEffect(() => {
    let cancelled = false;

    if (baseLayers.length === 0) {
      setColoredLayers([]);
      return;
    }

    applyColorsToLayers(baseLayers, partColors, strokeSettings).then((result) => {
      if (!cancelled) setColoredLayers(result);
    });

    return () => {
      cancelled = true;
    };
  }, [baseLayers, partColors, strokeSettings]);

  const hasAnySelection = coloredLayers.length > 0;
  const scale = useMemo(() => {
    if (!previewWidth) return 1;
    return previewWidth / CANVAS_WIDTH;
  }, [previewWidth]);

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 py-16">
      <div
        className={cn('relative overflow-hidden', className)}
        style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
        ref={containerRef}
      >
        {!hasAnySelection && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            파츠를 선택하세요
          </div>
        )}

        {coloredLayers.map((layer) => {
          const key = `${layer.categoryId}-${layer.layerIndex}-${layer.side ?? 'full'}`;

          if (layer.side === 'right') {
            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: layer.layerIndex,
                  clipPath: 'inset(0 0 0 50%)',
                  transform: buildTransformStyle(layer, scale),
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
                  sizes="(max-width: 768px) 100vw, 400px"
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
                transform: buildTransformStyle(layer, scale),
                transformOrigin: '50% 50%',
              }}
              sizes="(max-width: 768px) 100vw, 400px"
              priority
            />
          );
        })}
      </div>
    </div>
  );
}
