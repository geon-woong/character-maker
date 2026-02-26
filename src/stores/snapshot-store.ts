'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SelectedParts, PartTransforms, PartColors, FaceOffset, PoseId, ExpressionId, CategoryId, StrokeSettings } from '@/types/character';

const MAX_SNAPSHOTS = 8;

export interface SnapshotState {
  selectedParts: SelectedParts;
  partTransforms: PartTransforms;
  partColors: PartColors;
  faceOffset: FaceOffset;
  activePoseId: PoseId;
  activeExpressionId: ExpressionId;
  expressionLocks?: Partial<Record<CategoryId, boolean>>;
  strokeSettings: StrokeSettings;
}

export interface CharacterSnapshot {
  id: string;
  createdAt: number;
  thumbnailUrl: string;
  state: SnapshotState;
}

interface SnapshotStore {
  snapshots: CharacterSnapshot[];
  saveSnapshot: (snapshot: CharacterSnapshot) => void;
  deleteSnapshot: (id: string) => void;
  clearAll: () => void;
  setThumbnailUrl: (id: string, url: string) => void;
}

export const useSnapshotStore = create<SnapshotStore>()(
  persist(
    (set) => ({
      snapshots: [],

      saveSnapshot: (snapshot) => {
        set((state) => {
          const next = [snapshot, ...state.snapshots];
          if (next.length > MAX_SNAPSHOTS) next.pop();
          return { snapshots: next };
        });
      },

      deleteSnapshot: (id) => {
        set((state) => ({
          snapshots: state.snapshots.filter((s) => s.id !== id),
        }));
      },

      clearAll: () => set({ snapshots: [] }),

      setThumbnailUrl: (id, url) => {
        set((state) => ({
          snapshots: state.snapshots.map((s) =>
            s.id === id ? { ...s, thumbnailUrl: url } : s
          ),
        }));
      },
    }),
    {
      name: 'character-maker-snapshots',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        snapshots: state.snapshots.map((s) => ({
          ...s,
          thumbnailUrl: '', // Blob URL은 세션 간 유지 불가
        })),
      }),
    }
  )
);
