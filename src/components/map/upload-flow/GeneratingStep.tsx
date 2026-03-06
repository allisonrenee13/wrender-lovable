import { useEffect, useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";

interface GeneratingStepProps {
  onComplete: () => void;
  description?: string;
}

const GeneratingStep = ({ onComplete, description }: GeneratingStepProps) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  // Extract a name from the description for dynamic text
  const mapName = useMemo(() => {
    if (!description) return "your map";
    const match = description.match(/(?:rename.*?to|called|named|this is)\s+([A-Z][a-zA-Z\s]+?)(?:\s*[—–\-.,]|\s+The\s|\.\s|$)/i);
    return match ? match[1].trim() : "your map";
  }, [description]);

  const phases = useMemo(() => [
    { text: `Tracing the reference image...`, sub: "Identifying coastlines, roads, and landmarks" },
    { text: `Applying your world's changes...`, sub: "Renaming places and adding new locations" },
    { text: `Sketching ${mapName}...`, sub: "Rendering clean line art in your chosen style" },
  ], [mapName]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    const phaseTimer1 = setTimeout(() => setPhase(1), 1500);
    const phaseTimer2 = setTimeout(() => setPhase(2), 3500);
    const timeout = setTimeout(onComplete, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  const currentPhase = phases[phase];

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-xs">
        {/* Animated book/pen icon */}
        <div className="mx-auto w-16 h-16 relative">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <path d="M 8 20 Q 8 16 12 16 L 30 16 Q 32 16 32 18 L 32 48 Q 32 46 30 46 L 12 46 Q 8 46 8 42 Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <path d="M 56 20 Q 56 16 52 16 L 34 16 Q 32 16 32 18 L 32 48 Q 32 46 34 46 L 52 46 Q 56 46 56 42 Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <line x1="14" y1="24" x2="28" y2="24" stroke="hsl(var(--secondary))" strokeWidth="0.8" opacity="0.7">
              <animate attributeName="x2" from="14" to="28" dur="0.8s" repeatCount="indefinite" />
            </line>
            <line x1="14" y1="30" x2="26" y2="30" stroke="hsl(var(--secondary))" strokeWidth="0.8" opacity="0.5">
              <animate attributeName="x2" from="14" to="26" dur="1s" begin="0.3s" repeatCount="indefinite" />
            </line>
            <line x1="36" y1="24" x2="50" y2="24" stroke="hsl(var(--secondary))" strokeWidth="0.8" opacity="0.7">
              <animate attributeName="x2" from="36" to="50" dur="0.9s" begin="0.1s" repeatCount="indefinite" />
            </line>
            <line x1="36" y1="30" x2="48" y2="30" stroke="hsl(var(--secondary))" strokeWidth="0.8" opacity="0.5">
              <animate attributeName="x2" from="36" to="48" dur="1.1s" begin="0.4s" repeatCount="indefinite" />
            </line>
          </svg>
        </div>

        <div className="min-h-[60px]">
          <p className="text-lg font-serif font-semibold text-foreground transition-all">
            {currentPhase.text}
          </p>
          <p className="text-xs text-muted-foreground mt-1 transition-all">
            {currentPhase.sub}
          </p>
        </div>

        <Progress value={progress} className="h-1.5 bg-muted" />

        <p className="text-[10px] text-muted-foreground">
          {progress < 40 ? "Analyzing reference..." : progress < 70 ? "Building terrain..." : "Finalizing details..."}
        </p>
      </div>
    </div>
  );
};

export default GeneratingStep;
