import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SpliceMode = () => {
  return (
    <div className="space-y-4">
      {/* Two side-by-side upload boxes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center bg-card">
          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">Reference 1</p>
          <p className="text-xs text-muted-foreground mt-1">Upload an image</p>
        </div>
        <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center bg-card">
          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">Reference 2</p>
          <p className="text-xs text-muted-foreground mt-1">Upload an image</p>
        </div>
      </div>

      <Textarea
        placeholder="Use the coastline shape from image 1, the town layout from image 2, and add a lighthouse at the southern tip."
        className="min-h-[80px] text-sm border-border bg-card resize-none"
      />

      <Button className="bg-primary text-secondary font-medium">
        Generate Spliced Sketch
      </Button>

      {/* Preview placeholder */}
      <div className="rounded-lg bg-muted/50 border border-border h-64 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Spliced sketch will appear here</p>
      </div>
    </div>
  );
};

export default SpliceMode;
