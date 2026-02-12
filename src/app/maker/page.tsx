'use client';

import { useState } from 'react';
import { Move, ArrowLeft, ArrowRight } from 'lucide-react';
import { PartCategoryTabs } from '@/components/maker/PartCategoryTabs';
import { PartGrid } from '@/components/maker/PartGrid';
import { CharacterPreview } from '@/components/maker/CharacterPreview';
import { RandomizeButton } from '@/components/maker/RandomizeButton';
import { ExportButton } from '@/components/maker/ExportButton';
import { EditModeModal } from '@/components/maker/EditModeModal';
import { ColorPalette } from '@/components/maker/ColorPalette';
import { DirectionGrid } from '@/components/maker/DirectionGrid';
import { ActionPresetGrid } from '@/components/maker/ActionPresetGrid';
import { PoseSelector } from '@/components/maker/PoseSelector';
import { ExpressionSelector } from '@/components/maker/ExpressionSelector';
import { Button } from '@/components/ui/Button';
import { useCharacterStore } from '@/stores/character-store';
import { POSE_MAP, EXPRESSION_MAP } from '@/data/poses-expressions';

export default function MakerPage() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const step = useCharacterStore((s) => s.step);
  const setStep = useCharacterStore((s) => s.setStep);
  const isComplete = useCharacterStore((s) => s.isComplete);
  const activePoseId = useCharacterStore((s) => s.activePoseId);
  const activeExpressionId = useCharacterStore((s) => s.activeExpressionId);

  // Direction step
  if (step === 'direction') {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => setStep('action')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">방향 미리보기</h2>
          <div className="w-24" />
        </div>

        <DirectionGrid />
        <div className="flex justify-center">
          <ExportButton />
        </div>
      </div>
    );
  }

  // Action step
  if (step === 'action') {
    const poseName = POSE_MAP.get(activePoseId)?.name ?? activePoseId;
    const expressionName = EXPRESSION_MAP.get(activeExpressionId)?.name ?? activeExpressionId;

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => setStep('parts')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">동작 선택</h2>
          <Button onClick={() => setStep('direction')} className="gap-2" size="lg">
            방향 미리보기
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          {/* Preview */}
          <div className="flex flex-col gap-4 lg:order-2">
            <CharacterPreview className="w-full lg:sticky lg:top-20" />
            <p className="text-center text-sm text-gray-500">
              현재: <span className="font-medium text-gray-700">{poseName}</span> / <span className="font-medium text-gray-700">{expressionName}</span>
            </p>
          </div>

          {/* Action selection */}
          <div className="flex flex-col gap-6 lg:order-1">
            <ActionPresetGrid />

            <div className="border-t border-gray-200 pt-4">
              <h3 className="mb-4 text-sm font-medium text-gray-500">직접 선택</h3>
              <div className="flex flex-col gap-4">
                <PoseSelector />
                <ExpressionSelector />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parts step (default)
  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">캐릭터 만들기</h2>
        <div className="flex gap-2">
          <RandomizeButton />
          <Button variant="secondary" onClick={() => setIsEditOpen(true)} className="gap-2">
            <Move className="h-4 w-4" />
            편집모드
          </Button>
        </div>
      </div>

      {/* Main two-panel layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        {/* Preview first on mobile, second on desktop */}
        <div className="flex flex-col gap-4 lg:order-2">
          <CharacterPreview className="w-full lg:sticky lg:top-20" />
          <div className="flex items-center gap-2">
            <ExportButton />
          </div>
        </div>

        {/* Parts selection */}
        <div className="flex flex-col gap-4 lg:order-1">
          <PartCategoryTabs />
          <PartGrid />
          <ColorPalette />
        </div>
      </div>

      {/* Next step button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setStep('action')}
          disabled={!isComplete()}
          className="gap-2"
          size="lg"
        >
          동작 선택
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {isEditOpen && <EditModeModal onClose={() => setIsEditOpen(false)} />}
    </div>
  );
}
