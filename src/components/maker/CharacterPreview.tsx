'use client';

import Image from 'next/image';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayers } from '@/lib/composer/layer-order';
import { DEFAULT_POSE_ID, DEFAULT_EXPRESSION_ID, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

interface CharacterPreviewProps {
  className?: string;
}

function buildTransformStyle(layer: { offsetX: number; offsetY: number; skewX: number; skewY: number }) {
  const parts: string[] = [];
  if (layer.offsetX !== 0 || layer.offsetY !== 0) {
    const tx = (layer.offsetX / CANVAS_WIDTH) * 100;
    const ty = (layer.offsetY / CANVAS_HEIGHT) * 100;
    parts.push(`translate(${tx}%, ${ty}%)`);
  }
  if (layer.skewX !== 0) parts.push(`skewX(${layer.skewX}deg)`);
  if (layer.skewY !== 0) parts.push(`skewY(${layer.skewY}deg)`);
  return parts.length > 0 ? parts.join(' ') : undefined;
}

export function CharacterPreview({ className }: CharacterPreviewProps) {
  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partTransforms = useCharacterStore((s) => s.partTransforms);

  const layers = resolveLayers(
    selectedParts,
    DEFAULT_POSE_ID,
    DEFAULT_EXPRESSION_ID,
    partTransforms
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
        const clipPath = layer.side === 'left'
          ? 'inset(0 50% 0 0)'
          : layer.side === 'right'
            ? 'inset(0 0 0 50%)'
            : undefined;

        return (
          <Image
            key={`${layer.categoryId}-${layer.side ?? 'full'}-${layer.svgPath}`}
            src={layer.svgPath}
            alt={layer.categoryId}
            fill
            className="object-contain"
            style={{
              zIndex: layer.layerIndex,
              clipPath,
              transform: buildTransformStyle(layer),
            }}
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
        );
      })}
    </div>
  );
}
