'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayers } from '@/lib/composer/layer-order';
import { renderToBlob } from '@/lib/composer/canvas-renderer';
import { downloadBlob } from '@/lib/export/download-manager';
import { CANVAS_WIDTH, CANVAS_HEIGHT, DEFAULT_POSE_ID, DEFAULT_EXPRESSION_ID } from '@/lib/utils/constants';

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partTransforms = useCharacterStore((s) => s.partTransforms);
  const isComplete = useCharacterStore((s) => s.isComplete);

  const handleExport = async () => {
    if (!isComplete()) {
      toast.error('모든 필수 파츠를 선택해주세요.');
      return;
    }

    setIsExporting(true);
    try {
      const layers = resolveLayers(
        selectedParts,
        DEFAULT_POSE_ID,
        DEFAULT_EXPRESSION_ID,
        partTransforms
      );

      const blob = await renderToBlob(layers, CANVAS_WIDTH, CANVAS_HEIGHT);
      const timestamp = Date.now();
      downloadBlob(blob, `character-${timestamp}.png`);
      toast.success('캐릭터 이미지를 다운로드했습니다!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('내보내기에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting || !isComplete()}
      className="gap-2"
      size="lg"
    >
      <Download className="h-5 w-5" />
      {isExporting ? '내보내기 중...' : 'PNG 다운로드'}
    </Button>
  );
}
