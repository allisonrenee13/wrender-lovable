import { useState, useRef, useCallback, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import UnifiedMapBuilder from "@/components/map/UnifiedMapBuilder";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const MapPage = () => {
  const { currentProject, addPin } = useProject();
  const [savedSVG, setSavedSVG] = useState<string | null>(null);
  const [editingSVG, setEditingSVG] = useState<string | null>(null);
  const [versions, setVersions] = useState<string[]>([]);
  const [addingPin, setAddingPin] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [pinName, setPinName] = useState("");
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const showBuilder = editingSVG !== null || savedSVG === null;

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10">
        <p className="text-sm text-muted-foreground">
          Create a project first to start building your map.
        </p>
      </div>
    );
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!addingPin || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ x, y });
    setPinName("");
  };

  const handleConfirmPin = () => {
    if (!pendingPin || !pinName.trim()) return;
    addPin({
      title: pinName.trim(),
      x: pendingPin.x,
      y: pendingPin.y,
      type: "location",
      tier: "main",
      chapter: 0,
      location: "",
      note: "",
    });
    setPendingPin(null);
    setPinName("");
    setAddingPin(false);
  };

  const handleRenderCallback = (svg: string) => {
    if (savedSVG) setVersions((v) => [...v, savedSVG]);
    setSavedSVG(svg);
    setEditingSVG(null);
  };

  if (showBuilder) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 px-6 py-2.5 bg-muted/50 border-b border-border">
          <span className="text-xs text-muted-foreground font-medium tracking-wide">Map Builder</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <UnifiedMapBuilder
            onRender={handleRenderCallback}
            initialSVG={editingSVG}
          />
        </div>
      </div>
    );
  }

  const displaySVG = savedSVG!.replace(
    /<svg([^>]*)>/,
    '<svg$1 style="width:100%;height:100%;display:block;">'
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="font-serif font-semibold text-base">
            {currentProject.title}
          </h2>
          <span className="text-xs text-muted-foreground">v{versions.length + 1}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditingSVG(savedSVG)}>
          Edit map
        </Button>
      </div>

      {/* Pin placement banner */}
      {addingPin && (
        <div className="px-6 py-2 bg-accent/50 border-b border-border text-center">
          <span className="text-xs text-accent-foreground font-medium">
            Click anywhere on the map to place a pin
          </span>
          <button
            onClick={() => setAddingPin(false)}
            className="ml-3 text-xs text-muted-foreground hover:text-foreground underline"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
        <div
          ref={mapContainerRef}
          className="relative w-full max-w-[600px]"
          style={{ aspectRatio: "1 / 1", cursor: addingPin ? "crosshair" : "default" }}
          onClick={handleMapClick}
        >
          <div
            className="w-full h-full border border-border rounded-lg overflow-hidden shadow-md bg-background"
            dangerouslySetInnerHTML={{ __html: displaySVG }}
          />
          {currentProject.pins?.map((pin) => (
            <div
              key={pin.id}
              style={{
                position: "absolute",
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <div className="w-3 h-3 rounded-full bg-destructive border-2 border-background shadow-sm" />
              <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap drop-shadow-sm">
                {pin.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Locations panel */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Locations</h3>
          <Button size="sm" variant="outline" onClick={() => setAddingPin(true)}>
            + Add location
          </Button>
        </div>
        {!currentProject.pins?.length && (
          <p className="text-xs text-muted-foreground">
            No locations yet — click "Add location" then click anywhere on the map to place a pin.
          </p>
        )}
        {currentProject.pins?.map((pin) => (
          <div key={pin.id} className="flex items-center gap-2 py-1.5 text-sm">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            {pin.title}
          </div>
        ))}
      </div>

      {/* Pin naming dialog */}
      <Dialog open={!!pendingPin} onOpenChange={(open) => { if (!open) setPendingPin(null); }}>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle className="text-base font-serif">Name this location</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              value={pinName}
              onChange={(e) => setPinName(e.target.value)}
              placeholder="e.g. Dragon's Lair"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirmPin(); }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPendingPin(null)}>Cancel</Button>
              <Button size="sm" onClick={handleConfirmPin} disabled={!pinName.trim()}>Add Pin</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapPage;
