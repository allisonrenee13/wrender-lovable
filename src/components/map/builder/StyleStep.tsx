import StylePreferencesPanel from "./StylePreferencesPanel";
import { Button } from "@/components/ui/button";
import type { StylePreferences } from "./types";
import { backgroundColors } from "./types";

interface StyleStepProps {
  stylePrefs: StylePreferences;
  onStylePrefsChange: (prefs: StylePreferences) => void;
  canvasState: { paths: string[] };
  onContinue: () => void;
  onBack: () => void;
}

const StyleStep = ({ stylePrefs, onStylePrefsChange, canvasState, onContinue, onBack }: StyleStepProps) => {
  const colors = backgroundColors[stylePrefs.background];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Canvas preview — left */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ backgroundColor: colors.bg }}>
        <svg viewBox="0 0 600 600" className="w-full max-w-[460px] h-auto">
          <rect width="600" height="600" fill={colors.bg} />
          {canvasState.paths.map((p, i) => (
            <path
              key={i}
              d={p}
              fill="none"
              stroke={colors.stroke}
              strokeWidth={stylePrefs.strokeWeight === "fine" ? 1 : stylePrefs.strokeWeight === "bold" ? 2.5 : 1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {/* Style panel — right */}
      <div className="w-[360px] border-l border-border flex flex-col bg-card">
        <div className="flex-1 overflow-y-auto">
          {/* Force expanded */}
          <div className="p-6">
            <h3 className="text-base font-serif font-semibold text-foreground mb-1">Style your map</h3>
            <p className="text-xs text-muted-foreground mb-6">
              These are saved for this project. You can change them any time.
            </p>
          </div>
          {/* Reuse the panel but always expanded — we render it inline */}
          <StylePreferencesPanel prefs={stylePrefs} onChange={onStylePrefsChange} forceExpanded />
        </div>

        {/* Footer buttons */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Shape
          </button>
          <Button onClick={onContinue} className="bg-primary text-primary-foreground font-semibold px-6">
            Continue to Render →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StyleStep;
