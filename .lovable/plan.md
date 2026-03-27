

## Plan: Enhance Trace Tool for Color Maps

### Problem
The current `traceOutlineImage` function works well for black-and-white sketches and simple outlines but fails on color maps like the uploaded Key Biscayne image. These maps use distinct color regions (blue water, green parks, yellow/tan land, white roads) rather than ink-on-white outlines. The current colored-background branch caps at 8 components and uses simple gradient-based edge detection that loses most detail.

### Approach
Add a **color-segmentation pre-processing step** before the existing tracer runs. When the image is detected as a color map, we quantize it into distinct color regions, then convert each region boundary into ink pixels. This feeds into the existing component-finding and path-generation pipeline unchanged.

### Changes

**1. Extract `traceOutlineImage` into a shared utility file**
- Create `src/lib/traceOutlineImage.ts` with the function extracted from both `UnifiedMapBuilder.tsx` and `MapPage.tsx`
- Both files will import from this shared location (eliminates the duplicated ~220-line function)

**2. Add color map detection + quantization preprocessing**
Inside `traceOutlineImage`, before the ink-map step:
- **Detect color map**: Sample pixels across the image. If there are 3+ distinct color clusters (using simple k-means with k=6-8 on RGB), and the image has low overall edge density but high color variance, classify it as a "color map"
- **Quantize**: Assign each pixel to its nearest cluster center
- **Region boundaries**: Mark pixels where adjacent pixels belong to different clusters as ink=1. This captures all color-region boundaries (coastlines, park edges, road boundaries)
- **Merge with existing**: The ink map then flows into the existing component-finding, boundary-extraction, and Douglas-Peucker simplification pipeline

**3. Adjust filtering parameters for color maps**
- Raise the component cap from 8 to 80 for color maps (street maps have many small road segments)
- Lower the text-filter thresholds slightly since color maps have more legitimate small features
- Keep existing sensitivity slider working (controls quantization granularity for color maps)

**4. Keep all existing behavior unchanged**
- The new code path only activates when the color-cluster detection triggers (3+ distinct color regions with sufficient pixel coverage)
- Black-and-white images, sketches, and current "colored background" edge-detection all remain as-is
- No changes to the trace review UI, sensitivity slider, or manual trace flow

### Technical Detail

```text
Image uploaded
    │
    ▼
Sample ~1000 pixels ──► k-means (k=8) on RGB
    │
    ├── < 3 clusters with >5% coverage ──► EXISTING path (brightness/edge)
    │
    └── >= 3 clusters ──► COLOR MAP path
            │
            ▼
        Assign each pixel to nearest cluster
            │
            ▼
        Mark boundary pixels (neighbor in different cluster) as ink=1
            │
            ▼
        Feed ink[] into EXISTING component finder + path builder
        (with raised component cap: 80 instead of 8)
```

### Files Modified
- **New**: `src/lib/traceOutlineImage.ts` — shared tracer with color-map enhancement
- **Edit**: `src/components/map/UnifiedMapBuilder.tsx` — remove inline `traceOutlineImage`, import from shared lib
- **Edit**: `src/pages/MapPage.tsx` — remove inline `traceOutlineImage`, import from shared lib

