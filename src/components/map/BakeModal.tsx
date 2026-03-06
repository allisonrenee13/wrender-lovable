import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Location } from "@/data/projects";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, X } from "lucide-react";

interface BakeModalProps {
  open: boolean;
  onClose: () => void;
}

const BakeModal = ({ open, onClose }: BakeModalProps) => {
  const { currentProject, bakeLocations } = useProject();
  const [step, setStep] = useState<"select" | "preview" | "done">("select");
  const pinnedLocations = currentProject.locations.filter((l) => l.status === "pinned");
  const [selectedIds, setSelectedIds] = useState<string[]>(pinnedLocations.map((l) => l.id));
  const [keepPins, setKeepPins] = useState(false);

  const toggleId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedNames = pinnedLocations
    .filter((l) => selectedIds.includes(l.id))
    .map((l) => l.name);

  const handleApply = () => {
    bakeLocations(selectedIds);
    setStep("done");
    setTimeout(() => {
      onClose();
      setStep("select");
    }, 1500);
  };

  const handleClose = () => {
    onClose();
    setStep("select");
    setSelectedIds(pinnedLocations.map((l) => l.id));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "p-0 gap-0 border-none overflow-hidden",
        step === "preview" ? "sm:max-w-4xl" : "sm:max-w-lg"
      )}>
        {step === "select" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-serif font-semibold text-foreground">Bake Into Map</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Select which pinned locations to illustrate into your map artwork.
            </p>

            <div className="space-y-1 mb-6">
              {pinnedLocations.map((loc) => (
                <label
                  key={loc.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.includes(loc.id)}
                    onCheckedChange={() => toggleId(loc.id)}
                  />
                  <span className="text-sm font-medium flex-1">{loc.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{loc.type}</Badge>
                  <span className="text-[10px] text-muted-foreground">Ch. {loc.firstAppears}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Selected: {selectedIds.length} location{selectedIds.length !== 1 ? "s" : ""} to bake into map
              </span>
              <Button
                onClick={() => setStep("preview")}
                disabled={selectedIds.length === 0}
                className="bg-primary text-primary-foreground"
              >
                Preview Changes <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="flex flex-col">
            {/* Side by side preview */}
            <div className="grid grid-cols-2 min-h-[400px]">
              {/* Current map */}
              <div className="border-r border-border">
                <div className="px-4 py-3 border-b border-border">
                  <span className="text-xs font-serif text-muted-foreground">Current Map</span>
                </div>
                <div className="p-4 flex items-center justify-center h-[360px] bg-muted/30">
                  <div className="w-full h-full rounded-md bg-muted/50 flex items-center justify-center relative overflow-hidden">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-2xl">🗺️</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-serif italic">
                        v{currentProject.mapVersions.length || 1} · Current
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Updated map */}
              <div>
                <div className="px-4 py-3 border-b border-border">
                  <span className="text-xs font-serif text-muted-foreground">Updated Map</span>
                </div>
                <div className="p-4 flex items-center justify-center h-[360px] bg-muted/30">
                  <div className="w-full h-full rounded-md bg-muted/50 flex items-center justify-center relative overflow-hidden">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-2xl">🗺️</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-serif italic">
                        v{(currentProject.mapVersions.length || 1) + 1} · Updated
                      </p>
                      {/* Gold glow highlights for new locations */}
                      {selectedNames.map((name, i) => (
                        <div
                          key={name}
                          className="absolute rounded-full animate-pulse"
                          style={{
                            width: 32,
                            height: 32,
                            background: "hsla(43, 50%, 54%, 0.4)",
                            boxShadow: "0 0 16px 4px hsla(43, 50%, 54%, 0.3)",
                            top: `${30 + i * 25}%`,
                            left: `${40 + (i % 2) * 20}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend & summary */}
            <div className="px-6 py-4 border-t border-border space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-secondary" />
                <span className="font-medium">New in this update</span>
                <span className="w-2 h-2 rounded-full bg-secondary" />
              </div>
              <p className="text-sm text-foreground">
                Adding {selectedNames.length} new illustrated location{selectedNames.length !== 1 ? "s" : ""}:{" "}
                <span className="font-medium">{selectedNames.join(", ")}</span>
              </p>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleApply} className="bg-primary text-primary-foreground">
                  Apply Update
                </Button>
                <button onClick={handleClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Keep Current Map
                </button>
              </div>
              <button
                onClick={() => {
                  setKeepPins(true);
                  handleApply();
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Apply but keep as pins too
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-serif font-semibold mb-1">Map Updated</h3>
            <p className="text-sm text-muted-foreground">
              Version {currentProject.mapVersions.length} saved
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BakeModal;
