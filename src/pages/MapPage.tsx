import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Pin, PinType } from "@/data/projects";
import { X, Plus, Filter } from "lucide-react";

const pinColors: Record<PinType, string> = {
  plot: "bg-pin-plot",
  character: "bg-pin-character",
  location: "bg-pin-location",
};

const pinLabels: Record<PinType, string> = {
  plot: "Plot Event",
  character: "Character",
  location: "Location",
};

const MapPage = () => {
  const { currentProject } = useProject();
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [filters, setFilters] = useState<Record<PinType, boolean>>({
    plot: true,
    character: true,
    location: true,
  });

  const toggleFilter = (type: PinType) => {
    setFilters((f) => ({ ...f, [type]: !f[type] }));
  };

  const visiblePins = currentProject.pins.filter((p) => filters[p.type]);

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-xl font-serif font-semibold">{currentProject.title} — Map</h1>
        <div className="flex items-center gap-3">
          {(["plot", "character", "location"] as PinType[]).map((type) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-all ${
                filters[type]
                  ? "border-border bg-card text-foreground"
                  : "border-transparent bg-muted/30 text-muted-foreground line-through"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${pinColors[type]}`} />
              {pinLabels[type]}
            </button>
          ))}
          <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground">
            <Plus className="h-3 w-3" />
            Add Pin
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 relative overflow-hidden bg-muted/30">
        <img
          src={currentProject.mapImage}
          alt={`Map of ${currentProject.title}`}
          className="w-full h-full object-contain"
        />

        {/* Pins overlay */}
        {visiblePins.map((pin) => (
          <button
            key={pin.id}
            onClick={() => setSelectedPin(pin)}
            className="absolute group"
            style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className={`w-4 h-4 rounded-full ${pinColors[pin.type]} border-2 border-background shadow-md transition-transform group-hover:scale-125`} />
            <div className="absolute left-1/2 -translate-x-1/2 top-5 whitespace-nowrap bg-card border border-border rounded px-2 py-0.5 text-[10px] font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {pin.title}
            </div>
          </button>
        ))}

        {/* Pin Detail Panel */}
        {selectedPin && (
          <div className="absolute right-0 top-0 h-full w-80 bg-card border-l border-border shadow-lg p-6 overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-serif font-semibold pr-4">{selectedPin.title}</h3>
              <button onClick={() => setSelectedPin(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${pinColors[selectedPin.type]}`} />
                <span className="text-xs font-medium text-muted-foreground">{pinLabels[selectedPin.type]}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="bg-muted px-2 py-0.5 rounded">Chapter {selectedPin.chapter}</span>
              </div>
              <div className="text-xs text-muted-foreground">{selectedPin.location}</div>
              <p className="text-sm text-foreground mt-4">{selectedPin.note}</p>
              <button className="mt-4 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-3 py-1.5">
                Attach image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
