import { useState, useCallback } from "react";
import UploadStep from "./upload-flow/UploadStep";
import DescribeStep from "./upload-flow/DescribeStep";
import GeneratingStep from "./upload-flow/GeneratingStep";
import MapCanvasStep from "./upload-flow/MapCanvasStep";

type FlowStep = "upload" | "describe" | "generating" | "canvas";

interface UploadAdaptModeProps {
  selectedLocationId?: string | null;
  onSelectLocation?: (id: string | null) => void;
}

const UploadAdaptMode = ({ selectedLocationId = null, onSelectLocation }: UploadAdaptModeProps) => {
  const [step, setStep] = useState<FlowStep>("upload");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleSelectLocation = useCallback(
    (id: string | null) => onSelectLocation?.(id),
    [onSelectLocation]
  );

  const handleGenerateComplete = useCallback(() => setStep("canvas"), []);

  if (step === "upload") {
    return (
      <UploadStep
        uploadedImage={uploadedImage}
        onImageChange={setUploadedImage}
        onNext={() => setStep("describe")}
      />
    );
  }

  if (step === "describe") {
    return (
      <DescribeStep
        onBack={() => setStep("upload")}
        onGenerate={() => setStep("generating")}
      />
    );
  }

  if (step === "generating") {
    return <GeneratingStep onComplete={handleGenerateComplete} />;
  }

  return (
    <MapCanvasStep
      selectedLocationId={selectedLocationId}
      onSelectLocation={handleSelectLocation}
    />
  );
};

export default UploadAdaptMode;
