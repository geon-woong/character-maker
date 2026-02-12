'use client';

import { useCharacterStore } from '@/stores/character-store';
import { ACTIONS } from '@/data/poses-expressions';
import { cn } from '@/lib/utils/cn';
import type { ActionCategory } from '@/types/character';

const ACTION_CATEGORY_LABELS: Record<ActionCategory, string> = {
  basic: '기본 동작',
  emotion: '감정 동작',
  special: '특수 동작',
};

const ACTION_CATEGORY_ORDER: ActionCategory[] = ['basic', 'emotion', 'special'];

export function ActionPresetGrid() {
  const activeActionId = useCharacterStore((s) => s.activeActionId);
  const setAction = useCharacterStore((s) => s.setAction);

  const grouped = new Map<ActionCategory, typeof ACTIONS[number][]>();
  for (const action of ACTIONS) {
    const list = grouped.get(action.category) ?? [];
    list.push(action);
    grouped.set(action.category, list);
  }

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold text-gray-700">동작 프리셋</h4>
      {ACTION_CATEGORY_ORDER.map((category) => {
        const actions = grouped.get(category);
        if (!actions || actions.length === 0) return null;

        return (
          <div key={category}>
            <p className="mb-2 text-xs font-medium text-gray-400">
              {ACTION_CATEGORY_LABELS[category]}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {actions.map((action) => {
                const isActive = activeActionId === action.id;
                return (
                  <button
                    key={action.id}
                    onClick={() => setAction(action.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all',
                      isActive
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    )}
                  >
                    <span className="text-2xl">
                      {getActionEmoji(action.category)}
                    </span>
                    <span className={cn(
                      'text-xs font-medium truncate w-full text-center',
                      isActive ? 'text-indigo-700' : 'text-gray-600'
                    )}>
                      {action.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getActionEmoji(category: ActionCategory): string {
  switch (category) {
    case 'basic': return '\u{1F9CD}';
    case 'emotion': return '\u{1F60A}';
    case 'special': return '\u{2B50}';
  }
}
