"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Transformer, Group, Rect } from "react-konva";
import { nanoid } from "nanoid";
import { ToolOptions, Stroke } from "../../../../../../types";
import useCursor from "@/hooks/useCursor";
import { createToolHandlers, ToolHandlers } from "../drawing/toolHandlers2";
import { useStrokes } from "../drawing/useStrokes";
import { getSocket } from "@/lib/socket";
import RenderLayer from "./RenderLayer";
import { initStrokeSync } from "../socket/strokeSync";
import { useParams } from "next/navigation";
/* ---------------------------------------------
   Types
--------------------------------------------- */

type CanvasStageProps = {
  tool: string;
  options: ToolOptions;
  sidebarWidth: number;
  socket:any;
  roomid:any
};

type Point = { x: number; y: number };

/* ---------------------------------------------
   Constants
--------------------------------------------- */

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;

/* ---------------------------------------------
   Component
--------------------------------------------- */

export default function CanvasStage({
  tool,
  options,
  sidebarWidth,
  socket,
  roomid
}: CanvasStageProps) {
  const stageRef = useRef<any>(null);
  const canvasGroupRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  /* ---------------------------------------------
     Socket
  --------------------------------------------- */

 
  const authorId = socket.id ?? nanoid(); // fallback safety

  /* ---------------------------------------------
     Stroke state (SINGLE SOURCE OF TRUTH)
  --------------------------------------------- */

  const strokesApi = useStrokes(authorId);
  const { strokes, startStroke, updateStroke, endStroke, setStrokes } = strokesApi;

   
  /* ---------------------------------------------
     Socket Sync (bridge)
  --------------------------------------------- */

 const syncRef = useRef<ReturnType<typeof initStrokeSync> | null>(null);

useEffect(() => {
  if (!socket) return;

  const sync = initStrokeSync({
    socket,
    authorId,
    startStroke,
    updateStroke,
    endStroke,
    setStrokes,
  });

  syncRef.current = sync;

  return () => {
    sync.destroy();
    syncRef.current = null;
  };
}, [socket, authorId]);



useEffect(() => {
  if (!socket) return;
    socket.emit("join-room", { roomid });
  
}, [socket, roomid]);



  /* ---------------------------------------------
     Tool Handlers (LOCAL ONLY)
  --------------------------------------------- */
const networkedStrokesApi = {
  startStroke: (stroke:Stroke) => {
    startStroke(stroke);              // local
    syncRef.current?.emitStart(stroke); // socket
  },
  updateStroke: (id:any, point:any) => {
    
    updateStroke(id, point);            // local
    syncRef.current?.emitUpdate(id, point); // socket
  },
  endStroke: (id:any) => {
    endStroke(id);                  // local
    syncRef.current?.emitEnd(id);     // socket
  },
};

const activeStrokeId = useRef<string | null>(null);

  const toolHandlers: Record<string, ToolHandlers> =
  createToolHandlers(
    networkedStrokesApi,
    options,
    authorId,
    activeStrokeId
  );
  
  /* ---------------------------------------------
     Mouse handlers
  --------------------------------------------- */

  const handleMouseDown = (e: any) => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
    if (!isInsideCanvas(pos)) return;
    toolHandlers[tool]?.onDown?.({ pos });
  };

  const handleMouseMove = () => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
 
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
     Canvas bounds check
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
      {/* Canvas background */}
      <Layer>
        <Group ref={canvasGroupRef}>
          <Rect
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="white"
            listening={false}
          />
        </Group>
      </Layer>

      {/* Drawing layer */}
      <RenderLayer strokes={strokes} />

      {/* Transformer layer */}
      <Layer>
        <Transformer ref={trRef} />
      </Layer>
    </Stage>
  );
}
