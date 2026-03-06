export type MapMode = "describe" | "upload" | "splice";

interface MapModeToggleProps {
  mode: MapMode;
  onModeChange: (mode: MapMode) => void;
}

const modes: { value: MapMode; label: string; icon: string }[] = [
  { value: "describe", label: "Describe It", icon: "✏️" },
  { value: "upload", label: "Upload + Adapt", icon: "📷" },
  { value: "splice", label: "Splice", icon: "✂️" },
];

const MapModeToggle = ({ mode, onModeChange }: MapModeToggleProps) => {
  return (
    <div className="inline-flex items-center bg-muted rounded-full p-1 gap-0.5">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            mode === m.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="mr-1.5">{m.icon}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
};

export default MapModeToggle;
