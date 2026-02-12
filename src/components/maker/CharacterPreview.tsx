'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayers } from '@/lib/composer/layer-order';
import { applyColorsToLayers } from '@/lib/color/apply-colors';
import type { ResolvedLayer } from '@/types/character';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

interface CharacterPreviewProps {
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

export function CharacterPreview({ className }: CharacterPreviewProps) {
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
  const activePoseId = useCharacterStore((s) => s.activePoseId);
  const activeExpressionId = useCharacterStore((s) => s.activeExpressionId);

  const baseLayers = useMemo(
    () => resolveLayers(selectedParts, activePoseId, activeExpressionId, partTransforms),
    [selectedParts, activePoseId, activeExpressionId, partTransforms]
  );

  useEffect(() => {
    let cancelled = false;

    if (baseLayers.length === 0) {
      setColoredLayers([]);
      return;
    }

    applyColorsToLayers(baseLayers, partColors).then((result) => {
      if (!cancelled) setColoredLayers(result);
    });

    return () => {
      cancelled = true;
    };
  }, [baseLayers, partColors]);

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
          const clipPath =
            layer.side === 'left' ? 'inset(0 50% 0 0)' : layer.side === 'right' ? 'inset(0 0 0 50%)' : undefined;

          return (
            <Image
              key={`${layer.categoryId}-${layer.side ?? 'full'}`}
              src={layer.svgPath}
              alt={layer.categoryId}
              fill
              unoptimized
              className="object-contain"
              style={{
                zIndex: layer.layerIndex,
                clipPath,
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
