

## Plan: Pre-process Color Maps to Grayscale Before Tracing

### Problem
The current tracer detects dark lines on light backgrounds. On the Key Biscayne map, it finds roads (dark lines) but completely misses the coastline because it's a cream-to-blue color transition — not a brightness edge. The cream land area and green park areas have no dark outlines.

### Approach
Add a **color-to-grayscale preprocessing step** that runs before the existing tracer. When a color map is detected, we remap colors so that distinct regions become high-contrast black and white — turning color boundaries into brightness boundaries the existing tracer already handles.

### How It Works

```text
Upload image
    │
    ▼
Detect if color map (existing k-means, 3+ clusters)
    │
    ├── NO  → existing brightness/edge path (unchanged)
    │
    └── YES → Pre-process:
              1. k-means cluster pixels into ~6 regions
              2. Identify background cluster (most common in corners = water/blue)
              3. Set background pixels → WHITE (255)
              4. Set all other pixels → BLACK (0)
              5. Apply light Gaussian blur to smooth edges
              6. Feed this binary image into existing tracer
```

The key insight: instead of tracing color boundaries directly (which produced the dense filled result), we **flatten the image** so land=black, water=white. Then the existing edge tracer naturally picks up the coastline outline, parks, and roads all at once.

### Changes

**`src/lib/traceOutlineImage.ts`**
- Re-enable the `detectColorMap` call
- When color map detected, instead of using `colorBoundaryInk`, **modify the pixel data in-place** before the existing ink-map logic runs:
  - Use k-means results to identify the "background" cluster (largest coverage in corner pixels — typically water/ocean)
  - Set background-cluster pixels to white (R=G=B=255)
  - Set all other pixels to dark (R=G=B=40) — this makes land, parks, roads all "ink"
  - Then let the existing brightness-threshold path run on this preprocessed data
- This means the entire existing pipeline (component finding, boundary extraction, Douglas-Peucker, text filtering) runs unchanged on cleaner input
- No other files change

### Why This Is Better Than the Previous Color-Map Attempt
- Previous approach traced boundary pixels directly → produced dense filled shapes
- This approach converts the image first, then reuses the proven edge tracer → produces clean outlines just like sketches
- The coastline, park edges, and roads all become dark-on-white, which is exactly what the tracer is good at

### Result
The cream land mass outline, green park boundaries, AND existing road lines should all appear as clean black outlines — matching the style the tracer already produces for sketches.

