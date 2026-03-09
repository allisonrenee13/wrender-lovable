import { useState, useRef } from "react";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Eraser, MapPin, SlidersHorizontal, Eye, EyeOff, Trash2, X, LayoutTemplate, Scan, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import MapBuilderCanvas, { type MapCanvasHandle } from "@/components/map/builder/MapBuilderCanvas";
import TemplatePicker from "@/components/map/builder/TemplatePicker";
import StylePreferencesPanel from "@/components/map/builder/StylePreferencesPanel";
import { defaultStylePreferences } from "@/components/map/builder/types";
import type { ShapeTool, StylePreferences, MapTemplate, TracedPath } from "@/components/map/builder/types";

type CanvasTool = "pen" | "eraser" | null;

// Custom Trace icon - T with wavy top
const TraceIcon = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
    <line x1="9" y1="5" x2="9" y2="16" />
    <path d="M3 5 Q5 3 7 5 Q8 6.5 9 5 Q10 3.5 11 5 Q13 7 15 5" />
  </svg>
);

// --- Self-contained outline tracer (copied from UnifiedMapBuilder) ---
function traceOutlineImage(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  sensitivity: number
): TracedPath[] {
  const ctx = canvas.getContext("2d")!;
  const { data } = ctx.getImageData(0, 0, w, h);

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

  const ink = new Uint8Array(w * h);
  if (isColoredBackground) {
    for (let i = 0; i < w * h; i++) {
      const x = i % w, y = Math.floor(i / w);
      if (x === 0 || x === w - 1 || y === 0 || y === h - 1) { ink[i] = 0; continue; }
      let maxDiff = 0;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
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

  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (x < 6 || x >= w - 6 || y < 6 || y >= h - 6)
        ink[y * w + x] = 0;

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

  const minSize = Math.round((1 - sensitivity) * 150) + 8;
  const significant = components.filter(c => c.length >= minSize).sort((a, b) => b.length - a.length).slice(0, 300);

  const filteredSignificant = significant.filter(comp => {
    const xs = comp.map(([x]) => x);
    const ys = comp.map(([, y]) => y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const bboxW = maxX - minX, bboxH = maxY - minY;
    const bboxArea = bboxW * bboxH;
    const imageArea = w * h;
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

  const finalSignificant = isColoredBackground ? filteredSignificant.slice(0, 8) : filteredSignificant;

  function getBoundary(comp: Array<[number, number]>): Array<[number, number]> {
    const compSet = new Set(comp.map(([x, y]) => y * w + x));
    return comp.filter(([x, y]) => {
      return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(
        ([nx, ny]) => nx < 0 || nx >= w || ny < 0 || ny >= h || !compSet.has(ny * w + nx)
      );
    });
  }

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
      if (bestDist > 100) break;
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
    const boundary = getBoundary(comp);
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

  return paths;
}

function buildSVGFromPaths(paths: TracedPath[], w: number, h: number): string {
  // Scale paths to fit 800x600 canvas
  const canvasW = 800, canvasH = 600, padding = 40;

  // Find bounding box of all paths
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const allSegments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  for (const path of paths) {
    const coords = path.d.match(/[\d.]+/g);
    if (!coords) continue;
    for (let i = 0; i < coords.length - 1; i += 2) {
      const x = parseFloat(coords[i]), y = parseFloat(coords[i + 1]);
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
    // Convert path to line segments
    const parts = path.d.split(/(?=[MLZ])/);
    let cx = 0, cy = 0;
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith("M")) {
        const nums = trimmed.slice(1).trim().split(/\s+/).map(Number);
        cx = nums[0]; cy = nums[1];
      } else if (trimmed.startsWith("L")) {
        const nums = trimmed.slice(1).trim().split(/\s+/).map(Number);
        allSegments.push({ x1: cx, y1: cy, x2: nums[0], y2: nums[1] });
        cx = nums[0]; cy = nums[1];
      }
    }
  }

  if (allSegments.length === 0) return "";

  const pathW = maxX - minX || 1, pathH = maxY - minY || 1;
  const scale = Math.min((canvasW - padding * 2) / pathW, (canvasH - padding * 2) / pathH);
  const offsetX = padding + (canvasW - padding * 2 - pathW * scale) / 2 - minX * scale;
  const offsetY = padding + (canvasH - padding * 2 - pathH * scale) / 2 - minY * scale;

  return `<svg viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg">
    ${allSegments.map(({ x1, y1, x2, y2 }) =>
      `<line x1="${x1 * scale + offsetX}" y1="${y1 * scale + offsetY}" x2="${x2 * scale + offsetX}" y2="${y2 * scale + offsetY}" stroke="#1B2A4A" stroke-width="1.5" stroke-linecap="round"/>`
    ).join("\n")}
  </svg>`;
}

const MapPage = () => {
  const { currentProject, addPin, removePin, updatePin } = useProject();

  const [savedSVG, setSavedSVG] = useState<string | null>(null);
  const [canvasStarted, setCanvasStarted] = useState(false);
  const [activeTool, setActiveTool] = useState<CanvasTool>(null);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showPinLayer, setShowPinLayer] = useState(true);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [stylePrefs, setStylePrefs] = useState<StylePreferences>(defaultStylePreferences);
  const [viewMode, setViewMode] = useState<"edit" | "saved">("edit");

  const [placingPin, setPlacingPin] = useState(false);
  const [movingPinId, setMovingPinId] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [pinName, setPinName] = useState("");

  // Trace modal state
  const [traceModalOpen, setTraceModalOpen] = useState(false);
  const [traceImageUrl, setTraceImageUrl] = useState<string | null>(null);
  const [traceMode, setTraceMode] = useState<"choose" | "uploading" | "preview">("choose");
  const [tracing, setTracing] = useState(false);

  const canvasRef = useRef<MapCanvasHandle>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const traceInputRef = useRef<HTMLInputElement>(null);

  const hasMap = savedSVG !== null;
  const showCanvas = hasMap || canvasStarted;

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10">
        <p className="text-sm text-muted-foreground">
          Create a project first to start building your map.
        </p>
      </div>
    );
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingPin || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (movingPinId) {
      updatePin(movingPinId, { x, y });
      setMovingPinId(null);
      setPlacingPin(false);
      return;
    }

    setPendingPin({ x, y });
    setPlacingPin(false);
    setPinName("");
  };

  const handleConfirmPin = () => {
    if (!pendingPin || !pinName.trim()) return;
    addPin({
      title: pinName.trim(),
      x: pendingPin.x,
      y: pendingPin.y,
      type: "location",
      tier: "main",
      chapter: 0,
      location: "",
      note: "",
    });
    setPendingPin(null);
    setPinName("");
  };

  const toggleTool = (tool: CanvasTool) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  };

  const handleStartDraw = () => {
    setCanvasStarted(true);
    setActiveTool("pen");
  };

  const openTraceModal = () => {
    setTraceModalOpen(true);
    setTraceMode("choose");
    setTraceImageUrl(null);
    setTracing(false);
  };

  const handleTraceFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setTraceImageUrl(url);
      setTraceMode("preview");
    };
    reader.readAsDataURL(file);
  };

  const handleAutoTrace = () => {
    if (!traceImageUrl) return;
    setTracing(true);

    const img = new Image();
    img.onload = () => {
      const maxDim = 800;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      setTimeout(() => {
        const paths = traceOutlineImage(c, w, h, 0.65);
        setTracing(false);
        setTraceModalOpen(false);

        if (paths.length === 0) {
          // Fall back to manual mode
          toast("Auto-trace couldn't detect a clear outline — reference image loaded for manual tracing");
          setCanvasStarted(true);
          setActiveTool("pen");
          setTimeout(() => {
            canvasRef.current?.addReferenceImage(traceImageUrl!, 30);
          }, 300);
          return;
        }

        const svgString = buildSVGFromPaths(paths, w, h);
        if (!svgString) {
          toast("Auto-trace couldn't detect a clear outline — reference image loaded for manual tracing");
          setCanvasStarted(true);
          setActiveTool("pen");
          setTimeout(() => {
            canvasRef.current?.addReferenceImage(traceImageUrl!, 30);
          }, 300);
          return;
        }

        setCanvasStarted(true);
        setTimeout(() => {
          canvasRef.current?.loadSVG(svgString);
        }, 300);
      }, 50);
    };
    img.src = traceImageUrl;
  };

  const handleManualTrace = () => {
    if (!traceImageUrl) return;
    setTraceModalOpen(false);
    setCanvasStarted(true);
    setActiveTool("pen");
    setTimeout(() => {
      canvasRef.current?.addReferenceImage(traceImageUrl, 30);
    }, 300);
  };

  const handleTemplateSelect = (template: MapTemplate) => {
    setShowTemplatePicker(false);
    setCanvasStarted(true);
    setTimeout(() => {
      if (canvasRef.current) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${template.viewBox}"><path d="${template.svgPath}" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
        canvasRef.current.loadSVG(svg);
      }
    }, 300);
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const svg = canvasRef.current.getSVG();
      setSavedSVG(svg);
      setViewMode("saved");
      toast.success("Map saved successfully");
    }
  };

  const openPinDrawer = () => {
    setShowStylePanel(false);
    setShowPinDrawer(true);
  };

  const openStylePanel = () => {
    setShowPinDrawer(false);
    setShowStylePanel((v) => !v);
  };

  const handleAddLocationFromDrawer = () => {
    setShowPinDrawer(false);
    setPlacingPin(true);
  };

  const fabricTool: ShapeTool = activeTool === "pen" ? "pen" : activeTool === "eraser" ? "eraser" : "pan";
  const isPlacing = placingPin || !!movingPinId;

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 md:px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="font-serif font-semibold text-sm md:text-base">
            {currentProject.title}
          </h2>
          {hasMap && (
            <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setViewMode("edit")}
                className={`px-3 py-1 rounded-md transition-all ${viewMode === "edit" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
              >
                Edit
              </button>
              <button
                onClick={() => setViewMode("saved")}
                className={`px-3 py-1 rounded-md transition-all ${viewMode === "saved" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
              >
                Saved
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {showCanvas && viewMode === "edit" && (
            <>
              <Button
                size="sm"
                variant={activeTool === "pen" ? "default" : "outline"}
                onClick={() => toggleTool("pen")}
                className="text-xs h-8"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Draw</span>
              </Button>
              <Button
                size="sm"
                variant={activeTool === "eraser" ? "default" : "outline"}
                onClick={() => toggleTool("eraser")}
                className="text-xs h-8"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Eraser</span>
              </Button>
              <Button
                size="sm"
                variant={showPinDrawer ? "default" : "outline"}
                onClick={openPinDrawer}
                className="text-xs h-8"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Pin</span>
              </Button>
              <Button
                size="sm"
                variant={showStylePanel ? "default" : "outline"}
                onClick={openStylePanel}
                className="text-xs h-8"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPinLayer((v) => !v)}
                className="text-xs h-8"
              >
                {showPinLayer ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Placing indicator */}
      {isPlacing && (
        <div className="px-6 py-2 bg-accent/50 border-b border-border text-center">
          <span className="text-xs text-accent-foreground font-medium">
            {movingPinId ? "Click on the map to move the pin" : "Click on the map to place location…"}
          </span>
          <button
            onClick={() => { setPlacingPin(false); setMovingPinId(null); }}
            className="ml-3 text-xs text-muted-foreground hover:text-foreground underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left toolbar — always visible in edit mode */}
        {viewMode === "edit" && (
          <div className="hidden md:flex flex-col w-12 border-r border-border bg-muted/30 items-center py-3 gap-1.5">
            <button
              onClick={() => { if (!canvasStarted) handleStartDraw(); else toggleTool("pen"); }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                activeTool === "pen" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              title="Pen"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => { if (!canvasStarted) { setCanvasStarted(true); setActiveTool("eraser"); } else toggleTool("eraser"); }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                activeTool === "eraser" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              title="Eraser"
            >
              <Eraser className="h-4 w-4" />
            </button>
            <div className="w-6 border-t border-border my-1" />
            <button
              onClick={() => setShowTemplatePicker(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Templates"
            >
              <LayoutTemplate className="h-4 w-4" />
            </button>
            <button
              onClick={openTraceModal}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Trace from image"
            >
              <TraceIcon />
            </button>
          </div>
        )}

        {/* Center canvas */}
        <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 overflow-auto relative">
          {!showCanvas ? (
            /* Quickstart overlay on dotted background */
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backgroundImage: "radial-gradient(circle, hsl(var(--muted-foreground) / 0.12) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-1">Your map starts here</h3>
                  <p className="text-xs text-muted-foreground">
                    Trace, template, or draw freehand
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 w-full">
                  <button
                    onClick={openTraceModal}
                    className="flex flex-col items-center gap-2 border border-border rounded-xl p-3 bg-card/80 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <Scan className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Trace</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">From an image</span>
                  </button>
                  <button
                    onClick={() => setShowTemplatePicker(true)}
                    className="flex flex-col items-center gap-2 border border-border rounded-xl p-3 bg-card/80 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Template</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">Pick a shape</span>
                  </button>
                  <button
                    onClick={handleStartDraw}
                    className="flex flex-col items-center gap-2 border border-border rounded-xl p-3 bg-card/80 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all col-span-2 md:col-span-1"
                  >
                    <Pencil className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Freehand</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">Blank canvas</span>
                  </button>
                </div>
              </div>
            </div>
          ) : viewMode === "saved" && savedSVG ? (
            /* Saved map view */
            <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-6 w-full">
              <div
                ref={mapContainerRef}
                className="relative w-full mx-auto border border-border rounded-xl overflow-hidden shadow-md bg-background"
                style={{ maxWidth: "900px", cursor: isPlacing ? "crosshair" : "default" }}
                onClick={isPlacing ? handleMapClick : undefined}
              >
                <div dangerouslySetInnerHTML={{ __html: savedSVG }} className="w-full" />
                {showPinLayer && currentProject.pins?.map((pin) => (
                  <div
                    key={pin.id}
                    style={{
                      position: "absolute",
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 10,
                      pointerEvents: "none",
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-destructive border-2 border-background shadow-sm" />
                    <span className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap drop-shadow-sm">
                      {pin.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Edit mode canvas */
            <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-6 w-full">
              <div
                ref={mapContainerRef}
                className="relative w-full mx-auto border border-border rounded-xl overflow-hidden shadow-md"
                style={{ maxWidth: "900px", cursor: isPlacing ? "crosshair" : "default" }}
                onClick={isPlacing ? handleMapClick : undefined}
              >
                <MapBuilderCanvas
                  ref={canvasRef}
                  stylePrefs={stylePrefs}
                  activeTool={fabricTool}
                  activeStamp={null}
                  placingPin={placingPin && !movingPinId}
                  onPinPlaced={(x, y) => {
                    setPendingPin({ x, y });
                    setPlacingPin(false);
                    setPinName("");
                  }}
                />
                {showPinLayer && currentProject.pins?.map((pin) => (
                  <div
                    key={pin.id}
                    style={{
                      position: "absolute",
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 10,
                      pointerEvents: "none",
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-destructive border-2 border-background shadow-sm" />
                    <span className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap drop-shadow-sm">
                      {pin.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Save button */}
              <div className="mt-4 w-full" style={{ maxWidth: "900px" }}>
                <Button className="w-full h-11" onClick={handleSave}>
                  Save to Wrender
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right style panel */}
        {showStylePanel && (
          <div className="w-72 border-l border-border bg-card flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style</p>
              <button onClick={() => setShowStylePanel(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-4">
              <StylePreferencesPanel
                prefs={stylePrefs}
                onChange={setStylePrefs}
                forceExpanded
              />
            </div>
          </div>
        )}
      </div>

      {/* Template Picker */}
      <TemplatePicker
        open={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Trace Modal */}
      <Dialog open={traceModalOpen} onOpenChange={(open) => { if (!open) { setTraceModalOpen(false); setTracing(false); } }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="font-serif">Trace a map</DialogTitle>
          </DialogHeader>

          {tracing ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Tracing edges…</p>
            </div>
          ) : traceMode === "choose" ? (
            <div className="space-y-3">
              <input
                ref={traceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleTraceFileSelect(file);
                }}
              />
              <div
                onClick={() => traceInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleTraceFileSelect(file);
                }}
                className="w-full border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center bg-muted/20 hover:border-primary/40 transition-colors cursor-pointer"
              >
                <Upload className="h-7 w-7 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium text-foreground">
                  Drop an image here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, screenshot, or satellite view
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
                <img
                  src={traceImageUrl!}
                  alt="Uploaded reference"
                  className="w-full max-h-[220px] object-contain"
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleAutoTrace}>
                  Auto-trace
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleManualTrace}>
                  Draw over it manually
                </Button>
              </div>
              <button
                onClick={() => { setTraceMode("choose"); setTraceImageUrl(null); }}
                className="text-xs text-muted-foreground hover:text-foreground underline w-full text-center"
              >
                Choose a different image
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pin naming dialog */}
      <Dialog open={!!pendingPin} onOpenChange={(open) => { if (!open) setPendingPin(null); }}>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle className="text-base font-serif">Name this location</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              value={pinName}
              onChange={(e) => setPinName(e.target.value)}
              placeholder="e.g. Dragon's Lair"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirmPin(); }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPendingPin(null)}>Cancel</Button>
              <Button size="sm" onClick={handleConfirmPin} disabled={!pinName.trim()}>Add Pin</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pin drawer backdrop */}
      {showPinDrawer && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowPinDrawer(false)} />
      )}

      {/* Pin drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[340px] bg-card border-l border-border shadow-xl flex flex-col transform transition-transform duration-300 ${showPinDrawer ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h3 className="font-serif font-semibold text-base">Locations</h3>
          <button onClick={() => setShowPinDrawer(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <Button className="w-full" onClick={handleAddLocationFromDrawer}>
            <MapPin className="h-4 w-4" />
            Add Location
          </Button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pins</p>
            {!currentProject.pins?.length && (
              <p className="text-xs text-muted-foreground">No locations yet.</p>
            )}
            {currentProject.pins?.map((pin) => (
              <div key={pin.id} className="flex items-center gap-3 py-2 group">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{pin.title}</span>
                <button
                  onClick={() => { setShowPinDrawer(false); setMovingPinId(pin.id); setPlacingPin(true); }}
                  className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity px-1"
                >
                  Move
                </button>
                <button
                  onClick={() => removePin(pin.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Events</p>
              <p className="text-xs text-muted-foreground italic">Coming soon</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Characters</p>
              <p className="text-xs text-muted-foreground italic">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
