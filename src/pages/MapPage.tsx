import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import UnifiedMapBuilder from "@/components/map/UnifiedMapBuilder";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";

const MapPage = () => {
  const { currentProject } = useProject();
  const [forceBuilder, setForceBuilder] = useState(false);

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
          <UnifiedMapBuilder
            onConfirm={() => setForceBuilder(false)}
            initialPhase={forceBuilder ? "shapeCanvas" : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="font-serif font-semibold text-base">{currentProject.title}</h2>
          <span className="text-xs text-muted-foreground">v1</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setForceBuilder(true)}>
            Edit map
          </Button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-6 bg-muted/20">
        {currentProject.mapState?.renderedSVG ? (
          <div
            className="w-full max-w-[600px] border border-border rounded-lg overflow-hidden shadow-md"
            dangerouslySetInnerHTML={{ __html: currentProject.mapState.renderedSVG }}
          />
        ) : (
          <p className="text-sm text-muted-foreground italic">Your rendered map will appear here</p>
        )}
        {currentProject.pins?.map((pin) => (
          <div
            key={pin.id}
            style={{
              position: "absolute",
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-destructive border-2 border-background shadow-sm" />
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap text-foreground">
              {pin.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapPage;
