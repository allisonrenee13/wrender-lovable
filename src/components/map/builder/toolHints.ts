import type { ShapeTool, FeatureStamp } from "./types";

export const shapeToolHints: Record<ShapeTool, string> = {
  pen: "Click and drag to draw your world's outline or any shape. Lift to finish a stroke.",
  pan: "Click and drag to move around the canvas.",
  select: "Click any object to select, move, or resize it.",
  "sculpt-in": "Click and drag over any edge to push it inward and reshape it.",
  "sculpt-out": "Click and drag over any edge to pull it outward and extend it.",
  smooth: "Click and drag over any jagged line to smooth it out.",
  eraser: "Click any line or shape to remove it.",
  "node-editor": "Click a shape to see its points. Drag any point to reshape it.",
};

export const stampHints: Record<FeatureStamp, string> = {
  road: "Click a start point, then click an end point to place a road between them.",
  river: "Click to place a river. Drag to position it.",
  building: "Click anywhere on your map to place a building marker.",
  forest: "Click anywhere to mark a forested area.",
  elevation: "Click anywhere to mark elevated terrain or hills.",
};
