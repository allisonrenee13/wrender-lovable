import { useState, useCallback } from "react";
import CanvasToolbar from "./CanvasToolbar";
import StylePreferencesPanel from "./StylePreferencesPanel";
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
import { lineStyleLabels, strokeWeightValues, backgroundColors } from "./types";

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
}

const EditingCanvas = ({
  initialTemplate,
  referenceImage,
  canvasState,
  onCanvasChange,
  stylePrefs,
  onStylePrefsChange,
  onRenderPreview,
  demoMode,
  hideStylePanel,
  hideRenderButton,
}: EditingCanvasProps) => {
  const [mode, setMode] = useState<ToolMode>("shape");
  const [activeTool, setActiveTool] = useState<ShapeTool>("pen");
  const [activeStamp, setActiveStamp] = useState<FeatureStamp | null>(null);
  const [undoStack] = useState<string[]>([]);
  const [redoStack] = useState<string[]>([]);

  const getCursorClass = () => {
    if (activeStamp) return "cursor-crosshair";
    switch (activeTool) {
      case "pan": return "cursor-grab";
      case "pen": return "cursor-crosshair";
      case "eraser": return "cursor-pointer";
      case "node-editor": return "cursor-default";
      default: return "cursor-crosshair";
    }
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 600;

    if (activeStamp) {
      onCanvasChange({
        ...canvasState,
        features: [...canvasState.features, { type: activeStamp, x, y }],
      });
    }
  }, [activeStamp, canvasState, onCanvasChange]);

  // Demo paths for Isla Serrano
  const demoPaths = demoMode ? [
    "M300 75 Q330 72 345 85 Q370 100 365 120 Q375 135 370 155 Q380 180 375 200 Q385 225 378 250 Q382 275 375 295 Q380 315 370 335 Q378 355 372 375 Q380 400 368 420 Q365 445 355 460 Q348 480 338 500 Q330 520 322 540 Q315 560 308 575 Q303 588 300 600 Q297 588 292 575 Q285 560 278 540 Q270 520 262 500 Q252 480 245 460 Q235 445 232 420 Q220 400 228 375 Q222 355 230 335 Q220 315 225 295 Q218 275 222 250 Q215 225 225 200 Q220 180 230 155 Q225 135 235 120 Q230 100 255 85 Q270 72 300 75Z"
  ] : [];

  const demoFeatures = demoMode ? [
    { type: "building" as FeatureStamp, x: 310, y: 160 },
    { type: "road" as FeatureStamp, x: 300, y: 85, x2: 300, y2: 560 },
    { type: "elevation" as FeatureStamp, x: 300, y: 580 },
  ] : [];

  const displayPaths = canvasState.paths.length > 0 ? canvasState.paths : demoPaths;
  const displayFeatures = canvasState.features.length > 0 ? canvasState.features : demoFeatures;
  const displayRef = canvasState.referenceImage || referenceImage;
  const opacity = canvasState.referenceOpacity;
  const nodeCount = demoMode ? 12 : canvasState.nodeCount;
  const featCount = displayFeatures.length;

  // Style-driven values
  const sw = strokeWeightValues[stylePrefs.strokeWeight];
  const colors = backgroundColors[stylePrefs.background];
  const strokeColor = colors.stroke;
  const bgColor = colors.bg;

  // Line style adjustments
  const getStrokeDasharray = () => {
    switch (stylePrefs.lineStyle) {
      case "hand-drawn": return undefined; // wobble applied differently in production
      case "aged": return undefined;
      default: return undefined;
    }
  };

  const coastlineExtra = stylePrefs.lineStyle === "nautical" ? sw * 1.3 : sw;

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
          onUndo={() => {}}
          onRedo={() => {}}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
        />

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto flex items-center justify-center p-6" style={{ backgroundColor: bgColor }}>
            <svg
              viewBox="0 0 600 600"
              className={`w-full max-w-[560px] h-auto ${getCursorClass()}`}
              onClick={handleCanvasClick}
            >
              {/* Dot grid background */}
              <defs>
                <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="0.5" fill={strokeColor} opacity="0.08" />
                </pattern>
              </defs>
              <rect width="600" height="600" fill={bgColor} />
              <rect width="600" height="600" fill="url(#dotGrid)" />

              {/* Reference image */}
              {displayRef && (
                <image
                  href={displayRef}
                  x="50" y="20" width="500" height="560"
                  opacity={opacity / 100}
                  preserveAspectRatio="xMidYMid meet"
                />
              )}

              {/* Template outline */}
              {initialTemplate && displayPaths.length === 0 && (
                <g transform="translate(100,100) scale(2)">
                  <path
                    d={initialTemplate.svgPath}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={sw}
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {/* Drawn / demo paths */}
              {displayPaths.map((p, i) => (
                <path
                  key={i}
                  d={p}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={coastlineExtra}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={getStrokeDasharray()}
                />
              ))}

              {/* Feature stamps */}
              {displayFeatures.map((f, i) => (
                <g key={i}>
                  {f.type === "building" && (
                    <rect x={f.x - 6} y={f.y - 5} width="12" height="10" fill="none" stroke={strokeColor} strokeWidth={sw * 0.6} rx="0.5" />
                  )}
                  {f.type === "road" && f.x2 !== undefined && f.y2 !== undefined && (
                    <line x1={f.x} y1={f.y} x2={f.x2} y2={f.y2} stroke={strokeColor} strokeWidth={sw * 0.5} strokeDasharray="5 3" />
                  )}
                  {f.type === "road" && f.x2 === undefined && (
                    <line x1={f.x - 10} y1={f.y} x2={f.x + 10} y2={f.y} stroke={strokeColor} strokeWidth={sw * 0.5} strokeDasharray="5 3" />
                  )}
                  {f.type === "elevation" && (
                    <path d={`M${f.x - 8} ${f.y} Q${f.x} ${f.y - 8} ${f.x + 8} ${f.y}`} fill="none" stroke={strokeColor} strokeWidth={sw * 0.5} />
                  )}
                  {f.type === "river" && (
                    <path d={`M${f.x} ${f.y - 10} Q${f.x + 5} ${f.y} ${f.x} ${f.y + 10}`} fill="none" stroke={strokeColor} strokeWidth={sw * 0.6} opacity="0.6" />
                  )}
                  {f.type === "forest" && (
                    <g>
                      <path d={`M${f.x} ${f.y - 7} L${f.x - 4} ${f.y} L${f.x + 4} ${f.y}Z`} fill="none" stroke={strokeColor} strokeWidth={sw * 0.5} />
                      <line x1={f.x} y1={f.y} x2={f.x} y2={f.y + 3} stroke={strokeColor} strokeWidth={sw * 0.5} />
                    </g>
                  )}
                </g>
              ))}

              {/* Hint text for blank canvas */}
              {displayPaths.length === 0 && !initialTemplate && !displayRef && (
                <text x="300" y="300" textAnchor="middle" fontSize="14" fill={strokeColor} opacity="0.3">
                  Draw your world's outline. Wrender finishes it into clean line art.
                </text>
              )}
            </svg>
          </div>

          {/* Reference opacity slider */}
          {displayRef && (
            <div className="flex items-center gap-3 px-5 py-2 border-t border-border bg-card">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">Reference opacity</span>
              <Slider
                value={[opacity]}
                onValueChange={([v]) => onCanvasChange({ ...canvasState, referenceOpacity: v })}
                min={20}
                max={80}
                step={5}
                className="w-40"
              />
              <span className="text-[11px] text-muted-foreground w-8">{opacity}%</span>
            </div>
          )}

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-2 border-t border-border bg-muted/30">
            <span className="text-[11px] text-muted-foreground">
              {nodeCount} path nodes · {featCount} features placed · Style: {lineStyleLabels[stylePrefs.lineStyle]}
              {(displayPaths.length > 0 || initialTemplate) && " · Ready to render"}
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
            disabled={displayPaths.length === 0 && !initialTemplate}
          >
            Render Preview
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditingCanvas;
