import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Canvas, PencilBrush, FabricObject, Path, Rect, Circle, Line, FabricImage, util, loadSVGFromString } from "fabric";
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
}

interface MapBuilderCanvasProps {
  stylePrefs: StylePreferences;
  activeTool: ShapeTool;
  activeStamp: FeatureStamp | null;
  onStateChange?: () => void;
  width?: number;
  height?: number;
}

const MapBuilderCanvas = forwardRef<MapCanvasHandle, MapBuilderCanvasProps>(
  ({ stylePrefs, activeTool, activeStamp, onStateChange, width, height }, ref) => {
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<Canvas | null>(null);
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);
    const isLoadingRef = useRef(false);
    const refImageRef = useRef<FabricImage | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sculptingRef = useRef(false);
    const [canvasReady, setCanvasReady] = useState(false);

    const canvasWidth = width || 800;
    const canvasHeight = height || 600;

    const colors = backgroundColors[stylePrefs.background];
    const sw = strokeWeightValues[stylePrefs.strokeWeight];

    // --- Save / Restore History ---
    const saveState = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas || isLoadingRef.current) return;
      const json = JSON.stringify(canvas.toJSON());
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push(json);
      historyIndexRef.current = historyRef.current.length - 1;
      onStateChange?.();
    }, [onStateChange]);

    const doUndo = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas || historyIndexRef.current <= 0) return;
      isLoadingRef.current = true;
      historyIndexRef.current--;
      canvas.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
        canvas.renderAll();
        isLoadingRef.current = false;
        onStateChange?.();
      });
    }, [onStateChange]);

    const doRedo = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;
      isLoadingRef.current = true;
      historyIndexRef.current++;
      canvas.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
        canvas.renderAll();
        isLoadingRef.current = false;
        onStateChange?.();
      });
    }, [onStateChange]);

    // --- Init Canvas ---
    useEffect(() => {
      if (!canvasElRef.current || fabricRef.current) return;

      const container = canvasElRef.current.parentElement;
      const actualWidth = container
        ? Math.min(container.clientWidth, canvasWidth)
        : canvasWidth;
      const actualHeight = Math.round(actualWidth * (canvasHeight / canvasWidth));

      const canvas = new Canvas(canvasElRef.current, {
        isDrawingMode: false,
        backgroundColor: colors.bg,
        width: actualWidth,
        height: actualHeight,
        selection: false,
      });

      fabricRef.current = canvas;

      // Add dot grid
      for (let x = 20; x < canvasWidth; x += 20) {
        for (let y = 20; y < canvasHeight; y += 20) {
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

      // Listen for path created (freehand drawing)
      canvas.on("path:created", () => {
        saveState();
      });

      // Save initial state
      saveState();
      setCanvasReady(true);

      return () => {
        canvas.dispose();
        fabricRef.current = null;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            doRedo();
          } else {
            doUndo();
          }
        }
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [doUndo, doRedo]);

    // --- Apply Style Changes (including line style variations) ---
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas.backgroundColor = colors.bg;

      // Line style effects
      const lineStyle = stylePrefs.lineStyle;
      const getLineStyleProps = () => {
        switch (lineStyle) {
          case "hand-drawn":
            return { strokeDashArray: undefined, opacity: 0.95, stroke: colors.stroke };
          case "nautical":
            return { strokeDashArray: undefined, opacity: 1, stroke: colors.stroke };
          case "aged":
            return { strokeDashArray: [1, 0.5], opacity: 0.85, stroke: stylePrefs.background === "dark" ? "#d4c9a8" : "#2a1f0f" };
          default: // clean
            return { strokeDashArray: undefined, opacity: 1, stroke: colors.stroke };
        }
      };
      const lineProps = getLineStyleProps();

      canvas.getObjects().forEach((obj) => {
        if (obj.excludeFromExport) {
          obj.set({ fill: colors.stroke });
        } else if (obj instanceof Path) {
          const isCoastline = !(obj as any)._isFeature;
          obj.set({
            stroke: (obj as any)._isRiver ? "#6B8CAE" : lineProps.stroke,
            strokeWidth: lineStyle === "nautical" && isCoastline ? sw * 1.6 : sw,
            strokeDashArray: lineProps.strokeDashArray as number[] | undefined,
            opacity: lineProps.opacity,
          });
        } else if (obj instanceof Line) {
          obj.set({ stroke: lineProps.stroke });
        } else if (obj instanceof Rect || obj instanceof Circle) {
          if ((obj as any).isRefImage) return;
          obj.set({ stroke: lineProps.stroke });
        }
      });

      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = lineProps.stroke;
        canvas.freeDrawingBrush.width = sw;
      }

      canvas.renderAll();
    }, [colors.bg, colors.stroke, sw, stylePrefs.lineStyle, stylePrefs.background]);

    // --- Tool Activation ---
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // Clean up previous listeners
      canvas.off("mouse:down");
      canvas.off("mouse:move");
      canvas.off("mouse:up");
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = "default";

      canvas.getObjects().forEach((obj) => {
        if (!obj.excludeFromExport && !(obj instanceof FabricImage)) {
          obj.selectable = false;
          obj.evented = false;
        }
      });

      if (activeStamp) {
        canvas.defaultCursor = "crosshair";
        if (activeStamp === "road") {
          // Two-click road placement
          let startPoint: { x: number; y: number } | null = null;
          let previewLine: Line | null = null;
          canvas.on("mouse:down", (e) => {
            const pointer = canvas.getScenePoint(e.e);
            if (!startPoint) {
              startPoint = { x: pointer.x, y: pointer.y };
              canvas.defaultCursor = "crosshair";
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
              stroke: colors.stroke,
              strokeWidth: 1,
              strokeDashArray: [4, 4],
              selectable: false,
              evented: false,
              excludeFromExport: true,
              opacity: 0.4,
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
          const brush = new PencilBrush(canvas);
          brush.color = colors.stroke;
          brush.width = sw;
          brush.decimate = 4;
          canvas.freeDrawingBrush = brush;
          canvas.isDrawingMode = true;
          break;
        }

        case "pan": {
          canvas.defaultCursor = "grab";
          let isPanning = false;
          let lastPos = { x: 0, y: 0 };

          const getClientPos = (ev: any) => {
            if (ev.touches && ev.touches.length) {
              return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
            }
            return { x: ev.clientX ?? 0, y: ev.clientY ?? 0 };
          };

          canvas.on("mouse:down", (e) => {
            isPanning = true;
            lastPos = getClientPos(e.e);
            canvas.defaultCursor = "grabbing";
          });
          canvas.on("mouse:move", (e) => {
            if (!isPanning) return;
            const pos = getClientPos(e.e);
            const dx = pos.x - lastPos.x;
            const dy = pos.y - lastPos.y;
            canvas.relativePan({ x: dx, y: dy } as any);
            lastPos = pos;
          });
          canvas.on("mouse:up", () => {
            isPanning = false;
            canvas.defaultCursor = "grab";
          });
          break;
        }

        case "eraser": {
          canvas.defaultCursor = "pointer";
          canvas.selection = false;

          const makeEvented = () => {
            canvas.getObjects().forEach((obj) => {
              if (!obj.excludeFromExport && !(obj instanceof FabricImage)) {
                obj.selectable = false;
                obj.evented = true;
                obj.hoverCursor = "pointer";
              }
            });
          };
          makeEvented();

          canvas.on("mouse:down", (e) => {
            const target = e.target || canvas.findTarget(e.e);
            if (
              target &&
              !target.excludeFromExport &&
              !(target instanceof FabricImage)
            ) {
              canvas.remove(target);
              canvas.discardActiveObject();
              canvas.renderAll();
              saveState();
              makeEvented();
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
          canvas.on("mouse:up", () => {
            saveState();
          });
          canvas.renderAll();
          break;
        }

        case "sculpt-in":
        case "sculpt-out": {
          canvas.defaultCursor = "crosshair";
          const direction = activeTool === "sculpt-out" ? 1 : -1;
          const brushRadius = 40;
          const strength = 3;

          canvas.on("mouse:down", () => {
            sculptingRef.current = true;
          });
          canvas.on("mouse:move", (e) => {
            if (!sculptingRef.current) return;
            const pointer = canvas.getScenePoint(e.e);

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

              if (modified) {
                const newPathStr = pathData.map((seg: any[]) => seg.join(" ")).join(" ");
                const newPath = new Path(newPathStr, {
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
                if ((obj as any)._isFeature) (newPath as any)._isFeature = true;
                if ((obj as any)._isRiver) (newPath as any)._isRiver = true;
                canvas.remove(obj);
                canvas.add(newPath);
              }
            });
            canvas.renderAll();
          });
          canvas.on("mouse:up", () => {
            if (sculptingRef.current) {
              sculptingRef.current = false;
              saveState();
            }
          });
          break;
        }

        case "smooth": {
          canvas.defaultCursor = "crosshair";
          const smoothRadius = 40;

          canvas.on("mouse:down", () => {
            sculptingRef.current = true;
          });

          canvas.on("mouse:move", (e) => {
            if (!sculptingRef.current) return;
            const pointer = canvas.getScenePoint(e.e);
            const toReplace: Array<{ old: Path; newPath: Path }> = [];

            canvas.getObjects().forEach((obj) => {
              if (!(obj instanceof Path) || obj.excludeFromExport) return;
              const pathData = (obj as any).path as any[];
              if (!pathData) return;

              let modified = false;
              for (let i = 1; i < pathData.length - 1; i++) {
                const seg = pathData[i];
                const px = seg[1];
                const py = seg[2];
                if (px === undefined || py === undefined) continue;
                const dist = Math.sqrt(
                  (px - pointer.x) ** 2 + (py - pointer.y) ** 2
                );
                if (dist < smoothRadius) {
                  const prev = pathData[i - 1];
                  const next = pathData[i + 1];
                  const prevX = prev[1] ?? px;
                  const prevY = prev[2] ?? py;
                  const nextX = next[1] ?? px;
                  const nextY = next[2] ?? py;
                  const influence = (1 - dist / smoothRadius) * 0.3;
                  seg[1] = px + ((prevX + nextX) / 2 - px) * influence;
                  seg[2] = py + ((prevY + nextY) / 2 - py) * influence;
                  modified = true;
                }
              }

              if (modified) {
                const newPathStr = pathData
                  .map((seg: any[]) => seg.join(" "))
                  .join(" ");
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
                toReplace.push({ old: obj, newPath: rebuilt });
              }
            });

            toReplace.forEach(({ old, newPath }) => {
              canvas.remove(old);
              canvas.add(newPath);
            });

            if (toReplace.length > 0) canvas.renderAll();
          });

          canvas.on("mouse:up", () => {
            if (sculptingRef.current) {
              sculptingRef.current = false;
              saveState();
            }
          });
          break;
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTool, activeStamp, colors.stroke, sw]);

    // --- Place Road (two-click) ---
    const placeRoad = useCallback((x1: number, y1: number, x2: number, y2: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const road = new Line([x1, y1, x2, y2], {
        stroke: colors.stroke,
        strokeWidth: 1.5,
        strokeDashArray: [8, 4],
        selectable: false,
        evented: false,
      });
      canvas.add(road);
      canvas.renderAll();
      saveState();
    }, [colors.stroke, saveState]);

    // --- Place Feature Stamp ---
    const placeStamp = useCallback((type: FeatureStamp, x: number, y: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const stroke = colors.stroke;

      switch (type) {
        case "building": {
          const building = new Rect({
            left: x - 8,
            top: y - 6,
            width: 16,
            height: 12,
            fill: "transparent",
            stroke,
            strokeWidth: 1.2,
            selectable: false,
            evented: false,
            angle: 0,
          });
          canvas.add(building);
          break;
        }
        case "forest": {
          const offsets = [[-6, 0], [6, 0], [0, -8], [-10, -6], [10, -6]];
          offsets.forEach(([dx, dy]) => {
            const tree = new Circle({
              left: x + dx - 4,
              top: y + dy - 4,
              radius: 4,
              fill: "transparent",
              stroke,
              strokeWidth: 1,
              selectable: false,
              evented: false,
            });
            canvas.add(tree);
          });
          break;
        }
        case "elevation": {
          [20, 14, 8].forEach((r) => {
            const arc = new Path(
              `M ${x - r} ${y} Q ${x} ${y - r * 0.8} ${x + r} ${y}`,
              {
                fill: "transparent",
                stroke,
                strokeWidth: 0.8,
                opacity: 0.5,
                selectable: false,
                evented: false,
              }
            );
            canvas.add(arc);
          });
          break;
        }
        case "road":
          // handled by placeRoad for two-click, fallback single stamp
          break;
        case "river": {
          const river = new Path(
            `M ${x} ${y - 25} Q ${x + 12} ${y} ${x} ${y + 25}`,
            {
              fill: "transparent",
              stroke: "#6B8CAE",
              strokeWidth: 1.5,
              selectable: false,
              evented: false,
            }
          );
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
      getSVG: () => {
        const canvas = fabricRef.current;
        return canvas ? canvas.toSVG() : "";
      },
      getPNG: () => {
        const canvas = fabricRef.current;
        return canvas ? canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 }) : "";
      },
      loadSVG: async (svgString: string) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        isLoadingRef.current = true;
        try {
          const result = await loadSVGFromString(svgString);
          canvas.getObjects()
            .filter((o) => !o.excludeFromExport)
            .forEach((o) => canvas.remove(o));

          result.objects
            .filter((obj): obj is FabricObject => obj !== null)
            .forEach((obj) => {
              obj.set({
                stroke: colors.stroke,
                strokeWidth: sw,
                fill: "transparent",
                selectable: false,
                evented: false,
              });
              canvas.add(obj);
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
      getJSON: () => {
        const canvas = fabricRef.current;
        return canvas ? JSON.stringify(canvas.toJSON()) : "{}";
      },
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
          const scaleX = canvasWidth / (img.width || canvasWidth);
          const scaleY = canvasHeight / (img.height || canvasHeight);
          img.set({
            opacity: opacity / 100,
            selectable: false,
            evented: false,
            scaleX,
            scaleY,
            excludeFromExport: true,
          });
          canvas.add(img);
          canvas.sendObjectToBack(img);
          // Move dot grid below image
          canvas.getObjects().forEach((obj) => {
            if (obj.excludeFromExport && !(obj instanceof FabricImage)) {
              canvas.sendObjectToBack(obj);
            }
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
            const pathData = (obj as any).path;
            if (pathData) count += pathData.length;
          }
        });
        return count;
      },
      getObjectCount: () => {
        const canvas = fabricRef.current;
        if (!canvas) return 0;
        return canvas.getObjects().filter((o) => !o.excludeFromExport).length;
      },
    }), [doUndo, doRedo, saveState, colors.bg, colors.stroke, sw, canvasWidth, canvasHeight]);

    return (
      <div
        ref={containerRef}
        style={{ width: "100%", maxWidth: canvasWidth }}
      >
        <canvas
          ref={canvasElRef}
          style={{ display: "block" }}
        />
      </div>
    );
  }
);

MapBuilderCanvas.displayName = "MapBuilderCanvas";

export default MapBuilderCanvas;
