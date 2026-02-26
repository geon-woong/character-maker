'use client';

import { Lock, Unlock } from 'lucide-react';
import { useCharacterStore } from '@/stores/character-store';
import { EXPRESSIONS } from '@/data/poses-expressions';
import { EXPRESSION_EFFECTS } from '@/data/expression-effects';
import type { CategoryId } from '@/types/character';
import { cn } from '@/lib/utils/cn';

/** Categories that have expression effects and can be locked */
const LOCKABLE_CATEGORIES = Object.keys(EXPRESSION_EFFECTS) as CategoryId[];

const CATEGORY_LABELS: Partial<Record<CategoryId, string>> = {
  eyes: '눈',
  mouth: '입',
};

export function ExpressionSelector() {
  const activeExpressionId = useCharacterStore((s) => s.activeExpressionId);
  const setExpression = useCharacterStore((s) => s.setExpression);
  const expressionLocks = useCharacterStore((s) => s.expressionLocks);
  const toggleExpressionLock = useCharacterStore((s) => s.toggleExpressionLock);

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

      {/* 카테고리별 표정 잠금 토글 */}
      <div className="flex flex-wrap gap-2">
        {LOCKABLE_CATEGORIES.map((categoryId) => {
          const isLocked = !!expressionLocks[categoryId];
          const label = CATEGORY_LABELS[categoryId] ?? categoryId;
          const Icon = isLocked ? Lock : Unlock;
          return (
            <button
              key={categoryId}
              onClick={() => toggleExpressionLock(categoryId)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                isLocked
                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <Icon className="h-3 w-3" />
              {label} 표정 {isLocked ? '잠금' : '해제'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
