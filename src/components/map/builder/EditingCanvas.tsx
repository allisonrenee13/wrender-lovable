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
  const [templateLoaded, setTemplateLoaded] = useState(false);
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
        .filter(Boolean) as string[];

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

    if (initialTemplate && !templateLoaded) {
      import("./templates").then(({ templateSVGs }) => {
        const svg = templateSVGs[initialTemplate.id];
        if (svg) {
          handle.loadSVG(svg);
          setTemplateLoaded(true);
        }
      });
    }

    if (referenceImage) {
      handle.addReferenceImage(referenceImage, refOpacity);
    }

    if (canvasState.paths.length > 0 && !initialTemplate) {
      const svgStr = `<svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        ${canvasState.paths.map((p) => `<path d="${p}" fill="none" stroke="#1B2A4A" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`).join("\n")}
      </svg>`;
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
            <div className="border border-border rounded shadow-sm overflow-hidden relative" style={{ maxWidth: 800 }}>
              <MapBuilderCanvas
                ref={(handle) => {
                  if (externalCanvasRef) {
                    (externalCanvasRef as React.MutableRefObject<MapCanvasHandle | null>).current = handle;
                  }
                  internalRef.current = handle;
                  if (handle) {
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
