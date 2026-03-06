export type BuilderPath = "template" | "upload" | "draw";
export type BuilderPhase = "entry" | "editing" | "rendering" | "preview";
export type ToolMode = "shape" | "annotate";
export type ShapeTool =
  | "pan"
  | "pen"
  | "sculpt-in"
  | "sculpt-out"
  | "smooth"
  | "eraser"
  | "node-editor";
export type FeatureStamp = "road" | "river" | "building" | "forest" | "elevation";

export interface MapTemplate {
  id: string;
  name: string;
  genre: string;
  category: string;
  svgPath: string;
  viewBox: string;
}

export interface AIDirectionNotes {
  renderStyle: string;
  atmosphereNotes: string;
  whatToEmphasise: string;
}

export interface CanvasState {
  paths: string[];
  features: Array<{ type: FeatureStamp; x: number; y: number; x2?: number; y2?: number }>;
  referenceImage: string | null;
  referenceOpacity: number;
  nodeCount: number;
}
