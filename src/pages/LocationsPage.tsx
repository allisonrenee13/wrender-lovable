import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Location } from "@/data/projects";
import { MapPin, X, Plus, Image } from "lucide-react";

const LocationsPage = () => {
  const { currentProject } = useProject();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-serif font-semibold">{currentProject.title} — Locations</h1>
        <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground">
          <Plus className="h-3 w-3" />
          Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentProject.locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setSelectedLocation(loc)}
            className="text-left border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
          >
            {/* Image placeholder */}
            <div className="h-36 bg-muted flex items-center justify-center">
              <Image className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-serif font-semibold mb-1">{loc.name}</h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{loc.description}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                <MapPin className="h-2.5 w-2.5" />
                {loc.eventCount} events
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Panel */}
      {selectedLocation && (
        <div className="fixed inset-y-0 right-0 w-96 max-w-full bg-card border-l border-border shadow-xl z-50 p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-serif font-semibold">{selectedLocation.name}</h2>
            <button onClick={() => setSelectedLocation(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">{selectedLocation.description}</p>

          {/* Mood board grid */}
          <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Mood Board</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-md flex items-center justify-center">
                <Image className="h-5 w-5 text-muted-foreground/20" />
              </div>
            ))}
          </div>

          {/* Story pins */}
          <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Story Pins Here</h3>
          <div className="space-y-2">
            {currentProject.pins
              .filter((p) => p.location === selectedLocation.name || selectedLocation.name.includes(p.location))
              .map((pin) => (
                <div key={pin.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      pin.type === "plot" ? "bg-pin-plot" : pin.type === "character" ? "bg-pin-character" : "bg-pin-location"
                    }`}
                  />
                  <span>{pin.title}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsPage;
