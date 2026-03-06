import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import UnifiedMapBuilder from "@/components/map/UnifiedMapBuilder";
import MapViewMode from "@/components/map/MapViewMode";

const MapPage = () => {
  const { currentProject } = useProject();
  const [forceBuilder, setForceBuilder] = useState(false);

  // Show builder if map not confirmed, or user explicitly entered builder
  const showBuilder = !currentProject.mapConfirmed || forceBuilder;

  if (showBuilder) {
    return (
      <div className="h-full flex flex-col">
        {/* Builder banner */}
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
