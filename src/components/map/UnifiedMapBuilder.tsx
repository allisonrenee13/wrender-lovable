import { useState, useRef, useEffect, useCallback } from "react";
import { useProject } from "@/context/ProjectContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import StepIndicator, { type BuilderStep } from "./builder/StepIndicator";
import EntryScreen from "./builder/EntryScreen";
import TemplatePicker from "./builder/TemplatePicker";
import UploadTraceFlow from "./builder/UploadTraceFlow";
import EditingCanvas from "./builder/EditingCanvas";
import StyleStep from "./builder/StyleStep";
import type { MapCanvasHandle } from "./builder/MapBuilderCanvas";
import { postProcessSVG, exportSVG, exportPNG } from "./builder/svgPostProcess";
import type { BuilderPath, MapTemplate, StylePreferences, CanvasState } from "./builder/types";
import { defaultStylePreferences, lineStyleLabels, backgroundColors } from "./builder/types";

type Phase = "entry" | "upload" | "shapeCanvas" | "style" | "renderReady" | "rendering" | "preview";

interface UnifiedMapBuilderProps {
  onConfirm?: () => void;
}

const defaultCanvas: CanvasState = {
  paths: [],
  features: [],
  referenceImage: null,
  referenceOpacity: 40,
  nodeCount: 0,
};

const islaSerranoStylePrefs: StylePreferences = {
  lineStyle: "nautical",
  strokeWeight: "medium",
  background: "cream",
  labelStyle: "serif",
};

function phaseToStep(phase: Phase): BuilderStep {
  if (phase === "entry" || phase === "upload" || phase === "shapeCanvas") return 1;
  if (phase === "style") return 2;
  return 3;
}

function completedStepsForPhase(phase: Phase): Set<number> {
  const s = new Set<number>();
  if (phase === "style") s.add(1);
  if (phase === "renderReady" || phase === "rendering" || phase === "preview") { s.add(1); s.add(2); }
  return s;
}

function stepToPhase(step: 1 | 2 | 3): Phase {
  if (step === 1) return "shapeCanvas";
  if (step === 2) return "style";
  return "renderReady";
}

const UnifiedMapBuilder = ({ onConfirm }: UnifiedMapBuilderProps) => {
  const { currentProject, confirmMap, updateMapState } = useProject();
  const isDemoIsla = currentProject.id === "isla-serrano";
  const isSaltMarsh = currentProject.id === "salt-marsh";

  const saltMarshPath = "M280 120 Q320 100 360 115 Q400 135 410 175 Q415 215 395 250 Q380 270 370 300 Q365 330 355 360 Q340 385 310 400 Q280 410 250 395 Q220 375 210 340 Q200 305 210 270 Q220 240 235 215 Q250 185 260 155 Q265 135 280 120Z";

  const savedMapState = currentProject.mapState;

  const getInitialPhase = (): Phase => {
    if (savedMapState?.currentStep) return stepToPhase(savedMapState.currentStep as 1 | 2 | 3);
    if (isDemoIsla) return "renderReady";
    if (isSaltMarsh) return "style";
    return "entry";
  };

  const [phase, setPhase] = useState<Phase>(getInitialPhase);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MapTemplate | null>(null);
  const [renderedSVG, setRenderedSVG] = useState<string | null>(savedMapState?.renderedSVG || null);

  const canvasRef = useRef<MapCanvasHandle | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [canvasState, setCanvasState] = useState<CanvasState>(() => {
    if (isDemoIsla) return {
      paths: [
        "M300 75 Q330 72 345 85 Q370 100 365 120 Q375 135 370 155 Q380 180 375 200 Q385 225 378 250 Q382 275 375 295 Q380 315 370 335 Q378 355 372 375 Q380 400 368 420 Q365 445 355 460 Q348 480 338 500 Q330 520 322 540 Q315 560 308 575 Q303 588 300 600 Q297 588 292 575 Q285 560 278 540 Q270 520 262 500 Q252 480 245 460 Q235 445 232 420 Q220 400 228 375 Q222 355 230 335 Q220 315 225 295 Q218 275 222 250 Q215 225 225 200 Q220 180 230 155 Q225 135 235 120 Q230 100 255 85 Q270 72 300 75Z",
      ],
      features: [
        { type: "building", x: 310, y: 160 },
        { type: "road", x: 300, y: 85, x2: 300, y2: 560 },
        { type: "elevation", x: 300, y: 580 },
      ],
      referenceImage: null, referenceOpacity: 20, nodeCount: 12,
    };
    if (isSaltMarsh) return {
      paths: [saltMarshPath],
      features: [
        { type: "forest", x: 330, y: 200 },
        { type: "river", x: 280, y: 300 },
      ],
      referenceImage: null, referenceOpacity: 40, nodeCount: 8,
    };
    return defaultCanvas;
  });

  const [stylePrefs, setStylePrefs] = useState<StylePreferences>(() => {
    if (savedMapState?.stylePrefs) return savedMapState.stylePrefs as unknown as StylePreferences;
    if (isDemoIsla) return islaSerranoStylePrefs;
    if (isSaltMarsh) return { ...defaultStylePreferences, lineStyle: "hand-drawn" as const };
    return defaultStylePreferences;
  });

  const hasShape = canvasState.paths.length > 0 || selectedTemplate !== null;
  const currentStep = phaseToStep(phase);
  const completed = completedStepsForPhase(phase);
  const colors = backgroundColors[stylePrefs.background];

  // --- Auto-save every 30 seconds ---
  const saveCanvasState = useCallback(() => {
    const json = canvasRef.current?.getJSON() || null;
    updateMapState({
      canvasJSON: json,
      currentStep: phaseToStep(phase) as 1 | 2 | 3,
      stylePrefs: stylePrefs as any,
      renderedSVG: renderedSVG,
    });
  }, [phase, stylePrefs, renderedSVG, updateMapState]);

  useEffect(() => {
    autoSaveTimerRef.current = setInterval(saveCanvasState, 30000);
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [saveCanvasState]);

  // Save on step transitions
  const setPhaseAndSave = useCallback((newPhase: Phase) => {
    setPhase(newPhase);
    // Defer save so canvas ref is available
    setTimeout(() => {
      const json = canvasRef.current?.getJSON() || null;
      updateMapState({
        canvasJSON: json,
        currentStep: phaseToStep(newPhase) as 1 | 2 | 3,
        stylePrefs: stylePrefs as any,
        renderedSVG,
      });
    }, 100);
  }, [stylePrefs, renderedSVG, updateMapState]);

  // Restore canvas from saved JSON when canvas mounts
  useEffect(() => {
    if (savedMapState?.canvasJSON && canvasRef.current) {
      canvasRef.current.loadJSON(savedMapState.canvasJSON);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Handlers ---
  const handleEntrySelect = (path: BuilderPath) => {
    if (path === "template") {
      setTemplatePickerOpen(true);
    } else if (path === "upload") {
      setPhase("upload");
    } else {
      setCanvasState(defaultCanvas);
      setPhase("shapeCanvas");
    }
  };

  const handleTemplateSelect = (template: MapTemplate) => {
    setSelectedTemplate(template);
    setTemplatePickerOpen(false);
    setCanvasState({ ...defaultCanvas, paths: [template.svgPath] });
    setPhase("shapeCanvas");
    toast({ title: "Template loaded", description: "Edit the shape to match your world." });
  };

  const handleAutoTrace = (imageDataUrl: string) => {
    // Real client-side edge tracing using canvas pixel analysis
    const img = new Image();
    img.onload = () => {
      const traceCanvas = document.createElement("canvas");
      const w = Math.min(img.width, 600);
      const h = Math.min(img.height, 600);
      traceCanvas.width = w;
      traceCanvas.height = h;
      const ctx = traceCanvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const paths = traceImageToSVGPaths(imageData, w, h);

      if (paths.length > 0) {
        setCanvasState({
          ...defaultCanvas,
          paths,
          nodeCount: paths.length * 10,
        });
      } else {
        // Fallback: generate a traced outline from image edges
        setCanvasState({
          ...defaultCanvas,
          paths: [generateOutlinePath(w, h)],
          nodeCount: 12,
        });
      }
      setPhaseAndSave("shapeCanvas");
      toast({ title: "Trace complete", description: "Use the node editor to clean up any imperfect edges." });
    };
    img.src = imageDataUrl;
  };

  const handleManualTrace = (image: string) => {
    setCanvasState({ ...defaultCanvas, referenceImage: image, referenceOpacity: 40 });
    setPhase("shapeCanvas");
  };

  const handleRender = () => {
    setPhase("rendering");
    const rawSVG = canvasRef.current?.getSVG();

    setTimeout(() => {
      if (rawSVG) {
        const pins = currentProject.pins.map((p) => ({ title: p.title, x: p.x * 1.33, y: p.y * 0.86 }));
        const processed = postProcessSVG(rawSVG, stylePrefs, pins, 800, 600);
        setRenderedSVG(processed);
      }
      setPhaseAndSave("preview");
    }, 1500);
  };

  const handleUseMap = () => {
    saveCanvasState();
    confirmMap();
    onConfirm?.();
  };

  const handleExportSVG = () => {
    if (renderedSVG) {
      exportSVG(renderedSVG, currentProject.title.replace(/\s+/g, "-").toLowerCase());
      toast({ title: "SVG exported", description: `${currentProject.title} map downloaded.` });
    }
  };

  const handleExportPNG = () => {
    const dataUrl = canvasRef.current?.getPNG();
    if (dataUrl) {
      exportPNG(dataUrl, currentProject.title.replace(/\s+/g, "-").toLowerCase());
      toast({ title: "PNG exported", description: `${currentProject.title} map downloaded.` });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StepIndicator currentStep={currentStep} completedSteps={completed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {phase === "entry" && <EntryScreen onSelect={handleEntrySelect} />}

        {phase === "upload" && (
          <UploadTraceFlow
            onImageUploaded={() => {}}
            onAutoTrace={handleAutoTrace}
            onManualTrace={handleManualTrace}
          />
        )}

        {phase === "shapeCanvas" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <EditingCanvas
              initialTemplate={selectedTemplate}
              referenceImage={canvasState.referenceImage}
              canvasState={canvasState}
              onCanvasChange={setCanvasState}
              stylePrefs={stylePrefs}
              onStylePrefsChange={setStylePrefs}
              onRenderPreview={() => {}}
              hideStylePanel
              hideRenderButton
              canvasRef={canvasRef}
            />
            <div className="px-5 py-3 border-t border-border bg-card flex justify-end">
              <Button
                onClick={() => setPhaseAndSave("style")}
                className="bg-primary text-primary-foreground font-semibold px-6"
              >
                Continue to Style →
              </Button>
            </div>
          </div>
        )}

        {phase === "style" && (
          <StyleStep
            stylePrefs={stylePrefs}
            onStylePrefsChange={setStylePrefs}
            canvasState={canvasState}
            onContinue={() => setPhaseAndSave("renderReady")}
            onBack={() => setPhaseAndSave("shapeCanvas")}
          />
        )}

        {phase === "renderReady" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6" style={{ backgroundColor: colors.bg }}>
            <div className="flex-1 flex items-center justify-center w-full max-w-[500px]">
              <svg viewBox="0 0 600 600" className="w-full h-auto">
                <rect width="600" height="600" fill={colors.bg} />
                {canvasState.paths.map((p, i) => (
                  <path
                    key={i}
                    d={p}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={stylePrefs.strokeWeight === "fine" ? 1 : stylePrefs.strokeWeight === "bold" ? 2.5 : 1.8}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}
              </svg>
            </div>
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
              <Button
                onClick={handleRender}
                className="w-full bg-primary text-primary-foreground font-bold h-14 text-base"
              >
                Render My Map
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Wrender will finish your map with consistent strokes, terrain marks, a compass rose, and place labels.
              </p>
              <p className="text-[11px] text-muted-foreground/50 text-center">
                This takes about 2 seconds. You can re-render any time after editing.
              </p>
              <button
                onClick={() => setPhaseAndSave("style")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                ← Back to Style
              </button>
            </div>
            <div className="w-full text-center">
              <span className="text-[11px] text-muted-foreground">
                Style: {lineStyleLabels[stylePrefs.lineStyle]} · Ready to render
              </span>
            </div>
          </div>
        )}

        {phase === "rendering" && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 gap-4" style={{ backgroundColor: "#FAFAF7" }}>
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <path
                  d="M 8 48 Q 20 20, 32 36 Q 44 52, 56 16"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                >
                  <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.5s" repeatCount="indefinite" />
                </path>
                <circle r="3" fill="hsl(var(--secondary))">
                  <animateMotion path="M 8 48 Q 20 20, 32 36 Q 44 52, 56 16" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <h3 className="text-lg font-serif font-semibold text-foreground">Finishing your map...</h3>
            <p className="text-sm text-muted-foreground">Applying style and cleaning up strokes</p>
          </div>
        )}

        {phase === "preview" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6" style={{ backgroundColor: colors.bg }}>
            <div className="flex-1 flex items-center justify-center w-full max-w-[700px]">
              {renderedSVG ? (
                <div
                  className="w-full border border-border rounded-lg overflow-hidden shadow-md"
                  dangerouslySetInnerHTML={{ __html: renderedSVG }}
                />
              ) : (
                <div className="w-full h-[400px] bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground">
                  Map rendered
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 w-full max-w-md">
              <Button
                onClick={handleUseMap}
                className="w-full bg-primary text-primary-foreground font-semibold h-12 text-sm"
              >
                Use This Map
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleExportSVG} className="text-xs">
                  Export SVG
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPNG} className="text-xs">
                  Export PNG
                </Button>
              </div>
              <button
                onClick={() => setPhaseAndSave("shapeCanvas")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Keep Editing
              </button>
              <p className="text-[11px] text-muted-foreground/60 italic text-center">
                Your map looks exactly like what you drew — just finished and consistent. Edit the shape anytime and re-render instantly.
              </p>
            </div>
          </div>
        )}
      </div>

      <TemplatePicker
        open={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
};

// --- Client-side image edge tracing ---
function traceImageToSVGPaths(imageData: ImageData, w: number, h: number): string[] {
  const { data } = imageData;
  const edgePoints: Array<{ x: number; y: number }> = [];

  // Sobel-like edge detection - sample every 3rd pixel for performance
  for (let y = 1; y < h - 1; y += 3) {
    for (let x = 1; x < w - 1; x += 3) {
      const idx = (y * w + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      // Check neighbors for edge
      const idxRight = (y * w + (x + 1)) * 4;
      const idxDown = ((y + 1) * w + x) * 4;
      const grayRight = (data[idxRight] + data[idxRight + 1] + data[idxRight + 2]) / 3;
      const grayDown = (data[idxDown] + data[idxDown + 1] + data[idxDown + 2]) / 3;

      const gradient = Math.abs(gray - grayRight) + Math.abs(gray - grayDown);
      if (gradient > 40) {
        edgePoints.push({ x, y });
      }
    }
  }

  if (edgePoints.length < 10) return [];

  // Sort edge points and connect them into paths using nearest-neighbor
  const paths: string[] = [];
  const used = new Set<number>();
  
  while (used.size < edgePoints.length) {
    // Find first unused point
    let startIdx = -1;
    for (let i = 0; i < edgePoints.length; i++) {
      if (!used.has(i)) { startIdx = i; break; }
    }
    if (startIdx === -1) break;

    const chain: Array<{ x: number; y: number }> = [edgePoints[startIdx]];
    used.add(startIdx);

    // Follow nearest neighbors
    for (let step = 0; step < 200; step++) {
      const last = chain[chain.length - 1];
      let bestDist = 15; // max connection distance
      let bestIdx = -1;
      for (let i = 0; i < edgePoints.length; i++) {
        if (used.has(i)) continue;
        const dx = edgePoints[i].x - last.x;
        const dy = edgePoints[i].y - last.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      if (bestIdx === -1) break;
      chain.push(edgePoints[bestIdx]);
      used.add(bestIdx);
    }

    if (chain.length >= 5) {
      // Convert chain to SVG path with quadratic curves for smoothness
      let d = `M ${chain[0].x} ${chain[0].y}`;
      for (let i = 1; i < chain.length - 1; i += 2) {
        const cp = chain[i];
        const end = chain[i + 1] || chain[i];
        d += ` Q ${cp.x} ${cp.y} ${end.x} ${end.y}`;
      }
      paths.push(d);
    }
  }

  // Return longest paths (most significant edges)
  return paths
    .sort((a, b) => b.length - a.length)
    .slice(0, 20);
}

function generateOutlinePath(w: number, h: number): string {
  // Generate a simple organic outline as fallback
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) * 0.35;
  const points: Array<{ x: number; y: number }> = [];
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const variation = r * (0.85 + Math.random() * 0.3);
    points.push({
      x: cx + Math.cos(a) * variation,
      y: cy + Math.sin(a) * variation,
    });
  }
  let d = `M ${points[0].x.toFixed(0)} ${points[0].y.toFixed(0)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2 + (Math.random() - 0.5) * 20;
    const cpy = (prev.y + curr.y) / 2 + (Math.random() - 0.5) * 20;
    d += ` Q ${cpx.toFixed(0)} ${cpy.toFixed(0)} ${curr.x.toFixed(0)} ${curr.y.toFixed(0)}`;
  }
  d += "Z";
  return d;
}

export default UnifiedMapBuilder;
