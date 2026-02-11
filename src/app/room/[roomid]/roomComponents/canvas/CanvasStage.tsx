"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Transformer, Group, Rect } from "react-konva";
import { nanoid } from "nanoid";
import { ToolOptions, Shape } from "../../../../../../types";
import useCursor from "@/hooks/useCursor";
import RenderLayer from "./RenderLayer";
import { initShapeSync } from "../socket/strokeSync"; // rename later to shapeSync if you want
import { createToolHandlers, ToolHandlers } from "../drawing/toolHandlers";
import { useShapes } from "../drawing/useShapes";

type CanvasStageProps = {
  tool: string;
  options: ToolOptions;
  sidebarWidth: number;
  socket: any;
  roomid: string;
};

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;

export default function CanvasStage({
  tool,
  options,
  sidebarWidth,
  socket,
  
}: CanvasStageProps) {
  const stageRef = useRef<any>(null);
  const canvasGroupRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  // stable authorId:
  // - if socket has id, use it
  // - else fallback once (not on every render)
  const fallbackAuthorIdRef = useRef(nanoid());
  const authorId = socket?.id ?? fallbackAuthorIdRef.current;

  /* ---------------------------------------------
     Shapes store (single source of truth)
  --------------------------------------------- */
  const shapesApi = useShapes(authorId);
  const { shapes, addShape, updateShape, endShape, setAllShapes } = shapesApi;

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
    });

    syncRef.current = sync;

    return () => {
      sync.destroy();
      syncRef.current = null;
    };
  }, [socket, authorId, addShape, updateShape, endShape, setAllShapes]);

  /* ---------------------------------------------
     Networked API used by toolHandlers
     (local update + emit)
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
      endShape: (id: string) => {
        endShape(id);
        syncRef.current?.emitEnd(id);
      },
    }),
    [addShape, updateShape, endShape]
  );

  /* ---------------------------------------------
     Tool handlers
  --------------------------------------------- */
  const activeShapeId = useRef<string | null>(null);
  
  const startPosRef = { current: { x: 0, y: 0 } };
  const brushPointsRef = { current: [] as number[] };

 const toolHandlersRef = useRef<Record<string, ToolHandlers> | null>(null);

if (!toolHandlersRef.current) {
  toolHandlersRef.current = createToolHandlers(
    networkedShapesApi,
    options,
    authorId,
    activeShapeId,
    startPosRef,
    brushPointsRef,
    trRef
  );
}

const toolHandlers = toolHandlersRef.current!;


 /* ---------------------------------------------
     Mouse position helper
  --------------------------------------------- */


  /* ---------------------------------------------
     Mouse handlers
  --------------------------------------------- */

  const handleMouseDown = (e:any) => {
    const pos = stageRef.current?.getPointerPosition();


    if (!pos) return;
    if (!isInsideCanvas(pos)) return;
    toolHandlers[tool]?.onDown?.({ pos, target: e.target });
  };

  const handleMouseMove = () => {
    const pos = stageRef.current?.getPointerPosition();


    if (!pos) return;
    if (!isInsideCanvas(pos)) return;

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

    const transform = group.getAbsoluteTransform().copy();
    transform.invert();
    const localPos = transform.point(pos);

    return (
      localPos.x >= 0 &&
      localPos.y >= 0 &&
      localPos.x <= CANVAS_WIDTH &&
      localPos.y <= CANVAS_HEIGHT
    );
  }

  /* ---------------------------------------------
     Cursor per tool
  --------------------------------------------- */
  useCursor(stageRef, tool);

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
          <Rect
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="white"
            listening={false}
          />
          <Transformer ref={trRef} />
        </Group>
      </Layer>

      {/* Drawing layer */}
      <RenderLayer shapes={shapes} updateShape={networkedShapesApi.updateShape} />
    </Stage>
  );
}
