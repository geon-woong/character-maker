'use client';

import { useCharacterStore } from '@/stores/character-store';
import { EXPRESSIONS } from '@/data/poses-expressions';
import { cn } from '@/lib/utils/cn';

export function ExpressionSelector() {
  const activeExpressionId = useCharacterStore((s) => s.activeExpressionId);
  const setExpression = useCharacterStore((s) => s.setExpression);

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-gray-700">표정</h4>
      <div className="flex flex-wrap gap-2">
        {EXPRESSIONS.map((expression) => {
          const isActive = activeExpressionId === expression.id;
          return (
            <button
              key={expression.id}
              onClick={() => setExpression(expression.id)}
              className={cn(
                'rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              {expression.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
