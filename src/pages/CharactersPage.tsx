import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Plus, X, User, Image, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Character } from "@/data/projects";

const roles = ["Protagonist", "Antagonist", "Supporting", "Minor"];

const CharactersPage = () => {
  const { currentProject, addCharacter, removeCharacter, updateCharacter } = useProject();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [form, setForm] = useState({
    name: "", role: "Protagonist", age: "", firstAppears: 1,
    trait1: "", trait2: "", trait3: "", notes: "",
  });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addCharacter({
      name: form.name,
      initial: form.name[0]?.toUpperCase() || "?",
      role: form.role,
      age: form.age,
      firstAppears: form.firstAppears,
      traits: [form.trait1, form.trait2, form.trait3].filter(Boolean),
      notes: form.notes,
      photo: null,
    });
    setForm({ name: "", role: "Protagonist", age: "", firstAppears: 1, trait1: "", trait2: "", trait3: "", notes: "" });
    setShowAddModal(false);
  };

  const chars = currentProject.characters;

  return (
    <div className="p-6 md:p-10">
      {/* Character Movement Mapping banner */}
      <div className="mb-6 rounded-lg bg-primary/5 border border-primary/15 px-5 py-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Character Movement Mapping — coming soon
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            Place your characters on the map scene by scene and track their whereabouts throughout your story.
            See exactly where everyone is at any moment — and whether their movements make narrative sense.
          </p>
          <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed">
            Imagine mapping the moment your characters split up at the yacht club — who goes to the beach club,
            who heads to the hotel, and whether the geography of your story actually works.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-serif font-semibold">{currentProject.title} — Characters</h1>
        <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add Character
        </Button>
      </div>

      {chars.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-serif font-semibold mb-2">No characters yet</h2>
          <p className="text-sm text-muted-foreground mb-6">Add your first character to start building your world</p>
          <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground">
            <Plus className="h-3 w-3 mr-1" /> Add Character
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chars.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChar(c)}
              className="text-left border border-border rounded-lg p-5 bg-card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3 mb-3">
                {c.photo ? (
                  <img src={c.photo} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {c.initial}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-serif font-semibold">{c.name}</h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{c.role}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.traits.map((t, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">View Profile →</p>
            </button>
          ))}
        </div>
      )}

      {/* Add Character Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add Character</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Character name" className="font-serif" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {roles.map((r) => <option key={r}>{r}</option>)}
            </select>
            <div className="flex gap-2">
              <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Age" className="w-1/2" />
              <Input type="number" value={form.firstAppears} onChange={(e) => setForm({ ...form, firstAppears: Number(e.target.value) })} placeholder="First appears Ch." className="w-1/2" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Traits (up to 3)</label>
              <div className="flex gap-2">
                <Input value={form.trait1} onChange={(e) => setForm({ ...form, trait1: e.target.value })} placeholder="e.g. Guarded" className="text-xs" />
                <Input value={form.trait2} onChange={(e) => setForm({ ...form, trait2: e.target.value })} placeholder="e.g. Intelligent" className="text-xs" />
                <Input value={form.trait3} onChange={(e) => setForm({ ...form, trait3: e.target.value })} placeholder="e.g. Loyal" className="text-xs" />
              </div>
            </div>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes about this character..." className="text-sm" rows={3} />
            <Button onClick={handleAdd} disabled={!form.name.trim()} className="w-full bg-primary text-primary-foreground">Add Character</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Character Detail Panel */}
      {selectedChar && (
        <div className="fixed inset-y-0 right-0 w-96 max-w-full bg-card border-l border-border shadow-xl z-50 p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                {selectedChar.initial}
              </div>
              <div>
                <h2 className="text-xl font-serif font-semibold">{selectedChar.name}</h2>
                <Badge variant="outline" className="text-xs">{selectedChar.role}</Badge>
              </div>
            </div>
            <button onClick={() => setSelectedChar(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <div><span className="text-muted-foreground">Age:</span> <span className="font-medium">{selectedChar.age || "—"}</span></div>
              <div><span className="text-muted-foreground">First appears:</span> <span className="font-medium">Ch. {selectedChar.firstAppears}</span></div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Traits</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedChar.traits.map((t, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-muted text-foreground">{t}</span>
                ))}
                {selectedChar.traits.length === 0 && <span className="text-xs text-muted-foreground italic">No traits added</span>}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-foreground">{selectedChar.notes || "No notes yet."}</p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Locations</h3>
              <p className="text-xs text-muted-foreground italic">Link this character to map locations by pinning them on the map.</p>
            </div>

            <button
              onClick={() => { removeCharacter(selectedChar.id); setSelectedChar(null); }}
              className="text-xs text-destructive hover:underline mt-4"
            >
              Delete Character
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharactersPage;
