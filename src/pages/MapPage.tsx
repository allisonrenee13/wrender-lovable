import { useState } from "react";
import MapModeToggle, { MapMode } from "@/components/map/MapModeToggle";
import DescribeMode from "@/components/map/DescribeMode";
import UploadAdaptMode from "@/components/map/UploadAdaptMode";
import SpliceMode from "@/components/map/SpliceMode";
import LocationPanel from "@/components/map/LocationPanel";
import { useProject } from "@/context/ProjectContext";

const MapPage = () => {
  const { currentProject } = useProject();
  const [mode, setMode] = useState<MapMode>("describe");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  // Upload mode manages its own layout in canvas step
  const isUploadMode = mode === "upload";

  return (
    <div className="h-full flex flex-col">
      {/* Top bar — only show for non-upload or pre-canvas upload steps */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-xl font-serif font-semibold">{currentProject.title} — Map Canvas</h1>
        <MapModeToggle mode={mode} onModeChange={setMode} />
      </div>

      {/* Main area */}
      <div className="flex-1 relative overflow-hidden flex">
        {isUploadMode ? (
          <UploadAdaptMode
            selectedLocationId={selectedLocationId}
            onSelectLocation={setSelectedLocationId}
          />
        ) : (
          <>
            <div
              className="h-full overflow-y-auto p-6 flex-1"
              style={{
                marginRight: panelOpen ? "280px" : "0",
                transition: "margin-right 0.3s",
              }}
            >
              {mode === "describe" && (
                <DescribeMode
                  selectedLocationId={selectedLocationId}
                  onSelectLocation={setSelectedLocationId}
                />
              )}
              {mode === "splice" && <SpliceMode />}
            </div>

            <LocationPanel
              isOpen={panelOpen}
              onToggle={() => setPanelOpen(!panelOpen)}
              selectedLocationId={selectedLocationId}
              onSelectLocation={setSelectedLocationId}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MapPage;
