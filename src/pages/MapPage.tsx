import { useState } from "react";
import MapModeToggle, { MapMode } from "@/components/map/MapModeToggle";
import DescribeMode from "@/components/map/DescribeMode";
import UploadAdaptMode from "@/components/map/UploadAdaptMode";
import SpliceMode from "@/components/map/SpliceMode";
import LocationPanel from "@/components/map/LocationPanel";

const MapPage = () => {
  const [mode, setMode] = useState<MapMode>("describe");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-xl font-serif font-semibold">Map Canvas</h1>
        <MapModeToggle mode={mode} onModeChange={setMode} />
      </div>

      {/* Main area */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="h-full overflow-y-auto p-6"
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
          {mode === "upload" && <UploadAdaptMode />}
          {mode === "splice" && <SpliceMode />}
        </div>

        <LocationPanel
          isOpen={panelOpen}
          onToggle={() => setPanelOpen(!panelOpen)}
          selectedLocationId={selectedLocationId}
          onSelectLocation={setSelectedLocationId}
        />
      </div>
    </div>
  );
};

export default MapPage;
