'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayersForDirection } from '@/lib/composer/layer-order';
import { applyColorsToLayers } from '@/lib/color/apply-colors';
import type { ResolvedLayer, ViewDirection } from '@/types/character';
import { DEFAULT_FACE_OFFSET } from '@/types/character';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DEFAULT_POSE_ID,
  DEFAULT_EXPRESSION_ID,
  DIRECTION_CSS_TRANSFORMS,
  DIRECTION_LABELS,
} from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

interface DirectionPreviewProps {
  direction: ViewDirection;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
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

export function DirectionPreview({ direction, isSelected, onClick, className }: DirectionPreviewProps) {
  const [coloredLayers, setColoredLayers] = useState<ResolvedLayer[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partTransforms = useCharacterStore((s) => s.partTransforms);
  const partColors = useCharacterStore((s) => s.partColors);
  const strokeSettings = useCharacterStore((s) => s.strokeSettings);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      if (width > 0) setContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = useMemo(() => {
    if (!containerWidth) return 1;
    return containerWidth / CANVAS_WIDTH;
  }, [containerWidth]);

  const baseLayers = useMemo(
    () => resolveLayersForDirection(selectedParts, DEFAULT_POSE_ID, DEFAULT_EXPRESSION_ID, partTransforms, direction, DEFAULT_FACE_OFFSET),
    [selectedParts, partTransforms, direction]
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

  const cssTransform = DIRECTION_CSS_TRANSFORMS[direction];

  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-xl border-2 bg-gray-50 p-2 transition-colors',
        isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300',
        className
      )}
    >
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{
          aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
          transform: cssTransform,
        }}
      >
        {coloredLayers.map((layer) => {
          const key = `${layer.categoryId}-${layer.layerIndex}-${layer.side ?? 'full'}`;

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
                sizes="300px"
              />
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-center text-sm font-medium text-gray-600">
        {DIRECTION_LABELS[direction]}
      </p>
    </div>
  );
}
