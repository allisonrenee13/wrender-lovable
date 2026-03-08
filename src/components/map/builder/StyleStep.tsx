import StylePreferencesPanel from "./StylePreferencesPanel";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { StylePreferences } from "./types";
import { backgroundColors } from "./types";

interface StyleStepProps {
  stylePrefs: StylePreferences;
  onStylePrefsChange: (prefs: StylePreferences) => void;
  canvasState: { paths: Array<{ d: string; confidence: number }> };
  onContinue: () => void;
  onBack: () => void;
  renderButtonLabel?: string;
  isRendering?: boolean;
}

const StyleStep = ({ stylePrefs, onStylePrefsChange, canvasState, onContinue, onBack, renderButtonLabel, isRendering }: StyleStepProps) => {
  const colors = backgroundColors[stylePrefs.background];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Canvas preview — left */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ backgroundColor: colors.bg }}>
        <svg viewBox="0 0 600 600" className="w-full max-w-[460px] h-auto">
          {stylePrefs.lineStyle === "hand-drawn" && (
            <defs>
              <filter id="hand">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
            </defs>
          )}
          <rect width="600" height="600" fill={colors.bg} />
          {(() => {
            const baseStrokeWidth = stylePrefs.strokeWeight === "fine" ? 1 : stylePrefs.strokeWeight === "bold" ? 2.5 : 1.8;
            const longestIdx = canvasState.paths.reduce((best, p, i, arr) => p.d.length > arr[best].d.length ? i : best, 0);
            const isDark = stylePrefs.background === "dark";

            return canvasState.paths.map((p, i) => {
              let strokeColor = colors.stroke;
              let sw = baseStrokeWidth;
              let opacity = 1;
              let dasharray: string | undefined = undefined;
              let filter: string | undefined = undefined;

              switch (stylePrefs.lineStyle) {
                case "hand-drawn":
                  opacity = 0.92;
                  filter = "url(#hand)";
                  break;
                case "nautical":
                  sw = i === longestIdx ? baseStrokeWidth * 1.6 : baseStrokeWidth;
                  break;
                case "aged":
                  dasharray = "3,1.5";
                  opacity = 0.82;
                  strokeColor = isDark ? "#d4c9a8" : "#2a1f0f";
                  break;
                // clean: defaults
              }

              return (
                <path
                  key={i}
                  d={p.d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={sw}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={opacity}
                  strokeDasharray={dasharray}
                  filter={filter}
                />
              );
            });
          })()}
          {canvasState.paths.length === 0 && (
            <text
              x="300"
              y="310"
              textAnchor="middle"
              fontFamily="DM Sans, sans-serif"
              fontSize="13"
              fill={colors.stroke}
              opacity="0.3"
            >
              Your map shape will appear here
            </text>
          )}
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
            ← Back to Draw
          </button>
          <Button onClick={onContinue} disabled={isRendering} className="bg-primary text-primary-foreground font-semibold px-6">
            {isRendering ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Rendering…</>
            ) : (
              renderButtonLabel || "Continue to Render →"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StyleStep;
