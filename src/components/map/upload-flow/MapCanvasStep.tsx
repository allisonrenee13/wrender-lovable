import { useState } from "react";
import { RefreshCw, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import IslaSerranoMap from "@/components/map/IslaSerranoMap";
import AddPlacesPanel from "./AddPlacesPanel";
import LocationDetailDrawer from "./LocationDetailDrawer";
import { type IslaSerranoLocation } from "@/data/isla-serrano";

interface MapCanvasStepProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
  uploadedImage?: string | null;
  locations: IslaSerranoLocation[];
  onAddLocation: (loc: IslaSerranoLocation) => void;
  onRegenerate: () => void;
}

const MapCanvasStep = ({
  selectedLocationId,
  onSelectLocation,
  uploadedImage,
  locations,
  onAddLocation,
  onRegenerate,
}: MapCanvasStepProps) => {
  const [view, setView] = useState<"map" | "satellite">("map");
  const [pinDropMode, setPinDropMode] = useState(false);
  const [title, setTitle] = useState("Isla Serrano");
  const [editingTitle, setEditingTitle] = useState(false);

  const handleMapClick = (x: number, y: number) => {
    if (!pinDropMode) return;
    // This will be called from the map component
    const newLoc: IslaSerranoLocation = {
      id: `custom-${Date.now()}`,
      name: "New Location",
      type: "landmark",
      description: "Click to edit details",
      x,
      y,
      labelAnchor: x > 300 ? "right" : "left",
    };
    onAddLocation(newLoc);
    onSelectLocation(newLoc.id);
    setPinDropMode(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div>
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              className="text-lg font-serif font-semibold bg-transparent border-b border-secondary outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="text-lg font-serif font-semibold text-foreground hover:text-secondary transition-colors"
            >
              {title}
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="inline-flex bg-muted rounded-full p-0.5">
          <button
            onClick={() => setView("map")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              view === "map" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setView("satellite")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              view === "satellite" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Satellite ref
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={onRegenerate}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Regenerate
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button
            size="sm"
            className="text-xs bg-primary text-primary-foreground"
            onClick={() => setPinDropMode(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Place
          </Button>
        </div>
      </div>

      {/* Three-zone layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Add Places */}
        <AddPlacesPanel
          selectedLocationId={selectedLocationId}
          onSelectLocation={onSelectLocation}
          pinDropMode={pinDropMode}
          onTogglePinDrop={() => setPinDropMode(!pinDropMode)}
          locations={locations}
          onAddLocation={onAddLocation}
        />

        {/* Centre: Map */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
          {view === "map" ? (
            <IslaSerranoMap
              selectedLocationId={selectedLocationId}
              onSelectLocation={onSelectLocation}
              locations={locations}
              pinDropMode={pinDropMode}
              onMapClick={handleMapClick}
            />
          ) : (
            <div className="w-full flex justify-center py-6">
              <div className="max-w-[500px] w-full border border-border rounded-lg overflow-hidden">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Satellite reference" className="w-full object-contain bg-muted/30" />
                ) : (
                  <div className="h-[300px] bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
                    No reference image
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Location detail drawer */}
        {selectedLocationId && (
          <LocationDetailDrawer
            locationId={selectedLocationId}
            onClose={() => onSelectLocation(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MapCanvasStep;
