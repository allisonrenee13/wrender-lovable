import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type {
  StylePreferences,
  LineStyle,
  StrokeWeight,
  BackgroundStyle,
  LabelStyle,
} from "./types";
import {
  defaultStylePreferences,
  lineStyleLabels,
  backgroundColors,
} from "./types";

interface StylePreferencesPanelProps {
  prefs: StylePreferences;
  onChange: (prefs: StylePreferences) => void;
}

/* tiny island swatch paths per line style */
const swatchPath = "M30 10 Q42 8 48 18 Q52 30 48 42 Q44 50 30 52 Q16 50 12 42 Q8 30 12 18 Q18 8 30 10Z";

const lineStyles: Array<{ id: LineStyle; dashArray?: string; wobble?: boolean }> = [
  { id: "clean" },
  { id: "hand-drawn", dashArray: "3 1.5" },
  { id: "nautical" },
  { id: "aged", dashArray: "2 1" },
];

const strokeWeights: StrokeWeight[] = ["fine", "medium", "bold"];
const backgrounds: BackgroundStyle[] = ["white", "cream", "aged-paper", "dark"];
const labelStyles: LabelStyle[] = ["serif", "sans-serif", "hidden"];

const StylePreferencesPanel = ({ prefs, onChange }: StylePreferencesPanelProps) => {
  const [expanded, setExpanded] = useState(false);

  const update = <K extends keyof StylePreferences>(key: K, value: StylePreferences[K]) =>
    onChange({ ...prefs, key: value, [key]: value });

  const isDefault =
    prefs.lineStyle === defaultStylePreferences.lineStyle &&
    prefs.strokeWeight === defaultStylePreferences.strokeWeight &&
    prefs.background === defaultStylePreferences.background &&
    prefs.labelStyle === defaultStylePreferences.labelStyle;

  return (
    <div className="border-t border-border bg-card">
      {/* Collapsed row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-5 py-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className="text-[13px] text-muted-foreground">Style preferences</span>
        <span className="text-[11px] text-muted-foreground/60 ml-auto">
          {lineStyleLabels[prefs.lineStyle]}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-5">
          {/* Line Style */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/80">Line style</label>
            <div className="flex gap-2">
              {lineStyles.map((ls) => {
                const active = prefs.lineStyle === ls.id;
                const colors = backgroundColors[prefs.background];
                return (
                  <button
                    key={ls.id}
                    onClick={() => update("lineStyle", ls.id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                      active
                        ? "border-secondary bg-secondary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <svg viewBox="0 0 60 60" className="w-12 h-12">
                      <rect width="60" height="60" fill={colors.bg} rx="4" />
                      <path
                        d={swatchPath}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={ls.id === "nautical" ? 2.2 : 1.5}
                        strokeDasharray={ls.dashArray}
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[10px] text-muted-foreground">{lineStyleLabels[ls.id]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stroke Weight */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/80">Stroke weight</label>
            <div className="inline-flex bg-muted rounded-full p-0.5">
              {strokeWeights.map((sw) => (
                <button
                  key={sw}
                  onClick={() => update("strokeWeight", sw)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                    prefs.strokeWeight === sw
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  {sw}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/80">Background</label>
            <div className="flex gap-2">
              {backgrounds.map((bg) => {
                const active = prefs.background === bg;
                const color = backgroundColors[bg];
                return (
                  <button
                    key={bg}
                    onClick={() => update("background", bg)}
                    className={`w-9 h-9 rounded-lg border-2 transition-all ${
                      active ? "border-secondary scale-110" : "border-border hover:border-muted-foreground/40"
                    }`}
                    style={{ backgroundColor: color.bg }}
                    title={bg}
                  />
                );
              })}
            </div>
          </div>

          {/* Label Style */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/80">Place labels</label>
            <div className="inline-flex bg-muted rounded-full p-0.5">
              {labelStyles.map((ls) => (
                <button
                  key={ls}
                  onClick={() => update("labelStyle", ls)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                    prefs.labelStyle === ls
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  {ls === "sans-serif" ? "Sans-serif" : ls === "hidden" ? "Hidden" : "Serif"}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-muted-foreground/50 italic">
              These preferences are saved per project and applied every time you render.
            </p>
            {!isDefault && (
              <button
                onClick={() => onChange(defaultStylePreferences)}
                className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Reset to defaults
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StylePreferencesPanel;
