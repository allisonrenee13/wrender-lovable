import { useProject } from "@/context/ProjectContext";
import UnifiedMapBuilder from "@/components/map/UnifiedMapBuilder";

const MapPage = () => {
  const { currentProject } = useProject();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-xl font-serif font-semibold">{currentProject.title} — Map Builder</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <UnifiedMapBuilder />
      </div>
    </div>
  );
};

export default MapPage;
