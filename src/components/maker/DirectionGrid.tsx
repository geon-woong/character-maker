'use client';

import { useCharacterStore } from '@/stores/character-store';
import { DirectionPreview } from '@/components/maker/DirectionPreview';
import { ALL_DIRECTIONS } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

interface DirectionGridProps {
  className?: string;
}

export function DirectionGrid({ className }: DirectionGridProps) {
  const activeDirection = useCharacterStore((s) => s.activeDirection);
  const setActiveDirection = useCharacterStore((s) => s.setActiveDirection);

  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {ALL_DIRECTIONS.map((direction) => (
        <DirectionPreview
          key={direction}
          direction={direction}
          isSelected={activeDirection === direction}
          onClick={() => setActiveDirection(direction)}
        />
      ))}
    </div>
  );
}
