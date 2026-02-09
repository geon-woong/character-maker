'use client';

import { useCharacterStore } from '@/stores/character-store';
import { PARTS } from '@/data/parts';
import { PartThumbnail } from './PartThumbnail';

export function PartGrid() {
  const activeCategoryId = useCharacterStore((s) => s.activeCategoryId);
  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const selectPart = useCharacterStore((s) => s.selectPart);

  const categoryParts = PARTS[activeCategoryId] ?? [];
  const selectedPartId = selectedParts[activeCategoryId];

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4">
      {categoryParts.map((part) => (
        <PartThumbnail
          key={part.id}
          partId={part.id}
          name={part.name}
          thumbnailSrc={part.thumbnail}
          isSelected={selectedPartId === part.id}
          onSelect={(id) => selectPart(activeCategoryId, id)}
        />
      ))}
    </div>
  );
}
