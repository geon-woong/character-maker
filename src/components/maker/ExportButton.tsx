'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayers } from '@/lib/composer/layer-order';
import { renderToBlob } from '@/lib/composer/canvas-renderer';
import { downloadBlob } from '@/lib/export/download-manager';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_EXPORT_SCALE,
  DEFAULT_POSE_ID,
  DEFAULT_EXPRESSION_ID,
} from '@/lib/utils/constants';

type ExportPresetId = 'web' | 'standard' | 'hires';

interface ExportPreset {
  id: ExportPresetId;
  label: string;
  scale: number;
}

const EXPORT_PRESETS: ExportPreset[] = [
  { id: 'standard', label: '1080px (1x)', scale: CANVAS_EXPORT_SCALE },
  { id: 'hires', label: '2160px (2x)', scale: 2 },
  { id: 'web', label: '540px (0.5x)', scale: 0.5 },
];

function formatSize(scale: number) {
  const w = Math.round(CANVAS_WIDTH * scale);
  const h = Math.round(CANVAS_HEIGHT * scale);
  return `${w}×${h}`;
}

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [presetId, setPresetId] = useState<ExportPresetId>('standard');
  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partTransforms = useCharacterStore((s) => s.partTransforms);
  const isComplete = useCharacterStore((s) => s.isComplete);

  const activePreset: ExportPreset = useMemo(
    () => EXPORT_PRESETS.find((p) => p.id === presetId) ?? EXPORT_PRESETS[1]!,
    [presetId]
  );

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

      const blob = await renderToBlob(
        layers,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        activePreset.scale
      );
      const timestamp = Date.now();
      downloadBlob(blob, `character-${timestamp}-${activePreset.id}.png`);
      toast.success('캐릭터 이미지를 다운로드했습니다!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('내보내기에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          className="h-12 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={presetId}
          onChange={(e) => setPresetId(e.target.value as ExportPresetId)}
          disabled={isExporting}
        >
          {EXPORT_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label} · {formatSize(preset.scale)}
            </option>
          ))}
        </select>
      </div>
      <Button
        onClick={handleExport}
        disabled={isExporting || !isComplete()}
        className="gap-2"
        size="lg"
      >
        <Download className="h-5 w-5" />
        {isExporting ? '내보내기 중...' : 'PNG 다운로드'}
      </Button>
    </div>
  );
}
