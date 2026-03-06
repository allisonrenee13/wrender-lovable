import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadStepProps {
  onNext: () => void;
  uploadedImage: string | null;
  onImageChange: (img: string | null) => void;
}

const UploadStep = ({ onNext, uploadedImage, onImageChange }: UploadStepProps) => {
  const handleFileSelect = () => {
    // Demo: simulate selecting a reference image
    onImageChange("key-biscayne-ref");
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

        {!uploadedImage ? (
          <button
            onClick={handleFileSelect}
            className="w-full border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center bg-card hover:border-secondary/50 transition-colors cursor-pointer"
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
            {/* Demo reference thumbnail */}
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <svg viewBox="0 0 400 220" className="w-full">
                <rect width="400" height="220" fill="#e8f0f8" />
                {/* Water */}
                <rect x="0" y="0" width="400" height="220" fill="#d4e4f0" />
                {/* Island shape */}
                <path
                  d="M 180 20 Q 210 15, 225 30 Q 240 50, 235 80 Q 240 110, 230 140 Q 225 165, 215 185 Q 205 200, 200 210 Q 195 200, 185 185 Q 175 165, 170 140 Q 160 110, 165 80 Q 160 50, 175 30 Q 190 15, 180 20 Z"
                  fill="#c8d4a0"
                  stroke="#8a9a6a"
                  strokeWidth="1"
                />
                {/* Bridge from north */}
                <line x1="200" y1="0" x2="200" y2="22" stroke="#888" strokeWidth="2" />
                {/* Label */}
                <text x="200" y="130" textAnchor="middle" fontSize="11" fill="#555" fontWeight="500">
                  Key Biscayne
                </text>
                <text x="320" y="110" textAnchor="middle" fontSize="9" fill="#7a8ea0" fontStyle="italic">
                  Atlantic
                </text>
                <text x="80" y="110" textAnchor="middle" fontSize="9" fill="#7a8ea0" fontStyle="italic">
                  Bay
                </text>
              </svg>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Key Biscayne reference</span>
              <button
                onClick={() => onImageChange(null)}
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
