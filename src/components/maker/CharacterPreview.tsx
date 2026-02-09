'use client';

import Image from 'next/image';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayers } from '@/lib/composer/layer-order';
import { DEFAULT_POSE_ID, DEFAULT_EXPRESSION_ID, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

interface CharacterPreviewProps {
  className?: string;
}

export function CharacterPreview({ className }: CharacterPreviewProps) {
  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partOffsets = useCharacterStore((s) => s.partOffsets);

  const layers = resolveLayers(
    selectedParts,
    DEFAULT_POSE_ID,
    DEFAULT_EXPRESSION_ID,
    partOffsets
  );

  const hasAnySelection = layers.length > 0;

  return (
    <div
      className={cn(
        'relative bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden',
        className
      )}
      style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
    >
      {!hasAnySelection && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          파츠를 선택하세요
        </div>
      )}

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
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
        );
      })}
    </div>
  );
}
