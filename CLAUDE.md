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
- Key state: `selectedParts` (CategoryId → partId mapping), `activeCategoryId`, `step`

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
   - Looks up the appropriate variant based on current pose/expression
   - Returns sorted array ready for rendering

4. **Canvas Rendering** (`src/lib/composer/canvas-renderer.ts`):
   - `renderToBlob()` loads SVG/PNG images and composites them onto an HTML canvas
   - Uses `CANVAS_EXPORT_SCALE` for high-quality export
   - Returns PNG Blob for download

### Asset Path Handling
- `withBasePath()` utility (`src/lib/utils/asset-path.ts`) handles GitHub Pages deployment
- All asset paths must be prefixed with `NEXT_PUBLIC_BASE_PATH` for subdirectory deployments
- Assets are stored in `public/assets/parts/{category}/{number}.{svg|png}`

### Component Structure
- `src/app/maker/page.tsx`: Main maker page with two-panel layout (preview + part selector)
- `src/components/maker/`: Specialized maker components (PartGrid, CharacterPreview, etc.)
- `src/components/ui/`: Reusable UI primitives (Button, Card)
- `src/components/layout/`: Layout components (Header, Footer)

### Type System
All character-related types are centralized in `src/types/character.ts`:
- `CategoryId`: Union type for all body part categories
- `SelectedParts`: Partial record mapping categories to selected part IDs
- `ResolvedLayer`: Final layer with categoryId, layerIndex, and svgPath
- `PartDefinition`: Defines a part with variants and metadata

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
4. Consider updating UI components if special handling is needed

## Tech Stack Details

- **Next.js 15** with App Router and Turbopack
- **React 19** (client-side rendering for interactivity)
- **TypeScript** with strict mode and `noUncheckedIndexedAccess`
- **Tailwind CSS v4** (using new PostCSS-based architecture)
- **Zustand** for state management (simpler than Redux)
- **Lucide React** for icons
- **Sonner** for toast notifications
