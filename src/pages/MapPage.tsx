import { useState, useRef } from "react";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Eraser, MapPin, SlidersHorizontal, Eye, EyeOff, Trash2, X, Layout } from "lucide-react";
import { toast } from "sonner";
import MapBuilderCanvas, { type MapCanvasHandle } from "@/components/map/builder/MapBuilderCanvas";
import TemplatePicker from "@/components/map/builder/TemplatePicker";
import StylePreferencesPanel from "@/components/map/builder/StylePreferencesPanel";
import { defaultStylePreferences } from "@/components/map/builder/types";
import type { ShapeTool, StylePreferences, MapTemplate } from "@/components/map/builder/types";

type CanvasTool = "pen" | "eraser" | null;

const MapPage = () => {
  const { currentProject, addPin, removePin, updatePin } = useProject();

  const [savedSVG, setSavedSVG] = useState<string | null>(null);
  const [canvasStarted, setCanvasStarted] = useState(false);
  const [activeTool, setActiveTool] = useState<CanvasTool>(null);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showPinLayer, setShowPinLayer] = useState(true);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [stylePrefs, setStylePrefs] = useState<StylePreferences>(defaultStylePreferences);

  const [placingPin, setPlacingPin] = useState(false);
  const [movingPinId, setMovingPinId] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [pinName, setPinName] = useState("");

  const canvasRef = useRef<MapCanvasHandle>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const hasMap = savedSVG !== null;
  const showCanvas = hasMap || canvasStarted;

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
    if (!placingPin || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (movingPinId) {
      updatePin(movingPinId, { x, y });
      setMovingPinId(null);
      setPlacingPin(false);
      return;
    }

    setPendingPin({ x, y });
    setPlacingPin(false);
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
  };

  const toggleTool = (tool: CanvasTool) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  };

  const handleStartDraw = () => {
    setCanvasStarted(true);
    setActiveTool("pen");
  };

  const handleStartTrace = () => {
    setCanvasStarted(true);
  };

  const handleTemplateSelect = (template: MapTemplate) => {
    setShowTemplatePicker(false);
    setCanvasStarted(true);
    setTimeout(() => {
      if (canvasRef.current) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${template.viewBox}"><path d="${template.svgPath}" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
        canvasRef.current.loadSVG(svg);
      }
    }, 300);
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const svg = canvasRef.current.getSVG();
      setSavedSVG(svg);
      toast.success("Map saved successfully");
    }
  };

  const openPinDrawer = () => {
    setShowStylePanel(false);
    setShowPinDrawer(true);
  };

  const openStylePanel = () => {
    setShowPinDrawer(false);
    setShowStylePanel((v) => !v);
  };

  const handleAddLocationFromDrawer = () => {
    setShowPinDrawer(false);
    setPlacingPin(true);
  };

  const fabricTool: ShapeTool = activeTool === "pen" ? "pen" : activeTool === "eraser" ? "eraser" : "pan";
  const isPlacing = placingPin || !!movingPinId;

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 md:px-6 py-3 border-b border-border">
        <h2 className="font-serif font-semibold text-sm md:text-base">
          {currentProject.title}
        </h2>
        <div className="flex items-center gap-1.5">
          {showCanvas && (
            <>
              <Button
                size="sm"
                variant={activeTool === "pen" ? "default" : "outline"}
                onClick={() => toggleTool("pen")}
                className="text-xs h-8"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Draw</span>
              </Button>
              <Button
                size="sm"
                variant={activeTool === "eraser" ? "default" : "outline"}
                onClick={() => toggleTool("eraser")}
                className="text-xs h-8"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Eraser</span>
              </Button>
              <Button
                size="sm"
                variant={showPinDrawer ? "default" : "outline"}
                onClick={openPinDrawer}
                className="text-xs h-8"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Pin</span>
              </Button>
              <Button
                size="sm"
                variant={showStylePanel ? "default" : "outline"}
                onClick={openStylePanel}
                className="text-xs h-8"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPinLayer((v) => !v)}
                className="text-xs h-8"
              >
                {showPinLayer ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Placing indicator */}
      {isPlacing && (
        <div className="px-6 py-2 bg-accent/50 border-b border-border text-center">
          <span className="text-xs text-accent-foreground font-medium">
            {movingPinId ? "Click on the map to move the pin" : "Click on the map to place location…"}
          </span>
          <button
            onClick={() => { setPlacingPin(false); setMovingPinId(null); }}
            className="ml-3 text-xs text-muted-foreground hover:text-foreground underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left toolbar — always visible */}
        <div className="hidden md:flex flex-col w-12 border-r border-border bg-muted/30 items-center py-3 gap-1.5">
          <button
            onClick={() => { if (!canvasStarted) handleStartDraw(); else toggleTool("pen"); }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              activeTool === "pen" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title="Pen"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => { if (!canvasStarted) { setCanvasStarted(true); setActiveTool("eraser"); } else toggleTool("eraser"); }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              activeTool === "eraser" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </button>
          <div className="w-6 border-t border-border my-1" />
          <button
            onClick={() => setShowTemplatePicker(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Templates"
          >
            <Layout className="h-4 w-4" />
          </button>
          <button
            onClick={handleStartTrace}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
            title="Trace from image"
          >
            📷
          </button>
        </div>

        {/* Center canvas */}
        <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 overflow-auto relative">
          {!showCanvas ? (
            /* Quickstart overlay on dotted background */
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backgroundImage: "radial-gradient(circle, hsl(var(--muted-foreground) / 0.12) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="flex flex-col items-center gap-5 text-center max-w-sm px-4">
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-1.5">Your map starts here</h3>
                  <p className="text-sm text-muted-foreground">
                    Trace, template, or draw freehand
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
                  <button
                    onClick={handleStartTrace}
                    className="flex flex-col items-center gap-2.5 border border-border rounded-xl p-4 bg-card/80 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <span className="text-3xl">📷</span>
                    <span className="text-sm font-medium">Trace</span>
                  </button>
                  <button
                    onClick={() => setShowTemplatePicker(true)}
                    className="flex flex-col items-center gap-2.5 border border-border rounded-xl p-4 bg-card/80 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <span className="text-3xl">🗺</span>
                    <span className="text-sm font-medium">Template</span>
                  </button>
                  <button
                    onClick={handleStartDraw}
                    className="flex flex-col items-center gap-2.5 border border-border rounded-xl p-4 bg-card/80 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all col-span-2 md:col-span-1"
                  >
                    <span className="text-3xl">✏️</span>
                    <span className="text-sm font-medium">Freehand</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-6 w-full">
              <div
                ref={mapContainerRef}
                className="relative w-full mx-auto border border-border rounded-xl overflow-hidden shadow-md"
                style={{ maxWidth: "900px", cursor: isPlacing ? "crosshair" : "default" }}
                onClick={isPlacing ? handleMapClick : undefined}
              >
                <MapBuilderCanvas
                  ref={canvasRef}
                  stylePrefs={stylePrefs}
                  activeTool={fabricTool}
                  activeStamp={null}
                  placingPin={placingPin && !movingPinId}
                  onPinPlaced={(x, y) => {
                    setPendingPin({ x, y });
                    setPlacingPin(false);
                    setPinName("");
                  }}
                />
                {showPinLayer && currentProject.pins?.map((pin) => (
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
                    <span className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap drop-shadow-sm">
                      {pin.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Save button */}
              <div className="mt-4 w-full" style={{ maxWidth: "900px" }}>
                <Button className="w-full h-11" onClick={handleSave}>
                  Save to Wrender
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right style panel */}
        {showStylePanel && (
          <div className="w-72 border-l border-border bg-card flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style</p>
              <button onClick={() => setShowStylePanel(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-4">
              <StylePreferencesPanel
                prefs={stylePrefs}
                onChange={setStylePrefs}
                forceExpanded
              />
            </div>
          </div>
        )}
      </div>

      {/* Template Picker */}
      <TemplatePicker
        open={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={handleTemplateSelect}
      />

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

      {/* Pin drawer backdrop */}
      {showPinDrawer && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowPinDrawer(false)} />
      )}

      {/* Pin drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[340px] bg-card border-l border-border shadow-xl flex flex-col transform transition-transform duration-300 ${showPinDrawer ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h3 className="font-serif font-semibold text-base">Locations</h3>
          <button onClick={() => setShowPinDrawer(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <Button className="w-full" onClick={handleAddLocationFromDrawer}>
            <MapPin className="h-4 w-4" />
            Add Location
          </Button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pins</p>
            {!currentProject.pins?.length && (
              <p className="text-xs text-muted-foreground">No locations yet.</p>
            )}
            {currentProject.pins?.map((pin) => (
              <div key={pin.id} className="flex items-center gap-3 py-2 group">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{pin.title}</span>
                <button
                  onClick={() => { setShowPinDrawer(false); setMovingPinId(pin.id); setPlacingPin(true); }}
                  className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity px-1"
                >
                  Move
                </button>
                <button
                  onClick={() => removePin(pin.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Events</p>
              <p className="text-xs text-muted-foreground italic">Coming soon</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Characters</p>
              <p className="text-xs text-muted-foreground italic">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
