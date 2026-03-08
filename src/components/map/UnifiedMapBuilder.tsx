import { useState, useRef, useEffect, useCallback } from "react";
import { useProject } from "@/context/ProjectContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import EntryScreen from "./builder/EntryScreen";
import TemplatePicker from "./builder/TemplatePicker";
import UploadTraceFlow from "./builder/UploadTraceFlow";
import EditingCanvas from "./builder/EditingCanvas";
import StylePreferencesPanel from "./builder/StylePreferencesPanel";
import type { MapCanvasHandle } from "./builder/MapBuilderCanvas";
import { postProcessSVG, exportSVG, exportPNG } from "./builder/svgPostProcess";
import type { BuilderPath, MapTemplate, StylePreferences, CanvasState, TracedPath } from "./builder/types";
import { defaultStylePreferences, lineStyleLabels, backgroundColors } from "./builder/types";
import { saveTemplate } from "@/lib/templateLibrary";

type Phase = "entry" | "upload" | "traceReview" | "shapeCanvas" | "style" | "renderReady" | "rendering" | "preview";
type TabId = "trace" | "edit" | "style" | "add";

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

function phaseToTab(phase: Phase): TabId {
  if (phase === "entry" || phase === "upload" || phase === "traceReview") return "trace";
  if (phase === "shapeCanvas") return "edit";
  if (phase === "style") return "style";
  return "add";
}

function phaseToStep(phase: Phase): number {
  if (phase === "entry" || phase === "upload" || phase === "traceReview") return 1;
  if (phase === "shapeCanvas") return 2;
  if (phase === "style") return 3;
  return 4;
}

/** Which tabs have been reached based on the furthest phase */
function reachedTabs(phase: Phase): Set<TabId> {
  const s = new Set<TabId>(["trace"]);
  if (["shapeCanvas", "style", "renderReady", "rendering", "preview"].includes(phase)) s.add("edit");
  if (["style", "renderReady", "rendering", "preview"].includes(phase)) s.add("style");
  if (["renderReady", "rendering", "preview"].includes(phase)) s.add("add");
  return s;
}

const UnifiedMapBuilder = ({ onConfirm }: UnifiedMapBuilderProps) => {
  const { currentProject, confirmMap, updateMapState } = useProject();

  const savedMapState = currentProject?.mapState;

  const getInitialPhase = (): Phase => {
    if (savedMapState?.currentStep === 2) return "style";
    if (savedMapState?.currentStep === 3) return "preview";
    return "entry";
  };

  const [phase, setPhase] = useState<Phase>(getInitialPhase);
  const [activeTab, setActiveTab] = useState<TabId>(phaseToTab(getInitialPhase()));
  const [highestReached, setHighestReached] = useState<Set<TabId>>(() => reachedTabs(getInitialPhase()));
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
  const colors = backgroundColors[stylePrefs.background];

  // Update highest reached when phase changes
  useEffect(() => {
    setHighestReached(prev => {
      const next = new Set(prev);
      reachedTabs(phase).forEach(t => next.add(t));
      return next;
    });
    setActiveTab(phaseToTab(phase));
  }, [phase]);

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

    setTimeout(() => {
      const sw = stylePrefs.strokeWeight === "fine" ? 1 : stylePrefs.strokeWeight === "bold" ? 2.5 : 1.8;
      const pathMarkup = canvasState.paths
        .map((p) => `<path d="${p.d}" fill="none" stroke="${colors.stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`)
        .join("\n");
      const rawSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
        <rect width="600" height="600" fill="${colors.bg}"/>
        ${pathMarkup}
      </svg>`;

      const pins = currentProject?.pins.map((p) => ({ title: p.title, x: p.x * 1.33, y: p.y * 0.86 })) || [];
      const processed = postProcessSVG(rawSVG, stylePrefs, pins, 600, 600);
      setRenderedSVG(processed);

      updateMapState({
        renderedSVG: processed,
        currentStep: 3,
        stylePrefs: stylePrefs as any,
      });

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
  const pathCount = canvasState.paths.length;
  const traceGuidance = pathCount === 0
    ? "Nothing detected — try raising sensitivity or use a higher contrast image"
    : pathCount <= 3
    ? "Looks clean! Simple outlines work best."
    : pathCount <= 15
    ? "Good trace. Review the overlay and adjust if needed."
    : "Lots of detail detected — lower sensitivity if the overlay looks noisy";
  const getConfidenceColor = (c: number) => {
    if (c > 0.65) return "#2EAA5E";
    if (c >= 0.35) return "#D4882A";
    return "#D94040";
  };

  // Handle tab click — only allow if reached
  const handleTabClick = (tab: TabId) => {
    if (!highestReached.has(tab)) return;
    setActiveTab(tab);
    // Also switch phase when clicking back to a tab
    if (tab === "trace") {
      if (phase !== "entry" && phase !== "upload" && phase !== "traceReview") {
        setPhase(traceImageDataUrl ? "traceReview" : "entry");
      }
    } else if (tab === "edit") {
      if (phase !== "shapeCanvas") {
        setPhase("shapeCanvas");
      }
    } else if (tab === "style") {
      if (phase !== "style") {
        setPhase("style");
      }
    } else if (tab === "add") {
      if (phase !== "renderReady" && phase !== "rendering" && phase !== "preview") {
        setPhase(renderedSVG ? "preview" : "renderReady");
      }
    }
  };

  // --- Determine what to show in center ---
  const isEntryOrUpload = phase === "entry" || phase === "upload";
  const isTraceReview = phase === "traceReview";
  const isCanvasPhase = phase === "shapeCanvas" || phase === "style";
  const isRenderPhase = phase === "renderReady" || phase === "rendering" || phase === "preview";

  // Show right panel only after entry/upload
  const showRightPanel = !isEntryOrUpload;

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "trace", label: "Trace" },
    { id: "edit", label: "Edit" },
    { id: "style", label: "Style" },
    { id: "add", label: "Add" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Entry / Upload — full screen, no tabs */}
      {isEntryOrUpload && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {phase === "entry" && <EntryScreen onSelect={handleEntrySelect} />}
          {phase === "upload" && (
            <UploadTraceFlow
              onImageUploaded={() => {}}
              onAutoTrace={handleAutoTrace}
              onManualTrace={handleManualTrace}
            />
          )}
        </div>
      )}

      {/* Main single-page layout: Center + Right panel */}
      {!isEntryOrUpload && (
        <div className="flex-1 flex overflow-hidden">
          {/* CENTER — main canvas / content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Trace review center: image + SVG overlay */}
            {isTraceReview && (
              <div className="flex-1 flex items-center justify-center p-6 bg-muted/20 relative">
                <div className="relative w-full max-w-[600px]">
                  {traceImageDataUrl && (
                    <img
                      src={traceImageDataUrl}
                      alt="Uploaded reference"
                      className="w-full h-auto rounded-lg border border-border"
                    />
                  )}
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
            )}

            {/* Canvas phase center: EditingCanvas */}
            {isCanvasPhase && (
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
            )}

            {/* Render / Preview center */}
            {isRenderPhase && (
              <div className="flex-1 flex items-center justify-center p-6" style={{ backgroundColor: colors.bg }}>
                {phase === "rendering" ? (
                  <div className="flex flex-col items-center gap-4">
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
                ) : renderedSVG ? (
                  <div
                    className="w-full max-w-[600px] border border-border rounded-lg overflow-hidden shadow-md"
                    dangerouslySetInnerHTML={{ __html: renderedSVG }}
                  />
                ) : (
                  /* renderReady — preview of raw shape */
                  <div className="w-full max-w-[500px]">
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
                )}
              </div>
            )}
          </div>

          {/* RIGHT PANEL — tabbed */}
          {showRightPanel && (
            <div className="w-[320px] border-l border-border flex flex-col bg-card shrink-0">
              {/* Tab bar */}
              <div className="flex border-b border-border">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const isReached = highestReached.has(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      disabled={!isReached}
                      className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                        isActive
                          ? "text-foreground"
                          : isReached
                          ? "text-muted-foreground hover:text-foreground"
                          : "text-muted-foreground/30 cursor-not-allowed"
                      }`}
                    >
                      {tab.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-foreground rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* TRACE TAB */}
                {activeTab === "trace" && (
                  <div className="flex-1 flex flex-col">
                    <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                      <div>
                        <h3 className="text-base font-serif font-semibold text-foreground mb-1">Your trace is ready</h3>
                        <p className="text-xs text-muted-foreground">
                          Not quite right? Try free drawing with a template as your base, or draw from scratch.
                          We're always working to improve the auto-tracer — tap the feedback button if something looks off.
                        </p>
                      </div>

                      <a
                        href="mailto:feedback@wrender.com?subject=Tracer%20feedback"
                        className="inline-flex items-center text-xs text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                      >
                        Give feedback
                      </a>

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

                    {/* Trace tab footer */}
                    <div className="p-4 border-t border-border space-y-2">
                      <Button
                        onClick={() => {
                          setPhaseAndSave("shapeCanvas");
                          setActiveTab("edit");
                        }}
                        className="w-full bg-primary text-primary-foreground font-semibold"
                      >
                        Continue to Edit →
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
                )}

                {/* EDIT TAB */}
                {activeTab === "edit" && (
                  <div className="flex-1 flex flex-col">
                    <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                      <div>
                        <h3 className="text-base font-serif font-semibold text-foreground mb-1">Edit your outline</h3>
                        <p className="text-xs text-muted-foreground">
                          Use Pen ✏️ to draw missing lines. Use Erase ⌫ to remove anything extra. Use Smooth to clean up jagged edges.
                        </p>
                      </div>
                    </div>

                    {/* Edit tab footer */}
                    <div className="p-4 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => {
                          setPhaseAndSave(traceImageDataUrl ? "traceReview" : "entry");
                          setActiveTab("trace");
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ← Back to Trace
                      </button>
                      <Button
                        onClick={() => {
                          setPhaseAndSave("style");
                          setActiveTab("style");
                        }}
                        className="bg-primary text-primary-foreground font-semibold px-6"
                      >
                        Continue to Style →
                      </Button>
                    </div>
                  </div>
                )}

                {/* STYLE TAB */}
                {activeTab === "style" && (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-6">
                        <h3 className="text-base font-serif font-semibold text-foreground mb-1">Style your map</h3>
                        <p className="text-xs text-muted-foreground mb-6">
                          These are saved for this project. You can change them any time.
                        </p>
                      </div>
                      <StylePreferencesPanel prefs={stylePrefs} onChange={setStylePrefs} forceExpanded />
                    </div>

                    {/* Style tab footer */}
                    <div className="p-4 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => {
                          setPhaseAndSave("shapeCanvas");
                          setActiveTab("edit");
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ← Back to Edit
                      </button>
                      <Button
                        onClick={() => {
                          setPhaseAndSave("renderReady");
                          setActiveTab("add");
                        }}
                        className="bg-primary text-primary-foreground font-semibold px-6"
                      >
                        Continue to Add →
                      </Button>
                    </div>
                  </div>
                )}

                {/* ADD TAB */}
                {activeTab === "add" && (
                  <div className="flex-1 flex flex-col">
                    <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                      <div>
                        <h3 className="text-base font-serif font-semibold text-foreground mb-1">Add to your map</h3>
                        <p className="text-xs text-muted-foreground">
                          Add locations and events to your map. You can always do this later from the Locations page.
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast({ title: "Pin placement", description: "Click on the map to place a pin." });
                        }}
                      >
                        Place a Pin
                      </Button>
                    </div>

                    {/* Add tab footer */}
                    <div className="p-4 border-t border-border">
                      <Button
                        onClick={() => {
                          handleRender();
                          handleUseMap();
                        }}
                        className="w-full bg-primary text-primary-foreground font-semibold h-11"
                      >
                        Render & Save →
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
