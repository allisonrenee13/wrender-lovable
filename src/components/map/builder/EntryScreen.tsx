import { LayoutGrid, Upload, PenTool } from "lucide-react";
import type { BuilderPath } from "./types";

interface EntryScreenProps {
  onSelect: (path: BuilderPath) => void;
}

const cards: Array<{
  path: BuilderPath;
  icon: typeof LayoutGrid;
  label: string;
  subtext: string;
  cta: string;
}> = [
  {
    path: "template",
    icon: LayoutGrid,
    label: "Start from a template",
    subtext: "Choose a geography type and edit it into your world.",
    cta: "Browse Templates",
  },
  {
    path: "upload",
    icon: Upload,
    label: "Upload a reference",
    subtext: "Upload a real map, satellite image, or hand-drawn sketch. Auto-trace it or draw over it.",
    cta: "Upload Image",
  },
  {
    path: "draw",
    icon: PenTool,
    label: "Start from scratch",
    subtext: "Draw your world freehand on a blank canvas.",
    cta: "Start Drawing",
  },
];

const EntryScreen = ({ onSelect }: EntryScreenProps) => (
  <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 gap-6 md:gap-10">
    <div className="flex flex-col md:flex-row gap-3 md:gap-6 max-w-4xl w-full justify-center">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.path}
            onClick={() => onSelect(card.path)}
            className="w-full md:flex-1 md:max-w-[260px] border border-border rounded-xl p-6 md:p-8 flex flex-col items-center gap-3 md:gap-4 
              bg-card hover:border-secondary/60 hover:shadow-md transition-all text-center group"
          >
            <div className="w-14 h-14 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
              <Icon className="h-7 w-7 text-muted-foreground group-hover:text-secondary transition-colors" />
            </div>
            <h3 className="text-base font-serif font-semibold text-foreground">{card.label}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{card.subtext}</p>
            <span className="mt-auto pt-2 text-sm font-medium text-primary hover:text-secondary transition-colors">
              {card.cta} →
            </span>
          </button>
        );
      })}
    </div>
    <p className="text-xs text-muted-foreground/60 italic tracking-wide">
      You draw it. Wrender makes it look exactly right. Your shape, your geography, finished consistently every time.
    </p>
  </div>
);

export default EntryScreen;
