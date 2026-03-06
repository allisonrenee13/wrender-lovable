import { useState, useCallback, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { Pin, PinType } from "@/data/projects";
import { Pencil, Plus, Layers, X, GripVertical, MapPin, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import IslaSerranoMap from "./IslaSerranoMap";
import CapeCodeMap from "./CapeCodeMap";
import CommunityMap from "./CommunityMap";
import PrythianMap from "./PrythianMap";
import VersionStrip from "./VersionStrip";
import VersionPanel from "./VersionPanel";
import BakeModal from "./BakeModal";

interface MapViewModeProps {
  onEditMap: () => void;
}

const pinTypeColors: Record<PinType, string> = {
  plot: "bg-destructive",
  location: "bg-secondary",
  character: "bg-primary",
};

const pinTypeLabels: Record<PinType, string> = {
  plot: "Plot Event",
  location: "Location",
  character: "Character",
};

const MapViewMode = ({ onEditMap }: MapViewModeProps) => {
  const { currentProject, addPin, removePin, updatePin, getUnillustratedCount } = useProject();
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [pinDropMode, setPinDropMode] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showVersionPanel, setShowVersionPanel] = useState(false);
  const [hoveredListPinId, setHoveredListPinId] = useState<string | null>(null);
  const [showBakeModal, setShowBakeModal] = useState(false);
  const [pillDismissed, setPillDismissed] = useState(false);

  const [dropPoint, setDropPoint] = useState<{ x: number; y: number } | null>(null);
  const [pinForm, setPinForm] = useState({ name: "", type: "location" as PinType, chapter: 1, note: "" });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draggingPinId, setDraggingPinId] = useState<string | null>(null);

  const selectedPin = currentProject.pins.find((p) => p.id === selectedPinId) || null;
  const unillustratedCount = getUnillustratedCount();

  const handleMapClick = useCallback(
    (x: number, y: number) => {
      if (!pinDropMode) return;
      setDropPoint({ x, y });
    },
    [pinDropMode]
  );

  const handlePlacePin = () => {
    if (!dropPoint || !pinForm.name.trim()) return;
    addPin({
      title: pinForm.name,
      type: pinForm.type,
      tier: "main",
      chapter: pinForm.chapter,
      location: pinForm.name,
      note: pinForm.note,
      x: dropPoint.x,
      y: dropPoint.y,
      placed: true,
    });
    setDropPoint(null);
    setPinForm({ name: "", type: "location", chapter: 1, note: "" });
    setPinDropMode(false);
  };

  const handleCancelDrop = () => {
    setDropPoint(null);
    setPinForm({ name: "", type: "location", chapter: 1, note: "" });
    setPinDropMode(false);
  };

  const handlePinDragEnd = useCallback(
    (pinId: string, newX: number, newY: number) => {
      updatePin(pinId, { x: newX, y: newY });
      setDraggingPinId(null);
      toast({ title: "Location moved" });
    },
    [updatePin]
  );

  const currentVersionNum = currentProject.mapVersions.length || 1;

  const getLocationStatus = (pinTitle: string) => {
    const loc = currentProject.locations.find((l) => l.name === pinTitle);
    return loc?.status || "pinned";
  };

  const renderMap = () => {
    const mapProps = {
      selectedLocationId: selectedPinId,
      onSelectLocation: (id: string | null) => {
        if (!pinDropMode) {
          setSelectedPinId(id);
          setShowLayers(false);
          setShowVersionPanel(false);
        }
      },
      pins: currentProject.pins,
      pinDropMode,
      onMapClick: handleMapClick,
    };

    switch (currentProject.id) {
      case "paper-palace":
        return <CapeCodeMap {...mapProps} />;
      case "the-giver":
        return <CommunityMap {...mapProps} />;
      case "acotar":
        return <PrythianMap {...mapProps} />;
      default:
        return <IslaSerranoMap {...mapProps} />;
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-serif font-semibold text-foreground">{currentProject.title}</h1>
          {currentProject.mapVersions.length > 0 && (
            <button
              onClick={() => {
                setShowVersionPanel(!showVersionPanel);
                setShowLayers(false);
                setSelectedPinId(null);
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              v{currentVersionNum} · {currentProject.mapVersions.length} version{currentProject.mapVersions.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEditMap} title="Edit Map">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={pinDropMode ? "default" : "ghost"}
            size="icon"
            onClick={() => {
              setPinDropMode(!pinDropMode);
              setDropPoint(null);
            }}
            title="Add Pin"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant={showLayers ? "default" : "ghost"}
            size="icon"
            onClick={() => {
              setShowLayers(!showLayers);
              setSelectedPinId(null);
              setShowVersionPanel(false);
            }}
            title="Layers"
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Pin drop instruction banner */}
      {pinDropMode && !dropPoint && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary/10 border-b border-secondary/20 text-sm text-secondary-foreground animate-in fade-in duration-300">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          <span>Click anywhere on the map to place this location</span>
          <button onClick={handleCancelDrop} className="ml-2 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Full-screen map */}
      <div className="flex-1 overflow-auto relative" style={{ backgroundColor: "#FAFAF7" }}>
        {renderMap()}

        {/* Empty pin state message */}
        {currentProject.pins.length === 0 && !pinDropMode && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-muted-foreground/60 font-serif italic max-w-sm text-center">
              Add locations instantly as pins. When you're ready, bake them into your illustrated map.
            </p>
          </div>
        )}

        {/* Pin drop form popup */}
        {dropPoint && (
          <div
            className="absolute z-30 bg-card border border-border rounded-lg shadow-lg p-4 w-64 animate-in fade-in zoom-in-95 duration-200"
            style={{
              left: `min(calc(50% + ${(dropPoint.x - 300) * 0.5}px), calc(100% - 280px))`,
              top: `min(calc(${(dropPoint.y / 700) * 100}% + 20px), calc(100% - 260px))`,
            }}
          >
            <div className="space-y-3">
              <Input
                value={pinForm.name}
                onChange={(e) => setPinForm({ ...pinForm, name: e.target.value })}
                placeholder="Location name"
                className="text-sm font-serif"
                autoFocus
              />
              <div className="flex gap-1.5">
                {(["plot", "location", "character"] as PinType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setPinForm({ ...pinForm, type: t })}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-colors",
                      pinForm.type === t
                        ? "border-foreground/20 bg-muted text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", pinTypeColors[t])} />
                    {t === "plot" ? "Plot" : t === "location" ? "Location" : "Character"}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                value={pinForm.chapter}
                onChange={(e) => setPinForm({ ...pinForm, chapter: Number(e.target.value) })}
                placeholder="Chapter"
                className="text-sm"
              />
              <Textarea
                value={pinForm.note}
                onChange={(e) => setPinForm({ ...pinForm, note: e.target.value })}
                placeholder="Note (optional)"
                rows={2}
                className="text-sm resize-none"
              />
              <div className="flex items-center gap-2">
                <Button onClick={handlePlacePin} disabled={!pinForm.name.trim()} className="flex-1 h-8 text-xs bg-primary text-primary-foreground">
                  Place
                </Button>
                <button onClick={handleCancelDrop} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating bake pill */}
        {unillustratedCount >= 2 && !pillDismissed && !pinDropMode && !showBakeModal && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-lg">
              <span className="text-sm font-medium">
                You have {unillustratedCount} locations ready to illustrate
              </span>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs rounded-full"
                onClick={() => setShowBakeModal(true)}
              >
                Bake into Map
              </Button>
              <button
                onClick={() => setPillDismissed(true)}
                className="text-primary-foreground/70 hover:text-primary-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Version strip */}
      <VersionStrip onOpenPanel={() => {
        setShowVersionPanel(true);
        setShowLayers(false);
        setSelectedPinId(null);
      }} />

      {/* Layers sidebar — right */}
      <div
        className={cn(
          "absolute top-0 right-0 h-full w-80 bg-card border-l border-border shadow-xl z-40 transition-transform duration-300 ease-in-out flex flex-col",
          showLayers ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-serif font-semibold">Placed Pins</h3>
          <button onClick={() => setShowLayers(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {currentProject.pins.length === 0 ? (
            <p className="text-xs text-muted-foreground italic p-4 text-center">No pins placed yet. Use the + button to add one.</p>
          ) : (
            <div className="space-y-0.5">
              {currentProject.pins.map((pin) => {
                const status = getLocationStatus(pin.title);
                return (
                  <button
                    key={pin.id}
                    onClick={() => {
                      setSelectedPinId(pin.id);
                      setShowLayers(false);
                    }}
                    onMouseEnter={() => setHoveredListPinId(pin.id)}
                    onMouseLeave={() => setHoveredListPinId(null)}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-md text-left hover:bg-muted/50 transition-colors group"
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 flex-shrink-0" />
                    <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", pinTypeColors[pin.type])} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{pin.title}</span>
                    </div>
                    {status === "illustrated" ? (
                      <span className="text-[10px] flex-shrink-0" title="Illustrated">🖊️</span>
                    ) : (
                      <span className="text-[10px] flex-shrink-0" title="Pinned">📍</span>
                    )}
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 flex-shrink-0">
                      {pinTypeLabels[pin.type]}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">Ch.{pin.chapter}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Version panel — right */}
      <VersionPanel open={showVersionPanel} onClose={() => setShowVersionPanel(false)} />

      {/* Pin detail panel — right */}
      <div
        className={cn(
          "absolute top-0 right-0 h-full w-96 max-w-full bg-card border-l border-border shadow-xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
          selectedPin ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selectedPin && (
          <>
            <div className="flex items-start justify-between p-5 border-b border-border">
              <div className="flex-1 min-w-0">
                {editingField === "title" ? (
                  <Input
                    value={selectedPin.title}
                    onChange={(e) => updatePin(selectedPin.id, { title: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
                    className="text-lg font-serif font-semibold border-none p-0 h-auto focus-visible:ring-0"
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-lg font-serif font-semibold cursor-text hover:text-primary transition-colors"
                    onClick={() => setEditingField("title")}
                  >
                    {selectedPin.title}
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    className={cn(
                      "text-[10px] px-2 py-0.5 text-white border-none",
                      selectedPin.type === "plot"
                        ? "bg-destructive"
                        : selectedPin.type === "location"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary"
                    )}
                  >
                    {pinTypeLabels[selectedPin.type]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Ch. {selectedPin.chapter}</span>
                  {/* Status badge */}
                  {getLocationStatus(selectedPin.title) === "illustrated" ? (
                    <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                      🖊️ Illustrated
                    </span>
                  ) : (
                    <span className="text-[10px] text-secondary font-medium flex items-center gap-1">
                      📍 Pinned
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedPinId(null)} className="text-muted-foreground hover:text-foreground ml-2">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Note</label>
                {editingField === "note" ? (
                  <Textarea
                    value={selectedPin.note}
                    onChange={(e) => updatePin(selectedPin.id, { note: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    className="text-sm resize-none"
                    rows={3}
                    autoFocus
                  />
                ) : (
                  <p
                    className="text-sm text-muted-foreground cursor-text hover:text-foreground transition-colors"
                    onClick={() => setEditingField("note")}
                  >
                    {selectedPin.note || "Click to add a note..."}
                  </p>
                )}
              </div>

              {/* Mood images placeholder */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mood Board</label>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-muted rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground/20" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Events at location */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Events Here</label>
                {currentProject.pins
                  .filter(
                    (p) =>
                      p.id !== selectedPin.id &&
                      (p.location === selectedPin.location || p.location === selectedPin.title)
                  )
                  .sort((a, b) => a.chapter - b.chapter)
                  .map((pin) => (
                    <div key={pin.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          pin.tier === "main" ? "bg-destructive" : "bg-muted-foreground/40"
                        )}
                      />
                      <span className={pin.tier === "main" ? "font-medium" : "text-muted-foreground text-xs"}>
                        {pin.title}
                      </span>
                      <span className="ml-auto text-[10px] text-muted-foreground">Ch. {pin.chapter}</span>
                    </div>
                  ))}
              </div>

              {/* Bake into map link for pinned locations */}
              {getLocationStatus(selectedPin.title) === "pinned" && (
                <button
                  onClick={() => {
                    setSelectedPinId(null);
                    setShowBakeModal(true);
                  }}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <PenTool className="h-3 w-3" />
                  Bake into Map
                </button>
              )}
            </div>

            <div className="p-5 border-t border-border">
              <button
                onClick={() => {
                  removePin(selectedPin.id);
                  setSelectedPinId(null);
                }}
                className="text-xs text-destructive hover:underline"
              >
                Delete Pin
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bake Modal */}
      <BakeModal open={showBakeModal} onClose={() => setShowBakeModal(false)} />
    </div>
  );
};

export default MapViewMode;
