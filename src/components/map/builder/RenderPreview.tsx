import { Button } from "@/components/ui/button";
import IslaSerranoMap from "../IslaSerranoMap";
import CapeCodeMap from "../CapeCodeMap";
import CommunityMap from "../CommunityMap";
import PrythianMap from "../PrythianMap";

interface RenderPreviewProps {
  projectId: string;
  hasAINotes: boolean;
  onUseMap: () => void;
  onKeepEditing: () => void;
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
  pins?: any[];
}

const RenderPreview = ({
  projectId,
  hasAINotes,
  onUseMap,
  onKeepEditing,
  selectedLocationId,
  onSelectLocation,
  pins,
}: RenderPreviewProps) => {
  const renderMap = () => {
    switch (projectId) {
      case "paper-palace":
        return <CapeCodeMap selectedLocationId={selectedLocationId} onSelectLocation={onSelectLocation} pins={pins} />;
      case "the-giver":
        return <CommunityMap selectedLocationId={selectedLocationId} onSelectLocation={onSelectLocation} pins={pins} />;
      case "acotar":
        return <PrythianMap selectedLocationId={selectedLocationId} onSelectLocation={onSelectLocation} pins={pins} />;
      default:
        return <IslaSerranoMap selectedLocationId={selectedLocationId} onSelectLocation={onSelectLocation} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6" style={{ backgroundColor: "#FAFAF7" }}>
      <div className="flex-1 flex items-start justify-center w-full max-w-[600px]">
        {renderMap()}
      </div>

      <div className="flex flex-col items-center gap-3 w-full max-w-md">
        <Button
          onClick={onUseMap}
          className="w-full bg-primary text-primary-foreground font-semibold h-12 text-sm"
        >
          Use This Map
        </Button>
        <button
          onClick={onKeepEditing}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Keep Editing
        </button>
        {hasAINotes && (
          <p className="text-[11px] text-muted-foreground/60 italic text-center">
            Not quite right? Adjust your direction notes and re-render, or keep editing the shape.
          </p>
        )}
      </div>
    </div>
  );
};

export default RenderPreview;
