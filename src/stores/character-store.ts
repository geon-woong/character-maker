'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CategoryId, MakerStep, SelectedParts, PartTransforms, PartTransform, PartSide } from '@/types/character';
import { DEFAULT_PART_TRANSFORM } from '@/types/character';
import { PARTS } from '@/data/parts';
import { CATEGORIES } from '@/data/categories';
import { OFFSET_LIMIT, SKEW_LIMIT } from '@/lib/utils/constants';

function clampTransform(t: PartTransform): PartTransform {
  return {
    x: Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, t.x)),
    y: Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, t.y)),
    skewX: Math.max(-SKEW_LIMIT, Math.min(SKEW_LIMIT, t.skewX)),
    skewY: Math.max(-SKEW_LIMIT, Math.min(SKEW_LIMIT, t.skewY)),
  };
}

interface CharacterState {
  step: MakerStep;
  selectedParts: SelectedParts;
  activeCategoryId: CategoryId;
  partTransforms: PartTransforms;

  setStep: (step: MakerStep) => void;
  selectPart: (categoryId: CategoryId, partId: string) => void;
  setActiveCategory: (categoryId: CategoryId) => void;
  setPartTransform: (categoryId: CategoryId, side: PartSide, updates: Partial<PartTransform>) => void;
  resetPartTransform: (categoryId: CategoryId) => void;
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

      setPartTransform: (categoryId, side, updates) => {
        set((state) => {
          const current = state.partTransforms[categoryId] ?? {
            left: DEFAULT_PART_TRANSFORM,
            right: DEFAULT_PART_TRANSFORM,
          };
          const currentSide = current[side];
          const merged: PartTransform = {
            x: updates.x ?? currentSide.x,
            y: updates.y ?? currentSide.y,
            skewX: updates.skewX ?? currentSide.skewX,
            skewY: updates.skewY ?? currentSide.skewY,
          };
          return {
            partTransforms: {
              ...state.partTransforms,
              [categoryId]: {
                ...current,
                [side]: clampTransform(merged),
              },
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
        set({ selectedParts: randomized, partTransforms: {} });
      },

      resetCharacter: () =>
        set({
          step: 'parts',
          selectedParts: {},
          activeCategoryId: 'body',
          partTransforms: {},
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
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        step: state.step,
        selectedParts: state.selectedParts,
        activeCategoryId: state.activeCategoryId,
        partTransforms: state.partTransforms,
      }),
    }
  )
);
