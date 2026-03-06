import { useProject } from "@/context/ProjectContext";
import { MapVersion } from "@/data/projects";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VersionPanelProps {
  open: boolean;
  onClose: () => void;
}

const VersionPanel = ({ open, onClose }: VersionPanelProps) => {
  const { currentProject, restoreMapVersion } = useProject();
  const versions = currentProject.mapVersions;
  const currentVersion = versions[versions.length - 1];

  return (
    <div
      className={cn(
        "absolute top-0 right-0 h-full w-96 max-w-full bg-card border-l border-border shadow-xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
        open ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-serif font-semibold">Version History</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {[...versions].reverse().map((v) => (
          <div
            key={v.id}
            className={cn(
              "rounded-lg border p-4 transition-colors",
              v.id === currentVersion?.id
                ? "border-secondary bg-secondary/5"
                : "border-border hover:border-muted-foreground/30"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-foreground">v{v.version}</span>
              {v.id === currentVersion?.id && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary font-medium">
                  Current
                </span>
              )}
            </div>
            <p className="text-sm text-foreground font-medium mb-0.5">{v.label}</p>
            <p className="text-xs text-muted-foreground mb-3">{v.date}</p>

            <div className="w-full h-20 rounded bg-muted/50 flex items-center justify-center mb-3">
              <span className="text-lg">🗺️</span>
            </div>

            {v.id !== currentVersion?.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => restoreMapVersion(v.id)}
                className="text-xs h-7"
              >
                Restore This Version
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionPanel;
