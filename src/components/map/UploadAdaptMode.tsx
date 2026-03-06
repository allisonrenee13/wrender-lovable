import { useState, useCallback } from "react";
import UploadStep from "./upload-flow/UploadStep";
import DescribeStep from "./upload-flow/DescribeStep";
import GeneratingStep from "./upload-flow/GeneratingStep";
import MapCanvasStep from "./upload-flow/MapCanvasStep";
import { islaSerranoLocations, type IslaSerranoLocation } from "@/data/isla-serrano";

type FlowStep = "upload" | "describe" | "generating" | "canvas";

interface UploadAdaptModeProps {
  selectedLocationId?: string | null;
  onSelectLocation?: (id: string | null) => void;
}

const UploadAdaptMode = ({ selectedLocationId = null, onSelectLocation }: UploadAdaptModeProps) => {
  const [step, setStep] = useState<FlowStep>("upload");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [locations, setLocations] = useState<IslaSerranoLocation[]>(islaSerranoLocations);

  const handleSelectLocation = useCallback(
    (id: string | null) => onSelectLocation?.(id),
    [onSelectLocation]
  );

  const handleGenerateComplete = useCallback(() => setStep("canvas"), []);

  const handleRegenerate = useCallback(() => setStep("generating"), []);

  const handleAddLocation = useCallback((loc: IslaSerranoLocation) => {
    setLocations(prev => [...prev, loc]);
  }, []);

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
        onGenerate={(desc) => {
          setDescription(desc);
          setStep("generating");
        }}
        uploadedImage={uploadedImage}
      />
    );
  }

  if (step === "generating") {
    return <GeneratingStep description={description} onComplete={handleGenerateComplete} />;
  }

  return (
    <MapCanvasStep
      selectedLocationId={selectedLocationId}
      onSelectLocation={handleSelectLocation}
      uploadedImage={uploadedImage}
      locations={locations}
      onAddLocation={handleAddLocation}
      onRegenerate={handleRegenerate}
    />
  );
};

export default UploadAdaptMode;
