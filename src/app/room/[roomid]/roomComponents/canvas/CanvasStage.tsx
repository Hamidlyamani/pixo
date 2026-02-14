"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Stage, Layer, Transformer, Group, Rect } from "react-konva";
import { nanoid } from "nanoid";
import { ToolOptions, Shape, transform as TransformType } from "../../../../../../types";
import useCursor from "@/hooks/useCursor";
import RenderLayer from "./RenderLayer";
import { initShapeSync } from "../socket/strokeSync";
import { createToolHandlers, ToolHandlers } from "../drawing/toolHandlers";
import { useShapes } from "../drawing/useShapes";

type CanvasStageProps = {
  tool: string;
  options: ToolOptions;
  sidebarWidth: number;
  socket: any;
  roomid: string;
};

export type CanvasStageHandle = {
  exportJpg: () => void;
};

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

const CanvasStage = forwardRef<CanvasStageHandle, CanvasStageProps>(function CanvasStage(
  { tool, options, sidebarWidth, socket }: CanvasStageProps,
  ref
) {
  const stageRef = useRef<any>(null);
  const canvasGroupRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const fallbackAuthorIdRef = useRef(nanoid());
  const authorId = socket?.id ?? fallbackAuthorIdRef.current;


  /* ---------------------------------------------
     Shapes store
  --------------------------------------------- */
  const shapesApi = useShapes(authorId);
  const {
    shapes,
    addShape,
    updateShape,       // payload only
    updateTransform,   // transform only
    endShape,
    setAllShapes,
  } = shapesApi;

  /* ---------------------------------------------
     Socket sync
  --------------------------------------------- */
  const syncRef = useRef<ReturnType<typeof initShapeSync> | null>(null);

  useEffect(() => {
    if (!socket) return;
    const sync = initShapeSync({
      socket,
      authorId,
      addShape,
      updateShape,
      endShape,
      setAllShapes,
      updateTransform,
    });

    syncRef.current = sync;

    return () => {
      sync.destroy();
      syncRef.current = null;
    };
  }, [socket, authorId, addShape, updateShape, endShape, setAllShapes, updateTransform]);

  /* ---------------------------------------------
     Networked API used by toolHandlers
  --------------------------------------------- */
  const networkedShapesApi = useMemo(
    () => ({
      addShape: (shape: Shape) => {
       
        addShape(shape);
        syncRef.current?.emitStart(shape);
      },

      updateShape: (id: string, payload: any, status?: Shape["status"]) => {
        updateShape(id, payload, status);
        syncRef.current?.emitUpdate(id, payload, status);
      },

      updateTransform: (id: string, t: TransformType, status?: Shape["status"]) => {
        updateTransform(id, t, status);
        syncRef.current?.emitTransform?.(id, t, status);
      },

      endShape: (id: string) => {
        endShape(id);
        syncRef.current?.emitEnd(id);
      },
    }),
    [addShape, updateShape, updateTransform, endShape]
  );

  /* ---------------------------------------------
     Tool handlers
  --------------------------------------------- */
  const activeShapeId = useRef<string | null>(null);
  const startPosRef = { current: { x: 0, y: 0 } };
  const brushPointsRef = { current: [] as number[] };

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const toolHandlersRef = useRef<Record<string, ToolHandlers> | null>(null);
  if (!toolHandlersRef.current) {
    toolHandlersRef.current = createToolHandlers(
      networkedShapesApi,
      optionsRef,
      authorId,
      activeShapeId,
      startPosRef,
      brushPointsRef,
      trRef,
      canvasGroupRef
    );
  }
  const toolHandlers = toolHandlersRef.current!;

  /* ---------------------------------------------
     Export JPG (white board only)
  --------------------------------------------- */
  const exportBoardJpg = () => {
    const stage = stageRef.current;
    const group = canvasGroupRef.current;
    if (!stage || !group) return;

    // position du tableau blanc dans le stage (après pan)
    const rect = group.getClientRect({ relativeTo: stage });

    const dataUrl = stage.toDataURL({
      x: rect.x,
      y: rect.y,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      pixelRatio: 3,
      mimeType: "image/jpeg",
      quality: 0.95,
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `whiteboard-${Date.now()}.jpg`;
    link.click();
  };

  // ✅ expose exportJpg au parent
  useImperativeHandle(ref, () => ({
    exportJpg: exportBoardJpg,
  }));

  /* ---------------------------------------------
     Mouse handlers
  --------------------------------------------- */
  const handleMouseDown = (e: any) => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;

    // si tu as un outil "hand", il doit pouvoir pan même hors canvas
    if (tool !== "hand" && !isInsideCanvas(pos)) return;

    toolHandlers[tool]?.onDown?.({ pos, target: e.target });
  };

  const handleMouseMove = () => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;

    if (tool !== "hand" && !isInsideCanvas(pos)) return;

    toolHandlers[tool]?.onMove?.({ pos });
  };

  const handleMouseUp = () => {
    toolHandlers[tool]?.onUp?.();
  };

  /* ---------------------------------------------
     Resize logic
  --------------------------------------------- */
  useEffect(() => {
    const resize = () => {
      setStageSize({
        width: window.innerWidth - sidebarWidth,
        height: window.innerHeight,
      });
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [sidebarWidth]);

  /* ---------------------------------------------
     Bounds check
  --------------------------------------------- */
  function isInsideCanvas(pos: { x: number; y: number }) {
    const group = canvasGroupRef.current;
    if (!group) return false;

    const tr = group.getAbsoluteTransform().copy();
    tr.invert();
    const localPos = tr.point(pos);

    return (
      localPos.x >= 0 &&
      localPos.y >= 0 &&
      localPos.x <= CANVAS_WIDTH &&
      localPos.y <= CANVAS_HEIGHT
    );
  }

  useCursor(stageRef, tool);


//   useEffect(() => {
//   const group = canvasGroupRef.current;
//   if (!group) return;

//   const x = (stageSize.width - CANVAS_WIDTH) / 2;
//   const y = (stageSize.height - CANVAS_HEIGHT) / 2;

//   group.position({ x, y });
//   group.getLayer()?.batchDraw();
// }, [stageSize.width, stageSize.height]);

  /* ---------------------------------------------
     Render
  --------------------------------------------- */
  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ background: "#555" }}
    >
      <Layer>
        <Group ref={canvasGroupRef}>
          <Rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="white" listening={false} />
          <Transformer ref={trRef} />
          <RenderLayer
            shapes={shapes}
            updateShape={networkedShapesApi.updateShape}
            updateTransform={networkedShapesApi.updateTransform}
          />
        </Group>
      </Layer>
    </Stage>
  );
});

export default CanvasStage;
