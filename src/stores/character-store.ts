'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CategoryId, MakerStep, SelectedParts, PartTransforms, SymmetricTransform, PartColors, PartColor, ViewDirection, PoseId, ExpressionId, StrokeSettings, StrokeWidthId, StrokeTextureId } from '@/types/character';
import { DEFAULT_SYMMETRIC_TRANSFORM, DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR, DEFAULT_STROKE_SETTINGS } from '@/types/character';
import { PARTS } from '@/data/parts';
import { CATEGORIES } from '@/data/categories';
import { ACTION_MAP } from '@/data/poses-expressions';
import { OFFSET_LIMIT, ROTATION_LIMIT, COLORABLE_CATEGORIES, BULK_COLOR_EXCLUDED, getExclusiveSiblings } from '@/lib/utils/constants';

function clampSymmetricTransform(t: SymmetricTransform): SymmetricTransform {
  return {
    x: Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, t.x)),
    y: Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, t.y)),
    rotate: Math.max(-ROTATION_LIMIT, Math.min(ROTATION_LIMIT, t.rotate)),
  };
}

const MAX_RECENT_COLORS = 5;

function addToRecent(list: string[], color: string): string[] {
  if (list.some((c) => c.toLowerCase() === color.toLowerCase())) return list;
  return [color, ...list].slice(0, MAX_RECENT_COLORS);
}

interface CharacterState {
  step: MakerStep;
  selectedParts: SelectedParts;
  activeCategoryId: CategoryId;
  partTransforms: PartTransforms;
  partColors: PartColors;
  activeDirection: ViewDirection;
  activePoseId: PoseId;
  activeExpressionId: ExpressionId;
  activeActionId: string | null;
  strokeSettings: StrokeSettings;
  recentFillColors: string[];
  recentStrokeColors: string[];

  setStep: (step: MakerStep) => void;
  selectPart: (categoryId: CategoryId, partId: string) => void;
  setActiveCategory: (categoryId: CategoryId) => void;
  setSymmetricTransform: (categoryId: CategoryId, updates: Partial<SymmetricTransform>) => void;
  resetPartTransform: (categoryId: CategoryId) => void;
  setPartColor: (categoryId: CategoryId, color: PartColor) => void;
  applyColorToAll: (color: PartColor) => void;
  applyPalette: (colors: Partial<Record<CategoryId, PartColor>>) => void;
  resetPartColor: (categoryId: CategoryId) => void;
  resetAllColors: () => void;
  randomizeAll: () => void;
  resetCharacter: () => void;
  isComplete: () => boolean;
  setActiveDirection: (direction: ViewDirection) => void;
  setPose: (poseId: PoseId) => void;
  setExpression: (expressionId: ExpressionId) => void;
  setAction: (actionId: string) => void;
  setStrokeWidth: (widthId: StrokeWidthId) => void;
  setStrokeTexture: (textureId: StrokeTextureId) => void;
  resetStrokeSettings: () => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      step: 'parts',
      selectedParts: {},
      activeCategoryId: 'body',
      partTransforms: {},
      partColors: {},
      activeDirection: 'front',
      activePoseId: 'standing',
      activeExpressionId: 'neutral',
      activeActionId: null,
      strokeSettings: DEFAULT_STROKE_SETTINGS,
      recentFillColors: [],
      recentStrokeColors: [],

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
        set((state) => {
          const recentFillColors = color.fill.toLowerCase() !== DEFAULT_FILL_COLOR.toLowerCase()
            ? addToRecent(state.recentFillColors, color.fill)
            : state.recentFillColors;
          const recentStrokeColors = color.stroke.toLowerCase() !== DEFAULT_STROKE_COLOR.toLowerCase()
            ? addToRecent(state.recentStrokeColors, color.stroke)
            : state.recentStrokeColors;
          return {
            partColors: { ...state.partColors, [categoryId]: color },
            recentFillColors,
            recentStrokeColors,
          };
        }),

      applyColorToAll: (color) =>
        set((state) => {
          const next: PartColors = { ...state.partColors };
          for (const id of COLORABLE_CATEGORIES) {
            if (!BULK_COLOR_EXCLUDED.includes(id)) {
              next[id] = color;
            }
          }
          const recentFillColors = color.fill.toLowerCase() !== DEFAULT_FILL_COLOR.toLowerCase()
            ? addToRecent(state.recentFillColors, color.fill)
            : state.recentFillColors;
          const recentStrokeColors = color.stroke.toLowerCase() !== DEFAULT_STROKE_COLOR.toLowerCase()
            ? addToRecent(state.recentStrokeColors, color.stroke)
            : state.recentStrokeColors;
          return { partColors: next, recentFillColors, recentStrokeColors };
        }),

      applyPalette: (colors) =>
        set((state) => {
          const next: PartColors = { ...state.partColors };
          for (const [id, color] of Object.entries(colors)) {
            next[id as CategoryId] = color;
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
        set({ selectedParts: randomized, partTransforms: {}, partColors: {}, strokeSettings: DEFAULT_STROKE_SETTINGS });
      },

      resetCharacter: () =>
        set({
          step: 'parts',
          selectedParts: {},
          activeCategoryId: 'body',
          partTransforms: {},
          partColors: {},
          activeDirection: 'front',
          activePoseId: 'standing',
          activeExpressionId: 'neutral',
          activeActionId: null,
          strokeSettings: DEFAULT_STROKE_SETTINGS,
        }),

      setActiveDirection: (direction) => set({ activeDirection: direction }),

      setPose: (poseId) => set({ activePoseId: poseId, activeActionId: null }),

      setExpression: (expressionId) => set({ activeExpressionId: expressionId, activeActionId: null }),

      setAction: (actionId) => {
        const action = ACTION_MAP.get(actionId);
        if (!action) return;
        set({
          activePoseId: action.poseId,
          activeExpressionId: action.expressionId,
          activeActionId: actionId,
        });
      },

      setStrokeWidth: (widthId) =>
        set((state) => ({
          strokeSettings: { ...state.strokeSettings, widthId },
        })),

      setStrokeTexture: (textureId) =>
        set((state) => ({
          strokeSettings: { ...state.strokeSettings, textureId },
        })),

      resetStrokeSettings: () =>
        set({ strokeSettings: DEFAULT_STROKE_SETTINGS }),

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
      version: 11,
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
        if (version < 6) {
          return { ...state, activeDirection: 'front' };
        }
        if (version < 7) {
          return {
            ...state,
            activePoseId: 'standing',
            activeExpressionId: 'neutral',
            activeActionId: null,
          };
        }
        if (version < 8) {
          // v7→v8: Remove arms/legs, update ViewDirection, migrate PoseId
          const sp = (state.selectedParts ?? {}) as Record<string, unknown>;
          delete sp['arms'];
          delete sp['legs'];
          const pt = (state.partTransforms ?? {}) as Record<string, unknown>;
          delete pt['arms'];
          delete pt['legs'];
          const pc = (state.partColors ?? {}) as Record<string, unknown>;
          delete pc['arms'];
          delete pc['legs'];
          // Migrate direction: side-left/side-right → side
          const dir = state.activeDirection as string;
          const newDir = (dir === 'side-left' || dir === 'side-right') ? 'side' : dir;
          // Migrate pose: walking/running/jumping → standing
          const pose = state.activePoseId as string;
          const validPoses = ['standing', 'sitting', 'lying', 'bowing'];
          const newPose = validPoses.includes(pose) ? pose : 'standing';
          const cat = state.activeCategoryId as string;
          const newCat = (cat === 'arms' || cat === 'legs') ? 'body' : cat;
          return {
            ...state,
            selectedParts: sp,
            partTransforms: pt,
            partColors: pc,
            activeDirection: newDir,
            activePoseId: newPose,
            activeCategoryId: newCat,
            activeActionId: null,
            strokeSettings: DEFAULT_STROKE_SETTINGS,
          };
        }
        if (version < 9) {
          return { ...state, strokeSettings: DEFAULT_STROKE_SETTINGS };
        }
        // v9→v10: symmetric rendering for eyes/mouth/face2, no state changes
        if (version < 11) {
          return { ...state, recentFillColors: [], recentStrokeColors: [] };
        }
        return state as unknown as CharacterState;
      },
      partialize: (state) => ({
        step: state.step,
        selectedParts: state.selectedParts,
        activeCategoryId: state.activeCategoryId,
        partTransforms: state.partTransforms,
        partColors: state.partColors,
        activeDirection: state.activeDirection,
        activePoseId: state.activePoseId,
        activeExpressionId: state.activeExpressionId,
        activeActionId: state.activeActionId,
        strokeSettings: state.strokeSettings,
        recentFillColors: state.recentFillColors,
        recentStrokeColors: state.recentStrokeColors,
      }),
    }
  )
);
