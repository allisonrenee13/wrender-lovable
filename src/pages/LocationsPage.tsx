import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Location } from "@/data/projects";
import { MapPin, X, Plus, Image, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import BakeModal from "@/components/map/BakeModal";

const locationTypes = ["Hotel", "House", "Landmark", "Club", "Green Space", "Waterfront", "Road", "Other"];

const LocationsPage = () => {
  const { currentProject, addLocation, removeLocation } = useProject();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showBakeModal, setShowBakeModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Landmark", description: "", firstAppears: 1 });
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addLocation({
      name: form.name,
      type: form.type,
      description: form.description,
      firstAppears: form.firstAppears,
      eventCount: 0,
      photo: null,
      status: "pinned",
    });
    setForm({ name: "", type: "Landmark", description: "", firstAppears: 1 });
    setShowAddModal(false);
  };

  const locs = currentProject.locations;

  const eventsAtLocation = selectedLocation
    ? currentProject.pins
        .filter((p) => p.location === selectedLocation.name || selectedLocation.name.includes(p.location))
        .sort((a, b) => a.chapter - b.chapter)
    : [];
  const filteredEvents = showAllEvents ? eventsAtLocation : eventsAtLocation.filter((e) => e.tier === "main");

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-serif font-semibold">Locations</h1>
        <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add Location
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
        Each location in your story, individually drawn. Add detail, mood, and visual reference for every place that matters.
      </p>

      {locs.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-serif font-semibold mb-2">No locations yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Locations are added when you place pins on your map — or add them directly here.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => navigate("/map")} className="bg-primary text-primary-foreground">
              Go to Map
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(true)}>
              <Plus className="h-3 w-3 mr-1" /> Add Location
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locs.map((loc) => {
            const eventCount = currentProject.pins.filter(
              (p) => p.location === loc.name || loc.name.includes(p.location)
            ).length;
            return (
              <div key={loc.id} className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow">
                <button
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowAllEvents(false);
                  }}
                  className="text-left w-full"
                >
                  <div className="h-40 bg-muted flex items-center justify-center relative">
                    {loc.photo ? (
                      <img src={loc.photo} alt={loc.name} className="w-full h-full object-cover" />
                    ) : (
                      <Image className="h-8 w-8 text-muted-foreground/20" />
                    )}
                    <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/40 italic font-serif">
                      Illustration coming soon
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-serif font-semibold mb-1">{loc.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {loc.type}
                      </Badge>
                      {loc.status === "illustrated" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium">
                          🖊️ Illustrated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-secondary font-medium">
                          📍 Pinned
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-2.5 w-2.5" />
                        {eventCount} events
                      </span>
                    </div>
                  </div>
                </button>
                {loc.status === "pinned" && (
                  <div className="px-4 pb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[11px] h-7 text-primary border-primary/30 hover:bg-primary/5"
                      onClick={() => setShowBakeModal(true)}
                    >
                      <PenTool className="h-3 w-3 mr-1" />
                      Bake into Map
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Panel */}
      {selectedLocation && (
        <div className="fixed inset-y-0 right-0 w-96 max-w-full bg-card border-l border-border shadow-xl z-50 p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-serif font-semibold">{selectedLocation.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {selectedLocation.type}
                </Badge>
                {selectedLocation.status === "illustrated" ? (
                  <span className="text-[10px] text-primary font-medium">🖊️ Illustrated</span>
                ) : (
                  <span className="text-[10px] text-secondary font-medium">📍 Pinned</span>
                )}
              </div>
            </div>
            <button onClick={() => setSelectedLocation(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">{selectedLocation.description}</p>

          <div className="text-sm mb-4">
            <span className="text-muted-foreground">First appears:</span>{" "}
            <span className="font-medium">Ch. {selectedLocation.firstAppears}</span>
          </div>

          <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Mood Board</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
              >
                <Image className="h-5 w-5 text-muted-foreground/20" />
              </div>
            ))}
          </div>

          {/* Story events */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Story Events Here</h3>
            {eventsAtLocation.some((e) => e.tier === "minor") && (
              <button
                onClick={() => setShowAllEvents(!showAllEvents)}
                className="text-[10px] text-secondary hover:underline font-medium"
              >
                {showAllEvents ? "Main only" : "Show all"}
              </button>
            )}
          </div>
          <div className="space-y-2 mb-6">
            {filteredEvents.map((pin) => (
              <div
                key={pin.id}
                className={`flex items-center gap-2 text-sm p-2 rounded ${
                  pin.tier === "main" ? "bg-muted/50" : "bg-muted/20"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    pin.tier === "main" ? "bg-destructive" : "bg-muted-foreground/40"
                  }`}
                />
                <span className={pin.tier === "main" ? "font-medium" : "text-muted-foreground text-xs"}>
                  {pin.title}
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground">Ch. {pin.chapter}</span>
              </div>
            ))}
            {eventsAtLocation.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No story events linked to this location yet.</p>
            )}
          </div>

          {/* Bake button for pinned locations */}
          {selectedLocation.status === "pinned" && (
            <button
              onClick={() => {
                setSelectedLocation(null);
                setShowBakeModal(true);
              }}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mb-4"
            >
              <PenTool className="h-3 w-3" />
              Bake into Map
            </button>
          )}

          <button
            onClick={() => {
              removeLocation(selectedLocation.id);
              setSelectedLocation(null);
            }}
            className="text-xs text-destructive hover:underline"
          >
            Delete Location
          </button>
        </div>
      )}

      {/* Add Location Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Location name"
              className="font-serif"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {locationTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe this location..."
              rows={3}
            />
            <Input
              type="number"
              value={form.firstAppears}
              onChange={(e) => setForm({ ...form, firstAppears: Number(e.target.value) })}
              placeholder="First appears in chapter..."
            />
            <Button onClick={handleAdd} disabled={!form.name.trim()} className="w-full bg-primary text-primary-foreground">
              Add Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bake Modal */}
      <BakeModal open={showBakeModal} onClose={() => setShowBakeModal(false)} />
    </div>
  );
};

export default LocationsPage;
