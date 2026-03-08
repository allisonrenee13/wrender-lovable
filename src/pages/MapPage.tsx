import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import UnifiedMapBuilder from "@/components/map/UnifiedMapBuilder";
import { Button } from "@/components/ui/button";

const MapPage = () => {
  const { currentProject } = useProject();
  const [showBuilder, setShowBuilder] = useState(true);
  const [savedSVG, setSavedSVG] = useState<string | null>(null);

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10">
        <p className="text-sm text-muted-foreground">
          Create a project first to start building your map.
        </p>
      </div>
    );
  }

  if (showBuilder) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 px-6 py-2.5 bg-muted/50 border-b border-border">
          <span className="text-xs text-muted-foreground font-medium tracking-wide">Map Builder</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <UnifiedMapBuilder
            onRender={(svg) => {
              setSavedSVG(svg);
              setShowBuilder(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <h2 className="font-serif font-semibold text-base">
          {currentProject.title}
        </h2>
        <Button variant="outline" size="sm" onClick={() => setShowBuilder(true)}>
          Edit map
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20 relative">
        {savedSVG ? (
          <div
            className="w-full max-w-[600px] border border-border rounded-lg overflow-hidden shadow-md"
            dangerouslySetInnerHTML={{ __html: savedSVG }}
          />
        ) : (
          <p className="text-sm text-muted-foreground italic">No map yet</p>
        )}
        {currentProject.pins?.map((pin) => (
          <div
            key={pin.id}
            style={{
              position: "absolute",
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transform: "translate(-50%,-50%)",
              zIndex: 10,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-destructive border-2 border-background shadow-sm" />
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap">
              {pin.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapPage;
