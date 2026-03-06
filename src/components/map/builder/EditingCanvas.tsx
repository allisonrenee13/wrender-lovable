import { useState, useRef, useCallback } from "react";
import CanvasToolbar from "./CanvasToolbar";
import StylePreferencesPanel from "./StylePreferencesPanel";
import MapBuilderCanvas, { type MapCanvasHandle } from "./MapBuilderCanvas";
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
import { lineStyleLabels } from "./types";

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

  const internalRef = useRef<MapCanvasHandle | null>(null);
  const canvasHandle = externalCanvasRef || internalRef;

  const handleStateChange = useCallback(() => {
    const handle = canvasHandle.current;
    if (handle) {
      setNodeCount(handle.getNodeCount());
      setObjectCount(handle.getObjectCount());
    }
  }, [canvasHandle]);

  // Load template SVG once canvas is ready
  const handleCanvasReady = useCallback(() => {
    const handle = canvasHandle.current;
    if (!handle) return;

    if (initialTemplate && !templateLoaded) {
      // Load template from the templateSVGs
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

    // If there are existing canvas paths (demo mode), load them as SVG
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
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-muted/20">
            <div className="border border-border rounded shadow-sm overflow-hidden" style={{ maxWidth: 800 }}>
              <MapBuilderCanvas
                ref={(handle) => {
                  if (externalCanvasRef) {
                    (externalCanvasRef as React.MutableRefObject<MapCanvasHandle | null>).current = handle;
                  }
                  internalRef.current = handle;
                  if (handle) {
                    // defer to next frame so canvas is mounted
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

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-2 border-t border-border bg-muted/30">
            <span className="text-[11px] text-muted-foreground">
              {nodeCount} path nodes · {objectCount} objects · Style: {lineStyleLabels[stylePrefs.lineStyle]}
              {hasContent && " · Ready to render"}
            </span>
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
