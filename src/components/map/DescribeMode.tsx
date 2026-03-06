import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import IslaSerranoMap from "./IslaSerranoMap";

interface DescribeModeProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
}

const DEFAULT_PROMPT = `A long narrow barrier island, Atlantic Ocean on the east, calm bay on the west, one causeway entry from the north. A grand hotel on the northern beach. A lighthouse at the remote southern tip. A small village in the middle with a green, yacht club, and beach club.`;

const DescribeMode = ({ selectedLocationId, onSelectLocation }: DescribeModeProps) => {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [generated, setGenerated] = useState(true);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your world or location and Figment will sketch it..."
          className="min-h-[80px] text-sm border-border bg-card resize-none"
        />
        <Button
          onClick={() => setGenerated(true)}
          className="bg-primary text-secondary font-medium"
        >
          Generate Sketch
        </Button>
      </div>

      {generated && (
        <IslaSerranoMap
          selectedLocationId={selectedLocationId}
          onSelectLocation={onSelectLocation}
        />
      )}
    </div>
  );
};

export default DescribeMode;
