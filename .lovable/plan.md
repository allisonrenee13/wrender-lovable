

# Plan: Auto-Tracer + Confidence Review, Segment Eraser + Beginner Panel, Template Library

## Phase 1 — Better Auto-Tracer + Confidence Review

**types.ts**: Change `CanvasState.paths` from `string[]` to `Array<{ d: string; confidence: number }>`.

**UnifiedMapBuilder.tsx**:
- Replace `traceImageToSVGPaths` with new function (grayscale → 3-pass Gaussian blur → Sobel → threshold → DFS connected components → Douglas-Peucker → returns `{d, confidence}[]`). Accepts `sensitivity` param (default 0.65).
- Replace `generateOutlinePath` return to match new shape.
- Add `"traceReview"` to `Phase` union.
- `handleAutoTrace`: store traced paths + reference image, navigate to `traceReview`.
- New `traceReview` phase UI: image background + SVG overlay colored by confidence (green/amber/red), legend, sensitivity slider (0.2–0.95, **500ms debounce**), stats, "Looks good, continue →", "Re-trace" buttons.
- Update all path references: `handleTemplateSelect` wraps as `{d, confidence:1}`, `renderReady`/`preview` SVG uses `p.d`.

**StyleStep.tsx** — 3 references to update:
- Line 9: type `{ paths: string[] }` → `{ paths: Array<{ d: string; confidence: number }> }`
- Line 23/26: `canvasState.paths.map((p, i) => ... d={p}` → `d={p.d}`
- Line 34: unchanged (`.length` works)

**EditingCanvas.tsx**: Update any path string references to use `.d`.

## Phase 2 — Segment Eraser + Beginner Tool Panel

**MapBuilderCanvas.tsx**: Replace eraser tool handler with segment-level erasure (find nearest path within 20px → find nearest segment → remove segment → rebuild → remove if <2 segments → saveState).

**CanvasToolbar.tsx**: Redesign into grouped vertical panel — "Draw" (Pen, Erase, Pan) and "Adjust" (Smooth, Sculpt In, Sculpt Out, Node Editor). Icon + text label, filled active state, plain-English hover tooltips.

## Phase 3 — Template Library

**New `src/lib/templateLibrary.ts`**: `TemplateEntry` type, localStorage CRUD (`saveTemplate`, `getTemplates`, `togglePublic`, `deleteTemplate`) under key `wrender_templates`.

**UnifiedMapBuilder.tsx**: "Save as Template" button in traceReview panel → modal with name + public toggle → generates 200×150 thumbnail via offscreen canvas → calls `saveTemplate()`.

**TemplatePicker.tsx**: Add "My Templates" tab showing saved templates as cards (thumbnail, name, public/internal badge, toggle, delete). Click loads template.

## Files to create/modify

| File | Change |
|---|---|
| `src/components/map/builder/types.ts` | `CanvasState.paths` type |
| `src/components/map/UnifiedMapBuilder.tsx` | New tracer, traceReview phase, save-as-template, path refs |
| `src/components/map/builder/StyleStep.tsx` | 3 path references (lines 9, 23/26, 34) |
| `src/components/map/builder/EditingCanvas.tsx` | Path references |
| `src/components/map/builder/MapBuilderCanvas.tsx` | Segment eraser |
| `src/components/map/builder/CanvasToolbar.tsx` | Grouped beginner panel |
| `src/components/map/builder/TemplatePicker.tsx` | My Templates tab |
| `src/lib/templateLibrary.ts` | New — localStorage template CRUD |

