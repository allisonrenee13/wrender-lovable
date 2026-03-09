import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface UploadTraceFlowProps {
  onImageUploaded: (dataUrl: string) => void;
  onAutoTrace: (dataUrl: string) => void;
  onManualTrace: (dataUrl: string) => void;
}

const UploadTraceFlow = ({ onImageUploaded, onAutoTrace, onManualTrace }: UploadTraceFlowProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [tracing, setTracing] = useState(false);

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files?.[0]) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const url = ev.target.result as string;
          setImage(url);
          onImageUploaded(url);
        }
      };
      reader.readAsDataURL(files[0]);
    };
    input.click();
  };

  const handleAutoTrace = () => {
    if (!image) return;
    setTracing(true);
    setTimeout(() => {
      setTracing(false);
      onAutoTrace(image);
    }, 2000);
  };

  if (!image) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 gap-6">
        <div className="border-2 border-dashed border-border rounded-xl p-8 md:p-12 flex flex-col items-center gap-4 w-full max-w-md min-h-[120px]">
          <svg className="h-12 w-12 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 16l5-5 4 4 4-6 5 7" />
          </svg>
          <h3 className="text-lg font-serif font-semibold text-foreground">Upload a reference image</h3>
          <p className="text-sm text-muted-foreground text-center">
            A real map, satellite image, sketch, or screenshot. We'll help you trace it.
          </p>
          <Button onClick={handleUpload} className="bg-primary text-primary-foreground">
            Choose File
          </Button>
        </div>
      </div>
    );
  }

  if (tracing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <h3 className="text-lg font-serif font-semibold text-foreground">Tracing edges...</h3>
        <p className="text-sm text-muted-foreground">Detecting outlines in your image</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 gap-6">
      {/* Preview */}
      <div className="max-w-[400px] w-full border border-border rounded-lg overflow-hidden">
        <img src={image} alt="Uploaded reference" className="w-full object-contain" style={{ opacity: 0.4 }} />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleAutoTrace} className="bg-primary text-primary-foreground">
          Auto-trace this image
        </Button>
        <Button variant="outline" onClick={() => onManualTrace(image)}>
          Draw over it manually
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground/60 italic">
        Auto-trace detects edges and creates editable paths. Manual mode lets you draw directly over the reference.
      </p>
    </div>
  );
};

export default UploadTraceFlow;
