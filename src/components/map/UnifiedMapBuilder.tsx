import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { toast } from "@/hooks/use-toast";
import EntryScreen from "./builder/EntryScreen";
import TemplatePicker from "./builder/TemplatePicker";
import UploadTraceFlow from "./builder/UploadTraceFlow";
import EditingCanvas from "./builder/EditingCanvas";
import RenderPreview from "./builder/RenderPreview";
import type { BuilderPath, MapTemplate, AIDirectionNotes, CanvasState } from "./builder/types";

type Phase = "entry" | "upload" | "editing" | "rendering" | "preview";

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

const emptyNotes: AIDirectionNotes = { renderStyle: "", atmosphereNotes: "", whatToEmphasise: "" };

// Demo state for Isla Serrano — starts in editing canvas via "upload & trace" path
const islaSerranoNotes: AIDirectionNotes = {
  renderStyle: "warm and nautical, sun-bleached",
  atmosphereNotes: "A small barrier island. The lighthouse at the south point is the most important landmark. The harbour is sheltered and intimate.",
  whatToEmphasise: "",
};

const UnifiedMapBuilder = ({ onConfirm }: UnifiedMapBuilderProps) => {
  const { currentProject, confirmMap } = useProject();

  const isDemoIsla = currentProject.id === "isla-serrano";

  const [phase, setPhase] = useState<Phase>(isDemoIsla ? "editing" : "entry");
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

  const [aiNotes, setAINotes] = useState<AIDirectionNotes>(isDemoIsla ? islaSerranoNotes : emptyNotes);

  // --- Path handlers ---

  const handleEntrySelect = (path: BuilderPath) => {
    if (path === "template") {
      setTemplatePickerOpen(true);
    } else if (path === "upload") {
      setPhase("upload");
    } else {
      // draw from scratch
      setCanvasState(defaultCanvas);
      setPhase("editing");
    }
  };

  const handleTemplateSelect = (template: MapTemplate) => {
    setSelectedTemplate(template);
    setTemplatePickerOpen(false);
    setCanvasState({ ...defaultCanvas, paths: [template.svgPath] });
    setPhase("editing");
    toast({ title: "Template loaded", description: "Edit the shape to match your world." });
  };

  const handleAutoTrace = (_image: string) => {
    // Simulated: load the demo island outline as if traced
    setCanvasState({
      ...defaultCanvas,
      paths: [
        "M300 75 Q330 72 345 85 Q370 100 365 120 Q375 135 370 155 Q380 180 375 200 Q385 225 378 250 Q382 275 375 295 Q380 315 370 335 Q378 355 372 375 Q380 400 368 420 Q365 445 355 460 Q348 480 338 500 Q330 520 322 540 Q315 560 308 575 Q303 588 300 600 Q297 588 292 575 Q285 560 278 540 Q270 520 262 500 Q252 480 245 460 Q235 445 232 420 Q220 400 228 375 Q222 355 230 335 Q220 315 225 295 Q218 275 222 250 Q215 225 225 200 Q220 180 230 155 Q225 135 235 120 Q230 100 255 85 Q270 72 300 75Z",
      ],
      nodeCount: 12,
    });
    setPhase("editing");
    toast({ title: "Trace complete", description: "Trace result is editable. Drag nodes to adjust, or use sculpt tools to reshape." });
  };

  const handleManualTrace = (image: string) => {
    setCanvasState({ ...defaultCanvas, referenceImage: image, referenceOpacity: 40 });
    setPhase("editing");
  };

  const handleRenderPreview = () => {
    setPhase("rendering");
    const hasNotes = !!(aiNotes.renderStyle || aiNotes.atmosphereNotes || aiNotes.whatToEmphasise);
    setTimeout(() => {
      setPhase("preview");
    }, 2500);
  };

  const handleUseMap = () => {
    confirmMap();
    onConfirm?.();
  };

  const handleKeepEditing = () => {
    setPhase("editing");
  };

  const hasNotes = !!(aiNotes.renderStyle || aiNotes.atmosphereNotes || aiNotes.whatToEmphasise);

  return (
    <div className="flex h-full">
      {/* Full-width content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Entry */}
        {phase === "entry" && <EntryScreen onSelect={handleEntrySelect} />}

        {/* Upload flow */}
        {phase === "upload" && (
          <UploadTraceFlow
            onImageUploaded={() => {}}
            onAutoTrace={handleAutoTrace}
            onManualTrace={handleManualTrace}
          />
        )}

        {/* Editing canvas */}
        {phase === "editing" && (
          <EditingCanvas
            initialTemplate={selectedTemplate}
            referenceImage={canvasState.referenceImage}
            canvasState={canvasState}
            onCanvasChange={setCanvasState}
            aiNotes={aiNotes}
            onAINotesChange={setAINotes}
            onRenderPreview={handleRenderPreview}
            demoMode={isDemoIsla && canvasState.paths.length > 0}
          />
        )}

        {/* Rendering animation */}
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
            <h3 className="text-lg font-serif font-semibold text-foreground">
              {hasNotes ? "Rendering your sketch with your direction notes..." : "Rendering your sketch..."}
            </h3>
            <p className="text-sm text-muted-foreground">This takes a few seconds</p>
          </div>
        )}

        {/* Render preview */}
        {phase === "preview" && (
          <RenderPreview
            projectId={currentProject.id}
            hasAINotes={hasNotes}
            onUseMap={handleUseMap}
            onKeepEditing={handleKeepEditing}
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
