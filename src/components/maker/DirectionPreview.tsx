'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayersForDirection } from '@/lib/composer/layer-order';
import { applyColorsToLayers } from '@/lib/color/apply-colors';
import type { ResolvedLayer, ViewDirection } from '@/types/character';
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

  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partTransforms = useCharacterStore((s) => s.partTransforms);
  const partColors = useCharacterStore((s) => s.partColors);
  const strokeSettings = useCharacterStore((s) => s.strokeSettings);

  const baseLayers = useMemo(
    () => resolveLayersForDirection(selectedParts, DEFAULT_POSE_ID, DEFAULT_EXPRESSION_ID, partTransforms, direction),
    [selectedParts, partTransforms, direction]
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
        className="relative overflow-hidden"
        style={{
          aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
          transform: cssTransform,
        }}
      >
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
                  transform: buildTransformStyle(layer, 1),
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
                  sizes="300px"
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
                transform: buildTransformStyle(layer, 1),
                transformOrigin: '50% 50%',
              }}
              sizes="300px"
            />
          );
        })}
      </div>
      <p className="mt-1 text-center text-sm font-medium text-gray-600">
        {DIRECTION_LABELS[direction]}
      </p>
    </div>
  );
}
