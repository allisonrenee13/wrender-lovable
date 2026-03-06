import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const UploadAdaptMode = () => {
  return (
    <div className="space-y-4">
      {/* Upload dropzone */}
      <div className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center bg-card">
        <Upload className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">Upload a reference image</p>
        <p className="text-xs text-muted-foreground mt-1">A real place, a photo, a sketch</p>
      </div>

      <Textarea
        placeholder="Move the lighthouse to the southern tip. Replace the park with a grand hotel. Add a causeway from the north."
        className="min-h-[80px] text-sm border-border bg-card resize-none"
      />

      <Button className="bg-primary text-secondary font-medium">
        Generate Adapted Sketch
      </Button>

      {/* Preview placeholder */}
      <div className="rounded-lg bg-muted/50 border border-border h-64 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Adapted sketch will appear here</p>
      </div>
    </div>
  );
};

export default UploadAdaptMode;
