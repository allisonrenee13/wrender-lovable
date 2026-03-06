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
  { id: "pan", icon: Hand, label: "Move", desc: "Move around your map" },
  { id: "pen", icon: PenTool, label: "Draw", desc: "Draw your coastline or any shape" },
  { id: "sculpt-in", icon: ArrowDownFromLine, label: "Push In", desc: "Push the coastline inward to create a bay" },
  { id: "sculpt-out", icon: ArrowUpFromLine, label: "Pull Out", desc: "Pull the coastline outward to create a headland" },
  { id: "smooth", icon: CircleDot, label: "Smooth", desc: "Smooth out any jagged edges" },
  { id: "eraser", icon: Eraser, label: "Erase", desc: "Remove any line or shape" },
  { id: "node-editor", icon: MousePointer2, label: "Adjust", desc: "Drag points to fine-tune your shapes" },
];

const featureStamps: Array<{ id: FeatureStamp; label: string; icon: string; desc: string }> = [
  { id: "road", label: "Road", icon: "┅", desc: "Add a road or path" },
  { id: "river", label: "River", icon: "〰", desc: "Add a river or stream" },
  { id: "building", label: "Building", icon: "▭", desc: "Mark a building or structure" },
  { id: "forest", label: "Forest", icon: "🌲", desc: "Mark a forested area" },
  { id: "elevation", label: "Hills", icon: "⌒", desc: "Mark hills or elevated terrain" },
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
          {shapeTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id && !activeStamp;
            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => { onToolChange(tool.id); onStampChange(null); }}
                    className={`w-[56px] rounded flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
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
                  <p className="text-muted-foreground">{tool.desc}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Feature stamps divider */}
          <div className="w-10 border-t border-border my-1.5" />
          <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Features</span>

          {featureStamps.map((stamp) => {
            const isActive = activeStamp === stamp.id;
            return (
              <Tooltip key={stamp.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onStampChange(isActive ? null : stamp.id)}
                    className={`w-[56px] rounded flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="text-sm leading-none">{stamp.icon}</span>
                    <span className="text-[10px] font-medium leading-tight">{stamp.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs max-w-[180px]">
                  <p className="text-muted-foreground">{stamp.desc}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
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

export default CanvasToolbar;
