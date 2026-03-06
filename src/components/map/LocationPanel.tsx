import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LocationPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
}

const LocationPanel = ({ isOpen, onToggle, selectedLocationId, onSelectLocation }: LocationPanelProps) => {
  const { currentProject } = useProject();
  const [showAllEvents, setShowAllEvents] = useState(false);

  const selectedPin = currentProject.pins.find((p) => p.id === selectedLocationId);

  // Get events at the selected pin's location
  const eventsAtLocation = selectedPin
    ? currentProject.pins
        .filter((p) => p.location === selectedPin.location)
        .sort((a, b) => a.chapter - b.chapter)
    : [];

  const filteredEvents = showAllEvents ? eventsAtLocation : eventsAtLocation.filter((e) => e.tier === "main");

  return (
    <>
      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card border border-border rounded-l-md p-1.5 shadow-sm hover:bg-muted transition-colors"
        style={{ right: isOpen ? "280px" : "0" }}
      >
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-0" : "rotate-180"}`} />
      </button>

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full bg-card border-l border-border shadow-sm transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "280px" }}
      >
        <div className="p-4 space-y-4">
          {/* Style toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground px-2 py-1 bg-primary text-primary-foreground rounded">
              Line Art
            </span>
            <span className="text-xs text-muted-foreground px-2 py-1 rounded relative">
              Illustrated
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0">soon</Badge>
            </span>
          </div>

          {/* Location detail if a pin is selected */}
          {selectedPin && (
            <div className="border border-border rounded-lg p-3 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-serif font-semibold">{selectedPin.title}</h3>
                <Badge variant="outline" className="text-[10px]">
                  {selectedPin.tier === "main" ? "Main" : "Minor"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{selectedPin.note}</p>
              <div className="text-xs">
                <span className="text-muted-foreground">Ch. {selectedPin.chapter}</span>
                <span className="mx-1.5">·</span>
                <span className="text-muted-foreground">{selectedPin.location}</span>
              </div>

              {/* Everything that happens here */}
              {eventsAtLocation.length > 1 && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Events at this location
                    </span>
                    <button
                      onClick={() => setShowAllEvents(!showAllEvents)}
                      className="text-[10px] text-secondary hover:underline"
                    >
                      {showAllEvents ? "Main only" : "Show all"}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => onSelectLocation(ev.id)}
                        className={`w-full text-left flex items-center gap-2 text-xs p-1.5 rounded transition-colors ${
                          ev.id === selectedLocationId ? "bg-secondary/10" : "hover:bg-muted"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          ev.tier === "main" ? "bg-destructive" : "bg-muted-foreground/40"
                        }`} />
                        <span className={ev.tier === "main" ? "font-medium" : "text-muted-foreground"}>
                          {ev.title}
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground">Ch.{ev.chapter}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            All Pins
          </div>

          {/* Pin list */}
          <div className="space-y-2">
            {currentProject.pins.map((pin) => {
              const isSelected = selectedLocationId === pin.id;
              return (
                <button
                  key={pin.id}
                  onClick={() => onSelectLocation(isSelected ? null : pin.id)}
                  className={`w-full text-left p-3 rounded-md border transition-all ${
                    isSelected
                      ? "border-secondary bg-secondary/5"
                      : "border-border hover:border-secondary/40 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      pin.tier === "main" ? "bg-destructive" : "bg-muted-foreground/40"
                    }`} />
                    <span className="text-sm font-medium text-foreground">{pin.title}</span>
                  </div>
                  <div className="mt-1 ml-4 flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Ch. {pin.chapter}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{pin.tier}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {currentProject.pins.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 italic">No pins yet. Add events on the map or timeline.</p>
          )}

          <Button variant="outline" size="sm" className="w-full mt-2">
            <Plus className="h-3 w-3 mr-1.5" />
            Add Pin
          </Button>
        </div>
      </div>
    </>
  );
};

export default LocationPanel;
