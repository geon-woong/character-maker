'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CategoryId, MakerStep, SelectedParts, PartTransforms, SymmetricTransform, PartColors, PartColor } from '@/types/character';
import { DEFAULT_SYMMETRIC_TRANSFORM, DEFAULT_STROKE_COLOR } from '@/types/character';
import { PARTS } from '@/data/parts';
import { CATEGORIES } from '@/data/categories';
import { OFFSET_LIMIT, ROTATION_LIMIT, COLORABLE_CATEGORIES, BULK_COLOR_EXCLUDED, getExclusiveSiblings } from '@/lib/utils/constants';

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
  setPartColor: (categoryId: CategoryId, color: PartColor) => void;
  applyColorToAll: (color: PartColor) => void;
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
        set((state) => {
          const next: SelectedParts = { ...state.selectedParts, [categoryId]: partId };
          for (const id of getExclusiveSiblings(categoryId)) delete next[id];
          return { selectedParts: next };
        }),

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

      setPartColor: (categoryId, color) =>
        set((state) => ({
          partColors: {
            ...state.partColors,
            [categoryId]: color,
          },
        })),

      applyColorToAll: (color) =>
        set((state) => {
          const next: PartColors = { ...state.partColors };
          for (const id of COLORABLE_CATEGORIES) {
            if (!BULK_COLOR_EXCLUDED.includes(id)) {
              next[id] = color;
            }
          }
          return { partColors: next };
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
        const excluded = new Set<CategoryId>();
        for (const category of CATEGORIES) {
          if (excluded.has(category.id)) continue;

          const siblings = getExclusiveSiblings(category.id);
          let targetId = category.id;
          if (siblings.length > 0) {
            const group = [category.id, ...siblings];
            targetId = group[Math.floor(Math.random() * group.length)]!;
          }

          const parts = PARTS[targetId];
          if (parts && parts.length > 0) {
            const randomIndex = Math.floor(Math.random() * parts.length);
            const randomPart = parts[randomIndex];
            if (randomPart) {
              randomized[targetId] = randomPart.id;
              for (const id of getExclusiveSiblings(targetId)) excluded.add(id);
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
          .every((c) =>
            selectedParts[c.id] != null ||
            getExclusiveSiblings(c.id).some((id) => selectedParts[id] != null)
          );
      },
    }),
    {
      name: 'character-maker-state',
      version: 5,
      storage: createJSONStorage(() => sessionStorage),
      migrate: (persistedState, version) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 2) {
          return { ...state, partTransforms: {}, partColors: {} };
        }
        if (version < 3) {
          return { ...state, partColors: {} };
        }
        if (version < 4) {
          // v3→v4: partColors was string, now PartColor object
          const oldColors = (state.partColors ?? {}) as Record<string, unknown>;
          const newColors: PartColors = {};
          for (const [key, val] of Object.entries(oldColors)) {
            if (typeof val === 'string') {
              newColors[key as CategoryId] = { fill: val, stroke: DEFAULT_STROKE_COLOR };
            } else if (val && typeof val === 'object') {
              newColors[key as CategoryId] = val as PartColor;
            }
          }
          return { ...state, partColors: newColors };
        }
        // v4→v5: globalStroke removed, no migration needed
        return state as unknown as CharacterState;
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
