# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a character maker web application built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4. Users can create custom characters by selecting different body parts (body, face, eyes, nose, mouth, ears) from a visual grid, preview them in real-time, and export as PNG images. Supports turnaround (direction views) and posture (pose variants) as independent features.

## Development Commands

### Development
```bash
npm run dev          # Start dev server with Turbopack at http://localhost:3000
npm run build        # Production build with static export
npm start            # Start production server (requires build first)
npm run lint         # Run ESLint
```

### Deployment
- The project uses static export (`output: 'export'` in next.config.ts)
- GitHub Actions automatically deploys to GitHub Pages on push to main
- Production URL: https://[username].github.io/character-maker
- Base path is configured via `NEXT_PUBLIC_BASE_PATH` environment variable

## Architecture

### State Management
- **Zustand** store at `src/stores/character-store.ts` manages all character state
- State is persisted to `sessionStorage` for tab-level persistence
- Key state: `selectedParts`, `activeCategoryId`, `step`, `partTransforms`, `activeDirection`, `activePoseId`

### Character Composition System
The app uses a **layer-based composition** approach:

1. **Categories** (`src/data/categories.ts`): Define body part types with explicit `layerIndex` for z-order
   - Layer order (bottom to top): body → body2 → ears → face → face2 → eyes → mouth → nose
   - Each category has Korean names and required flags

2. **Parts** (`src/data/parts.ts`): Define available assets for each category
   - Each part can have multiple variants based on pose/expression
   - Variant key pattern: `"{poseId}/{expressionId}"` or `"{poseId}/default"`
   - Some parts `variesByExpression` (eyes, mouth), others don't
   - Parts can have `directionVariants` for turnaround-specific images
   - Parts can have `positionOverrides` for direction-specific offsets (face parts)

3. **Layer Resolution** (`src/lib/composer/layer-order.ts`):
   - `resolveLayers()` converts `selectedParts` → `ResolvedLayer[]` with correct z-order
   - Editable categories (ears) are split into symmetric left/right `ResolvedLayer` pairs
   - `resolveLayersForDirection()` applies direction-specific images and position overrides

4. **Canvas Rendering** (`src/lib/composer/canvas-renderer.ts`):
   - `renderToBlob()` loads SVG/PNG images and composites them onto an HTML canvas
   - `renderToBlobWithDirection()` handles back flip; side/half-side use actual images directly

### Turnaround System (Direction Views)

Independent feature for viewing character from different angles. Uses **actual direction-specific images** instead of CSS transforms.

**ViewDirection:** `'front' | 'side' | 'half-side' | 'back'`

**How it works:**
- Parts with `directionVariants` field provide direction-specific SVG paths
- `resolveLayersForDirection()` checks `directionVariants[direction]` first
- If no direction image exists, falls back to default variant + `positionOverrides`
- Face parts (eyes, nose, mouth, face2) use `positionOverrides` for offset shifting
- Back direction: hides facial features + applies horizontal flip
- Side/half-side: NO CSS transforms — actual turnaround images are rendered directly

**Asset structure:**
```
public/assets/parts/body/turnaround/01_side.svg
public/assets/parts/body/turnaround/01_halfside.svg
```

**Key files:**
- `src/types/character.ts` — `ViewDirection` type, `directionVariants` on PartDefinition
- `src/lib/utils/constants.ts` — `HIDDEN_CATEGORIES_BY_DIRECTION`, `DIRECTION_CSS_TRANSFORMS`, `ALL_DIRECTIONS`
- `src/components/maker/DirectionPreview.tsx` — Single direction preview
- `src/components/maker/DirectionGrid.tsx` — 2x2 grid of all 4 directions

### Posture System (Pose Variants)

Independent feature for changing body pose. Uses the existing **variant key** system.

**PoseId:** `'standing' | 'sitting' | 'lying' | 'bowing'`

**How it works:**
- Body parts have `variesByPose: true` and pose-specific variant keys
- `buildVariantKey()` generates keys like `"sitting/default"`
- `resolveVariantKey()` has a fallback chain: exact → standing → neutral → first available
- Posture and turnaround are **independent** — no combined direction+pose variants needed

**Asset structure:**
```
public/assets/parts/body/posture/01_sit.svg
public/assets/parts/body/posture/01_lay.svg
public/assets/parts/body/posture/01_bow.svg
```

### Edit Mode (Symmetric Transform System)

Allows users to adjust position (X/Y) and rotation of **ears** with automatic symmetric mirroring.

**Symmetry logic:**
- X axis: Mirrored (left +X → right -X)
- Y axis: Synchronized (left Y = right Y)
- Rotation: Mirrored (left +rotate → right -rotate)

**Key files:**
- `src/lib/utils/constants.ts` — `OFFSET_LIMIT` (±20), `ROTATION_LIMIT` (±10°), `EDITABLE_CATEGORIES`
- `src/components/maker/EditModeModal.tsx` — Fullscreen modal with category tabs, sliders

### Asset Path Handling
- `withBasePath()` utility (`src/lib/utils/asset-path.ts`) handles GitHub Pages deployment
- All asset paths must be prefixed with `NEXT_PUBLIC_BASE_PATH` for subdirectory deployments
- Assets are stored in `public/assets/parts/{category}/{number}.{svg|png}`

### Component Structure
- `src/app/maker/page.tsx`: Main maker page with two-panel layout (preview + part selector)
- `src/components/maker/CharacterPreview.tsx`: Real-time preview with clip-path for sided layers
- `src/components/maker/DirectionPreview.tsx`: Direction-specific preview (turnaround)
- `src/components/maker/DirectionGrid.tsx`: 2x2 grid of all 4 direction previews
- `src/components/maker/EditModeModal.tsx`: Fullscreen edit modal (귀/입/코/눈, symmetric sliders)
- `src/components/maker/PartCategoryTabs.tsx`: Category tab bar for part selection
- `src/components/maker/PartGrid.tsx` + `PartThumbnail.tsx`: Thumbnail grid for part selection
- `src/components/maker/ExportButton.tsx`: PNG export with direction support
- `src/components/maker/RandomizeButton.tsx`: Random part selection
- `src/components/ui/`: Reusable UI primitives (Button, Card)
- `src/components/layout/`: Layout components (Header, Footer)

### Type System
All character-related types are centralized in `src/types/character.ts`:
- `CategoryId`: Union type for body part categories (body, body2, face, face2, eyes, nose, mouth, ears, ear2)
- `ViewDirection`: `'front' | 'side' | 'half-side' | 'back'`
- `PoseId`: `'standing' | 'sitting' | 'lying' | 'bowing'`
- `PartDefinition`: Part with variants, directionVariants, positionOverrides
- `ResolvedLayer`: Final layer with categoryId, layerIndex, svgPath, offsets, side?

### Constants (`src/lib/utils/constants.ts`)
- `CANVAS_WIDTH` / `CANVAS_HEIGHT`: Base canvas dimensions (1080 × 1080)
- `CANVAS_EXPORT_SCALE`: 1x (1080px default)
- `EDITABLE_CATEGORIES`: `['ears', 'mouth', 'nose', 'eyes']`
- `COLORABLE_CATEGORIES`: `['body', 'body2', 'face', 'face2', 'ears', 'nose']`

## Key Design Patterns

### Turnaround vs Posture (Independent Features)
- **Turnaround**: Direction-specific images via `directionVariants` on PartDefinition
- **Posture**: Pose-specific body via `variants` keys (e.g., `"sitting/default"`)
- These features do NOT combine — no direction+pose combo variants needed

### Part Variants
Parts support multiple variants through the `variants` object:
- Expression-varying parts (eyes, mouth): Use `"any/{expressionId}"` keys
- Pose-varying parts (body): Use `"{poseId}/default"` keys
- Static parts: Use `"any/default"` keys
- Fallback chain ensures graceful degradation when specific variants are missing

### Static Export Configuration
The Next.js config is optimized for static hosting:
- `output: 'export'` generates static HTML/CSS/JS
- `trailingSlash: true` for proper routing on static hosts
- `images.unoptimized: true` since Next.js Image optimization requires a server
- `basePath` and `assetPrefix` configured for GitHub Pages subdirectory

## Adding New Parts

1. Add image files to `public/assets/parts/{category}/`
2. Update `src/data/parts.ts` with new PartDefinition entries
3. Ensure `thumbnail` and all `variants` paths use `withBasePath()` helper
4. For turnaround: add `directionVariants` with direction-specific SVG paths
5. For posture: add pose variant keys to `variants` object
6. Follow existing ID numbering convention (e.g., '01', '02', '03')

## Adding New Categories

1. Add CategoryId to union in `src/types/character.ts`
2. Add Category definition to `CATEGORIES` array in `src/data/categories.ts` with appropriate `layerIndex`
3. Add parts array to `PARTS` object in `src/data/parts.ts`
4. If the category should support edit mode, add its id to `EDITABLE_CATEGORIES` in `src/lib/utils/constants.ts`

## Tech Stack Details

- **Next.js 15** with App Router and Turbopack
- **React 19** (client-side rendering for interactivity)
- **TypeScript** with strict mode and `noUncheckedIndexedAccess`
- **Tailwind CSS v4** (using new PostCSS-based architecture)
- **Zustand** for state management (simpler than Redux)
- **Lucide React** for icons
- **Sonner** for toast notifications
