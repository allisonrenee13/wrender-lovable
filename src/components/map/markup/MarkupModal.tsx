import { useState, useEffect } from "react";
import { X, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import MarkupToolbar from "./MarkupToolbar";
import MarkupCanvas from "./MarkupCanvas";
import type { MarkupTool, MarkupColor, StrokeWeight, MarkupElement, MarkupImage } from "./types";

interface MarkupModalProps {
  open: boolean;
  onClose: () => void;
  images: MarkupImage[];
  onSave: (images: MarkupImage[]) => void;
  initialSelectedId?: string;
}

// Demo markup data for Key Biscayne
const KEY_BISCAYNE_DEMO_MARKUPS: MarkupElement[] = [
  {
    id: "demo-1",
    tool: "circle",
    color: "green",
    strokeWeight: "medium",
    points: Array.from({ length: 30 }, (_, i) => ({
      x: 300 + 60 * Math.cos((i / 30) * Math.PI * 2),
      y: 380 + 40 * Math.sin((i / 30) * Math.PI * 2),
    })),
  },
  {
    id: "demo-1-label",
    tool: "text",
    color: "green",
    strokeWeight: "medium",
    points: [{ x: 260, y: 345 }],
    text: "Keep — lighthouse end",
  },
  {
    id: "demo-2",
    tool: "circle",
    color: "red",
    strokeWeight: "medium",
    points: Array.from({ length: 30 }, (_, i) => ({
      x: 280 + 70 * Math.cos((i / 30) * Math.PI * 2),
      y: 120 + 50 * Math.sin((i / 30) * Math.PI * 2),
    })),
  },
  {
    id: "demo-2-label",
    tool: "text",
    color: "red",
    strokeWeight: "medium",
    points: [{ x: 220, y: 80 }],
    text: "Exclude — too urban",
  },
  {
    id: "demo-3",
    tool: "arrow",
    color: "gold",
    strokeWeight: "medium",
    points: [{ x: 400, y: 250 }, { x: 320, y: 260 }],
  },
  {
    id: "demo-3-label",
    tool: "text",
    color: "gold",
    strokeWeight: "medium",
    points: [{ x: 400, y: 240 }],
    text: "Village should be here",
  },
];

const MARCO_ISLAND_DEMO_MARKUPS: MarkupElement[] = [
  {
    id: "demo-m1",
    tool: "circle",
    color: "green",
    strokeWeight: "medium",
    points: Array.from({ length: 40 }, (_, i) => ({
      x: 300 + 140 * Math.cos((i / 40) * Math.PI * 2),
      y: 250 + 100 * Math.sin((i / 40) * Math.PI * 2),
    })),
  },
  {
    id: "demo-m1-label",
    tool: "text",
    color: "green",
    strokeWeight: "medium",
    points: [{ x: 200, y: 140 }],
    text: "Use this shape",
  },
  {
    id: "demo-m2",
    tool: "circle",
    color: "gold",
    strokeWeight: "medium",
    points: Array.from({ length: 20 }, (_, i) => ({
      x: 320 + 50 * Math.cos((i / 20) * Math.PI * 2),
      y: 380 + 30 * Math.sin((i / 20) * Math.PI * 2),
    })),
  },
  {
    id: "demo-m2-label",
    tool: "text",
    color: "gold",
    strokeWeight: "medium",
    points: [{ x: 260, y: 360 }],
    text: "Adapt — make more dramatic",
  },
];

const MarkupModal = ({ open, onClose, images, onSave, initialSelectedId }: MarkupModalProps) => {
  const [localImages, setLocalImages] = useState<MarkupImage[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [activeTool, setActiveTool] = useState<MarkupTool>("pan");
  const [activeColor, setActiveColor] = useState<MarkupColor>("green");
  const [strokeWeight, setStrokeWeight] = useState<StrokeWeight>("medium");
  const [history, setHistory] = useState<MarkupElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [notesOpen, setNotesOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"single" | "side-by-side">("single");
  const [secondSelectedId, setSecondSelectedId] = useState<string>("");
  const [activeCanvasId, setActiveCanvasId] = useState<string>("");

  useEffect(() => {
    if (open) {
      // Apply demo markups
      const withDemos = images.map((img) => {
        if (img.id === "key-biscayne" && img.markups.length === 0) {
          return { ...img, markups: KEY_BISCAYNE_DEMO_MARKUPS, hasMarkup: true };
        }
        if (img.id === "marco-island" && img.markups.length === 0) {
          return { ...img, markups: MARCO_ISLAND_DEMO_MARKUPS, hasMarkup: true };
        }
        return img;
      });
      setLocalImages(withDemos);
      const primary = initialSelectedId || withDemos[0]?.id || "";
      setSelectedId(primary);
      setActiveCanvasId(primary);
      setSecondSelectedId(withDemos.length > 1 ? withDemos.find(i => i.id !== primary)?.id || "" : "");
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [open, images, initialSelectedId]);

  if (!open) return null;

  const selectedImage = localImages.find((img) => img.id === selectedId);
  const secondSelectedImage = localImages.find((img) => img.id === secondSelectedId);
  const markupCount = localImages.reduce((sum, img) => sum + img.markups.length, 0);
  const markedUpCount = localImages.filter((img) => img.markups.length > 0).length;

  const handleImageClick = (imgId: string) => {
    if (viewMode === "single") {
      setSelectedId(imgId);
      setActiveCanvasId(imgId);
    } else {
      // In side-by-side: click to replace the non-active panel, or select if already shown
      if (imgId === selectedId || imgId === secondSelectedId) {
        setActiveCanvasId(imgId);
      } else {
        // Replace the non-active side
        if (activeCanvasId === selectedId) {
          setSecondSelectedId(imgId);
          setActiveCanvasId(imgId);
        } else {
          setSelectedId(imgId);
          setActiveCanvasId(imgId);
        }
      }
    }
  };

  const handleViewModeChange = (mode: "single" | "side-by-side") => {
    setViewMode(mode);
    if (mode === "side-by-side") {
      // Ensure the two panels show different images
      if (secondSelectedId === selectedId || !secondSelectedId) {
        const other = localImages.find(i => i.id !== selectedId);
        if (other) setSecondSelectedId(other.id);
      }
    }
  };

  const activeImage = localImages.find((img) => img.id === activeCanvasId);

  const updateImageMarkups = (imageId: string, markups: MarkupElement[]) => {
    setLocalImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, markups, hasMarkup: markups.length > 0 } : img
      )
    );
  };

  const handleAddMarkup = (markup: MarkupElement) => {
    if (!selectedImage) return;
    const newMarkups = [...selectedImage.markups, markup];
    updateImageMarkups(selectedId, newMarkups);
    // Push to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newMarkups);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleRemoveMarkup = (id: string) => {
    if (!selectedImage) return;
    const newMarkups = selectedImage.markups.filter((m) => m.id !== id);
    updateImageMarkups(selectedId, newMarkups);
  };

  const handleUndo = () => {
    if (historyIndex <= 0 || !selectedImage) return;
    const prev = history[historyIndex - 1];
    setHistoryIndex(historyIndex - 1);
    updateImageMarkups(selectedId, prev);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !selectedImage) return;
    const next = history[historyIndex + 1];
    setHistoryIndex(historyIndex + 1);
    updateImageMarkups(selectedId, next);
  };

  const handleNotesChange = (notes: string) => {
    setLocalImages((prev) =>
      prev.map((img) => (img.id === selectedId ? { ...img, notes } : img))
    );
  };

  const handleSave = () => {
    onSave(localImages);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-2xl flex flex-col w-[90vw] h-[90vh] max-w-[1400px] z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-serif font-semibold text-foreground">Mark Up Your References</h2>
            <p className="text-sm text-muted-foreground">
              Circle what to include, exclude, or adapt. Add notes to guide your map generation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Image Carousel + View Toggle */}
        <div className="px-6 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {localImages.map((img) => {
                const isShown = viewMode === "side-by-side"
                  ? img.id === selectedId || img.id === secondSelectedId
                  : img.id === selectedId;
                const isActive = img.id === activeCanvasId;
                return (
                  <button
                    key={img.id}
                    onClick={() => handleImageClick(img.id)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className={cn(
                        "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                        isActive
                          ? "border-primary opacity-100"
                          : isShown
                            ? "border-primary/50 opacity-90"
                            : "border-transparent opacity-60 hover:opacity-80"
                      )}
                    >
                      <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                      {isShown && (
                        <div className={cn(
                          "absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center",
                          isActive ? "bg-primary" : "bg-primary/60"
                        )}>
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      {img.hasMarkup && !isShown && (
                        <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-500" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {img.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* View Toggle */}
            {localImages.length > 1 && (
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange("single")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    viewMode === "single"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Single
                </button>
                <button
                  onClick={() => handleViewModeChange("side-by-side")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    viewMode === "side-by-side"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Side by Side
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar + Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex justify-center py-3">
            <MarkupToolbar
              activeTool={activeTool}
              activeColor={activeColor}
              strokeWeight={strokeWeight}
              onToolChange={setActiveTool}
              onColorChange={setActiveColor}
              onStrokeChange={setStrokeWeight}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
            />
          </div>

          {/* Canvas */}
          <div className={cn("flex-1 mx-6 mb-2 rounded-lg overflow-hidden", viewMode === "side-by-side" && "flex gap-2")}>
            {viewMode === "single" ? (
              selectedImage && (
                <MarkupCanvas
                  imageSrc={selectedImage.src}
                  markups={selectedImage.markups}
                  activeTool={activeTool}
                  activeColor={activeColor}
                  strokeWeight={strokeWeight}
                  onAddMarkup={handleAddMarkup}
                  onRemoveMarkup={handleRemoveMarkup}
                />
              )
            ) : (
              <>
                {selectedImage && (
                  <div
                    className={cn(
                      "flex-1 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer",
                      activeCanvasId === selectedId ? "border-primary" : "border-transparent"
                    )}
                    onClick={() => setActiveCanvasId(selectedId)}
                  >
                    <MarkupCanvas
                      imageSrc={selectedImage.src}
                      markups={selectedImage.markups}
                      activeTool={activeCanvasId === selectedId ? activeTool : "pan"}
                      activeColor={activeColor}
                      strokeWeight={strokeWeight}
                      onAddMarkup={(m) => { setActiveCanvasId(selectedId); handleAddMarkup(m); }}
                      onRemoveMarkup={handleRemoveMarkup}
                    />
                  </div>
                )}
                {secondSelectedImage && (
                  <div
                    className={cn(
                      "flex-1 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer",
                      activeCanvasId === secondSelectedId ? "border-primary" : "border-transparent"
                    )}
                    onClick={() => setActiveCanvasId(secondSelectedId)}
                  >
                    <MarkupCanvas
                      imageSrc={secondSelectedImage.src}
                      markups={secondSelectedImage.markups}
                      activeTool={activeCanvasId === secondSelectedId ? activeTool : "pan"}
                      activeColor={activeColor}
                      strokeWeight={strokeWeight}
                      onAddMarkup={(m) => {
                        setActiveCanvasId(secondSelectedId);
                        const newMarkups = [...secondSelectedImage.markups, m];
                        updateImageMarkups(secondSelectedId, newMarkups);
                      }}
                      onRemoveMarkup={(id) => {
                        const newMarkups = secondSelectedImage.markups.filter((mk) => mk.id !== id);
                        updateImageMarkups(secondSelectedId, newMarkups);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Notes Panel */}
        <div className="border-t border-border">
          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className="w-full flex items-center justify-between px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-medium">Notes for this image</span>
            <span className="text-xs">{notesOpen ? "▾" : "▸"}</span>
          </button>
          {notesOpen && selectedImage && (
            <div className="px-6 pb-3">
              <Textarea
                value={selectedImage.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Describe what you want to take from this reference, or what to avoid..."
                className="min-h-[60px] text-sm resize-none border-border bg-muted/30"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {markedUpCount} image{markedUpCount !== 1 ? "s" : ""} marked up · {markupCount} annotation{markupCount !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              className="bg-primary text-secondary font-semibold px-6"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Save Markup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkupModal;
