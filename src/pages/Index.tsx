import { useProject } from "@/context/ProjectContext";
import { MapPin, Users, Map } from "lucide-react";

const Index = () => {
  const { currentProject, allProjects, setCurrentProjectId } = useProject();

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Project Switcher */}
      <div className="flex flex-wrap gap-2 mb-8">
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
      </div>

      {/* Project Header */}
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">{currentProject.title}</h1>

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
        <StatCard icon={<MapPin className="h-5 w-5 text-pin-location" />} label="Pins on Map" value={currentProject.pins.length} />
        <StatCard icon={<Users className="h-5 w-5 text-pin-character" />} label="Characters" value={currentProject.characters.length} />
        <StatCard icon={<Map className="h-5 w-5 text-muted-foreground" />} label="Locations" value={currentProject.locations.length} />
      </div>

      {/* Recent Activity */}
      <h2 className="text-lg font-serif font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-2">
        {currentProject.recentActivity.map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-muted/50 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
            <span className="text-foreground">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
