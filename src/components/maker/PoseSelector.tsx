'use client';

import { useCharacterStore } from '@/stores/character-store';
import { POSES } from '@/data/poses-expressions';
import { cn } from '@/lib/utils/cn';

const POSE_CATEGORY_LABELS: Record<string, string> = {
  basic: '기본',
  special: '특수',
};

export function PoseSelector() {
  const activePoseId = useCharacterStore((s) => s.activePoseId);
  const setPose = useCharacterStore((s) => s.setPose);

  const grouped = new Map<string, (typeof POSES)[number][]>();
  for (const pose of POSES) {
    const list = grouped.get(pose.category) ?? [];
    list.push(pose);
    grouped.set(pose.category, list);
  }

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-gray-700">포즈</h4>
      {Array.from(grouped.entries()).map(([category, poses]) => (
        <div key={category}>
          <p className="mb-1.5 text-xs font-medium text-gray-400">
            {POSE_CATEGORY_LABELS[category] ?? category}
          </p>
          <div className="flex flex-wrap gap-2">
            {poses.map((pose) => {
              const isActive = activePoseId === pose.id;
              return (
                <button
                  key={pose.id}
                  onClick={() => setPose(pose.id)}
                  className={cn(
                    'rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {pose.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
