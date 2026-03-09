import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import CanvasToolbar, { type BrushWeight } from "./CanvasToolbar";
import StylePreferencesPanel from "./StylePreferencesPanel";
import MapBuilderCanvas, { type MapCanvasHandle } from "./MapBuilderCanvas";
import GuidanceOverlay, { shouldShowGuidance } from "./GuidanceOverlay";
import EmptyCanvasPrompt from "./EmptyCanvasPrompt";
import { shapeToolHints } from "./toolHints";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type {
  ShapeTool,
  ToolMode,
  StylePreferences,
  MapTemplate,
  CanvasState,
} from "./types";

interface EditingCanvasProps {
  initialTemplate?: MapTemplate | null;
  referenceImage?: string | null;
  canvasState: CanvasState;
  onCanvasChange: (state: CanvasState) => void;
  stylePrefs: StylePreferences;
  onStylePrefsChange: (prefs: StylePreferences) => void;
  onRenderPreview: () => void;
  demoMode?: boolean;
  hideStylePanel?: boolean;
  hideRenderButton?: boolean;
  canvasRef?: React.RefObject<MapCanvasHandle | null>;
  placingPin?: boolean;
  onPinPlaced?: (x: number, y: number) => void;
  overrideActiveTool?: ShapeTool;
}

const EditingCanvas = ({
  initialTemplate,
  referenceImage,
  canvasState,
  onCanvasChange,
  stylePrefs,
  onStylePrefsChange,
  onRenderPreview,
  hideStylePanel,
  hideRenderButton,
  canvasRef: externalCanvasRef,
  placingPin,
  onPinPlaced,
  overrideActiveTool,
}: EditingCanvasProps) => {
  const [mode, setMode] = useState<ToolMode>("shape");
  const [activeTool, setActiveTool] = useState<ShapeTool>("pen");

  // Debug: confirm activeTool updates
  console.log("[EditingCanvas] activeTool:", activeTool);
  const [nodeCount, setNodeCount] = useState(0);
  const [objectCount, setObjectCount] = useState(0);
  const [refOpacity, setRefOpacity] = useState(canvasState.referenceOpacity);
  const templateLoadedRef = useRef(false);
  const initialLoadDone = useRef(false); // Guard: only load paths once on mount
  const [showGuidance, setShowGuidance] = useState(() => {
    return canvasState.paths.length === 0 && !initialTemplate && shouldShowGuidance();
  });
  const [hasDrawn, setHasDrawn] = useState(canvasState.paths.length > 0 || !!initialTemplate);

  // Brush weight state — synced with stylePrefs.strokeWeight
  const penWidthMap: Record<BrushWeight, number> = useMemo(() => ({ fine: 1, medium: 3, bold: 6 }), []);
  const eraserRadiusMap: Record<BrushWeight, number> = useMemo(() => ({ fine: 8, medium: 20, bold: 40 }), []);

  // Eraser size state for slider (default 24)
  const [eraserSize, setEraserSize] = useState(24);

  const [brushWeight, setBrushWeight] = useState<BrushWeight>(
    (stylePrefs.strokeWeight as BrushWeight) || "medium"
  );

  const handleBrushWeightChange = (weight: BrushWeight) => {
    setBrushWeight(weight);
    if (activeTool === "pen") {
      canvasHandle.current?.setBrushWidth(penWidthMap[weight]);
    }
  };

  const internalRef = useRef<MapCanvasHandle | null>(null);
  const canvasHandle = externalCanvasRef || internalRef;

  // Sync brush weight when stylePrefs.strokeWeight changes
  useEffect(() => {
    const w = stylePrefs.strokeWeight as BrushWeight;
    if (w && w !== brushWeight) {
      setBrushWeight(w);
      if (activeTool === "pen") {
        canvasHandle.current?.setBrushWidth(penWidthMap[w]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stylePrefs.strokeWeight]);

  const handleStateChange = useCallback(() => {
    const handle = canvasHandle.current;
    if (!handle) return;

    setNodeCount(handle.getNodeCount());
    setObjectCount(handle.getObjectCount());

    // Mark that user has drawn something
    if (handle.getNodeCount() > 0 || handle.getObjectCount() > 0) {
      setHasDrawn(true);
    }

    // Extract current SVG paths and save back to parent
    const svg = handle.getSVG();
    if (svg) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, "image/svg+xml");
      const pathElements = Array.from(doc.querySelectorAll("path"));
      const paths = pathElements
        .map((el) => el.getAttribute("d"))
        .filter(Boolean)
        .map((d) => ({ d: d as string, confidence: 1 }));

      onCanvasChange({
        ...canvasState,
        paths,
        nodeCount: handle.getNodeCount(),
      });
    }
  }, [canvasHandle, canvasState, onCanvasChange]);

  // Load template SVG once canvas is ready — guarded to run only once
  const handleCanvasReady = useCallback(() => {
    if (initialLoadDone.current) return; // Never run again after first load
    const handle = canvasHandle.current;
    if (!handle) return;

    initialLoadDone.current = true;

    if (initialTemplate && !templateLoadedRef.current) {
      templateLoadedRef.current = true;
      import("./templates").then(({ templateSVGs }) => {
        const svg = templateSVGs[initialTemplate.id];
        if (svg) {
          handle.loadSVG(svg);
        }
      });
    }

    // Reference image disabled — no longer shown on edit page

    if (canvasState.paths.length > 0 && !initialTemplate) {
      // Parse all path segments and compute bounding box
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const allSegments: { x1: number; y1: number; x2: number; y2: number }[] = [];

      canvasState.paths.forEach((tracedPath) => {
        const commands = tracedPath.d.match(/[ML]\s*[\d.]+\s*[\d.]+/g) || [];
        const points = commands.map((cmd) => {
          const parts = cmd.trim().split(/\s+/);
          return { x: parseFloat(parts[1]), y: parseFloat(parts[2]) };
        });
        for (let i = 0; i < points.length - 1; i++) {
          allSegments.push({
            x1: points[i].x, y1: points[i].y,
            x2: points[i + 1].x, y2: points[i + 1].y,
          });
          minX = Math.min(minX, points[i].x, points[i + 1].x);
          minY = Math.min(minY, points[i].y, points[i + 1].y);
          maxX = Math.max(maxX, points[i].x, points[i + 1].x);
          maxY = Math.max(maxY, points[i].y, points[i + 1].y);
        }
      });

      if (allSegments.length > 0) {
        // Scale to fit canvas with 40px padding
        const padding = 40;
        const pathW = maxX - minX || 1;
        const pathH = maxY - minY || 1;
        const canvasW = handle.getJSON ? 800 : 800;
        const canvasH = 600;
        const scale = Math.min(
          (canvasW - padding * 2) / pathW,
          (canvasH - padding * 2) / pathH
        );
        const offsetX = padding + (canvasW - padding * 2 - pathW * scale) / 2 - minX * scale;
        const offsetY = padding + (canvasH - padding * 2 - pathH * scale) / 2 - minY * scale;

        // Build a scaled SVG and load via loadSVG (which breaks into line segments)
        const svgStr = `<svg viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg">
          ${allSegments.map(({ x1, y1, x2, y2 }) =>
            `<line x1="${x1 * scale + offsetX}" y1="${y1 * scale + offsetY}" x2="${x2 * scale + offsetX}" y2="${y2 * scale + offsetY}" stroke="#1B2A4A" stroke-width="1.5" stroke-linecap="round"/>`
          ).join("\n")}
        </svg>`;
        handle.loadSVG(svgStr);
      }
    }

    handleStateChange();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync reference opacity when parent changes it (e.g. toggle in Edit tab)
  useEffect(() => {
    if (canvasState.referenceOpacity !== refOpacity) {
      setRefOpacity(canvasState.referenceOpacity);
      canvasHandle.current?.setReferenceOpacity(canvasState.referenceOpacity);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasState.referenceOpacity]);

  const handleRefOpacityChange = (value: number) => {
    setRefOpacity(value);
    onCanvasChange({ ...canvasState, referenceOpacity: value });
    canvasHandle.current?.setReferenceOpacity(value);
  };

  const handleGuidanceDismiss = () => {
    setShowGuidance(false);
    setActiveTool("pen");
  };

  // Determine current hint text
  const currentHint = shapeToolHints[activeTool];

  const showEmptyPrompt = !hasDrawn && activeTool === "pen" && !showGuidance;
  const hasContent = nodeCount > 0 || objectCount > 0 || canvasState.paths.length > 0 || !!initialTemplate;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <CanvasToolbar
          mode={mode}
          onModeChange={setMode}
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onUndo={() => canvasHandle.current?.undo()}
          onRedo={() => canvasHandle.current?.redo()}
          canUndo={true}
          canRedo={true}
          brushWeight={brushWeight}
          onBrushWeightChange={handleBrushWeightChange}
          eraserSize={eraserSize}
          onEraserSizeChange={setEraserSize}
        />

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto flex items-center justify-center p-2 md:p-4 bg-muted/20 relative max-h-[55vh] md:max-h-none">
            <div className="border border-border rounded shadow-sm overflow-hidden relative w-full" style={{ maxWidth: 800 }}>
              <MapBuilderCanvas
                ref={(handle) => {
                  if (externalCanvasRef) {
                    (externalCanvasRef as React.MutableRefObject<MapCanvasHandle | null>).current = handle;
                  }
                  const wasNull = internalRef.current === null;
                  internalRef.current = handle;
                  if (handle && wasNull) {
                    requestAnimationFrame(handleCanvasReady);
                  }
                }}
                stylePrefs={stylePrefs}
                activeTool={overrideActiveTool ?? activeTool}
                activeStamp={null}
                onStateChange={handleStateChange}
                width={800}
                height={600}
                brushWidth={activeTool === "pen" ? penWidthMap[brushWeight] : undefined}
                eraserRadius={activeTool === "eraser" ? eraserSize : undefined}
                placingPin={placingPin}
                onPinPlaced={onPinPlaced}
              />

              {/* Empty canvas prompt */}
              {showEmptyPrompt && <EmptyCanvasPrompt />}

              {/* First-time guidance overlay */}
              {showGuidance && <GuidanceOverlay onDismiss={handleGuidanceDismiss} />}
            </div>
          </div>

          {/* Reference opacity slider removed */}

          {/* Contextual hint bar */}
          <div className="px-3 md:px-5 py-2.5 border-t border-border bg-card">
            <p className="text-xs md:text-[13px] text-foreground leading-snug">{currentHint}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {nodeCount} path nodes · {objectCount} objects
            </p>
          </div>
        </div>
      </div>

      {/* Style Preferences */}
      {!hideStylePanel && <StylePreferencesPanel prefs={stylePrefs} onChange={onStylePrefsChange} />}

      {/* Render button */}
      {!hideRenderButton && (
        <div className="px-3 md:px-5 py-3 border-t border-border bg-card flex justify-end">
          <Button
            onClick={onRenderPreview}
            className="bg-primary text-secondary font-semibold px-8 h-10"
            disabled={!hasContent}
          >
            Render Preview
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditingCanvas;
