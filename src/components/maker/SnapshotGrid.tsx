'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSnapshotStore } from '@/stores/snapshot-store';
import type { SnapshotState } from '@/stores/snapshot-store';
import { useCharacterStore } from '@/stores/character-store';
import { resolveLayersForDirection } from '@/lib/composer/layer-order';
import { applyColorsToLayers } from '@/lib/color/apply-colors';
import { renderToBlob } from '@/lib/composer/canvas-renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

const THUMBNAIL_SCALE = 0.15; // 162×162px

/** 스냅샷 state로부터 썸네일 Blob URL 생성 */
async function generateThumbnail(state: SnapshotState): Promise<string> {
  const baseLayers = resolveLayersForDirection(
    state.selectedParts,
    state.activePoseId,
    state.activeExpressionId,
    state.partTransforms,
    'front',
    state.faceOffset,
    state.expressionLocks
  );
  const layers = await applyColorsToLayers(
    baseLayers,
    state.partColors,
    state.strokeSettings,
    state.selectedParts
  );
  const blob = await renderToBlob(layers, CANVAS_WIDTH, CANVAS_HEIGHT, THUMBNAIL_SCALE);
  return URL.createObjectURL(blob);
}

export function SnapshotGrid() {
  const snapshots = useSnapshotStore((s) => s.snapshots);
  const saveSnapshot = useSnapshotStore((s) => s.saveSnapshot);
  const deleteSnapshot = useSnapshotStore((s) => s.deleteSnapshot);
  const setThumbnailUrl = useSnapshotStore((s) => s.setThumbnailUrl);
  const loadSnapshot = useCharacterStore((s) => s.loadSnapshot);

  // 현재 캐릭터 상태 (저장용)
  const selectedParts = useCharacterStore((s) => s.selectedParts);
  const partTransforms = useCharacterStore((s) => s.partTransforms);
  const partColors = useCharacterStore((s) => s.partColors);
  const faceOffset = useCharacterStore((s) => s.faceOffset);
  const activePoseId = useCharacterStore((s) => s.activePoseId);
  const activeExpressionId = useCharacterStore((s) => s.activeExpressionId);
  const expressionLocks = useCharacterStore((s) => s.expressionLocks);
  const strokeSettings = useCharacterStore((s) => s.strokeSettings);

  const blobUrlsRef = useRef<Set<string>>(new Set());

  // localStorage 복원 시 썸네일 재생성
  useEffect(() => {
    for (const snap of snapshots) {
      if (!snap.thumbnailUrl) {
        generateThumbnail(snap.state).then((url) => {
          blobUrlsRef.current.add(url);
          setThumbnailUrl(snap.id, url);
        });
      }
    }
  }, [snapshots, setThumbnailUrl]);

  // cleanup blob URLs on unmount
  useEffect(() => {
    const urls = blobUrlsRef.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  const handleSave = useCallback(async () => {
    if (Object.keys(selectedParts).length === 0) {
      toast.error('저장할 캐릭터가 없습니다.');
      return;
    }

    const state: SnapshotState = {
      selectedParts,
      partTransforms,
      partColors,
      faceOffset,
      activePoseId,
      activeExpressionId,
      expressionLocks,
      strokeSettings,
    };

    try {
      const thumbnailUrl = await generateThumbnail(state);
      blobUrlsRef.current.add(thumbnailUrl);
      saveSnapshot({
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        thumbnailUrl,
        state,
      });
      toast.success('임시 저장 완료');
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    }
  }, [selectedParts, partTransforms, partColors, faceOffset, activePoseId, activeExpressionId, expressionLocks, strokeSettings, saveSnapshot]);

  const handleLoad = useCallback((state: SnapshotState) => {
    if (!window.confirm('현재 작업이 사라집니다. 불러오시겠습니까?')) return;
    loadSnapshot(state);
    toast.success('불러오기 완료');
  }, [loadSnapshot]);

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSnapshot(id);
  }, [deleteSnapshot]);

  if (snapshots.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-indigo-400 hover:text-indigo-500"
        >
          <Plus className="h-5 w-5" />
        </button>
        <span className="text-xs text-gray-400">임시 저장</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {snapshots.map((snap) => (
        <div
          key={snap.id}
          role="button"
          tabIndex={0}
          onClick={() => handleLoad(snap.state)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLoad(snap.state); }}
          className={cn(
            'group relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 transition-all',
            'hover:border-indigo-400 hover:shadow-md'
          )}
        >
          {snap.thumbnailUrl ? (
            <img
              src={snap.thumbnailUrl}
              alt="스냅샷"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
              ...
            </div>
          )}
          <button
            onClick={(e) => handleDelete(e, snap.id)}
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ))}

      {snapshots.length < 8 && (
        <button
          onClick={handleSave}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-indigo-400 hover:text-indigo-500"
        >
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
