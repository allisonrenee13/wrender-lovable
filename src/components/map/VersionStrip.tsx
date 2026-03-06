import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { MapVersion } from "@/data/projects";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VersionStripProps {
  onOpenPanel: () => void;
}

const VersionStrip = ({ onOpenPanel }: VersionStripProps) => {
  const { currentProject, restoreMapVersion } = useProject();
  const versions = currentProject.mapVersions;
  const [previewVersion, setPreviewVersion] = useState<MapVersion | null>(null);

  if (versions.length === 0) return null;

  const currentVersion = versions[versions.length - 1];

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/30 border-t border-border overflow-x-auto">
        <button
          onClick={onOpenPanel}
          className="text-[10px] text-muted-foreground hover:text-foreground font-medium flex-shrink-0 transition-colors"
        >
          {versions.length} version{versions.length !== 1 ? "s" : ""}
        </button>
        <div className="flex items-center gap-2">
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => setPreviewVersion(v)}
              className={cn(
                "flex-shrink-0 w-14 h-10 rounded border-2 bg-muted/50 flex items-center justify-center transition-all hover:scale-105",
                v.id === currentVersion.id
                  ? "border-secondary shadow-sm"
                  : "border-border hover:border-muted-foreground/30"
              )}
              title={`v${v.version} · ${v.label}`}
            >
              <span className="text-[9px] text-muted-foreground font-medium">v{v.version}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Version preview overlay */}
      <Dialog open={!!previewVersion} onOpenChange={() => setPreviewVersion(null)}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
          {previewVersion && (
            <>
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-serif font-semibold">Version {previewVersion.version}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {previewVersion.label} · {previewVersion.date}
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[400px] bg-muted/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-3xl">🗺️</span>
                  </div>
                  <p className="text-sm font-serif text-muted-foreground italic">
                    v{previewVersion.version} · {previewVersion.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{previewVersion.description}</p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border flex items-center gap-3">
                {previewVersion.id !== currentVersion.id && (
                  <Button
                    onClick={() => {
                      restoreMapVersion(previewVersion.id);
                      setPreviewVersion(null);
                    }}
                    className="bg-primary text-primary-foreground"
                  >
                    Restore This Version
                  </Button>
                )}
                {previewVersion.id === currentVersion.id && (
                  <span className="text-xs text-secondary font-medium">Current version</span>
                )}
                <button
                  onClick={() => setPreviewVersion(null)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VersionStrip;
