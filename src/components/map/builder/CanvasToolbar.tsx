import {
  Hand,
  PenTool,
  CircleDot,
  Minus,
  Eraser,
  MousePointer2,
  Undo2,
  Redo2,
  ArrowDownFromLine,
  ArrowUpFromLine,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { ShapeTool, ToolMode, FeatureStamp } from "./types";

interface CanvasToolbarProps {
  mode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  activeTool: ShapeTool;
  onToolChange: (tool: ShapeTool) => void;
  activeStamp: FeatureStamp | null;
  onStampChange: (stamp: FeatureStamp | null) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const shapeTools: Array<{ id: ShapeTool; icon: typeof Hand; label: string; desc: string }> = [
  { id: "pan", icon: Hand, label: "Pan", desc: "Move around the canvas" },
  { id: "pen", icon: PenTool, label: "Pen", desc: "Freehand drawing with smooth curves" },
  { id: "sculpt-in", icon: ArrowDownFromLine, label: "Sculpt In", desc: "Push coastline inward — create bays" },
  { id: "sculpt-out", icon: ArrowUpFromLine, label: "Sculpt Out", desc: "Push coastline outward — create headlands" },
  { id: "smooth", icon: CircleDot, label: "Smooth", desc: "Smooth jagged edges into gentle curves" },
  { id: "eraser", icon: Eraser, label: "Eraser", desc: "Erase paths or portions" },
  { id: "node-editor", icon: MousePointer2, label: "Node Editor", desc: "Drag nodes to reshape precisely" },
];

const featureStamps: Array<{ id: FeatureStamp; label: string; icon: string }> = [
  { id: "road", label: "Road", icon: "┅" },
  { id: "river", label: "River", icon: "〰" },
  { id: "building", label: "Building", icon: "▭" },
  { id: "forest", label: "Forest", icon: "🌲" },
  { id: "elevation", label: "Elevation", icon: "⌒" },
];

const CanvasToolbar = ({
  mode,
  onModeChange,
  activeTool,
  onToolChange,
  activeStamp,
  onStampChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasToolbarProps) => (
  <TooltipProvider delayDuration={200}>
    <div className="w-12 bg-card border-r border-border flex flex-col items-center py-3 gap-1 shrink-0">
      {/* Mode toggle */}
      <div className="flex flex-col items-center gap-0.5 mb-2">
        <button
          onClick={() => onModeChange("shape")}
          className={`w-9 h-7 rounded text-[10px] font-medium transition-colors ${
            mode === "shape" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Shape
        </button>
        <button
          onClick={() => onModeChange("annotate")}
          className={`w-9 h-7 rounded text-[10px] font-medium transition-colors ${
            mode === "annotate" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Note
        </button>
      </div>

      <div className="w-7 border-t border-border mb-1" />

      {/* Shape tools */}
      {mode === "shape" && (
        <>
          {shapeTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => { onToolChange(tool.id); onStampChange(null); }}
                    className={`w-9 h-9 rounded flex items-center justify-center transition-colors ${
                      activeTool === tool.id && !activeStamp
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  <p className="font-medium">{tool.label}</p>
                  <p className="text-muted-foreground">{tool.desc}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Feature stamps */}
          <div className="w-7 border-t border-border my-1" />
          {featureStamps.map((stamp) => (
            <Tooltip key={stamp.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStampChange(activeStamp === stamp.id ? null : stamp.id)}
                  className={`w-9 h-9 rounded flex items-center justify-center text-sm transition-colors ${
                    activeStamp === stamp.id
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {stamp.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <p className="font-medium">{stamp.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </>
      )}

      {/* Annotate mode placeholder */}
      {mode === "annotate" && (
        <div className="flex flex-col items-center gap-1 px-1">
          {["Include", "Exclude", "Adapt"].map((label, i) => (
            <button
              key={label}
              className={`w-9 h-9 rounded flex items-center justify-center transition-colors text-[10px] font-medium ${
                i === 0 ? "bg-green-500/20 text-green-700" :
                i === 1 ? "bg-red-500/20 text-red-700" :
                "bg-yellow-500/20 text-yellow-700"
              }`}
            >
              {label[0]}
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
              className="w-9 h-9 rounded flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <Undo2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Undo (⌘Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="w-9 h-9 rounded flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Redo (⌘⇧Z)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  </TooltipProvider>
);

export default CanvasToolbar;
