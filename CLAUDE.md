# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a character maker web application built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4. Users can create custom characters by selecting different body parts (body, face, eyes, nose, mouth, ears, arms, legs) from a visual grid, preview them in real-time, and export as PNG images.

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
- Key state: `selectedParts`, `activeCategoryId`, `step`, `partTransforms`

### Character Composition System
The app uses a **layer-based composition** approach:

1. **Categories** (`src/data/categories.ts`): Define body part types with explicit `layerIndex` for z-order
   - Layer order (bottom to top): legs → arms → body → ears → face → eyes → nose → mouth
   - Each category has Korean names and required flags

2. **Parts** (`src/data/parts.ts`): Define available assets for each category
   - Each part can have multiple variants based on pose/expression
   - Variant key pattern: `"{poseId}/{expressionId}"` or `"{poseId}/default"`
   - Some parts `variesByExpression` (eyes, mouth), others don't

3. **Layer Resolution** (`src/lib/composer/layer-order.ts`):
   - `resolveLayers()` converts `selectedParts` → `ResolvedLayer[]` with correct z-order
   - Editable categories (ears, arms, legs) are split into symmetric left/right `ResolvedLayer` pairs
   - Non-editable categories produce a single layer
   - Accepts optional `partTransforms` for symmetric offset/rotation data

4. **Canvas Rendering** (`src/lib/composer/canvas-renderer.ts`):
   - `renderToBlob()` loads SVG/PNG images and composites them onto an HTML canvas
   - Layers with `side` are clipped to left/right half via `ctx.rect()` + `ctx.clip()`
   - Layers with transforms use `ctx.save/translate/rotate/restore` for offset + rotation
   - Uses `CANVAS_EXPORT_SCALE` for high-quality export
   - Returns PNG Blob for download

### Edit Mode (Symmetric Transform System)

Allows users to adjust position (X/Y) and rotation of **ears, arms, legs** with automatic symmetric mirroring — both sides are controlled simultaneously.

**Symmetry logic:**
- X axis: Mirrored (left +X → right -X) — maintains symmetric distance from center
- Y axis: Synchronized (left Y = right Y) — same vertical direction
- Rotation: Mirrored (left +rotate → right -rotate) — symmetric angle

**Key files:**
- `src/types/character.ts` — `SymmetricTransform`, `PartTransforms` types
- `src/lib/utils/constants.ts` — `OFFSET_LIMIT` (±200), `ROTATION_LIMIT` (±30°), `EDITABLE_CATEGORIES`
- `src/stores/character-store.ts` — `partTransforms` state, `setSymmetricTransform(categoryId, updates)`, `resetPartTransform(categoryId)`
- `src/components/maker/EditModeModal.tsx` — Fullscreen modal with category tabs (귀/팔/다리), 3 sliders (X, Y, 회전)

**Data flow:**
```
EditModeModal (slider change)
  → setSymmetricTransform(categoryId, { x?, y?, rotate? })
  → store.partTransforms updated (single SymmetricTransform per category)
  → resolveLayers() derives mirrored left/right ResolvedLayers
  → CharacterPreview renders with CSS clip-path + rotate transform
  → renderToBlob() exports with canvas clip + ctx.rotate()
```

**Left/Right split (clip-path approach):**
- Same image rendered twice — once clipped to left 50%, once to right 50%
- CSS: `clip-path: inset(0 50% 0 0)` (left) / `inset(0 0 0 50%)` (right)
- Canvas: `ctx.rect(0, 0, w/2, h)` + `ctx.clip()` (left) / `ctx.rect(w/2, 0, w/2, h)` (right)
- Each half gets its own mirrored transform (offset + rotation)

**Transform types:**
```typescript
interface SymmetricTransform { x: number; y: number; rotate: number }
type PartTransforms = Partial<Record<CategoryId, SymmetricTransform>>
```

### Asset Path Handling
- `withBasePath()` utility (`src/lib/utils/asset-path.ts`) handles GitHub Pages deployment
- All asset paths must be prefixed with `NEXT_PUBLIC_BASE_PATH` for subdirectory deployments
- Assets are stored in `public/assets/parts/{category}/{number}.{svg|png}`

### Component Structure
- `src/app/maker/page.tsx`: Main maker page with two-panel layout (preview + part selector) + edit mode button/modal
- `src/components/maker/CharacterPreview.tsx`: Real-time preview with clip-path + CSS transform for sided layers
- `src/components/maker/EditModeModal.tsx`: Fullscreen edit modal (귀/팔/다리 only, symmetric X/Y/Rotation sliders)
- `src/components/maker/PartCategoryTabs.tsx`: Category tab bar for part selection
- `src/components/maker/PartGrid.tsx` + `PartThumbnail.tsx`: Thumbnail grid for part selection
- `src/components/maker/ExportButton.tsx`: PNG export with transform support
- `src/components/maker/RandomizeButton.tsx`: Random part selection
- `src/components/ui/`: Reusable UI primitives (Button, Card)
- `src/components/layout/`: Layout components (Header, Footer)

### Type System
All character-related types are centralized in `src/types/character.ts`:
- `CategoryId`: Union type for all body part categories
- `SelectedParts`: Partial record mapping categories to selected part IDs
- `SymmetricTransform`: Position (x, y) + rotation for symmetric editing
- `PartTransforms`: Partial record mapping CategoryId → SymmetricTransform
- `ResolvedLayer`: Final layer with categoryId, layerIndex, svgPath, offsetX/Y, rotate, side?
- `PartDefinition`: Defines a part with variants and metadata

### Constants (`src/lib/utils/constants.ts`)
- `CANVAS_WIDTH` / `CANVAS_HEIGHT`: Base canvas dimensions (703.09 × 1029.04)
- `CANVAS_EXPORT_SCALE`: 2x for retina export
- `DEFAULT_POSE_ID` / `DEFAULT_EXPRESSION_ID`: Hardcoded MVP values
- `OFFSET_LIMIT`: ±200px max offset for part transforms
- `ROTATION_LIMIT`: ±30° max rotation for part transforms
- `EDITABLE_CATEGORIES`: `['ears', 'arms', 'legs']` — categories that support edit mode

## Key Design Patterns

### Pose & Expression System (MVP)
Currently hardcoded to single values:
- Pose: `'standing'` only
- Expression: `'neutral'` only

Future extensions would add more poses/expressions and update the variant resolution logic.

### Part Variants
Parts support multiple variants through the `variants` object:
- Expression-varying parts (eyes, mouth): Use `"{poseId}/{expressionId}"` keys
- Static parts: Use `"{poseId}/default"` keys
- This allows future expansion to multiple expressions without refactoring

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
4. Follow existing ID numbering convention (e.g., '01', '02', '03')

## Adding New Categories

1. Add CategoryId to union in `src/types/character.ts`
2. Add Category definition to `CATEGORIES` array in `src/data/categories.ts` with appropriate `layerIndex`
3. Add parts array to `PARTS` object in `src/data/parts.ts`
4. If the category should support edit mode, add its id to `EDITABLE_CATEGORIES` in `src/lib/utils/constants.ts`

## Making a Category Editable (Edit Mode)

To add a new category to the edit mode system:
1. Add the CategoryId to `EDITABLE_CATEGORIES` array in `src/lib/utils/constants.ts`
2. The layer resolver will automatically split it into left/right layers
3. The EditModeModal will show it as a tab
4. Both preview (CSS clip-path) and export (canvas clip) handle it automatically

## Tech Stack Details

- **Next.js 15** with App Router and Turbopack
- **React 19** (client-side rendering for interactivity)
- **TypeScript** with strict mode and `noUncheckedIndexedAccess`
- **Tailwind CSS v4** (using new PostCSS-based architecture)
- **Zustand** for state management (simpler than Redux)
- **Lucide React** for icons
- **Sonner** for toast notifications
