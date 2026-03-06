import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_KEY = "seenery-map-guidance-dismissed";

interface GuidanceOverlayProps {
  onDismiss: () => void;
}

export function shouldShowGuidance(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  } catch {
    return true;
  }
}

const GuidanceOverlay = ({ onDismiss }: GuidanceOverlayProps) => {
  const [dontShow, setDontShow] = useState(false);

  const handleDismiss = () => {
    if (dontShow) {
      try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
    }
    onDismiss();
  };

  const steps = [
    {
      num: 1,
      title: "Draw your outline",
      desc: "Use the Draw tool to sketch your coastline, island edge, or any boundary. Don't worry about being perfect — you can adjust it after.",
    },
    {
      num: 2,
      title: "Add some features",
      desc: "Drop roads, rivers, and buildings onto your map using the feature tools on the left.",
    },
    {
      num: 3,
      title: "Continue when ready",
      desc: 'When your shape feels right, hit Continue to Style to choose how your map looks.',
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className="pointer-events-auto bg-background/90 backdrop-blur-sm border border-border rounded-xl p-8 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-lg font-serif font-semibold text-foreground mb-5">
          Let's build your world's map
        </h2>

        <ol className="space-y-4 mb-6">
          {steps.map((step) => (
            <li key={step.num} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center mt-0.5">
                {step.num}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-[13px] text-muted-foreground leading-relaxed mt-0.5">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <Button
          onClick={handleDismiss}
          className="w-full bg-primary text-primary-foreground font-semibold h-10"
        >
          Got it, start drawing
        </Button>

        <label className="flex items-center gap-2 mt-3 cursor-pointer justify-center">
          <Checkbox
            checked={dontShow}
            onCheckedChange={(v) => setDontShow(v === true)}
            className="h-3.5 w-3.5"
          />
          <span className="text-[11px] text-muted-foreground">Don't show this again</span>
        </label>
      </div>
    </div>
  );
};

export default GuidanceOverlay;
