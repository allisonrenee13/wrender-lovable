import {
  Hand,
  PenTool,
  CircleDot,
  Eraser,
  MousePointer2,
  Undo2,
  Redo2,
  ArrowDownFromLine,
  ArrowUpFromLine,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import type { ShapeTool, ToolMode } from "./types";

interface CanvasToolbarProps {
  mode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  activeTool: ShapeTool;
  onToolChange: (tool: ShapeTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
}

const drawTools: Array<{ id: ShapeTool; icon: typeof Hand; label: string; hint: string }> = [
  { id: "pen", icon: PenTool, label: "Pen", hint: "Draw new lines freehand" },
  { id: "eraser", icon: Eraser, label: "Erase", hint: "Remove part of a line by clicking it" },
  { id: "pan", icon: Hand, label: "Pan", hint: "Click and drag to move around the canvas" },
];

const adjustTools: Array<{ id: ShapeTool; icon: typeof Hand; label: string; hint: string }> = [
  { id: "smooth", icon: CircleDot, label: "Smooth", hint: "Drag to smooth out jagged edges" },
  { id: "sculpt-in", icon: ArrowDownFromLine, label: "Push In", hint: "Push edges inward" },
  { id: "sculpt-out", icon: ArrowUpFromLine, label: "Pull Out", hint: "Pull edges outward" },
  { id: "node-editor", icon: MousePointer2, label: "Adjust", hint: "Drag points to fine-tune your shapes" },
];

const CanvasToolbar = ({
  mode,
  onModeChange,
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  brushSize,
  onBrushSizeChange,
}: CanvasToolbarProps) => {

  const showSizeSlider = activeTool === "pen" || activeTool === "eraser";

  const renderToolButton = (
    tool: { id: ShapeTool; icon: typeof Hand; label: string; hint: string },
    isActive: boolean,
    onClick: () => void
  ) => {
    const Icon = tool.icon;
    return (
      <Tooltip key={tool.id}>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`w-[56px] rounded flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[10px] font-medium leading-tight">{tool.label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs max-w-[180px]">
          <p className="text-muted-foreground">{tool.hint}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-3 gap-0.5 shrink-0 overflow-y-auto">
        {/* Mode toggle */}
        <div className="flex flex-col items-center gap-0.5 mb-2">
          <button
            onClick={() => onModeChange("shape")}
            className={`w-[56px] h-7 rounded text-[10px] font-medium transition-colors ${
              mode === "shape" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Shape
          </button>
          <button
            onClick={() => onModeChange("annotate")}
            className={`w-[56px] h-7 rounded text-[10px] font-medium transition-colors ${
              mode === "annotate" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Note
          </button>
        </div>

        <div className="w-10 border-t border-border mb-1" />

        {/* Shape tools */}
        {mode === "shape" && (
          <>
            {/* Draw section */}
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Draw</span>
            {drawTools.map((tool) =>
              renderToolButton(tool, activeTool === tool.id, () => {
                onToolChange(tool.id);
              })
            )}

            {/* Brush size slider — visible only for Pen/Erase */}
            {showSizeSlider && (
              <div className="w-[56px] flex flex-col items-center gap-1 mt-1 mb-1 px-0.5">
                <span className="text-[9px] text-muted-foreground">Size {brushSize}px</span>
                <Slider
                  value={[brushSize]}
                  onValueChange={([v]) => onBrushSizeChange(v)}
                  min={1}
                  max={40}
                  step={1}
                  orientation="horizontal"
                  className="w-full"
                />
              </div>
            )}

          </>
        )}

        {/* Annotate mode placeholder */}
        {mode === "annotate" && (
          <div className="flex flex-col items-center gap-1 px-1">
            {["Include", "Exclude", "Adapt"].map((label, i) => (
              <button
                key={label}
                className={`w-[56px] h-9 rounded flex items-center justify-center transition-colors text-[10px] font-medium ${
                  i === 0 ? "bg-green-500/20 text-green-700" :
                  i === 1 ? "bg-red-500/20 text-red-700" :
                  "bg-yellow-500/20 text-yellow-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Undo/Redo */}
        <div className="flex flex-col items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="w-[56px] rounded flex flex-col items-center justify-center gap-0.5 py-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
              >
                <Undo2 className="h-4 w-4" />
                <span className="text-[10px] font-medium leading-tight">Undo</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">⌘Z</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="w-[56px] rounded flex flex-col items-center justify-center gap-0.5 py-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
              >
                <Redo2 className="h-4 w-4" />
                <span className="text-[10px] font-medium leading-tight">Redo</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">⌘⇧Z</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CanvasToolbar;
