import { useState, useRef, useEffect, useCallback } from "react";
import { useProject } from "@/context/ProjectContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import StepIndicator, { type BuilderStep } from "./builder/StepIndicator";
import EntryScreen from "./builder/EntryScreen";
import TemplatePicker from "./builder/TemplatePicker";
import UploadTraceFlow from "./builder/UploadTraceFlow";
import EditingCanvas from "./builder/EditingCanvas";
import StyleStep from "./builder/StyleStep";
import type { MapCanvasHandle } from "./builder/MapBuilderCanvas";
import { postProcessSVG, exportSVG, exportPNG } from "./builder/svgPostProcess";
import type { BuilderPath, MapTemplate, StylePreferences, CanvasState, TracedPath } from "./builder/types";
import { defaultStylePreferences, lineStyleLabels, backgroundColors } from "./builder/types";
import { saveTemplate } from "@/lib/templateLibrary";

type Phase = "entry" | "upload" | "traceReview" | "shapeCanvas" | "style" | "renderReady" | "rendering" | "preview";

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

function phaseToStep(phase: Phase): BuilderStep {
  if (phase === "entry" || phase === "upload" || phase === "traceReview" || phase === "shapeCanvas") return 1;
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

  const savedMapState = currentProject?.mapState;

  const getInitialPhase = (): Phase => {
    if (savedMapState?.currentStep) return stepToPhase(savedMapState.currentStep as 1 | 2 | 3);
    return "entry";
  };

  const [phase, setPhase] = useState<Phase>(getInitialPhase);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MapTemplate | null>(null);
  const [renderedSVG, setRenderedSVG] = useState<string | null>(savedMapState?.renderedSVG || null);

  const canvasRef = useRef<MapCanvasHandle | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [canvasState, setCanvasState] = useState<CanvasState>(defaultCanvas);

  const [stylePrefs, setStylePrefs] = useState<StylePreferences>(() => {
    if (savedMapState?.stylePrefs) return savedMapState.stylePrefs as unknown as StylePreferences;
    return defaultStylePreferences;
  });

  // Trace review state
  const [traceSensitivity, setTraceSensitivity] = useState(0.65);
  const [traceImageDataUrl, setTraceImageDataUrl] = useState<string | null>(null);
  const [traceImageData, setTraceImageData] = useState<{ data: ImageData; w: number; h: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save-as-template modal
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templatePublic, setTemplatePublic] = useState(false);

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
    setCanvasState({ ...defaultCanvas, paths: [{ d: template.svgPath, confidence: 1 }] });
    setPhase("shapeCanvas");
    toast({ title: "Template loaded", description: "Edit the shape to match your world." });
  };

  const runTrace = useCallback((canvas: HTMLCanvasElement, w: number, h: number, sensitivity: number): TracedPath[] => {
    return traceOutlineImage(canvas, w, h, sensitivity);
  }, []);

  const handleAutoTrace = (imageDataUrl: string) => {
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
      const paths = runTrace(traceCanvas, w, h, 0.65);

      setTraceImageDataUrl(imageDataUrl);
      setTraceImageData({ data: imageData, w, h });
      setTraceSensitivity(0.65);

      if (paths.length > 0) {
        setCanvasState({
          ...defaultCanvas,
          paths,
          nodeCount: paths.length * 10,
        });
      } else {
        setCanvasState({
          ...defaultCanvas,
          paths: [generateOutlinePath(w, h)],
          nodeCount: 12,
        });
      }
      setPhase("traceReview");
    };
    img.src = imageDataUrl;
  };

  // Re-trace with new sensitivity (debounced call)
  const handleSensitivityChange = useCallback((value: number) => {
    setTraceSensitivity(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!traceImageData || !traceImageDataUrl) return;
      const { w, h } = traceImageData;
      const img = new Image();
        img.onload = () => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const paths = traceOutlineImage(c, w, h, value);
        if (paths.length > 0) {
          setCanvasState((prev) => ({ ...prev, paths, nodeCount: paths.length * 10 }));
        } else {
          setCanvasState((prev) => ({
            ...prev,
            paths: [generateOutlinePath(w, h)],
            nodeCount: 12,
          }));
        }
      };
      img.src = traceImageDataUrl;
    }, 500);
  }, [traceImageData, traceImageDataUrl]);

  const handleManualTrace = (image: string) => {
    setCanvasState({ ...defaultCanvas, referenceImage: image, referenceOpacity: 40 });
    setPhase("shapeCanvas");
  };

  const handleRender = () => {
    setPhase("rendering");
    const rawSVG = canvasRef.current?.getSVG();

    setTimeout(() => {
      if (rawSVG && currentProject) {
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
    if (renderedSVG && currentProject) {
      exportSVG(renderedSVG, currentProject.title.replace(/\s+/g, "-").toLowerCase());
      toast({ title: "SVG exported", description: `${currentProject.title} map downloaded.` });
    }
  };

  const handleExportPNG = () => {
    const dataUrl = canvasRef.current?.getPNG();
    if (dataUrl && currentProject) {
      exportPNG(dataUrl, currentProject.title.replace(/\s+/g, "-").toLowerCase());
      toast({ title: "PNG exported", description: `${currentProject.title} map downloaded.` });
    }
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) return;
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = 200;
    thumbCanvas.height = 150;
    const ctx = thumbCanvas.getContext("2d")!;
    ctx.fillStyle = "#FAFAF7";
    ctx.fillRect(0, 0, 200, 150);

    const allPaths = canvasState.paths;
    if (allPaths.length > 0) {
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      allPaths.forEach((p) => {
        const path2d = new Path2D(p.d);
        ctx.stroke(path2d);
      });
    }

    const thumbnailDataUrl = thumbCanvas.toDataURL("image/png");
    saveTemplate({
      name: templateName.trim(),
      svgPaths: allPaths,
      thumbnailDataUrl,
      isPublic: templatePublic,
    });
    setSaveTemplateOpen(false);
    setTemplateName("");
    setTemplatePublic(false);
    toast({ title: "Template saved", description: `"${templateName.trim()}" saved to your library.` });
  };

  // Trace review stats
  const highCount = canvasState.paths.filter((p) => p.confidence > 0.65).length;
  const lowCount = canvasState.paths.filter((p) => p.confidence < 0.35).length;

  const getConfidenceColor = (c: number) => {
    if (c > 0.65) return "#2EAA5E";
    if (c >= 0.35) return "#D4882A";
    return "#D94040";
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

        {phase === "traceReview" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              {/* Image + SVG overlay */}
              <div className="flex-1 flex items-center justify-center p-6 bg-muted/20 relative">
                <div className="relative w-full max-w-[600px]">
                  {traceImageDataUrl && (
                    <img
                      src={traceImageDataUrl}
                      alt="Uploaded reference"
                      className="w-full h-auto rounded-lg border border-border"
                    />
                  )}
                  {/* SVG overlay */}
                  <svg
                    viewBox={`0 0 ${traceImageData?.w || 600} ${traceImageData?.h || 600}`}
                    className="absolute inset-0 w-full h-full"
                    style={{ pointerEvents: "none" }}
                  >
                    {canvasState.paths.map((p, i) => (
                      <path
                        key={i}
                        d={p.d}
                        fill="none"
                        stroke={getConfidenceColor(p.confidence)}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        opacity="0.85"
                      />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Right panel */}
              <div className="w-[320px] border-l border-border flex flex-col bg-card">
                <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                  <div>
                    <h3 className="text-base font-serif font-semibold text-foreground mb-1">Review Trace</h3>
                    <p className="text-xs text-muted-foreground">
                      Adjust sensitivity and review detected edges before continuing.
                    </p>
                  </div>

                  {/* Legend */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Confidence</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#2EAA5E" }} />
                      <span className="text-foreground">High (&gt; 0.65)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D4882A" }} />
                      <span className="text-foreground">Medium (0.35–0.65)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D94040" }} />
                      <span className="text-foreground">Low (&lt; 0.35)</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                    <p className="text-sm text-foreground font-medium">{canvasState.paths.length} paths found</p>
                    <p className="text-xs text-muted-foreground">
                      {highCount} high · {canvasState.paths.length - highCount - lowCount} medium · {lowCount} low confidence
                    </p>
                  </div>

                  {/* Sensitivity slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">Sensitivity</p>
                      <span className="text-xs text-muted-foreground">{traceSensitivity.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[traceSensitivity]}
                      onValueChange={([v]) => handleSensitivityChange(v)}
                      min={0.2}
                      max={0.95}
                      step={0.01}
                      className="w-full"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Lower = fewer edges, higher = more detail (may include noise)
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border space-y-2">
                  <Button
                    onClick={() => setPhaseAndSave("shapeCanvas")}
                    className="w-full bg-primary text-primary-foreground font-semibold"
                  >
                    Looks good, continue →
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        if (traceImageData && traceImageDataUrl) {
                          const { w, h } = traceImageData;
                          const img = new Image();
                          img.onload = () => {
                            const c = document.createElement("canvas");
                            c.width = w;
                            c.height = h;
                            const ctx = c.getContext("2d")!;
                            ctx.drawImage(img, 0, 0, w, h);
                            const paths = traceOutlineImage(c, w, h, traceSensitivity);
                            if (paths.length > 0) {
                              setCanvasState((prev) => ({ ...prev, paths, nodeCount: paths.length * 10 }));
                            }
                          };
                          img.src = traceImageDataUrl;
                        }
                      }}
                    >
                      Re-trace
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setTemplateName("");
                        setTemplatePublic(false);
                        setSaveTemplateOpen(true);
                      }}
                    >
                      Save as Template
                    </Button>
                  </div>
                  <button
                    onClick={() => setPhase("upload")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
                  >
                    ← Back to Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
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
            <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-4">
              <span className="text-[12px] text-muted-foreground hidden sm:inline">
                Happy with the shape? Continue when ready — you can always come back and edit.
              </span>
              <Button
                onClick={() => setPhaseAndSave("style")}
                className="bg-primary text-primary-foreground font-semibold px-6 shrink-0"
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
                    d={p.d}
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

      {/* Save as Template Modal */}
      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="font-serif">Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-name" className="text-xs">Template name</Label>
              <Input
                id="tpl-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="My island template"
                className="h-9"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tpl-public" className="text-xs">Make public</Label>
              <Switch
                id="tpl-public"
                checked={templatePublic}
                onCheckedChange={setTemplatePublic}
              />
            </div>
            <Button
              onClick={handleSaveAsTemplate}
              disabled={!templateName.trim()}
              className="w-full bg-primary text-primary-foreground font-semibold"
            >
              Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Self-contained outline tracer (no external deps) ---
function traceOutlineImage(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  sensitivity: number
): TracedPath[] {
  const ctx = canvas.getContext("2d")!;
  const { data } = ctx.getImageData(0, 0, w, h);

  // 1. Build binary ink map
  const threshold = 200 - Math.round(sensitivity * 120);
  const ink = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const brightness = (r + g + b) / 3;
    ink[i] = brightness < threshold ? 1 : 0;
  }

  // 2. Zero out 6px border to remove image frame artifacts
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
  const minSize = Math.round((1 - sensitivity) * 150) + 8;
  const significant = components
    .filter(c => c.length >= minSize)
    .sort((a, b) => b.length - a.length)
    .slice(0, 120);

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
  for (const comp of significant) {
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

  console.log(`[tracer] found ${paths.length} paths from ${significant.length} components`);
  return paths;
}

function generateOutlinePath(w: number, h: number): TracedPath {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.35;

  const variations = [1.0, 0.88, 1.1, 0.92, 0.85, 1.05, 0.95, 1.08, 1.0, 0.9, 1.12, 0.87, 0.95, 1.02, 0.88, 1.0];
  const cpOffsets = [8, -10, 12, -8, 10, -12, 6, -9, 11, -7, 9, -11, 7, -8, 10, -6];

  const points: Array<{ x: number; y: number }> = [];
  const steps = 16;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const variation = r * variations[i];
    points.push({
      x: cx + Math.cos(a) * variation,
      y: cy + Math.sin(a) * variation,
    });
  }

  let d = `M ${points[0].x.toFixed(0)} ${points[0].y.toFixed(0)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2 + cpOffsets[i];
    const cpy = (prev.y + curr.y) / 2 + cpOffsets[(i + 4) % 16];
    d += ` Q ${cpx.toFixed(0)} ${cpy.toFixed(0)} ${curr.x.toFixed(0)} ${curr.y.toFixed(0)}`;
  }
  d += " Z";
  return { d, confidence: 0.5 };
}

export default UnifiedMapBuilder;
