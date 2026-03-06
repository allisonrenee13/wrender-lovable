import { useState, useRef } from "react";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, BookOpen, Pencil } from "lucide-react";
import IslaSerranoMap from "./IslaSerranoMap";
import CapeCodeMap from "./CapeCodeMap";
import CommunityMap from "./CommunityMap";
import PrythianMap from "./PrythianMap";
import MarkupModal from "./markup/MarkupModal";
import type { MarkupImage } from "./markup/types";
import refKeyBiscayne from "@/assets/ref-key-biscayne.jpg";
import refMarcoIsland from "@/assets/ref-marco-island.jpg";

type BuilderState = "idle" | "generating" | "preview";

const demoDescriptions: Record<string, string> = {
  "isla-serrano":
    "A long narrow barrier island. Atlantic Ocean on the east, calm bay on the west.",
  "paper-palace":
    "A curved peninsula reaching into the Atlantic — Cape Cod, Massachusetts. Summer houses lining a freshwater pond. Dense woods to the north.",
  "the-giver":
    "A perfectly ordered circular community. Concentric rings of identical family dwelling units. An auditorium at the centre.",
  "acotar":
    "The realm of Prythian. Seven courts divided by magic. The Spring Court lush and green to the east.",
};

const demoNotes: Record<string, string> = {
  "isla-serrano": "Want to keep the causeway feel from Key Biscayne. The lighthouse end is critical — remote, windswept. Village should feel like a New England harbour town dropped into tropical warmth.",
};

const createDemoImages = (projectId: string): MarkupImage[] => {
  if (projectId === "isla-serrano") {
    return [
      {
        id: "key-biscayne",
        src: refKeyBiscayne,
        label: "Key Biscayne",
        markups: [],
        notes: "Use the overall island shape and the causeway entry from the north. The southern tip is perfect for the lighthouse. Ignore the northern developed area — my island is quieter.",
        hasMarkup: false,
      },
      {
        id: "marco-island",
        src: refMarcoIsland,
        label: "Marco Island",
        markups: [],
        notes: "Love the overall silhouette of this — slightly wider than Key Biscayne. Use as the base shape.",
        hasMarkup: false,
      },
    ];
  }
  return [];
};

const UnifiedMapBuilder = () => {
  const { currentProject } = useProject();
  const descRef = useRef<HTMLTextAreaElement>(null);

  const defaultDesc = demoDescriptions[currentProject.id] || "";
  const [description, setDescription] = useState(defaultDesc);
  const [creationNotes, setCreationNotes] = useState(demoNotes[currentProject.id] || "");
  const [referenceImages, setReferenceImages] = useState<MarkupImage[]>(
    createDemoImages(currentProject.id)
  );
  const [state, setState] = useState<BuilderState>("idle");
  const [versions, setVersions] = useState<number[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [markupOpen, setMarkupOpen] = useState(false);
  const [markupInitialId, setMarkupInitialId] = useState<string | undefined>();

  const handleAddImage = () => {
    if (referenceImages.length >= 3) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const newImg: MarkupImage = {
            id: `ref-${Date.now()}`,
            src: ev.target.result as string,
            label: `Reference ${referenceImages.length + 1}`,
            markups: [],
            notes: "",
            hasMarkup: false,
          };
          setReferenceImages((prev) => [...prev, newImg]);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleRemoveImage = (id: string) => {
    setReferenceImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleOpenMarkup = (imageId?: string) => {
    setMarkupInitialId(imageId);
    setMarkupOpen(true);
  };

  const handleSaveMarkup = (updatedImages: MarkupImage[]) => {
    setReferenceImages(updatedImages);
  };

  const handleMarkUpGeneratedMap = () => {
    // Add the generated map as a reference image for markup
    const generatedMapImg: MarkupImage = {
      id: "generated-map",
      src: "/placeholder.svg", // In real app, this would be a screenshot of the generated map
      label: "Generated Map",
      markups: [],
      notes: "",
      hasMarkup: false,
    };
    const allImages = [generatedMapImg, ...referenceImages.filter((img) => img.id !== "generated-map")];
    setReferenceImages(allImages);
    setMarkupInitialId("generated-map");
    setMarkupOpen(true);
  };

  const handleGenerate = () => {
    setState("generating");
    setTimeout(() => {
      setState("preview");
      setVersions((prev) => [...prev, prev.length + 1]);
    }, 2500);
  };

  const handleKeepRefining = () => {
    descRef.current?.focus();
    descRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const renderPreviewMap = () => {
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

  return (
    <div className="flex h-full">
      {/* Left — Input Panel */}
      <div className="w-[420px] min-w-[360px] border-r border-border flex flex-col overflow-y-auto">
        <div className="p-6 space-y-8 flex-1">
          {/* Section 1: Describe */}
          <div className="space-y-2">
            <label className="text-sm font-serif font-semibold text-foreground">
              Describe your world
            </label>
            <Textarea
              ref={descRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your location, geography, and key places. Be as detailed or loose as you like. You can keep adding detail after seeing the preview."
              className="min-h-[160px] text-sm border-border bg-card resize-none leading-relaxed"
            />
          </div>

          {/* Section 2: Creation Notes */}
          <div className="space-y-2">
            <label className="text-sm font-serif font-semibold text-foreground">
              Creation Notes
            </label>
            <Textarea
              value={creationNotes}
              onChange={(e) => setCreationNotes(e.target.value)}
              placeholder="Private notes for yourself — what you want to keep, change, or figure out later."
              className="min-h-[80px] text-sm border-border bg-muted/30 resize-none leading-relaxed text-muted-foreground"
            />
          </div>

          {/* Section 3: Reference Images */}
          <div className="space-y-2">
            <label className="text-sm font-serif font-semibold text-foreground">
              Reference Images
            </label>
            <p className="text-xs text-muted-foreground">
              Upload up to 3 reference images — maps, satellite views, photos, sketches
            </p>
            <div className="flex gap-3 pt-1">
              {/* Image slots */}
              {referenceImages.map((img) => (
                <div key={img.id} className="flex flex-col items-center gap-1.5">
                  <div className="relative w-24 h-24 rounded-lg border border-border overflow-hidden group">
                    <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1 right-1 w-5 h-5 bg-foreground/70 text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {/* Markup button */}
                    <button
                      onClick={() => handleOpenMarkup(img.id)}
                      className="absolute bottom-1 right-1 w-6 h-6 bg-background/90 border border-border rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="h-3 w-3 text-foreground" />
                    </button>
                    {/* Has markup indicator */}
                    {img.hasMarkup && (
                      <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-green-500 border border-background" />
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{img.label}</span>
                </div>
              ))}
              {/* Add slot */}
              {referenceImages.length < 3 && (
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={handleAddImage}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 flex flex-col items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Add image</span>
                  </button>
                  <span className="text-[11px] text-muted-foreground">
                    Reference {referenceImages.length + 1}
                  </span>
                </div>
              )}
            </div>

            {/* Mark Up Images button */}
            {referenceImages.length > 0 && (
              <button
                onClick={() => handleOpenMarkup()}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Mark Up Images</span>
              </button>
            )}
          </div>

          {/* Section 4: Generate */}
          <div className="space-y-3">
            <Button
              onClick={handleGenerate}
              disabled={state === "generating" || !description.trim()}
              className="w-full bg-primary text-secondary font-semibold h-11"
            >
              Generate Map Preview
            </Button>
            <p className="text-[11px] text-muted-foreground italic text-center">
              Not quite right? Add more description or images above and generate again — each version improves on the last.
            </p>
          </div>

        </div>
      </div>

      {/* Right — Preview Window */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ backgroundColor: "#FAFAF7" }}>
        {state === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-4 max-w-md">
              <BookOpen className="h-10 w-10 text-muted-foreground/40" />
              <h3 className="text-lg font-serif font-semibold text-foreground">Your map will appear here</h3>
              <p className="text-sm text-muted-foreground text-center">
                Describe your world and add references on the left, then hit Generate
              </p>
            </div>
          </div>
        )}

        {state === "generating" && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 gap-4">
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
                  <animateMotion
                    path="M 8 48 Q 20 20, 32 36 Q 44 52, 56 16"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
            <h3 className="text-lg font-serif font-semibold text-foreground">Sketching your world...</h3>
            <p className="text-sm text-muted-foreground">This takes a few seconds</p>
          </div>
        )}

        {state === "preview" && (
          <div className="flex-1 flex flex-col p-6">
            <div className="flex-1 flex items-start justify-center">
              {renderPreviewMap()}
            </div>

            {/* Mark Up This Map */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleMarkUpGeneratedMap}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Mark Up This Map</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col items-center gap-3 pt-4 pb-2">
              <div className="flex items-center gap-4">
                <Button className="bg-primary text-primary-foreground font-semibold px-8 h-10">
                  Use This Map
                </Button>
                <button
                  onClick={handleKeepRefining}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  Keep Refining
                </button>
              </div>

              {versions.length > 1 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Previous versions</span>
                  <div className="flex gap-1.5">
                    {versions.slice(0, -1).slice(-3).map((v) => (
                      <button
                        key={v}
                        className="w-8 h-8 rounded border border-border bg-muted/50 hover:border-muted-foreground/40 transition-colors flex items-center justify-center"
                        title={`Version ${v}`}
                      >
                        <span className="text-[9px] text-muted-foreground">v{v}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Markup Modal */}
      <MarkupModal
        open={markupOpen}
        onClose={() => setMarkupOpen(false)}
        images={referenceImages}
        onSave={handleSaveMarkup}
        initialSelectedId={markupInitialId}
      />
    </div>
  );
};

export default UnifiedMapBuilder;
