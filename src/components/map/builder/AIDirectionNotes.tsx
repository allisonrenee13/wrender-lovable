import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { AIDirectionNotes as AINotesType } from "./types";

interface AIDirectionNotesProps {
  notes: AINotesType;
  onChange: (notes: AINotesType) => void;
  hasNotes: boolean;
}

const AIDirectionNotesPanel = ({ notes, onChange, hasNotes }: AIDirectionNotesProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-border bg-card">
      {/* Collapsed toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-5 py-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className="text-[13px] text-muted-foreground">AI direction notes</span>
        <span className="text-[11px] text-secondary font-medium ml-1">(optional)</span>
        {!expanded && hasNotes && (
          <span className="w-2 h-2 rounded-full bg-secondary ml-auto" />
        )}
      </button>

      {/* Expanded fields */}
      {expanded && (
        <div className="px-5 pb-4 space-y-4">
          <p className="text-[11px] text-muted-foreground/70 italic">
            These notes are optional. Wrender renders well without them. Add notes only if you want to guide the style.
          </p>

          {/* Render style */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground/80">Render style</label>
            <input
              type="text"
              value={notes.renderStyle}
              onChange={(e) => onChange({ ...notes, renderStyle: e.target.value })}
              placeholder="e.g. hand-drawn and nautical, clinical and architectural, ancient and weathered, modern and clean"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-muted/20 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-secondary/40"
            />
            <p className="text-[10px] text-muted-foreground/50">Describes the overall visual feel of the line art.</p>
          </div>

          {/* Atmosphere */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground/80">Atmosphere notes</label>
            <textarea
              value={notes.atmosphereNotes}
              onChange={(e) => onChange({ ...notes, atmosphereNotes: e.target.value })}
              placeholder="e.g. This is a sun-bleached island, warm and slightly hazy. The lighthouse is the most important landmark. The north beach should feel open and exposed."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-muted/20 resize-none placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-secondary/40"
            />
            <p className="text-[10px] text-muted-foreground/50">Anything that helps Wrender understand the mood and priorities of your setting.</p>
          </div>

          {/* Emphasise */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground/80">What to emphasise</label>
            <input
              type="text"
              value={notes.whatToEmphasise}
              onChange={(e) => onChange({ ...notes, whatToEmphasise: e.target.value })}
              placeholder="e.g. Emphasise the coastline detail. Make the harbour feel sheltered. The forest in the east is dense and dark."
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-muted/20 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-secondary/40"
            />
            <p className="text-[10px] text-muted-foreground/50">Specific rendering priorities — what matters most in your world.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDirectionNotesPanel;
