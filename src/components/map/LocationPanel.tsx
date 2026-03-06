import { islaSerranoLocations } from "@/data/isla-serrano";
import { ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LocationPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
}

const typeLabels: Record<string, string> = {
  hotel: "Hotel",
  residence: "Residence",
  landmark: "Landmark",
  club: "Club",
  public: "Public",
  infrastructure: "Access",
};

const LocationPanel = ({ isOpen, onToggle, selectedLocationId, onSelectLocation }: LocationPanelProps) => {
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

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Locations
          </div>

          {/* Location cards */}
          <div className="space-y-2">
            {islaSerranoLocations.map((loc) => {
              const isSelected = selectedLocationId === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => onSelectLocation(isSelected ? null : loc.id)}
                  className={`w-full text-left p-3 rounded-md border transition-all ${
                    isSelected
                      ? "border-secondary bg-secondary/5"
                      : "border-border hover:border-secondary/40 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{loc.name}</span>
                  </div>
                  <div className="mt-1 ml-4">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {typeLabels[loc.type] || loc.type}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>

          <Button variant="outline" size="sm" className="w-full mt-2">
            <Plus className="h-3 w-3 mr-1.5" />
            Add Location
          </Button>
        </div>
      </div>
    </>
  );
};

export default LocationPanel;
