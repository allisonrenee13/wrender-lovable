import { useState, useRef } from "react";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, BookOpen, Pencil } from "lucide-react";
import IslaSerranoMap from "./IslaSerranoMap";
import CapeCodeMap from "./CapeCodeMap";
import CommunityMap from "./CommunityMap";
import PrythianMap from "./PrythianMap";

type BuilderState = "idle" | "generating" | "preview";

const demoDescriptions: Record<string, string> = {
  "isla-serrano":
    "A long narrow barrier island running north to south. Atlantic Ocean on the east with open beaches, calm bay on the west with mangroves and docks. One causeway entering from the north — the only way on or off. A grand faded hotel on the northern beach called The Solano Hotel. A lighthouse at the remote southern tip called Cape Serrano Lighthouse. A small village in the centre with a green, a yacht club on the bay side, and a beach club on the ocean side. Feels like Florida Keys warmth meets Ogunquit Maine — storybook, sun-bleached, lush.",
  "paper-palace":
    "A curved peninsula reaching into the Atlantic — Cape Cod, Massachusetts. Summer houses lining a freshwater pond. Dense woods to the north. A boathouse tucked along the shore. Winding sandy roads connecting everything.",
  "the-giver":
    "A perfectly ordered circular community. Concentric rings of identical family dwelling units. An auditorium at the centre. The Annex at the boundary. A river marking the edge — beyond it, Elsewhere.",
  "acotar":
    "The realm of Prythian. Seven courts divided by magic. The Spring Court lush and green to the east. The Night Court dark and star-filled to the northwest. Under the Mountain looms at the centre-north. The Wall separates faerie from the mortal lands to the south.",
};

const UnifiedMapBuilder = () => {
  const { currentProject } = useProject();
  const descRef = useRef<HTMLTextAreaElement>(null);

  const defaultDesc = demoDescriptions[currentProject.id] || "";
  const [description, setDescription] = useState(defaultDesc);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [state, setState] = useState<BuilderState>("idle");
  const [versions, setVersions] = useState<number[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const handleAddImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setReferenceImages((prev) => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
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
              className="min-h-[200px] text-sm border-border bg-card resize-none leading-relaxed"
            />
          </div>

          {/* Section 2: Reference Images */}
          <div className="space-y-2">
            <label className="text-sm font-serif font-semibold text-foreground">
              Add reference images
            </label>
            <p className="text-xs text-muted-foreground">
              Maps, photos, satellite views, sketches — anything that captures the feel or shape of your world
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
              {referenceImages.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg border border-border overflow-hidden flex-shrink-0 group">
                  <img src={img} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-foreground/70 text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddImage}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 flex flex-col items-center justify-center gap-1 flex-shrink-0 transition-colors"
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add ref</span>
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              The more references you add, the more accurate your map becomes.
            </p>
          </div>

          {/* Section 3: Generate */}
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

          {/* Coming Soon: Pen Tool */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1 opacity-60">
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">Pen Tool — coming soon</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Circle areas on your reference images to include or exclude, or annotate your generated map to mark what needs changing.
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
            {/* Pen sketching animation */}
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
                {/* Pen nib */}
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
            {/* Map */}
            <div className="flex-1 flex items-start justify-center">
              {renderPreviewMap()}
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

              {/* Version history */}
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
    </div>
  );
};

export default UnifiedMapBuilder;
