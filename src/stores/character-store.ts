'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CategoryId, MakerStep, SelectedParts, PartTransforms, SymmetricTransform, PartColors } from '@/types/character';
import { DEFAULT_SYMMETRIC_TRANSFORM } from '@/types/character';
import { PARTS } from '@/data/parts';
import { CATEGORIES } from '@/data/categories';
import { OFFSET_LIMIT, ROTATION_LIMIT } from '@/lib/utils/constants';

function clampSymmetricTransform(t: SymmetricTransform): SymmetricTransform {
  return {
    x: Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, t.x)),
    y: Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, t.y)),
    rotate: Math.max(-ROTATION_LIMIT, Math.min(ROTATION_LIMIT, t.rotate)),
  };
}

interface CharacterState {
  step: MakerStep;
  selectedParts: SelectedParts;
  activeCategoryId: CategoryId;
  partTransforms: PartTransforms;
  partColors: PartColors;

  setStep: (step: MakerStep) => void;
  selectPart: (categoryId: CategoryId, partId: string) => void;
  setActiveCategory: (categoryId: CategoryId) => void;
  setSymmetricTransform: (categoryId: CategoryId, updates: Partial<SymmetricTransform>) => void;
  resetPartTransform: (categoryId: CategoryId) => void;
  setPartColor: (categoryId: CategoryId, fill: string) => void;
  applyColorToAll: (fill: string) => void;
  resetPartColor: (categoryId: CategoryId) => void;
  resetAllColors: () => void;
  randomizeAll: () => void;
  resetCharacter: () => void;
  isComplete: () => boolean;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      step: 'parts',
      selectedParts: {},
      activeCategoryId: 'body',
      partTransforms: {},
      partColors: {},

      setStep: (step) => set({ step }),

      selectPart: (categoryId, partId) =>
        set((state) => ({
          selectedParts: {
            ...state.selectedParts,
            [categoryId]: partId,
          },
        })),

      setActiveCategory: (categoryId) =>
        set({ activeCategoryId: categoryId }),

      setSymmetricTransform: (categoryId, updates) => {
        set((state) => {
          const current = state.partTransforms[categoryId] ?? DEFAULT_SYMMETRIC_TRANSFORM;
          const merged: SymmetricTransform = {
            x: updates.x ?? current.x,
            y: updates.y ?? current.y,
            rotate: updates.rotate ?? current.rotate,
          };
          return {
            partTransforms: {
              ...state.partTransforms,
              [categoryId]: clampSymmetricTransform(merged),
            },
          };
        });
      },

      resetPartTransform: (categoryId) => {
        set((state) => {
          const next = { ...state.partTransforms };
          delete next[categoryId];
          return { partTransforms: next };
        });
      },

      setPartColor: (categoryId, fill) =>
        set((state) => ({
          partColors: {
            ...state.partColors,
            [categoryId]: fill,
          },
        })),

      applyColorToAll: (fill) =>
        set(() => {
          const allColors: PartColors = {};
          for (const category of CATEGORIES) {
            allColors[category.id] = fill;
          }
          return { partColors: allColors };
        }),

      resetPartColor: (categoryId) =>
        set((state) => {
          const next = { ...state.partColors };
          delete next[categoryId];
          return { partColors: next };
        }),

      resetAllColors: () =>
        set({ partColors: {} }),

      randomizeAll: () => {
        const randomized: SelectedParts = {};
        for (const category of CATEGORIES) {
          const parts = PARTS[category.id];
          if (parts && parts.length > 0) {
            const randomIndex = Math.floor(Math.random() * parts.length);
            const randomPart = parts[randomIndex];
            if (randomPart) {
              randomized[category.id] = randomPart.id;
            }
          }
        }
        set({ selectedParts: randomized, partTransforms: {}, partColors: {} });
      },

      resetCharacter: () =>
        set({
          step: 'parts',
          selectedParts: {},
          activeCategoryId: 'body',
          partTransforms: {},
          partColors: {},
        }),

      isComplete: () => {
        const { selectedParts } = get();
        return CATEGORIES
          .filter((c) => c.isRequired)
          .every((c) => selectedParts[c.id] != null);
      },
    }),
    {
      name: 'character-maker-state',
      version: 3,
      storage: createJSONStorage(() => sessionStorage),
      migrate: (persistedState, version) => {
        if (version < 2) {
          return { ...(persistedState as Record<string, unknown>), partTransforms: {}, partColors: {} };
        }
        if (version < 3) {
          return { ...(persistedState as Record<string, unknown>), partColors: {} };
        }
        return persistedState as CharacterState;
      },
      partialize: (state) => ({
        step: state.step,
        selectedParts: state.selectedParts,
        activeCategoryId: state.activeCategoryId,
        partTransforms: state.partTransforms,
        partColors: state.partColors,
      }),
    }
  )
);
