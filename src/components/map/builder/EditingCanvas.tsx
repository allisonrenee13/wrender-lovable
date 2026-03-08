import { useState, useRef, useCallback } from "react";
import CanvasToolbar from "./CanvasToolbar";
import StylePreferencesPanel from "./StylePreferencesPanel";
import MapBuilderCanvas, { type MapCanvasHandle } from "./MapBuilderCanvas";
import GuidanceOverlay, { shouldShowGuidance } from "./GuidanceOverlay";
import EmptyCanvasPrompt from "./EmptyCanvasPrompt";
import { shapeToolHints, stampHints } from "./toolHints";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type {
  ShapeTool,
  ToolMode,
  FeatureStamp,
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
}: EditingCanvasProps) => {
  const [mode, setMode] = useState<ToolMode>("shape");
  const [activeTool, setActiveTool] = useState<ShapeTool>("pen");
  const [activeStamp, setActiveStamp] = useState<FeatureStamp | null>(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [objectCount, setObjectCount] = useState(0);
  const [refOpacity, setRefOpacity] = useState(canvasState.referenceOpacity);
  const templateLoadedRef = useRef(false);
  const [showGuidance, setShowGuidance] = useState(() => {
    // Show guidance only if canvas is empty and not previously dismissed
    return canvasState.paths.length === 0 && !initialTemplate && shouldShowGuidance();
  });
  const [hasDrawn, setHasDrawn] = useState(canvasState.paths.length > 0 || !!initialTemplate);

  const internalRef = useRef<MapCanvasHandle | null>(null);
  const canvasHandle = externalCanvasRef || internalRef;

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

  // Load template SVG once canvas is ready
  const handleCanvasReady = useCallback(() => {
    const handle = canvasHandle.current;
    if (!handle) return;

    if (initialTemplate && !templateLoadedRef.current) {
      templateLoadedRef.current = true;
      import("./templates").then(({ templateSVGs }) => {
        const svg = templateSVGs[initialTemplate.id];
        if (svg) {
          handle.loadSVG(svg);
        }
      });
    }

    if (referenceImage) {
      handle.addReferenceImage(referenceImage, refOpacity);
    }

    if (canvasState.paths.length > 0 && !initialTemplate) {
      // Compute bounding box of all paths to scale & center them
      const allPoints: Array<[number, number]> = [];
      canvasState.paths.forEach((p) => {
        const matches = p.d.matchAll(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g);
        for (const m of matches) {
          allPoints.push([parseFloat(m[1]), parseFloat(m[2])]);
        }
      });

      let svgStr: string;
      if (allPoints.length >= 2) {
        const xs = allPoints.map(([x]) => x);
        const ys = allPoints.map(([, y]) => y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const shapeW = maxX - minX || 1;
        const shapeH = maxY - minY || 1;

        const canvasW = 800;
        const canvasH = 600;
        const targetW = canvasW * 0.8;
        const targetH = canvasH * 0.8;
        const scale = Math.min(targetW / shapeW, targetH / shapeH);
        const scaledW = shapeW * scale;
        const scaledH = shapeH * scale;
        const tx = (canvasW - scaledW) / 2 - minX * scale;
        const ty = (canvasH - scaledH) / 2 - minY * scale;

        svgStr = `<svg viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(${tx}, ${ty}) scale(${scale})">
            ${canvasState.paths.map((p) => `<path d="${p.d}" fill="none" stroke="#1B2A4A" stroke-width="${Math.max(1, 2 / scale)}" stroke-linejoin="round" stroke-linecap="round"/>`).join("\n")}
          </g>
        </svg>`;
      } else {
        svgStr = `<svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          ${canvasState.paths.map((p) => `<path d="${p.d}" fill="none" stroke="#1B2A4A" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`).join("\n")}
        </svg>`;
      }
      handle.loadSVG(svgStr);
    }

    handleStateChange();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const currentHint = activeStamp
    ? stampHints[activeStamp]
    : shapeToolHints[activeTool];

  const showEmptyPrompt = !hasDrawn && activeTool === "pen" && !activeStamp && !showGuidance;
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
          activeStamp={activeStamp}
          onStampChange={setActiveStamp}
          onUndo={() => canvasHandle.current?.undo()}
          onRedo={() => canvasHandle.current?.redo()}
          canUndo={true}
          canRedo={true}
        />

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-muted/20 relative">
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
                activeTool={activeTool}
                activeStamp={activeStamp}
                onStateChange={handleStateChange}
                width={800}
                height={600}
              />

              {/* Empty canvas prompt */}
              {showEmptyPrompt && <EmptyCanvasPrompt />}

              {/* First-time guidance overlay */}
              {showGuidance && <GuidanceOverlay onDismiss={handleGuidanceDismiss} />}
            </div>
          </div>

          {/* Reference opacity slider */}
          {referenceImage && (
            <div className="flex items-center gap-3 px-5 py-2 border-t border-border bg-card">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">Reference opacity</span>
              <Slider
                value={[refOpacity]}
                onValueChange={([v]) => handleRefOpacityChange(v)}
                min={20}
                max={80}
                step={5}
                className="w-40"
              />
              <span className="text-[11px] text-muted-foreground w-8">{refOpacity}%</span>
            </div>
          )}

          {/* Contextual hint bar */}
          <div className="px-5 py-2.5 border-t border-border bg-card">
            <p className="text-[13px] text-foreground leading-snug">{currentHint}</p>
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
        <div className="px-5 py-3 border-t border-border bg-card flex justify-end">
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
