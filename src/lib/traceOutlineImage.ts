import type { TracedPath } from "@/components/map/builder/types";

/**
 * K-means clustering on RGB pixel data.
 * Returns cluster centers and per-pixel cluster assignments.
 */
function kMeansRGB(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  k: number,
  maxIter: number = 10
): { centers: number[][]; labels: Int32Array } {
  const n = w * h;
  const labels = new Int32Array(n);

  // Initialize centers by sampling evenly spaced pixels
  const centers: number[][] = [];
  const step = Math.max(1, Math.floor(n / k));
  for (let i = 0; i < k; i++) {
    const idx = (i * step) % n;
    centers.push([data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]]);
  }

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign each pixel to nearest center
    let changed = 0;
    for (let i = 0; i < n; i++) {
      const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
      let bestDist = Infinity, bestC = 0;
      for (let c = 0; c < k; c++) {
        const dr = r - centers[c][0], dg = g - centers[c][1], db = b - centers[c][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bestDist) { bestDist = d; bestC = c; }
      }
      if (labels[i] !== bestC) { labels[i] = bestC; changed++; }
    }

    if (changed === 0) break;

    // Recompute centers
    const sums = Array.from({ length: k }, () => [0, 0, 0]);
    const counts = new Int32Array(k);
    for (let i = 0; i < n; i++) {
      const c = labels[i];
      sums[c][0] += data[i * 4];
      sums[c][1] += data[i * 4 + 1];
      sums[c][2] += data[i * 4 + 2];
      counts[c]++;
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        centers[c] = [sums[c][0] / counts[c], sums[c][1] / counts[c], sums[c][2] / counts[c]];
      }
    }
  }

  return { centers, labels };
}

/**
 * Detect whether the image is a color map (3+ distinct color regions with significant coverage).
 * Returns cluster labels if it is, or null if existing path should be used.
 */
function detectColorMap(
  data: Uint8ClampedArray,
  w: number,
  h: number
): Int32Array | null {
  const n = w * h;
  const k = 8;
  const { centers, labels } = kMeansRGB(data, w, h, k);

  // Count pixels per cluster
  const counts = new Int32Array(k);
  for (let i = 0; i < n; i++) counts[labels[i]]++;

  // Count clusters with >5% coverage
  const minCoverage = n * 0.05;
  let significantClusters = 0;
  for (let c = 0; c < k; c++) {
    if (counts[c] >= minCoverage) significantClusters++;
  }

  // Also check color variance between significant clusters
  if (significantClusters >= 3) {
    // Verify the clusters are actually different colors (not just brightness variations)
    const sigCenters = centers.filter((_, i) => counts[i] >= minCoverage);
    let maxColorDist = 0;
    for (let i = 0; i < sigCenters.length; i++) {
      for (let j = i + 1; j < sigCenters.length; j++) {
        const dr = sigCenters[i][0] - sigCenters[j][0];
        const dg = sigCenters[i][1] - sigCenters[j][1];
        const db = sigCenters[i][2] - sigCenters[j][2];
        maxColorDist = Math.max(maxColorDist, Math.sqrt(dr * dr + dg * dg + db * db));
      }
    }
    // Need at least some color difference (not just brightness)
    if (maxColorDist > 60) {
      console.log(`[tracer] Color map detected: ${significantClusters} clusters, max color dist ${maxColorDist.toFixed(0)}`);
      return labels;
    }
  }

  return null;
}

/**
 * Build ink map from color-region boundaries.
 * A pixel is ink if any of its 4-neighbors belongs to a different cluster.
 */
function colorBoundaryInk(labels: Int32Array, w: number, h: number): Uint8Array {
  // Step 1: find raw 1px boundaries
  const raw = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const c = labels[idx];
      if (
        labels[idx - 1] !== c ||
        labels[idx + 1] !== c ||
        labels[idx - w] !== c ||
        labels[idx + w] !== c
      ) {
        raw[idx] = 1;
      }
    }
  }

  // Step 2: dilate by 2px to connect nearby boundary fragments
  const ink = new Uint8Array(w * h);
  const radius = 2;
  for (let y = radius; y < h - radius; y++) {
    for (let x = radius; x < w - radius; x++) {
      if (!raw[y * w + x]) continue;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          ink[(y + dy) * w + (x + dx)] = 1;
        }
      }
    }
  }
  return ink;
}

// --- Self-contained outline tracer with color-map support ---
export function traceOutlineImage(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  sensitivity: number
): TracedPath[] {
  const ctx = canvas.getContext("2d")!;
  const { data } = ctx.getImageData(0, 0, w, h);

  // === Color map detection ===
  const colorLabels = detectColorMap(data, w, h);
  const isColorMap = colorLabels !== null;

  let ink: Uint8Array;

  if (isColorMap) {
    // Color map path: use region boundaries as ink
    ink = colorBoundaryInk(colorLabels, w, h);
  } else {
    // === EXISTING path (unchanged) ===
    // 1. Build binary ink map with multi-tone detection
    let threshold = Math.round(240 - sensitivity * 80);

    const nonWhiteBrightness: number[] = [];
    const sampleStep = Math.max(1, Math.floor((w * h) / 1000));
    for (let i = 0; i < w * h; i += sampleStep) {
      const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
      if (r <= 240 || g <= 240 || b <= 240) {
        nonWhiteBrightness.push((r + g + b) / 3);
      }
    }
    if (nonWhiteBrightness.length > 10) {
      const mean = nonWhiteBrightness.reduce((a, b) => a + b, 0) / nonWhiteBrightness.length;
      const variance = nonWhiteBrightness.reduce((a, b) => a + (b - mean) ** 2, 0) / nonWhiteBrightness.length;
      const stddev = Math.sqrt(variance);
      if (stddev > 30) threshold = 220;
    }

    const corners = [
      [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
      [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 1],
      [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)]
    ];
    let cornerBrightnessSum = 0, colorVarSum = 0;
    for (const [cx, cy] of corners) {
      const ci = (cy * w + cx) * 4;
      const r = data[ci], g = data[ci + 1], b = data[ci + 2];
      cornerBrightnessSum += (r + g + b) / 3;
      colorVarSum += Math.max(r, g, b) - Math.min(r, g, b);
    }
    const avgCornerBrightness = cornerBrightnessSum / corners.length;
    const colorVar = colorVarSum / corners.length;
    const isColoredBackground = avgCornerBrightness < 220 && colorVar > 30;

    ink = new Uint8Array(w * h);
    if (isColoredBackground) {
      for (let i = 0; i < w * h; i++) {
        const x = i % w, y = Math.floor(i / w);
        if (x === 0 || x === w - 1 || y === 0 || y === h - 1) { ink[i] = 0; continue; }
        let maxDiff = 0;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
          const ni = ((y + dy) * w + (x + dx)) * 4;
          const diff = Math.abs(data[i * 4] - data[ni]) + Math.abs(data[i * 4 + 1] - data[ni + 1]) + Math.abs(data[i * 4 + 2] - data[ni + 2]);
          if (diff > maxDiff) maxDiff = diff;
        }
        ink[i] = maxDiff > Math.round(80 - sensitivity * 50) ? 1 : 0;
      }
    } else {
      for (let i = 0; i < w * h; i++) {
        const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
        const brightness = (r + g + b) / 3;
        const isBackground = brightness > threshold;
        const isWhite = r > 240 && g > 240 && b > 240;
        ink[i] = (!isBackground && !isWhite) ? 1 : 0;
      }
    }
  }

  // 2. Zero out border to remove image frame artifacts
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (x < 6 || x >= w - 6 || y < 6 || y >= h - 6)
        ink[y * w + x] = 0;

  // 3. Find connected ink components via DFS
  const visited = new Uint8Array(w * h);
  const DIRS8: Array<[number, number]> = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  const components: Array<Array<[number, number]>> = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!ink[idx] || visited[idx]) continue;
      const comp: Array<[number, number]> = [];
      const stack: Array<[number, number]> = [[x, y]];
      visited[idx] = 1;
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        comp.push([cx, cy]);
        for (const [dx, dy] of DIRS8) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const ni = ny * w + nx;
          if (ink[ni] && !visited[ni]) { visited[ni] = 1; stack.push([nx, ny]); }
        }
      }
      components.push(comp);
    }
  }

  // 4. Min component size based on sensitivity
  // For color maps, use a smaller min size to capture road edges etc.
  const minSize = isColorMap
    ? Math.round((1 - sensitivity) * 50) + 4
    : Math.round((1 - sensitivity) * 150) + 8;
  const significant = components
    .filter(c => c.length >= minSize)
    .sort((a, b) => b.length - a.length)
    .slice(0, 500);

  // 4b. Filter out likely text/letter components
  const filteredSignificant = significant.filter(comp => {
    const xs = comp.map(([x]) => x);
    const ys = comp.map(([, y]) => y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const bboxW = maxX - minX, bboxH = maxY - minY;
    const bboxArea = bboxW * bboxH;
    const imageArea = w * h;

    // For color maps, keep large features only (coastlines, major roads)
    if (isColorMap) {
      // After dilation, real features are large; filter small noise aggressively
      if (comp.length < imageArea * 0.003) return false;
      return true;
    }

    if (comp.length < imageArea * 0.002) {
      const fillRatio = comp.length / (bboxArea || 1);
      if (fillRatio < 0.35) return false;
    }
    const aspectRatio = bboxW > 0 && bboxH > 0 ? Math.max(bboxW, bboxH) / Math.min(bboxW, bboxH) : 999;
    const isSmall = bboxW < w * 0.06 && bboxH < h * 0.08;
    if (isSmall && aspectRatio < 2.5) return false;
    if (bboxW < w * 0.02 && bboxH < h * 0.06) return false;
    const longAxis = Math.max(bboxW, bboxH);
    const shortAxis = Math.min(bboxW, bboxH);
    const elongationRatio = longAxis / (shortAxis || 1);
    const pixelDensityAlongLongAxis = comp.length / (longAxis || 1);
    if (elongationRatio > 4 && pixelDensityAlongLongAxis < 8) return false;
    const centroidX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const centroidY = ys.reduce((a, b) => a + b, 0) / ys.length;
    const isNearEdge = centroidX < w * 0.15 || centroidX > w * 0.85 || centroidY < h * 0.15 || centroidY > h * 0.85;
    if (isNearEdge && comp.length < imageArea * 0.005) return false;
    return true;
  });

  // For color maps, allow up to 80 components; for colored bg (old path), cap at 8; otherwise keep all
  const finalSignificant = isColorMap
    ? filteredSignificant.slice(0, 80)
    : filteredSignificant;

  // 5. For each component, find boundary pixels only
  function getBoundary(comp: Array<[number, number]>): Array<[number, number]> {
    const compSet = new Set(comp.map(([x, y]) => y * w + x));
    return comp.filter(([x, y]) => {
      return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(
        ([nx, ny]) => nx < 0 || nx >= w || ny < 0 || ny >= h || !compSet.has(ny * w + nx)
      );
    });
  }

  // 6. Order boundary pixels into a walk, Douglas-Peucker simplify
  function orderPoints(pts: Array<[number, number]>): Array<[number, number]> {
    if (pts.length === 0) return [];
    const remaining = new Set(pts.map((_, i) => i));
    const result: Array<[number, number]> = [pts[0]];
    remaining.delete(0);
    while (remaining.size > 0) {
      const [lx, ly] = result[result.length - 1];
      let bestDist = Infinity, bestIdx = -1;
      for (const i of remaining) {
        const dx = pts[i][0] - lx, dy = pts[i][1] - ly;
        const d = dx * dx + dy * dy;
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      }
      if (bestDist > 400) break; // larger gap tolerance for complex boundaries
      result.push(pts[bestIdx]);
      remaining.delete(bestIdx);
    }
    return result;
  }

  function douglasPeucker(pts: Array<[number, number]>, eps: number): Array<[number, number]> {
    if (pts.length <= 2) return pts;
    const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
    const dx = bx - ax, dy = by - ay, len = Math.sqrt(dx * dx + dy * dy);
    let maxD = 0, maxI = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = len === 0
        ? Math.sqrt((pts[i][0] - ax) ** 2 + (pts[i][1] - ay) ** 2)
        : Math.abs((pts[i][1] - ay) * dx - (pts[i][0] - ax) * dy) / len;
      if (d > maxD) { maxD = d; maxI = i; }
    }
    if (maxD > eps) return [
      ...douglasPeucker(pts.slice(0, maxI + 1), eps).slice(0, -1),
      ...douglasPeucker(pts.slice(maxI), eps)
    ];
    return [pts[0], pts[pts.length - 1]];
  }

  const paths: TracedPath[] = [];
  for (const comp of finalSignificant) {
    // For color maps, the component IS already boundary pixels (dilated), skip getBoundary
    const boundary = isColorMap ? comp : getBoundary(comp);
    if (boundary.length < 4) continue;
    const ordered = orderPoints(boundary);
    const eps = sensitivity > 0.75 ? 0.4 : 0.7;
    const simplified = douglasPeucker(ordered, eps);
    if (simplified.length < 3) continue;
    let d = `M ${simplified[0][0]} ${simplified[0][1]}`;
    for (let i = 1; i < simplified.length; i++)
      d += ` L ${simplified[i][0]} ${simplified[i][1]}`;
    if (comp.length > 500) d += " Z";
    paths.push({ d, confidence: Math.min(1, comp.length / 2000) });
  }

  console.log(`[tracer] ${isColorMap ? 'COLOR MAP' : 'standard'} mode: found ${paths.length} paths from ${finalSignificant.length} components (${significant.length - finalSignificant.length} filtered out)`);
  return paths;
}
