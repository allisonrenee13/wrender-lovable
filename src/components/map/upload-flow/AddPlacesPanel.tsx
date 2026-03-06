import { useState } from "react";
import { MapPin, Pencil, MessageSquare, Camera, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { islaSerranoLocations, type IslaSerranoLocation } from "@/data/isla-serrano";

interface AddPlacesPanelProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
  pinDropMode: boolean;
  onTogglePinDrop: () => void;
}

const typeLabels: Record<string, string> = {
  hotel: "Hotel",
  residence: "House",
  landmark: "Landmark",
  club: "Club",
  public: "Green Space",
  infrastructure: "Access",
};

type ToolSection = "pin" | "draw" | "describe" | "photo";

const AddPlacesPanel = ({
  selectedLocationId,
  onSelectLocation,
  pinDropMode,
  onTogglePinDrop,
}: AddPlacesPanelProps) => {
  const [expanded, setExpanded] = useState<ToolSection>("pin");

  const toggle = (section: ToolSection) =>
    setExpanded((prev) => (prev === section ? section : section));

  return (
    <div className="w-[250px] border-r border-border bg-card h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-serif font-semibold text-foreground">Add to your map</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Drop a Pin */}
        <div className="border-b border-border">
          <button
            onClick={() => toggle("pin")}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-secondary" />
            <span>Drop a Pin</span>
            <ChevronDown className={`h-3 w-3 ml-auto transition-transform ${expanded === "pin" ? "rotate-180" : ""}`} />
          </button>
          {expanded === "pin" && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Click anywhere on the map to drop a location pin
              </p>
              <Button
                variant={pinDropMode ? "default" : "outline"}
                size="sm"
                className="w-full text-xs"
                onClick={onTogglePinDrop}
              >
                {pinDropMode ? "Cancel Pin Drop" : "Start Placing"}
              </Button>
              {pinDropMode && (
                <div className="space-y-2 animate-fade-in">
                  <Input placeholder="Location name" className="h-8 text-xs" />
                  <select className="w-full h-8 text-xs rounded-md border border-input bg-background px-2">
                    <option>Hotel</option>
                    <option>House</option>
                    <option>Landmark</option>
                    <option>Club</option>
                    <option>Green Space</option>
                    <option>Water</option>
                    <option>Other</option>
                  </select>
                  <Input placeholder="Note" className="h-8 text-xs" />
                  <div className="flex gap-2">
                    {["destructive", "primary", "secondary"].map((color) => (
                      <button
                        key={color}
                        className={`w-5 h-5 rounded-full border-2 border-border bg-${color}`}
                        style={{
                          backgroundColor:
                            color === "destructive"
                              ? "hsl(0 72% 51%)"
                              : color === "primary"
                              ? "hsl(220 45% 20%)"
                              : "hsl(43 50% 54%)",
                        }}
                      />
                    ))}
                  </div>
                  <Button size="sm" className="w-full text-xs bg-primary text-primary-foreground">
                    Place on Map
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Draw a Shape */}
        <div className="border-b border-border">
          <button
            onClick={() => toggle("draw")}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5 text-secondary" />
            <span>Draw a Shape</span>
            <ChevronDown className={`h-3 w-3 ml-auto transition-transform ${expanded === "draw" ? "rotate-180" : ""}`} />
          </button>
          {expanded === "draw" && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Draw a building outline, road, or area directly onto the map
              </p>
              <div className="flex gap-1">
                {["Pen", "Line", "Rect", "Circle", "Erase"].map((tool) => (
                  <button
                    key={tool}
                    className="flex-1 text-[10px] py-1.5 rounded border border-border hover:bg-muted/50 transition-colors text-muted-foreground"
                  >
                    {tool}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Colour:</span>
                {[
                  { label: "Black", color: "#1a1a1a" },
                  { label: "Navy", color: "hsl(220 45% 20%)" },
                  { label: "Gold", color: "hsl(43 50% 54%)" },
                ].map((c) => (
                  <button
                    key={c.label}
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Weight:</span>
                {["Thin", "Med", "Thick"].map((w) => (
                  <button key={w} className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:bg-muted/50">
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Describe & Place */}
        <div className="border-b border-border">
          <button
            onClick={() => toggle("describe")}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5 text-secondary" />
            <span>Describe & Place</span>
            <ChevronDown className={`h-3 w-3 ml-auto transition-transform ${expanded === "describe" ? "rotate-180" : ""}`} />
          </button>
          {expanded === "describe" && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Describe a place and Figment will find the right spot for it
              </p>
              <Input placeholder="e.g. A grand hotel on the northern beach" className="h-8 text-xs" />
              <Button size="sm" variant="outline" className="w-full text-xs">
                Place It
              </Button>
              <div className="flex flex-wrap gap-1.5">
                {["The Solano Hotel", "The Harbour Club", "Cape Serrano Lighthouse"].map((name) => (
                  <span key={name} className="text-[10px] px-2 py-1 rounded-full bg-muted text-foreground">
                    {name} ✓
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pin a Photo */}
        <div className="border-b border-border">
          <button
            onClick={() => toggle("photo")}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <Camera className="h-3.5 w-3.5 text-secondary" />
            <span>Pin a Photo</span>
            <ChevronDown className={`h-3 w-3 ml-auto transition-transform ${expanded === "photo" ? "rotate-180" : ""}`} />
          </button>
          {expanded === "photo" && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Upload an image and anchor it to a spot on your map
              </p>
              <div className="border-2 border-dashed border-border rounded p-4 text-center">
                <Camera className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-[10px] text-muted-foreground">Click to upload</p>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Then click the map to place it
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Placed locations list */}
      <div className="border-t border-border p-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Placed</p>
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {islaSerranoLocations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelectLocation(selectedLocationId === loc.id ? null : loc.id)}
              className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                selectedLocationId === loc.id
                  ? "bg-secondary/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
              <span className="truncate">{loc.name}</span>
              <Badge variant="outline" className="text-[8px] px-1 py-0 ml-auto flex-shrink-0">
                {typeLabels[loc.type] || loc.type}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddPlacesPanel;
