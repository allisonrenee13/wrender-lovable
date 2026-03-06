import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { MapPin, Users, Map, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SeeneryLogo } from "@/components/SeeneryLogo";

const Index = () => {
  const { currentProject, allProjects, setCurrentProjectId, createProject, updateProjectTitle } = useProject();
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [form, setForm] = useState({ title: "", genre: "Literary Fiction", setting: "", wordCount: "" });

  const handleCreateProject = () => {
    if (!form.title.trim()) return;
    createProject(form);
    setForm({ title: "", genre: "Literary Fiction", setting: "", wordCount: "" });
    setShowNewProject(false);
  };

  // Empty state — no projects yet
  if (!currentProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Map className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">No projects yet</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create your first project to start building your world.
            </p>
          </div>
          <Button
            onClick={() => setShowNewProject(true)}
            className="bg-primary text-primary-foreground font-medium px-8 h-12"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <NewProjectModal
          open={showNewProject}
          onOpenChange={setShowNewProject}
          form={form}
          setForm={setForm}
          onSubmit={handleCreateProject}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Project Switcher */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {allProjects.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrentProjectId(p.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              currentProject.id === p.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.title}
          </button>
        ))}
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-secondary transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          New Project
        </button>
      </div>

      {/* Project Header */}
      {editingTitle ? (
        <input
          autoFocus
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={() => { updateProjectTitle(newTitle); setEditingTitle(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") { updateProjectTitle(newTitle); setEditingTitle(false); } }}
          className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2 bg-transparent border-b-2 border-secondary outline-none w-full"
        />
      ) : (
        <h1
          onClick={() => { setNewTitle(currentProject.title); setEditingTitle(true); }}
          className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2 cursor-pointer hover:text-secondary transition-colors"
        >
          {currentProject.title}
        </h1>
      )}

      {/* Project Card */}
      <div className="border border-border rounded-lg p-5 mb-8 bg-card">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="bg-secondary/20 text-secondary-foreground px-2.5 py-0.5 rounded font-medium text-xs">
            {currentProject.genre}
          </span>
          <span className="text-muted-foreground">{currentProject.setting}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{currentProject.wordCount} words</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Last edited {currentProject.lastEdited}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<MapPin className="h-5 w-5 text-secondary" />} label="Pins on Map" value={currentProject.pins.length} />
        <StatCard icon={<Users className="h-5 w-5 text-primary" />} label="Characters" value={currentProject.characters.length} />
        <StatCard icon={<Map className="h-5 w-5 text-muted-foreground" />} label="Locations" value={currentProject.locations.length} />
      </div>


      <NewProjectModal
        open={showNewProject}
        onOpenChange={setShowNewProject}
        form={form}
        setForm={setForm}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

function NewProjectModal({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: { title: string; genre: string; setting: string; wordCount: string };
  setForm: (f: typeof form) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Book Title *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. The Paper Palace"
              className="font-serif"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Genre</label>
            <select
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {["Literary Fiction", "Thriller", "Fantasy", "Sci-Fi", "Romance", "Historical Fiction", "Horror", "Other"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Setting</label>
            <Input
              value={form.setting}
              onChange={(e) => setForm({ ...form, setting: e.target.value })}
              placeholder="e.g. A small island off the coast of Florida"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Word Count</label>
            <Input
              type="number"
              value={form.wordCount}
              onChange={(e) => setForm({ ...form, wordCount: e.target.value })}
              placeholder="0"
            />
          </div>
          <Button
            onClick={onSubmit}
            disabled={!form.title.trim()}
            className="w-full bg-primary text-primary-foreground font-medium"
          >
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="border border-border rounded-lg p-5 bg-card flex items-center gap-4">
      {icon}
      <div>
        <p className="text-2xl font-serif font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default Index;
