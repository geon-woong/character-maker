'use client';

import { memo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface PartThumbnailProps {
  partId: string;
  name: string;
  thumbnailSrc: string;
  isSelected: boolean;
  onSelect: (partId: string) => void;
}

export const PartThumbnail = memo(function PartThumbnail({
  partId,
  name,
  thumbnailSrc,
  isSelected,
  onSelect,
}: PartThumbnailProps) {
  return (
    <button
      onClick={() => onSelect(partId)}
      className={cn(
        'group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3',
        'transition-all duration-150',
        isSelected
          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
      )}
      title={name}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={thumbnailSrc}
          alt={name}
          fill
          className="object-contain p-2"
          sizes="120px"
        />
      </div>
      <span className="text-xs font-medium text-gray-600 truncate w-full text-center">
        {name}
      </span>
    </button>
  );
});
