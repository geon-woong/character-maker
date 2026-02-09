'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CategoryId, MakerStep, SelectedParts, PartOffsets } from '@/types/character';
import { PARTS } from '@/data/parts';
import { CATEGORIES } from '@/data/categories';
import { OFFSET_LIMIT } from '@/lib/utils/constants';

interface CharacterState {
  step: MakerStep;
  selectedParts: SelectedParts;
  activeCategoryId: CategoryId;
  partOffsets: PartOffsets;

  setStep: (step: MakerStep) => void;
  selectPart: (categoryId: CategoryId, partId: string) => void;
  setActiveCategory: (categoryId: CategoryId) => void;
  setPartOffset: (categoryId: CategoryId, x: number, y: number) => void;
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
      partOffsets: {},

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

      setPartOffset: (categoryId, x, y) => {
        const clampedX = Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, x));
        const clampedY = Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, y));
        set((state) => ({
          partOffsets: {
            ...state.partOffsets,
            [categoryId]: { x: clampedX, y: clampedY },
          },
        }));
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
        set({ selectedParts: randomized, partOffsets: {} });
      },

      resetCharacter: () =>
        set({
          step: 'parts',
          selectedParts: {},
          activeCategoryId: 'body',
          partOffsets: {},
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
        partOffsets: state.partOffsets,
      }),
    }
  )
);
