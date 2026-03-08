import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Canvas,
  PencilBrush,
  FabricObject,
  Path,
  Rect,
  Circle,
  Line,
  FabricImage,
  loadSVGFromString,
} from "fabric";
import type { StylePreferences, ShapeTool, FeatureStamp } from "./types";
import { strokeWeightValues, backgroundColors } from "./types";

export interface MapCanvasHandle {
  getSVG: () => string;
  getPNG: () => string;
  loadSVG: (svg: string) => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  getJSON: () => string;
  loadJSON: (json: string) => void;
  addReferenceImage: (url: string, opacity: number) => void;
  setReferenceOpacity: (opacity: number) => void;
  getNodeCount: () => number;
  getObjectCount: () => number;
  setBrushWidth: (width: number) => void;
}

interface MapBuilderCanvasProps {
  stylePrefs: StylePreferences;
  activeTool: ShapeTool;
  activeStamp: FeatureStamp | null;
  onStateChange?: () => void;
  width?: number;
  height?: number;
  brushWidth?: number;
  eraserRadius?: number;
}

const MapBuilderCanvas = forwardRef<MapCanvasHandle, MapBuilderCanvasProps>(
  ({ stylePrefs, activeTool, activeStamp, onStateChange, width, height, brushWidth, eraserRadius }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<Canvas | null>(null);
    const history = useRef<string[]>([]);
    const historyIndex = useRef(-1);
    const isBusy = useRef(false);
    const refImageRef = useRef<FabricImage | null>(null);
    const sculptingRef = useRef(false);
    const eraserSizeRef = useRef(eraserRadius ?? 24);

    // Keep eraserSizeRef in sync
    useEffect(() => {
      eraserSizeRef.current = eraserRadius ?? 24;
    }, [eraserRadius]);

    const canvasWidth = width || 800;
    const canvasHeight = height || 600;
    const colors = backgroundColors[stylePrefs.background];
    const sw = strokeWeightValues[stylePrefs.strokeWeight];

    // --- History ---
    const saveState = useCallback(() => {
      if (isBusy.current) return;
      const canvas = fabricRef.current;
      if (!canvas) return;
      const snap = JSON.stringify(
        canvas.toJSON(["data", "selectable", "evented", "excludeFromExport", "strokeWidth"])
      );
      if (snap === history.current[historyIndex.current]) return;
      history.current = history.current.slice(0, historyIndex.current + 1);
      history.current.push(snap);
      if (history.current.length > 50) history.current.shift();
      historyIndex.current = history.current.length - 1;
      onStateChange?.();
    }, [onStateChange]);

    const restoreState = useCallback((snap: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      isBusy.current = true;
      canvas.loadFromJSON(JSON.parse(snap), () => {
        canvas.getObjects().forEach(obj => {
          if (obj.data?.isMapStroke) {
            obj.selectable = false;
            obj.evented = true;
          }
        });
        canvas.renderAll();
        isBusy.current = false;
        onStateChange?.();
      });
    }, [onStateChange]);

    const doUndo = useCallback(() => {
      if (historyIndex.current <= 0) return;
      historyIndex.current--;
      restoreState(history.current[historyIndex.current]);
    }, [restoreState]);

    const doRedo = useCallback(() => {
      if (historyIndex.current >= history.current.length - 1) return;
      historyIndex.current++;
      restoreState(history.current[historyIndex.current]);
    }, [restoreState]);

    // --- Init Canvas With Correct Dimensions ---
    useEffect(() => {
      if (!canvasElRef.current || fabricRef.current) return;

      const initCanvas = (containerWidth: number) => {
        if (fabricRef.current) return;

        const actualWidth = Math.min(Math.max(containerWidth, 400), canvasWidth);
        const actualHeight = Math.round(actualWidth * (canvasHeight / canvasWidth));

        const canvas = new Canvas(canvasElRef.current!, {
          isDrawingMode: false,
          backgroundColor: colors.bg,
          width: actualWidth,
          height: actualHeight,
          selection: false,
        });

        fabricRef.current = canvas;

        // Dot grid
        for (let x = 20; x < actualWidth; x += 20) {
          for (let y = 20; y < actualHeight; y += 20) {
            const dot = new Circle({
              left: x - 0.5,
              top: y - 0.5,
              radius: 0.5,
              fill: colors.stroke,
              opacity: 0.08,
              selectable: false,
              evented: false,
              excludeFromExport: true,
            });
            canvas.add(dot);
          }
        }

        // Split pen-drawn paths into line segments for fine-grained erasing
        canvas.on("path:created", (e: any) => {
          const path = e.path as Path;
          if (!path) { saveState(); return; }
          const pathData = (path as any).path as any[];
          if (!pathData || pathData.length < 2) { saveState(); return; }
          
          // Extract points from the path commands
          const points: { x: number; y: number }[] = [];
          pathData.forEach((seg: any[]) => {
            const cmd = seg[0];
            if (cmd === "M" || cmd === "L") {
              points.push({ x: seg[1], y: seg[2] });
            } else if (cmd === "Q") {
              points.push({ x: seg[3], y: seg[4] });
            } else if (cmd === "C") {
              points.push({ x: seg[5], y: seg[6] });
            }
          });
          
          if (points.length < 2) { saveState(); return; }
          
          // Remove the original path and add as line segments
          canvas.remove(path);
          const strokeColor = path.stroke || colors.stroke;
          const strokeW = path.strokeWidth || sw;
          for (let i = 0; i < points.length - 1; i++) {
            const line = new Line(
              [points[i].x, points[i].y, points[i + 1].x, points[i + 1].y],
              {
                stroke: strokeColor as string,
                strokeWidth: strokeW,
                strokeLineCap: "round",
                selectable: false,
                evented: true,
                data: { isMapStroke: true },
              }
            );
            canvas.add(line);
          }
          canvas.renderAll();
          saveState();
        });
        saveState();
      };

      // Use the containerRef div (our own wrapper) to get width
      const container = containerRef.current;

      const tryInit = () => {
        const el = container || canvasElRef.current?.parentElement;
        const w = el?.clientWidth || 0;
        if (w > 100) {
          initCanvas(w);
          return true;
        }
        return false;
      };

      // Try immediately
      if (tryInit()) {
        return () => {
          fabricRef.current?.dispose();
          fabricRef.current = null;
        };
      }

      // Otherwise use ResizeObserver to wait for layout
      const target = container || canvasElRef.current.parentElement || document.body;
      const ro = new ResizeObserver(() => {
        if (tryInit()) {
          ro.disconnect();
        }
      });
      ro.observe(target);

      return () => {
        ro.disconnect();
        fabricRef.current?.dispose();
        fabricRef.current = null;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "z") {
          e.preventDefault();
          e.shiftKey ? doRedo() : doUndo();
        }
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [doUndo, doRedo]);

    // --- Style Changes ---
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.backgroundColor = colors.bg;
      const lineStyle = stylePrefs.lineStyle;
      const getLineProps = () => {
        switch (lineStyle) {
          case "hand-drawn": return { strokeDashArray: undefined, opacity: 0.95, stroke: colors.stroke };
          case "nautical": return { strokeDashArray: undefined, opacity: 1, stroke: colors.stroke };
          case "aged": return { strokeDashArray: [1, 0.5], opacity: 0.85, stroke: stylePrefs.background === "dark" ? "#d4c9a8" : "#2a1f0f" };
          default: return { strokeDashArray: undefined, opacity: 1, stroke: colors.stroke };
        }
      };
      const lineProps = getLineProps();
      canvas.getObjects().forEach((obj) => {
        if (obj.excludeFromExport) {
          obj.set({ fill: colors.stroke });
        } else if (obj instanceof Path) {
          const isOutline = !(obj as any)._isFeature;
          obj.set({
            stroke: (obj as any)._isRiver ? "#6B8CAE" : lineProps.stroke,
            strokeWidth: lineStyle === "nautical" && isOutline ? sw * 1.6 : sw,
            strokeDashArray: lineProps.strokeDashArray as number[] | undefined,
            opacity: lineProps.opacity,
          });
        } else if (obj instanceof Line) {
          if ((obj as any).data?.isMapStroke) {
            obj.set({ stroke: lineProps.stroke, strokeWidth: lineStyle === "nautical" ? sw * 1.6 : sw });
          } else {
            obj.set({ stroke: lineProps.stroke });
          }
        } else if (obj instanceof Rect || obj instanceof Circle) {
          if (!(obj as any).isRefImage) obj.set({ stroke: lineProps.stroke });
        }
      });
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = lineProps.stroke;
        // Don't override brush width here — it's controlled by the weight selector via brushWidth prop
      }
      canvas.renderAll();
    }, [colors.bg, colors.stroke, sw, stylePrefs.lineStyle, stylePrefs.background]);

    // --- Path rebuild helper for sculpt and smooth ---
    const rebuildPath = useCallback((canvas: Canvas, obj: Path, pathData: any[]) => {
      const newPathStr = pathData.map((seg: any[]) => seg.join(" ")).join(" ");
      const rebuilt = new Path(newPathStr, {
        fill: "transparent",
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        strokeLineCap: "round",
        strokeLineJoin: "round",
        strokeDashArray: obj.strokeDashArray as number[] | undefined,
        opacity: obj.opacity,
        selectable: false,
        evented: false,
      });
      if ((obj as any)._isFeature) (rebuilt as any)._isFeature = true;
      if ((obj as any)._isRiver) (rebuilt as any)._isRiver = true;
      canvas.remove(obj);
      canvas.add(rebuilt);
      return rebuilt;
    }, []);

    // --- Tool Activation ---
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas.off("mouse:down");
      canvas.off("mouse:move");
      canvas.off("mouse:up");
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = "default";
      // Remove any eraser cursor circles left over
      canvas.getObjects().forEach((obj) => {
        if (obj.excludeFromExport && obj instanceof Circle && ((obj as any).stroke === "rgba(255,0,0,0.4)" || (obj as any).stroke === "#666")) {
          canvas.remove(obj);
        }
      });
      canvas.getObjects().forEach((obj) => {
        if (!obj.excludeFromExport && !(obj instanceof FabricImage)) {
          obj.selectable = false;
          obj.evented = false;
        }
      });

      if (activeStamp) {
        canvas.defaultCursor = "crosshair";
        if (activeStamp === "road") {
          let startPoint: { x: number; y: number } | null = null;
          let previewLine: Line | null = null;
          canvas.on("mouse:down", (e) => {
            const pointer = canvas.getScenePoint(e.e);
            if (!startPoint) {
              startPoint = { x: pointer.x, y: pointer.y };
            } else {
              if (previewLine) canvas.remove(previewLine);
              placeRoad(startPoint.x, startPoint.y, pointer.x, pointer.y);
              startPoint = null;
              previewLine = null;
            }
          });
          canvas.on("mouse:move", (e) => {
            if (!startPoint) return;
            const pointer = canvas.getScenePoint(e.e);
            if (previewLine) canvas.remove(previewLine);
            previewLine = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
              stroke: colors.stroke, strokeWidth: 1,
              strokeDashArray: [4, 4], selectable: false,
              evented: false, excludeFromExport: true, opacity: 0.4,
            });
            canvas.add(previewLine);
            canvas.renderAll();
          });
        } else {
          canvas.on("mouse:down", (e) => {
            const pointer = canvas.getScenePoint(e.e);
            placeStamp(activeStamp, pointer.x, pointer.y);
          });
        }
        return;
      }

      switch (activeTool) {
        case "pen": {
          // Assign brush BEFORE enabling drawing mode
          const brush = new PencilBrush(canvas);
          brush.color = colors.stroke;
          brush.width = brushWidth ?? sw;
          brush.decimate = 4;
          canvas.freeDrawingBrush = brush;
          canvas.isDrawingMode = true;
          break;
        }

        case "pan": {
          canvas.defaultCursor = "grab";
          let isPanning = false;
          let lastPos = { x: 0, y: 0 };
          const getPos = (ev: any) =>
            ev.touches?.length
              ? { x: ev.touches[0].clientX, y: ev.touches[0].clientY }
              : { x: ev.clientX ?? 0, y: ev.clientY ?? 0 };
          canvas.on("mouse:down", (e) => { isPanning = true; lastPos = getPos(e.e); canvas.defaultCursor = "grabbing"; });
          canvas.on("mouse:move", (e) => {
            if (!isPanning) return;
            const pos = getPos(e.e);
            canvas.relativePan({ x: pos.x - lastPos.x, y: pos.y - lastPos.y } as any);
            lastPos = pos;
          });
          canvas.on("mouse:up", () => { isPanning = false; canvas.defaultCursor = "grab"; });
          break;
        }

        case "eraser": {
          canvas.isDrawingMode = false;
          canvas.defaultCursor = "crosshair";
          let isErasing = false;

          canvas.on("mouse:down", () => { isErasing = true; });
          canvas.on("mouse:up", () => { isErasing = false; saveState(); });

          canvas.on("mouse:move", (e) => {
            if (!isErasing) return;
            const pointer = canvas.getScenePoint(e.e);
            const radius = eraserSizeRef.current;
            const toRemove = canvas.getObjects().filter(obj => {
              if (obj.excludeFromExport) return false;
              if (obj instanceof FabricImage) return false;
              
              if (obj instanceof Line && (obj as any).data?.isMapStroke) {
                // Check midpoint and endpoints
                const mx = ((obj.x1 ?? 0) + (obj.x2 ?? 0)) / 2;
                const my = ((obj.y1 ?? 0) + (obj.y2 ?? 0)) / 2;
                const distMid = Math.sqrt((mx - pointer.x) ** 2 + (my - pointer.y) ** 2);
                if (distMid < radius) return true;
                const distP1 = Math.sqrt(((obj.x1 ?? 0) - pointer.x) ** 2 + ((obj.y1 ?? 0) - pointer.y) ** 2);
                if (distP1 < radius) return true;
                const distP2 = Math.sqrt(((obj.x2 ?? 0) - pointer.x) ** 2 + ((obj.y2 ?? 0) - pointer.y) ** 2);
                if (distP2 < radius) return true;
                return false;
              }
              
              // For other objects (stamps etc), check bounding box center
              if (obj instanceof Rect || obj instanceof Circle || obj instanceof Path) {
                const bound = obj.getBoundingRect();
                const cx = bound.left + bound.width / 2;
                const cy = bound.top + bound.height / 2;
                const dist = Math.sqrt((cx - pointer.x) ** 2 + (cy - pointer.y) ** 2);
                return dist < radius;
              }
              return false;
            });
            if (toRemove.length > 0) {
              toRemove.forEach(obj => canvas.remove(obj));
              canvas.renderAll();
            }
          });
          break;
        }

        case "node-editor": {
          canvas.selection = true;
          canvas.defaultCursor = "default";
          canvas.getObjects().forEach((obj) => {
            if (!obj.excludeFromExport && !(obj instanceof FabricImage)) {
              obj.selectable = true;
              obj.evented = true;
              obj.hasBorders = true;
              obj.hasControls = true;
              obj.cornerStyle = "circle";
              obj.cornerColor = "#C9A84C";
              obj.cornerSize = 8;
              obj.transparentCorners = false;
            }
          });
          canvas.on("mouse:up", () => saveState());
          canvas.renderAll();
          break;
        }

        case "sculpt-in":
        case "sculpt-out": {
          canvas.defaultCursor = "crosshair";
          const direction = activeTool === "sculpt-out" ? 1 : -1;
          const brushRadius = 40;
          const strength = 3;
          canvas.on("mouse:down", () => { sculptingRef.current = true; });
          canvas.on("mouse:move", (e) => {
            if (!sculptingRef.current) return;
            const pointer = canvas.getScenePoint(e.e);
            const toReplace: Array<{ old: Path; pathData: any[] }> = [];
            canvas.getObjects().forEach((obj) => {
              if (!(obj instanceof Path) || obj.excludeFromExport) return;
              const pathData = (obj as any).path as any[];
              if (!pathData) return;
              let modified = false;
              pathData.forEach((segment: any[]) => {
                for (let j = 1; j < segment.length; j += 2) {
                  const px = segment[j];
                  const py = segment[j + 1];
                  if (px === undefined || py === undefined) continue;
                  const dist = Math.sqrt((px - pointer.x) ** 2 + (py - pointer.y) ** 2);
                  if (dist < brushRadius && dist > 0) {
                    const influence = (1 - dist / brushRadius) * strength;
                    const dx = px - pointer.x;
                    const dy = py - pointer.y;
                    const norm = Math.sqrt(dx * dx + dy * dy);
                    segment[j] = px + (dx / norm) * influence * direction;
                    segment[j + 1] = py + (dy / norm) * influence * direction;
                    modified = true;
                  }
                }
              });
              if (modified) toReplace.push({ old: obj, pathData });
            });
            toReplace.forEach(({ old, pathData }) => rebuildPath(canvas, old, pathData));
            if (toReplace.length > 0) canvas.renderAll();
          });
          canvas.on("mouse:up", () => {
            if (sculptingRef.current) { sculptingRef.current = false; saveState(); }
          });
          break;
        }

        case "smooth": {
          canvas.defaultCursor = "crosshair";
          const smoothRadius = 40;
          canvas.on("mouse:down", () => { sculptingRef.current = true; });
          canvas.on("mouse:move", (e) => {
            if (!sculptingRef.current) return;
            const pointer = canvas.getScenePoint(e.e);
            const toReplace: Array<{ old: Path; pathData: any[] }> = [];
            canvas.getObjects().forEach((obj) => {
              if (!(obj instanceof Path) || obj.excludeFromExport) return;
              const pathData = (obj as any).path as any[];
              if (!pathData) return;
              let modified = false;
              for (let i = 1; i < pathData.length - 1; i++) {
                const seg = pathData[i];
                const px = seg[1]; const py = seg[2];
                if (px === undefined || py === undefined) continue;
                const dist = Math.sqrt((px - pointer.x) ** 2 + (py - pointer.y) ** 2);
                if (dist < smoothRadius) {
                  const prev = pathData[i - 1]; const next = pathData[i + 1];
                  const influence = (1 - dist / smoothRadius) * 0.3;
                  seg[1] = px + (((prev[1] ?? px) + (next[1] ?? px)) / 2 - px) * influence;
                  seg[2] = py + (((prev[2] ?? py) + (next[2] ?? py)) / 2 - py) * influence;
                  modified = true;
                }
              }
              if (modified) toReplace.push({ old: obj, pathData });
            });
            toReplace.forEach(({ old, pathData }) => rebuildPath(canvas, old, pathData));
            if (toReplace.length > 0) canvas.renderAll();
          });
          canvas.on("mouse:up", () => {
            if (sculptingRef.current) { sculptingRef.current = false; saveState(); }
          });
          break;
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTool, activeStamp, colors.stroke, sw]);

    // --- Place Road ---
    const placeRoad = useCallback((x1: number, y1: number, x2: number, y2: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.add(new Line([x1, y1, x2, y2], {
        stroke: colors.stroke, strokeWidth: 1.5,
        strokeDashArray: [8, 4], selectable: false, evented: false,
      }));
      canvas.renderAll();
      saveState();
    }, [colors.stroke, saveState]);

    // --- Place Stamp ---
    const placeStamp = useCallback((type: FeatureStamp, x: number, y: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const stroke = colors.stroke;
      switch (type) {
        case "building":
          canvas.add(new Rect({
            left: x - 8, top: y - 6, width: 16, height: 12,
            fill: "transparent", stroke, strokeWidth: 1.2,
            selectable: false, evented: false, angle: 0,
          }));
          break;
        case "forest":
          [[-6, 0], [6, 0], [0, -8], [-10, -6], [10, -6]].forEach(([dx, dy]) => {
            canvas.add(new Circle({
              left: x + dx - 4, top: y + dy - 4, radius: 4,
              fill: "transparent", stroke, strokeWidth: 1,
              selectable: false, evented: false,
            }));
          });
          break;
        case "elevation":
          [20, 14, 8].forEach((r) => {
            canvas.add(new Path(`M ${x - r} ${y} Q ${x} ${y - r * 0.8} ${x + r} ${y}`, {
              fill: "transparent", stroke, strokeWidth: 0.8,
              opacity: 0.5, selectable: false, evented: false,
            }));
          });
          break;
        case "river": {
          const river = new Path(`M ${x} ${y - 25} Q ${x + 12} ${y} ${x} ${y + 25}`, {
            fill: "transparent", stroke: "#6B8CAE", strokeWidth: 1.5,
            selectable: false, evented: false,
          });
          (river as any)._isRiver = true;
          (river as any)._isFeature = true;
          canvas.add(river);
          break;
        }
      }
      canvas.renderAll();
      saveState();
    }, [colors.stroke, saveState]);

    // --- Public API ---
    useImperativeHandle(ref, () => ({
      getSVG: () => fabricRef.current?.toSVG() ?? "",
      getPNG: () => fabricRef.current?.toDataURL({ format: "png", quality: 1, multiplier: 2 }) ?? "",
      loadSVG: async (svgString: string) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        isLoadingRef.current = true;
        try {
          const result = await loadSVGFromString(svgString);
          canvas.getObjects().filter((o) => !o.excludeFromExport).forEach((o) => canvas.remove(o));
          result.objects
            .filter((obj): obj is FabricObject => obj !== null)
            .forEach((obj) => {
              if (obj instanceof Path) {
                // Break SVG paths into line segments for fine-grained erasing
                const pathData = (obj as any).path as any[];
                if (pathData && pathData.length >= 2) {
                  const points: { x: number; y: number }[] = [];
                  pathData.forEach((seg: any[]) => {
                    const cmd = seg[0];
                    if (cmd === "M" || cmd === "L") {
                      points.push({ x: seg[1], y: seg[2] });
                    } else if (cmd === "Q") {
                      points.push({ x: seg[3], y: seg[4] });
                    } else if (cmd === "C") {
                      points.push({ x: seg[5], y: seg[6] });
                    }
                  });
                  for (let i = 0; i < points.length - 1; i++) {
                    const line = new Line(
                      [points[i].x, points[i].y, points[i + 1].x, points[i + 1].y],
                      {
                        stroke: colors.stroke,
                        strokeWidth: sw,
                        strokeLineCap: "round",
                        selectable: false,
                        evented: true,
                        data: { isMapStroke: true },
                      }
                    );
                    canvas.add(line);
                  }
                }
              } else if (obj instanceof Line) {
                // SVG <line> elements — tag as map strokes for eraser
                obj.set({ stroke: colors.stroke, strokeWidth: sw, strokeLineCap: "round", selectable: false, evented: true, data: { isMapStroke: true } });
                canvas.add(obj);
              } else {
                obj.set({ stroke: colors.stroke, strokeWidth: sw, fill: "transparent", selectable: false, evented: false });
                canvas.add(obj);
              }
            });
          canvas.renderAll();
          saveState();
        } catch (err) {
          console.error("loadSVG failed:", err);
        } finally {
          isLoadingRef.current = false;
        }
      },
      clear: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const dots = canvas.getObjects().filter((o) => o.excludeFromExport);
        canvas.clear();
        canvas.backgroundColor = colors.bg;
        dots.forEach((d) => canvas.add(d));
        canvas.renderAll();
        saveState();
      },
      undo: doUndo,
      redo: doRedo,
      getJSON: () => JSON.stringify(fabricRef.current?.toJSON() ?? {}),
      loadJSON: async (json: string) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        isLoadingRef.current = true;
        await canvas.loadFromJSON(json);
        canvas.renderAll();
        isLoadingRef.current = false;
      },
      addReferenceImage: (url: string, opacity: number) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        FabricImage.fromURL(url).then((img) => {
          if (!img) return;
          img.set({
            opacity: opacity / 100, selectable: false, evented: false,
            scaleX: canvasWidth / (img.width || canvasWidth),
            scaleY: canvasHeight / (img.height || canvasHeight),
            excludeFromExport: true,
          });
          canvas.add(img);
          canvas.sendObjectToBack(img);
          canvas.getObjects().forEach((obj) => {
            if (obj.excludeFromExport && !(obj instanceof FabricImage)) canvas.sendObjectToBack(obj);
          });
          refImageRef.current = img;
          canvas.renderAll();
        });
      },
      setReferenceOpacity: (opacity: number) => {
        if (refImageRef.current) {
          refImageRef.current.set({ opacity: opacity / 100 });
          fabricRef.current?.renderAll();
        }
      },
      getNodeCount: () => {
        const canvas = fabricRef.current;
        if (!canvas) return 0;
        let count = 0;
        canvas.getObjects().forEach((obj) => {
          if (obj instanceof Path && !obj.excludeFromExport) {
            const p = (obj as any).path;
            if (p) count += p.length;
          }
        });
        return count;
      },
      getObjectCount: () =>
        fabricRef.current?.getObjects().filter((o) => !o.excludeFromExport).length ?? 0,
      setBrushWidth: (width: number) => {
        const canvas = fabricRef.current;
        if (canvas?.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = width;
        }
      },
    }), [doUndo, doRedo, saveState, colors.bg, colors.stroke, sw, canvasWidth, canvasHeight]);

    return (
      <div
        ref={containerRef}
        style={{ width: "100%", flex: 1, minHeight: 400 }}
      >
        <canvas ref={canvasElRef} style={{ display: "block" }} />
      </div>
    );
  }
);

MapBuilderCanvas.displayName = "MapBuilderCanvas";
export default MapBuilderCanvas;
