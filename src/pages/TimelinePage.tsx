import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { PinType, EventTier } from "@/data/projects";
import { Plus, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TimelinePage = () => {
  const { currentProject, addTimelineEvent, addPin } = useProject();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMinor, setShowMinor] = useState(false);
  const [form, setForm] = useState({ title: "", chapter: 1, character: "", location: "", note: "", tier: "main" as EventTier });

  if (!currentProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h2 className="text-lg font-serif font-semibold mb-2">No project selected</h2>
        <p className="text-sm text-muted-foreground">Create a project first to build your timeline.</p>
      </div>
    );
  }

  const timeline = currentProject.timeline;

  const handleAdd = () => {
    if (!form.title.trim()) return;
    const charObj = currentProject.characters.find((c) => c.name === form.character);
    addTimelineEvent({
      title: form.title,
      tier: form.tier,
      chapter: form.chapter,
      character: form.character || "Unknown",
      characterInitial: charObj?.initial || form.character?.[0]?.toUpperCase() || "?",
      pinType: "plot",
      location: form.location || "Unknown",
    });
    addPin({
      title: form.title,
      type: "plot",
      tier: form.tier,
      chapter: form.chapter,
      location: form.location || "Unknown",
      note: form.note,
      x: 30 + Math.random() * 40,
      y: 20 + Math.random() * 60,
    });
    setForm({ title: "", chapter: 1, character: "", location: "", note: "", tier: "main" });
    setShowAddModal(false);
  };

  const visibleTimeline = showMinor ? timeline : timeline.filter((e) => e.tier !== "minor");

  if (timeline.length === 0) {
    return (
      <div className="p-6 md:p-10">
        <AISyncBanner />
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-serif font-semibold">{currentProject.title} — Timeline</h1>
          <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add Event
          </Button>
        </div>
        <div className="text-center py-20">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <h2 className="text-lg font-serif font-semibold mb-2">No events on your timeline yet</h2>
          <p className="text-sm text-muted-foreground mb-6">Add plot pins on your map to populate the timeline, or add events directly here</p>
          <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground">
            <Plus className="h-3 w-3 mr-1" /> Add Event
          </Button>
        </div>
        <AddEventModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          form={form}
          setForm={setForm}
          onAdd={handleAdd}
          characters={currentProject.characters}
          locations={currentProject.locations}
        />
      </div>
    );
  }

  const maxChapter = Math.max(...timeline.map((e) => e.chapter));
  const chapters = new Map<number, typeof timeline>();
  visibleTimeline.forEach((e) => {
    const arr = chapters.get(e.chapter) || [];
    arr.push(e);
    chapters.set(e.chapter, arr);
  });
  const sortedChapters = Array.from(chapters.entries()).sort(([a], [b]) => a - b);
  const currentChapter = sortedChapters[sortedChapters.length - 1]?.[0] || 1;

  return (
    <div className="p-6 md:p-10">
      <AISyncBanner />

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-serif font-semibold">{currentProject.title} — Timeline</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMinor(!showMinor)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              showMinor
                ? "bg-muted text-foreground border-border"
                : "text-muted-foreground border-transparent hover:border-border"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showMinor ? "bg-muted-foreground" : "bg-muted-foreground/30"}`} />
            Show Minor Events
          </button>
          <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add Event
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Chapter 1</span>
          <span>Chapter {currentChapter} of {maxChapter}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(currentChapter / maxChapter) * 100}%` }} />
        </div>
      </div>

      {/* Horizontal scrollable timeline */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {sortedChapters.map(([chapter, events]) => {
            const mainEvents = events.filter((e) => e.tier === "main");
            const minorEvents = events.filter((e) => e.tier === "minor");
            return (
              <div key={chapter} className="flex flex-col items-start">
                <span className="text-xs font-medium text-muted-foreground mb-3 px-1">Ch. {chapter}</span>
                <div className="space-y-2">
                  {mainEvents.map((event) => (
                    <div key={event.id} className="w-56 border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
                        <span className="text-xs text-muted-foreground">{event.location}</span>
                      </div>
                      <h3 className="text-sm font-semibold font-serif mb-2">{event.title}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                          {event.characterInitial}
                        </div>
                        <span className="text-xs text-muted-foreground">{event.character}</span>
                      </div>
                    </div>
                  ))}
                  {minorEvents.map((event) => (
                    <div
                      key={event.id}
                      className="w-56 border border-dashed border-border/60 rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                        <span className="text-[10px] text-muted-foreground">{event.location}</span>
                      </div>
                      <h3 className="text-xs font-medium text-muted-foreground font-serif mb-1.5">{event.title}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[9px] font-bold">
                          {event.characterInitial}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{event.character}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 border-t border-dashed border-border" />

      <AddEventModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        form={form}
        setForm={setForm}
        onAdd={handleAdd}
        characters={currentProject.characters}
        locations={currentProject.locations}
      />
    </div>
  );
};

function AISyncBanner() {
  return (
    <div className="mb-6 rounded-lg bg-primary/5 border border-primary/15 px-5 py-4 flex items-start gap-3">
      <Sparkles className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          AI Timeline Sync — coming soon
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Connect your writing app and Claude will scan your manuscript, identify main and minor events,
          suggest which belong on your map, and ask you to confirm before adding them.
        </p>
      </div>
    </div>
  );
}

function AddEventModal({
  open, onOpenChange, form, setForm, onAdd, characters, locations,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: { title: string; chapter: number; character: string; location: string; note: string; tier: EventTier };
  setForm: (f: typeof form) => void;
  onAdd: () => void;
  characters: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Add Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="font-serif" />

          <div className="flex items-center gap-1 bg-muted rounded-full p-0.5 w-fit">
            <button
              onClick={() => setForm({ ...form, tier: "main" })}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                form.tier === "main"
                  ? "bg-destructive text-white shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              ● Main Event
            </button>
            <button
              onClick={() => setForm({ ...form, tier: "minor" })}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                form.tier === "minor"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              · Minor Event
            </button>
          </div>

          <Input type="number" value={form.chapter} onChange={(e) => setForm({ ...form, chapter: Number(e.target.value) })} placeholder="Chapter" />
          <select value={form.character} onChange={(e) => setForm({ ...form, character: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Select character...</option>
            {characters.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Select location...</option>
            {locations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>
          <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note (optional)" />
          <Button onClick={onAdd} disabled={!form.title.trim()} className="w-full bg-primary text-primary-foreground">Add to Timeline & Map</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TimelinePage;
