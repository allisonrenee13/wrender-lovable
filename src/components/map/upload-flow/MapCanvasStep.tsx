import { useState } from "react";
import { RefreshCw, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import IslaSerranoMap from "@/components/map/IslaSerranoMap";
import AddPlacesPanel from "./AddPlacesPanel";
import LocationDetailDrawer from "./LocationDetailDrawer";

interface MapCanvasStepProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
}

const MapCanvasStep = ({ selectedLocationId, onSelectLocation }: MapCanvasStepProps) => {
  const [view, setView] = useState<"map" | "satellite">("map");
  const [pinDropMode, setPinDropMode] = useState(false);
  const [title, setTitle] = useState("Isla Serrano");
  const [editingTitle, setEditingTitle] = useState(false);

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
          <Button variant="outline" size="sm" className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Regenerate
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button size="sm" className="text-xs bg-primary text-primary-foreground">
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
        />

        {/* Centre: Map */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
          {view === "map" ? (
            <IslaSerranoMap
              selectedLocationId={selectedLocationId}
              onSelectLocation={onSelectLocation}
            />
          ) : (
            <div className="w-full flex justify-center py-6">
              <div className="max-w-[500px] w-full border border-border rounded-lg overflow-hidden">
                <svg viewBox="0 0 400 300" className="w-full">
                  <rect width="400" height="300" fill="#d4e4f0" />
                  <path
                    d="M 180 25 Q 210 18, 228 38 Q 245 60, 238 100 Q 245 140, 233 175 Q 228 205, 218 235 Q 208 260, 200 280 Q 192 260, 182 235 Q 172 205, 167 175 Q 155 140, 162 100 Q 155 60, 172 38 Q 190 18, 180 25 Z"
                    fill="#c8d4a0"
                    stroke="#8a9a6a"
                    strokeWidth="1"
                  />
                  <line x1="200" y1="0" x2="200" y2="28" stroke="#888" strokeWidth="2" />
                  <text x="200" y="160" textAnchor="middle" fontSize="11" fill="#555" fontWeight="500">Key Biscayne</text>
                </svg>
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
