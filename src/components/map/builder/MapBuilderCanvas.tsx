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

      const canvas = new Canvas(canvasElRef.current, {
        isDrawingMode: false,
        backgroundColor: colors.bg,
        width: canvasWidth,
        height: canvasHeight,
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

    // --- Apply Style Changes ---
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas.backgroundColor = colors.bg;

      canvas.getObjects().forEach((obj) => {
        if (obj.excludeFromExport) {
          // dot grid
          obj.set({ fill: colors.stroke });
        } else if (obj instanceof Path) {
          obj.set({
            stroke: colors.stroke,
            strokeWidth: sw,
          });
        } else if (obj instanceof Line) {
          obj.set({ stroke: colors.stroke });
        } else if (obj instanceof Rect || obj instanceof Circle) {
          if ((obj as any).isRefImage) return;
          obj.set({ stroke: colors.stroke });
        }
      });

      // Update drawing brush if active
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = colors.stroke;
        canvas.freeDrawingBrush.width = sw;
      }

      canvas.renderAll();
    }, [colors.bg, colors.stroke, sw]);

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
        // Stamp mode
        canvas.defaultCursor = "crosshair";
        canvas.on("mouse:down", (e) => {
          const pointer = canvas.getScenePoint(e.e);
          placeStamp(activeStamp, pointer.x, pointer.y);
        });
        return;
      }

      switch (activeTool) {
        case "pen": {
          canvas.isDrawingMode = true;
          const brush = new PencilBrush(canvas);
          brush.color = colors.stroke;
          brush.width = sw;
          brush.decimate = 4;
          canvas.freeDrawingBrush = brush;
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
          canvas.getObjects().forEach((obj) => {
            if (!obj.excludeFromExport && !(obj instanceof FabricImage)) {
              obj.selectable = true;
              obj.evented = true;
            }
          });
          canvas.on("mouse:down", (e) => {
            if (e.target && !e.target.excludeFromExport && !(e.target instanceof FabricImage)) {
              canvas.remove(e.target);
              canvas.renderAll();
              saveState();
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
                // Force re-render by setting dirty
                (obj as any).dirty = true;
                obj.setCoords();
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

            canvas.getObjects().forEach((obj) => {
              if (!(obj instanceof Path) || obj.excludeFromExport) return;
              const pathData = (obj as any).path as any[];
              if (!pathData) return;

              for (let i = 1; i < pathData.length - 1; i++) {
                const seg = pathData[i];
                const px = seg[1];
                const py = seg[2];
                if (px === undefined || py === undefined) continue;
                const dist = Math.sqrt((px - pointer.x) ** 2 + (py - pointer.y) ** 2);
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
                }
              }
              (obj as any).dirty = true;
              obj.setCoords();
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
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTool, activeStamp, colors.stroke, sw]);

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
            angle: Math.random() * 20 - 10,
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
        case "road": {
          const road = new Line([x - 30, y, x + 30, y], {
            stroke,
            strokeWidth: 1.5,
            strokeDashArray: [8, 4],
            selectable: false,
            evented: false,
          });
          canvas.add(road);
          break;
        }
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
          canvas.getObjects().forEach((obj) => {
            if (!obj.excludeFromExport) canvas.remove(obj);
          });
          const group = util.groupSVGElements(result.objects.filter(Boolean) as FabricObject[]);
          // Ungroup and add individual objects
          if ((group as any).getObjects) {
            (group as any).getObjects().forEach((obj: FabricObject) => {
              obj.set({
                stroke: colors.stroke,
                strokeWidth: sw,
                fill: "transparent",
                selectable: false,
                evented: false,
              });
              canvas.add(obj);
            });
          } else {
            group.set({
              stroke: colors.stroke,
              strokeWidth: sw,
              fill: "transparent",
              selectable: false,
              evented: false,
            });
            canvas.add(group);
          }
          canvas.renderAll();
          saveState();
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
      <canvas
        ref={canvasElRef}
        style={{ display: "block", width: "100%", maxWidth: canvasWidth }}
      />
    );
  }
);

MapBuilderCanvas.displayName = "MapBuilderCanvas";

export default MapBuilderCanvas;
