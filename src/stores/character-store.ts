'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CategoryId, MakerStep, SelectedParts } from '@/types/character';
import { PARTS } from '@/data/parts';
import { CATEGORIES } from '@/data/categories';

interface CharacterState {
  step: MakerStep;
  selectedParts: SelectedParts;
  activeCategoryId: CategoryId;

  setStep: (step: MakerStep) => void;
  selectPart: (categoryId: CategoryId, partId: string) => void;
  setActiveCategory: (categoryId: CategoryId) => void;
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
        set({ selectedParts: randomized });
      },

      resetCharacter: () =>
        set({
          step: 'parts',
          selectedParts: {},
          activeCategoryId: 'body',
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
      }),
    }
  )
);
