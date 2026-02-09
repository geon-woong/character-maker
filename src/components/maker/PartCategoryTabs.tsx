'use client';

import { cn } from '@/lib/utils/cn';
import { useCharacterStore } from '@/stores/character-store';
import { CATEGORIES } from '@/data/categories';

export function PartCategoryTabs() {
  const activeCategoryId = useCharacterStore((s) => s.activeCategoryId);
  const setActiveCategory = useCharacterStore((s) => s.setActiveCategory);
  const selectedParts = useCharacterStore((s) => s.selectedParts);

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-gray-200 pb-px">
      {CATEGORIES.map((category) => {
        const isActive = activeCategoryId === category.id;
        const hasSelection = selectedParts[category.id] != null;

        return (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              'relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'text-indigo-600'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {category.name}
            {isActive && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-600" />
            )}
            {hasSelection && !isActive && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
