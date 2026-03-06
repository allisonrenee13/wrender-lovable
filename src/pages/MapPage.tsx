import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import UnifiedMapBuilder from "@/components/map/UnifiedMapBuilder";
import MapViewMode from "@/components/map/MapViewMode";
import { Map, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const MapPage = () => {
  const { currentProject } = useProject();
  const [forceBuilder, setForceBuilder] = useState(false);

  // No project selected
  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Map className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-serif font-semibold text-foreground">No project selected</h2>
          <p className="text-sm text-muted-foreground">Create a project first to start building your map.</p>
        </div>
      </div>
    );
  }

  // Show builder if map not confirmed, or user explicitly entered builder
  const showBuilder = !currentProject.mapConfirmed || forceBuilder;

  if (showBuilder) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 px-6 py-2.5 bg-muted/50 border-b border-border">
          <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" />
          </svg>
          <span className="text-xs text-muted-foreground font-medium tracking-wide">Map Builder</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <UnifiedMapBuilder onConfirm={() => setForceBuilder(false)} />
        </div>
      </div>
    );
  }

  return <MapViewMode onEditMap={() => setForceBuilder(true)} />;
};

export default MapPage;
