import { useRef, useState, DragEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadStepProps {
  onNext: () => void;
  uploadedImage: string | null;
  onImageChange: (img: string | null) => void;
}

const UploadStep = ({ onNext, uploadedImage, onImageChange }: UploadStepProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onImageChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">
            Start with a real place
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Upload a photo, satellite image, or map of a real location. Figment will trace it into a story sketch and let you adapt it into your world.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />

        {!uploadedImage ? (
          <button
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center bg-card transition-colors cursor-pointer ${
              dragging ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/50"
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">
              Drop an image here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG, or screenshot — even a Google Maps view works
            </p>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <img
                src={uploadedImage}
                alt="Uploaded reference"
                className="w-full max-h-[300px] object-contain bg-muted/30"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Your reference image</span>
              <button
                onClick={() => { onImageChange(null); if (inputRef.current) inputRef.current.value = ""; }}
                className="text-xs text-secondary hover:underline"
              >
                Change
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            onClick={onNext}
            disabled={!uploadedImage}
            className="bg-primary text-primary-foreground font-medium"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadStep;
