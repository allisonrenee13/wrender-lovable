import { useState, useRef } from "react";
import { useProject } from "@/context/ProjectContext";
import UnifiedMapBuilder from "@/components/map/UnifiedMapBuilder";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X, Trash2, Move } from "lucide-react";

const MapPage = () => {
  const { currentProject, addPin, removePin, updatePin } = useProject();
  const [savedSVG, setSavedSVG] = useState<string | null>(null);
  const [editingSVG, setEditingSVG] = useState<string | null>(null);
  const [versions, setVersions] = useState<string[]>([]);
  const [addingPin, setAddingPin] = useState(false);
  const [movingPinId, setMovingPinId] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [pinName, setPinName] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
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
    if ((!addingPin && !movingPinId) || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (movingPinId) {
      updatePin(movingPinId, { x, y });
      setMovingPinId(null);
      return;
    }

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

  const handleMovePin = (pinId: string) => {
    setDrawerOpen(false);
    setMovingPinId(pinId);
  };

  const handleSaveTitle = (pinId: string) => {
    if (editingTitleValue.trim()) {
      updatePin(pinId, { title: editingTitleValue.trim() });
    }
    setEditingTitleId(null);
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

  const isPlacing = addingPin || !!movingPinId;

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

      {/* Pin placement / move banner */}
      {isPlacing && (
        <div className="px-6 py-2 bg-accent/50 border-b border-border text-center">
          <span className="text-xs text-accent-foreground font-medium">
            {movingPinId ? "Click on the map to move the pin" : "Click anywhere on the map to place a pin"}
          </span>
          <button
            onClick={() => { setAddingPin(false); setMovingPinId(null); }}
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
          style={{ aspectRatio: "1 / 1", cursor: isPlacing ? "crosshair" : "default" }}
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
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium">Locations</h3>
          <Button size="sm" variant="outline" onClick={() => setAddingPin(true)}>
            + Add location
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDrawerOpen(true)}>
            Manage
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

      {/* Manage Pins Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-[360px] bg-background border-l border-border shadow-lg animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold">Manage Pins</h3>
              <button onClick={() => setDrawerOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Locations */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Locations</h4>
                {!currentProject.pins?.length && (
                  <p className="text-xs text-muted-foreground italic">No pins yet</p>
                )}
                <div className="space-y-1.5">
                  {currentProject.pins?.map((pin) => (
                    <div key={pin.id} className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/50 group">
                      <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                      {editingTitleId === pin.id ? (
                        <Input
                          value={editingTitleValue}
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          onBlur={() => handleSaveTitle(pin.id)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(pin.id); }}
                          className="h-7 text-sm flex-1"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="text-sm flex-1 cursor-pointer hover:underline"
                          onClick={() => { setEditingTitleId(pin.id); setEditingTitleValue(pin.title); }}
                        >
                          {pin.title}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleMovePin(pin.id)}
                      >
                        <Move className="h-3 w-3 mr-1" />
                        Move
                      </Button>
                      <button
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePin(pin.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Events */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Events</h4>
                <p className="text-xs text-muted-foreground italic">Coming soon</p>
              </div>

              {/* Characters */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Characters</h4>
                <p className="text-xs text-muted-foreground italic">Coming soon</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MapPage;
