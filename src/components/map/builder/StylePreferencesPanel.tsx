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
  forceExpanded?: boolean;
  hideLineStyle?: boolean;
}

/* tiny island swatch paths per line style */
const swatchPath = "M30 10 Q42 8 48 18 Q52 30 48 42 Q44 50 30 52 Q16 50 12 42 Q8 30 12 18 Q18 8 30 10Z";

const lineStyles: Array<{ id: LineStyle }> = [
  { id: "clean" },
  { id: "hand-drawn" },
  { id: "nautical" },
  { id: "aged" },
];

const strokeWeights: StrokeWeight[] = ["fine", "medium", "bold"];
const backgrounds: BackgroundStyle[] = ["white", "cream", "aged-paper", "dark"];
const labelStyles: LabelStyle[] = ["serif", "sans-serif", "hidden"];

/** Returns SVG attributes per line style for the swatch preview */
function getSwatchAttrs(id: LineStyle, baseStroke: string) {
  switch (id) {
    case "hand-drawn":
      return { strokeWidth: 1.5, opacity: 0.92, stroke: baseStroke, filter: "url(#wobble)", strokeDasharray: undefined };
    case "nautical":
      return { strokeWidth: 2.4, opacity: 1, stroke: baseStroke, filter: undefined, strokeDasharray: undefined };
    case "aged":
      return { strokeWidth: 1.5, opacity: 0.82, stroke: "#2a1f0f", filter: undefined, strokeDasharray: "3,1.5" };
    default: // clean
      return { strokeWidth: 1.5, opacity: 1, stroke: baseStroke, filter: undefined, strokeDasharray: undefined };
  }
}

const StylePreferencesPanel = ({ prefs, onChange, forceExpanded, hideLineStyle }: StylePreferencesPanelProps) => {
  const [expanded, setExpanded] = useState(forceExpanded ?? false);

  const update = <K extends keyof StylePreferences>(key: K, value: StylePreferences[K]) =>
    onChange({ ...prefs, [key]: value });

  const isDefault =
    prefs.lineStyle === defaultStylePreferences.lineStyle &&
    prefs.strokeWeight === defaultStylePreferences.strokeWeight &&
    prefs.background === defaultStylePreferences.background &&
    prefs.labelStyle === defaultStylePreferences.labelStyle;

  const renderContent = () => {
    const colors = backgroundColors[prefs.background];
    return (
      <div className="space-y-4">

        {/* Stroke Weight — 3 buttons full width */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground/80">Stroke weight</label>
          <div className="flex w-full bg-muted rounded-full p-0.5">
            {strokeWeights.map((sw) => (
              <button
                key={sw}
                onClick={() => update("strokeWeight", sw)}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
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

        {/* Background — wrapping swatches */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground/80">Background</label>
          <div className="flex flex-wrap gap-2">
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


        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-[10px] text-muted-foreground/50 italic">
            Applied every time you render.
          </p>
          {!isDefault && (
            <button
              onClick={() => onChange(defaultStylePreferences)}
              className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    );
  };

  // When forceExpanded, skip the collapsible wrapper
  if (forceExpanded) {
    return <div className="space-y-0">{renderContent()}</div>;
  }

  return (
    <div className="border-t border-border bg-card">
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
      {expanded && <div className="px-5 pb-5">{renderContent()}</div>}
    </div>
  );
};

export default StylePreferencesPanel;
