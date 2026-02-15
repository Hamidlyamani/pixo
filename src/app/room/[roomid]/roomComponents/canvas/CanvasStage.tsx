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
  canJoin: boolean;     // ✅ NEW
  username: string;     // ✅ NEW
};

export type CanvasStageHandle = {
  exportJpg: () => void;
};

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

const CanvasStage = forwardRef<CanvasStageHandle, CanvasStageProps>(function CanvasStage(
  { tool, options, sidebarWidth, socket, roomid, canJoin, username }: CanvasStageProps,
  ref
) {
  const stageRef = useRef<any>(null);
  const canvasGroupRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const fallbackAuthorIdRef = useRef(nanoid());
  const authorId = socket?.id ?? fallbackAuthorIdRef.current;

  const shapesApi = useShapes(authorId);
  const { shapes, addShape, updateShape, updateTransform, endShape, setAllShapes } = shapesApi;

  const syncRef = useRef<ReturnType<typeof initShapeSync> | null>(null);



  const [boardScale, setBoardScale] = useState(1);
const [boardPos, setBoardPos] = useState({ x: 0, y: 0 });

useEffect(() => {
  const updateBoardFit = () => {
    const availableWidth = stageSize.width;
    const availableHeight = stageSize.height;

    // fit (garde le ratio)
    const sx = availableWidth / CANVAS_WIDTH;
    const sy = availableHeight / (CANVAS_HEIGHT + 40);
    const s = Math.min(sx, sy); // pas de limite, tu peux mettre Math.min(sx, sy, 1) si tu veux pas agrandir

    setBoardScale(s);

    // center
    const x = (availableWidth - CANVAS_WIDTH * s) / 2;
    const y = (availableHeight - CANVAS_HEIGHT * s) / 2;
    setBoardPos({ x, y });
  };

  updateBoardFit();
}, [stageSize.width, stageSize.height]);


  // ✅ 1) attach listeners first
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

  // ✅ 2) join only after listeners attached + canJoin
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!socket || !roomid) return;
    if (!canJoin) return;
    if (!username || username.trim().length < 3) return;

    // important: avoid multiple joins
    if (joinedRef.current) return;

    const doJoin = () => {
      if (joinedRef.current) return;
      joinedRef.current = true;

      socket.emit("room:join", { roomId: roomid, username: username.trim() });
    };

    // if not connected yet
    if (socket.connected) doJoin();
    else socket.once("connect", doJoin);

    return () => {
      socket.off("connect", doJoin);
    };
  }, [socket, roomid, canJoin, username]);

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

  const activeShapeId = useRef<string | null>(null);
  const startPosRef = { current: { x: 0, y: 0 } };
  const brushPointsRef = { current: [] as number[] };

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  // ----------------------- solve x,y probleme en scale
// const tr = group.getAbsoluteTransform().copy();
// tr.invert();
// const localPos = tr.point(pos);
const getBoardPointer = () => {
  const stage = stageRef.current;
  const group = canvasGroupRef.current;
  if (!stage || !group) return null;

  const p = stage.getPointerPosition();
  if (!p) return null;

  const tr = group.getAbsoluteTransform().copy();
  tr.invert();
  return tr.point(p); // ✅ coordonnées locales 1000×600
};

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

  const exportBoardJpg = () => {
    const stage = stageRef.current;
    const group = canvasGroupRef.current;
    if (!stage || !group) return;

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

  useImperativeHandle(ref, () => ({ exportJpg: exportBoardJpg }));

  const handleMouseDown = (e: any) => {
     const pos = getBoardPointer();
  if (!pos) return;
    if (tool !== "hand" && !isInsideCanvas(pos)) return;
    toolHandlers[tool]?.onDown?.({ pos, target: e.target });
  };

  const handleMouseMove = () => {
    const pos = getBoardPointer();
  if (!pos) return;
    if (tool !== "hand" && !isInsideCanvas(pos)) return;
    toolHandlers[tool]?.onMove?.({ pos });
  };

  const handleMouseUp = () => {
    toolHandlers[tool]?.onUp?.();
  };

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

  function isInsideCanvas(localPos: { x: number; y: number }) {
  return (
    localPos.x >= 0 &&
    localPos.y >= 0 &&
    localPos.x <= CANVAS_WIDTH &&
    localPos.y <= CANVAS_HEIGHT
  );
}

  useCursor(stageRef, tool);

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
       <Group
  ref={canvasGroupRef}
  x={boardPos.x}
  y={boardPos.y}
  scaleX={boardScale}
  scaleY={boardScale}
>
          <Rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="white" listening={false} />
          <Transformer ref={trRef} />
          <RenderLayer shapes={shapes} updateShape={networkedShapesApi.updateShape} updateTransform={networkedShapesApi.updateTransform} />
        </Group>
      </Layer>
    </Stage>
  );
});

export default CanvasStage;
