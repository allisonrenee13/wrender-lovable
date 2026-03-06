import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProject } from "@/context/ProjectContext";
import IslaSerranoMap from "./IslaSerranoMap";
import CapeCodeMap from "./CapeCodeMap";
import CommunityMap from "./CommunityMap";
import PrythianMap from "./PrythianMap";
import MapEventOverlay from "./MapEventOverlay";

interface DescribeModeProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
}

const projectPrompts: Record<string, string> = {
  "paper-palace": `A curved peninsula reaching into the Atlantic — Cape Cod, Massachusetts. Summer houses lining a freshwater pond. Dense woods to the north. A boathouse tucked along the shore. Winding sandy roads connecting everything.`,
  "the-giver": `A perfectly ordered circular community. Concentric rings of identical family dwelling units. An auditorium at the centre. The Annex at the boundary. A river marking the edge — beyond it, Elsewhere.`,
  "acotar": `The realm of Prythian. Seven courts divided by magic. The Spring Court lush and green to the east. The Night Court dark and star-filled to the northwest. Under the Mountain looms at the centre-north. The Wall separates faerie from the mortal lands to the south.`,
};

const DescribeMode = ({ selectedLocationId, onSelectLocation }: DescribeModeProps) => {
  const { currentProject } = useProject();
  const defaultPrompt = projectPrompts[currentProject.id] || `Describe your world or location and Wrender will sketch it...`;
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [generated, setGenerated] = useState(true);
  const [showMain, setShowMain] = useState(true);
  const [showMinor, setShowMinor] = useState(false);

  // Filter pins by visibility
  const visiblePins = currentProject.pins.filter((p) => {
    if (p.tier === "main" && showMain) return true;
    if (p.tier === "minor" && showMinor) return true;
    return false;
  });

  const renderMap = () => {
    switch (currentProject.id) {
      case "paper-palace":
        return <CapeCodeMap selectedLocationId={selectedLocationId} onSelectLocation={onSelectLocation} pins={visiblePins} />;
      case "the-giver":
        return <CommunityMap selectedLocationId={selectedLocationId} onSelectLocation={onSelectLocation} pins={visiblePins} />;
      case "acotar":
        return <PrythianMap selectedLocationId={selectedLocationId} onSelectLocation={onSelectLocation} pins={visiblePins} />;
      default:
        return <IslaSerranoMap selectedLocationId={selectedLocationId} onSelectLocation={onSelectLocation} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your world or location and Wrender will sketch it..."
          className="min-h-[80px] text-sm border-border bg-card resize-none"
        />
        <Button
          onClick={() => setGenerated(true)}
          className="bg-primary text-secondary font-medium"
        >
          Generate Sketch
        </Button>
      </div>

      {generated && (
        <div className="relative">
          {renderMap()}
          <MapEventOverlay
            showMain={showMain}
            showMinor={showMinor}
            onToggleMain={() => setShowMain(!showMain)}
            onToggleMinor={() => setShowMinor(!showMinor)}
          />
        </div>
      )}
    </div>
  );
};

export default DescribeMode;
