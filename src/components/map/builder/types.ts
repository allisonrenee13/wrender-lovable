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

export type LineStyle = "clean" | "hand-drawn" | "nautical" | "aged";
export type StrokeWeight = "fine" | "medium" | "bold";
export type BackgroundStyle = "white" | "cream" | "aged-paper" | "dark";
export type LabelStyle = "serif" | "sans-serif" | "hidden";

export interface StylePreferences {
  lineStyle: LineStyle;
  strokeWeight: StrokeWeight;
  background: BackgroundStyle;
  labelStyle: LabelStyle;
}

export const defaultStylePreferences: StylePreferences = {
  lineStyle: "clean",
  strokeWeight: "medium",
  background: "cream",
  labelStyle: "serif",
};

export const lineStyleLabels: Record<LineStyle, string> = {
  clean: "Clean architectural",
  "hand-drawn": "Hand-drawn",
  nautical: "Nautical",
  aged: "Aged",
};

export const strokeWeightValues: Record<StrokeWeight, number> = {
  fine: 1,
  medium: 1.8,
  bold: 2.5,
};

export const backgroundColors: Record<BackgroundStyle, { bg: string; stroke: string }> = {
  white: { bg: "#FFFFFF", stroke: "#1a1a1a" },
  cream: { bg: "#FAFAF7", stroke: "#1a1a1a" },
  "aged-paper": { bg: "#F5EDD6", stroke: "#1a1a1a" },
  dark: { bg: "#1a1a1a", stroke: "#FFFFFF" },
};

export interface MapTemplate {
  id: string;
  name: string;
  genre: string;
  category: string;
  svgPath: string;
  viewBox: string;
}

export interface CanvasState {
  paths: string[];
  features: Array<{ type: FeatureStamp; x: number; y: number; x2?: number; y2?: number }>;
  referenceImage: string | null;
  referenceOpacity: number;
  nodeCount: number;
}
