import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import StepIndicator, { type BuilderStep } from "./builder/StepIndicator";
import EntryScreen from "./builder/EntryScreen";
import TemplatePicker from "./builder/TemplatePicker";
import UploadTraceFlow from "./builder/UploadTraceFlow";
import EditingCanvas from "./builder/EditingCanvas";
import StyleStep from "./builder/StyleStep";
import RenderPreview from "./builder/RenderPreview";
import IslaSerranoMap from "./IslaSerranoMap";
import CapeCodeMap from "./CapeCodeMap";
import CommunityMap from "./CommunityMap";
import PrythianMap from "./PrythianMap";
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

const UnifiedMapBuilder = ({ onConfirm }: UnifiedMapBuilderProps) => {
  const { currentProject, confirmMap } = useProject();
  const isDemoIsla = currentProject.id === "isla-serrano";

  // Isla Serrano starts at step 3 (render ready)
  const [phase, setPhase] = useState<Phase>(isDemoIsla ? "renderReady" : "entry");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MapTemplate | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const [canvasState, setCanvasState] = useState<CanvasState>(
    isDemoIsla
      ? {
          paths: [
            "M300 75 Q330 72 345 85 Q370 100 365 120 Q375 135 370 155 Q380 180 375 200 Q385 225 378 250 Q382 275 375 295 Q380 315 370 335 Q378 355 372 375 Q380 400 368 420 Q365 445 355 460 Q348 480 338 500 Q330 520 322 540 Q315 560 308 575 Q303 588 300 600 Q297 588 292 575 Q285 560 278 540 Q270 520 262 500 Q252 480 245 460 Q235 445 232 420 Q220 400 228 375 Q222 355 230 335 Q220 315 225 295 Q218 275 222 250 Q215 225 225 200 Q220 180 230 155 Q225 135 235 120 Q230 100 255 85 Q270 72 300 75Z",
          ],
          features: [
            { type: "building", x: 310, y: 160 },
            { type: "road", x: 300, y: 85, x2: 300, y2: 560 },
            { type: "elevation", x: 300, y: 580 },
          ],
          referenceImage: null,
          referenceOpacity: 20,
          nodeCount: 12,
        }
      : defaultCanvas
  );

  const [stylePrefs, setStylePrefs] = useState<StylePreferences>(
    isDemoIsla ? islaSerranoStylePrefs : defaultStylePreferences
  );

  const hasShape = canvasState.paths.length > 0 || selectedTemplate !== null;
  const currentStep = phaseToStep(phase);
  const completed = completedStepsForPhase(phase);

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

  const handleAutoTrace = () => {
    setCanvasState({
      ...defaultCanvas,
      paths: [
        "M300 75 Q330 72 345 85 Q370 100 365 120 Q375 135 370 155 Q380 180 375 200 Q385 225 378 250 Q382 275 375 295 Q380 315 370 335 Q378 355 372 375 Q380 400 368 420 Q365 445 355 460 Q348 480 338 500 Q330 520 322 540 Q315 560 308 575 Q303 588 300 600 Q297 588 292 575 Q285 560 278 540 Q270 520 262 500 Q252 480 245 460 Q235 445 232 420 Q220 400 228 375 Q222 355 230 335 Q220 315 225 295 Q218 275 222 250 Q215 225 225 200 Q220 180 230 155 Q225 135 235 120 Q230 100 255 85 Q270 72 300 75Z",
      ],
      nodeCount: 12,
    });
    setPhase("shapeCanvas");
    toast({ title: "Trace complete", description: "Edit the shape with sculpt tools, or continue to style." });
  };

  const handleManualTrace = (image: string) => {
    setCanvasState({ ...defaultCanvas, referenceImage: image, referenceOpacity: 40 });
    setPhase("shapeCanvas");
  };

  const handleRender = () => {
    setPhase("rendering");
    setTimeout(() => setPhase("preview"), 1500);
  };

  const handleUseMap = () => {
    confirmMap();
    onConfirm?.();
  };

  const renderProjectMap = () => {
    switch (currentProject.id) {
      case "paper-palace":
        return <CapeCodeMap selectedLocationId={selectedLocationId} onSelectLocation={setSelectedLocationId} pins={currentProject.pins} />;
      case "the-giver":
        return <CommunityMap selectedLocationId={selectedLocationId} onSelectLocation={setSelectedLocationId} pins={currentProject.pins} />;
      case "acotar":
        return <PrythianMap selectedLocationId={selectedLocationId} onSelectLocation={setSelectedLocationId} pins={currentProject.pins} />;
      default:
        return <IslaSerranoMap selectedLocationId={selectedLocationId} onSelectLocation={setSelectedLocationId} />;
    }
  };

  const colors = backgroundColors[stylePrefs.background];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Step Indicator — always visible */}
      <StepIndicator currentStep={currentStep} completedSteps={completed} />

      {/* Phase content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Step 1: Entry cards */}
        {phase === "entry" && <EntryScreen onSelect={handleEntrySelect} />}

        {/* Step 1: Upload flow */}
        {phase === "upload" && (
          <UploadTraceFlow
            onImageUploaded={() => {}}
            onAutoTrace={handleAutoTrace}
            onManualTrace={handleManualTrace}
          />
        )}

        {/* Step 1: Shape canvas */}
        {phase === "shapeCanvas" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <EditingCanvas
              initialTemplate={selectedTemplate}
              referenceImage={canvasState.referenceImage}
              canvasState={canvasState}
              onCanvasChange={setCanvasState}
              stylePrefs={stylePrefs}
              onStylePrefsChange={setStylePrefs}
              onRenderPreview={() => {}} // disabled in step flow
              demoMode={false}
              hideStylePanel
              hideRenderButton
            />
            {/* Continue button */}
            {hasShape && (
              <div className="px-5 py-3 border-t border-border bg-card flex justify-end">
                <Button
                  onClick={() => setPhase("style")}
                  className="bg-primary text-primary-foreground font-semibold px-6"
                >
                  Continue to Style →
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Style */}
        {phase === "style" && (
          <StyleStep
            stylePrefs={stylePrefs}
            onStylePrefsChange={setStylePrefs}
            canvasState={canvasState}
            onContinue={() => setPhase("renderReady")}
            onBack={() => setPhase("shapeCanvas")}
          />
        )}

        {/* Step 3: Render ready */}
        {phase === "renderReady" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6" style={{ backgroundColor: colors.bg }}>
            {/* Preview of styled outline */}
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
                onClick={() => setPhase("style")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                ← Back to Style
              </button>
            </div>

            {/* Status bar */}
            <div className="w-full text-center">
              <span className="text-[11px] text-muted-foreground">
                {canvasState.nodeCount || canvasState.paths.length > 0 ? "12" : "0"} path nodes · {canvasState.features.length} features placed · Style: {lineStyleLabels[stylePrefs.lineStyle]} · Ready to render
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Rendering animation */}
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

        {/* Step 3: Preview result */}
        {phase === "preview" && (
          <RenderPreview
            projectId={currentProject.id}
            onUseMap={handleUseMap}
            onKeepEditing={() => setPhase("shapeCanvas")}
            selectedLocationId={selectedLocationId}
            onSelectLocation={setSelectedLocationId}
            pins={currentProject.pins}
          />
        )}
      </div>

      {/* Template Picker Modal */}
      <TemplatePicker
        open={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
};

export default UnifiedMapBuilder;
