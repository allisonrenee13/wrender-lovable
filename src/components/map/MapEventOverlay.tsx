interface MapEventOverlayProps {
  showMain: boolean;
  showMinor: boolean;
  onToggleMain: () => void;
  onToggleMinor: () => void;
}

const MapEventOverlay = ({ showMain, showMinor, onToggleMain, onToggleMinor }: MapEventOverlayProps) => {
  return (
    <div className="absolute bottom-4 left-4 z-20 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-sm p-3 space-y-2">
      <button
        onClick={onToggleMain}
        className="flex items-center gap-2 text-xs font-medium w-full text-left"
      >
        <span className={`w-2.5 h-2.5 rounded-full transition-colors ${showMain ? "bg-destructive" : "bg-muted"}`} />
        <span className={showMain ? "text-foreground" : "text-muted-foreground"}>Main Events</span>
        <span className={`ml-auto text-[10px] ${showMain ? "text-foreground" : "text-muted-foreground"}`}>
          {showMain ? "ON" : "OFF"}
        </span>
      </button>
      <button
        onClick={onToggleMinor}
        className="flex items-center gap-2 text-xs font-medium w-full text-left"
      >
        <span className={`w-2 h-2 rounded-full transition-colors ${showMinor ? "bg-muted-foreground" : "bg-muted"}`} />
        <span className={showMinor ? "text-foreground" : "text-muted-foreground"}>Minor Events</span>
        <span className={`ml-auto text-[10px] ${showMinor ? "text-foreground" : "text-muted-foreground"}`}>
          {showMinor ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
};

export default MapEventOverlay;
