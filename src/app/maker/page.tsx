'use client';

import { useState } from 'react';
import { Move } from 'lucide-react';
import { PartCategoryTabs } from '@/components/maker/PartCategoryTabs';
import { PartGrid } from '@/components/maker/PartGrid';
import { CharacterPreview } from '@/components/maker/CharacterPreview';
import { RandomizeButton } from '@/components/maker/RandomizeButton';
import { ExportButton } from '@/components/maker/ExportButton';
import { EditModeModal } from '@/components/maker/EditModeModal';
import { Button } from '@/components/ui/Button';

export default function MakerPage() {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">캐릭터 만들기</h2>
        <RandomizeButton />
      </div>

      {/* Main two-panel layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        {/* Preview first on mobile, second on desktop */}
        <div className="flex flex-col gap-4 lg:order-2">
          <CharacterPreview className="w-full lg:sticky lg:top-20" />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsEditOpen(true)}
              className="gap-2"
            >
              <Move className="h-4 w-4" />
              위치 편집
            </Button>
            <ExportButton />
          </div>
        </div>

        {/* Parts selection */}
        <div className="flex flex-col gap-4 lg:order-1">
          <PartCategoryTabs />
          <PartGrid />
        </div>
      </div>

      {isEditOpen && <EditModeModal onClose={() => setIsEditOpen(false)} />}
    </div>
  );
}
