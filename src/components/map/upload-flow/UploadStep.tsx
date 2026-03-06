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

  const loadDemoImage = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
      <rect width="400" height="600" fill="#3b7dd8"/>
      <text x="200" y="30" text-anchor="middle" fill="#fff" font-size="14" font-family="sans-serif" opacity="0.6">Key Biscayne Reference</text>
      <path d="M 200 60 Q 220 58 230 70 Q 245 90 240 120 Q 250 150 245 180 Q 255 210 248 240 Q 252 270 245 300 Q 250 330 240 360 Q 245 390 235 420 Q 230 450 220 480 Q 210 510 205 530 Q 200 545 195 530 Q 190 510 180 480 Q 170 450 165 420 Q 155 390 160 360 Q 150 330 155 300 Q 148 270 152 240 Q 145 210 155 180 Q 150 150 160 120 Q 155 90 170 70 Q 180 58 200 60 Z" fill="#4a8f4a" stroke="#2d5a2d" stroke-width="1"/>
      <path d="M 200 10 L 200 60" stroke="#888" stroke-width="2" stroke-dasharray="4 3"/>
      <rect x="195" y="100" width="20" height="15" fill="#c8b080" opacity="0.7" rx="1"/>
      <rect x="205" y="160" width="15" height="12" fill="#c8b080" opacity="0.6" rx="1"/>
      <circle cx="190" cy="280" r="12" fill="#5a9a5a" opacity="0.5"/>
      <rect x="210" y="350" width="10" height="8" fill="#c8b080" opacity="0.5" rx="1"/>
      <rect x="195" y="480" width="6" height="20" fill="#ddd" opacity="0.7"/>
    </svg>`;
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    onImageChange(dataUrl);
  };

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
            Upload a photo, satellite image, or map of a real location. Seenery will trace it into a story sketch and let you adapt it into your world.
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
          <div className="space-y-3">
            <div
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
            </div>
            <div className="text-center">
              <button
                onClick={loadDemoImage}
                className="text-xs text-secondary hover:underline"
              >
                Or use demo image (Key Biscayne)
              </button>
            </div>
          </div>
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
