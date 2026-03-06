import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface DescribeStepProps {
  onGenerate: () => void;
  onBack: () => void;
}

const DEFAULT_DESCRIPTION = `This is Isla Serrano — a fictional version of this island. Rename the island to Isla Serrano. The large hotel on the northern beach should be called The Solano Hotel — grand, slightly faded, 90s glamour. The main residential cottage near the ocean side should be called The Reef Cottage. Add a yacht club on the bay side called The Harbour Club. Keep the Village Green in the centre. Add a Beach Club on the ocean side. The lighthouse at the southern tip should be called Cape Serrano Lighthouse. The causeway entry from the north is the only way on or off. The aesthetic should feel like Florida Keys warmth meets Ogunquit Maine — storybook, sun-bleached, lush.`;

const DescribeStep = ({ onGenerate, onBack }: DescribeStepProps) => {
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [style, setStyle] = useState<"line-art" | "illustrated">("line-art");

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Reference image */}
      <div className="w-1/2 border-r border-border p-6 flex flex-col items-center justify-center bg-muted/30">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Your reference</p>
        <div className="w-full max-w-sm border border-border rounded-lg overflow-hidden bg-card">
          <svg viewBox="0 0 400 300" className="w-full">
            <rect width="400" height="300" fill="#d4e4f0" />
            <path
              d="M 180 25 Q 210 18, 228 38 Q 245 60, 238 100 Q 245 140, 233 175 Q 228 205, 218 235 Q 208 260, 200 280 Q 192 260, 182 235 Q 172 205, 167 175 Q 155 140, 162 100 Q 155 60, 172 38 Q 190 18, 180 25 Z"
              fill="#c8d4a0"
              stroke="#8a9a6a"
              strokeWidth="1"
            />
            <line x1="200" y1="0" x2="200" y2="28" stroke="#888" strokeWidth="2" />
            <text x="200" y="160" textAnchor="middle" fontSize="11" fill="#555" fontWeight="500">Key Biscayne</text>
            <text x="330" y="150" textAnchor="middle" fontSize="9" fill="#7a8ea0" fontStyle="italic">Atlantic Ocean</text>
            <text x="70" y="150" textAnchor="middle" fontSize="9" fill="#7a8ea0" fontStyle="italic">Biscayne Bay</text>
          </svg>
        </div>
      </div>

      {/* Right: Description form */}
      <div className="w-1/2 p-6 overflow-y-auto flex flex-col">
        <div className="space-y-1 mb-4">
          <h2 className="text-xl font-serif font-semibold text-foreground">
            How does your world differ?
          </h2>
          <p className="text-sm text-muted-foreground">
            Describe changes — rename places, move landmarks, add or remove elements. Be as specific or loose as you like.
          </p>
        </div>

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 min-h-[180px] text-sm border-border bg-card resize-none mb-4"
        />

        {/* Style selector */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Style</p>
          <div className="flex gap-3">
            <button
              onClick={() => setStyle("line-art")}
              className={`flex-1 p-3 rounded-lg border-2 transition-all text-left ${
                style === "line-art"
                  ? "border-secondary bg-secondary/5"
                  : "border-border hover:border-border"
              }`}
            >
              {/* Mini line art preview */}
              <svg viewBox="0 0 80 50" className="w-16 h-10 mb-1">
                <rect width="80" height="50" fill="#faf8f4" rx="2" />
                <path d="M 35 8 Q 45 5 50 12 Q 55 20 52 30 Q 48 40 40 45 Q 32 40 28 30 Q 25 20 30 12 Q 35 5 35 8 Z" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
                <circle cx="40" cy="20" r="1" fill="#1a1a1a" />
                <circle cx="40" cy="35" r="1" fill="#1a1a1a" />
              </svg>
              <p className="text-xs font-medium text-foreground">Line Art</p>
            </button>
            <button
              disabled
              className="flex-1 p-3 rounded-lg border-2 border-border opacity-50 cursor-not-allowed text-left relative"
            >
              <svg viewBox="0 0 80 50" className="w-16 h-10 mb-1">
                <rect width="80" height="50" fill="#f0f0f0" rx="2" />
                <rect x="20" y="10" width="40" height="30" fill="#ddd" rx="4" />
              </svg>
              <p className="text-xs font-medium text-muted-foreground">Illustrated</p>
              <Badge variant="secondary" className="absolute top-2 right-2 text-[9px] px-1.5 py-0">
                Coming soon
              </Badge>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </button>
          <Button
            onClick={onGenerate}
            className="bg-primary text-secondary font-medium"
          >
            Generate My Map →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DescribeStep;
