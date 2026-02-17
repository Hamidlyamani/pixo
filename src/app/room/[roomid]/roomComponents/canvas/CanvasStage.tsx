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
import type Konva from "konva";
import { nanoid } from "nanoid";
import { Socket } from "socket.io-client";

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
  socket: Socket;
  roomid: string;
  canJoin: boolean;
  username: string;
};

export type CanvasStageHandle = {
  exportJpg: () => void;
};

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

const CanvasStage = forwardRef<CanvasStageHandle, CanvasStageProps>(function CanvasStage(
  { tool, options, sidebarWidth, socket, roomid, canJoin, username },
  ref
) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const canvasGroupRef = useRef<Konva.Group | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  // authorId stable
  const fallbackAuthorIdRef = useRef(nanoid());
  const authorId = socket?.id ?? fallbackAuthorIdRef.current;

  /* -----------------------------
     Shapes store
  ------------------------------ */
  const shapesApi = useShapes();
  const { shapes, addShape, updateShape, updateTransform, endShape, setAllShapes } = shapesApi;

  /* -----------------------------
     Board fit (responsive)
  ------------------------------ */
  const [boardScale, setBoardScale] = useState(1);
  const [boardPos, setBoardPos] = useState({ x: 0, y: 0 });
  
const [pixelRatio, setPixelRatio] = useState(1);

useEffect(() => {
  const pr = window.devicePixelRatio || 1;
  // limite à 2 ou 3 pour éviter de tuer les perfs
  setPixelRatio(Math.min(pr, 2));
}, []);
  useEffect(() => {
    const updateBoardFit = () => {
      const availableWidth = stageSize.width || window.innerWidth - sidebarWidth;
      const availableHeight = stageSize.height || window.innerHeight;

      const sx = availableWidth / CANVAS_WIDTH;
      const sy = availableHeight / (CANVAS_HEIGHT + 40); // garde ton +40 si besoin
      const s = Math.max(0.6, Math.min(sx, sy));

      setBoardScale(s);

      const x = (availableWidth - CANVAS_WIDTH * s) / 2;
      const y = (availableHeight - CANVAS_HEIGHT * s) / 2;
      setBoardPos({ x, y });
    };

    updateBoardFit();
  }, [stageSize.width, stageSize.height, sidebarWidth]);

  /* -----------------------------
     Socket sync (listeners first)
  ------------------------------ */
  const syncRef = useRef<ReturnType<typeof initShapeSync> | null>(null);

  useEffect(() => {
    if (!socket) return;

    const sync = initShapeSync({
      socket,
      authorId,
      addShape,
      updateShape,
      updateTransform,
      endShape,
      setAllShapes,
    });

    syncRef.current = sync;

    return () => {
      sync.destroy();
      syncRef.current = null;
    };
  }, [socket, authorId, addShape, updateShape, updateTransform, endShape, setAllShapes]);

  /* -----------------------------
     Join room after listeners
  ------------------------------ */
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!socket || !roomid) return;
    if (!canJoin) return;
    const u = username?.trim() ?? "";
    if (u.length < 3) return;
    if (joinedRef.current) return;

    const doJoin = () => {
      if (joinedRef.current) return;
      joinedRef.current = true;
      socket.emit("room:join", { roomId: roomid, username: u });
    };

    if (socket.connected) doJoin();
    else socket.once("connect", doJoin);

    return () => {
      socket.off("connect", doJoin);
    };
  }, [socket, roomid, canJoin, username]);

  /* -----------------------------
     Networked API (local + emit)
  ------------------------------ */
  const networkedShapesApi = useMemo(
    () => ({
      addShape: (shape: Shape) => {
        addShape(shape);
        syncRef.current?.emitStart(shape);
      },

      updateShape: (id: string, payload: Shape["payload"], status?: Shape["status"]) => {
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

  /* -----------------------------
     Tool handlers (stable)
  ------------------------------ */
  const activeShapeId = useRef<string | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const brushPointsRef = useRef<number[]>([]);

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
      { current: startPosRef.current }, // compat avec ton API
      { current: brushPointsRef.current },
      trRef,
      canvasGroupRef
    );
  }
  const toolHandlers = toolHandlersRef.current!;

  /* -----------------------------
     Pointer position in board coords
  ------------------------------ */
  const getBoardPointer = () => {
    const stage = stageRef.current;
    const group = canvasGroupRef.current;
    if (!stage || !group) return null;

    const p = stage.getPointerPosition();
    if (!p) return null;

    const tr = group.getAbsoluteTransform().copy();
    tr.invert();
    return tr.point(p); // coords locales 1000x600
  };

  function isInsideCanvas(localPos: { x: number; y: number }) {
    return (
      localPos.x >= 0 &&
      localPos.y >= 0 &&
      localPos.x <= CANVAS_WIDTH &&
      localPos.y <= CANVAS_HEIGHT
    );
  }

  /* -----------------------------
     Export JPG (board only)
  ------------------------------ */
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

  /* -----------------------------
     Pointer events (mobile + desktop)
  ------------------------------ */
  const activePointerId = useRef<number | null>(null);

  const handlePointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt?.preventDefault?.();

    // ignore second finger
    if (activePointerId.current !== null) return;
    activePointerId.current = e.evt.pointerId;

    const pos = getBoardPointer();
    if (!pos) return;

    if (tool !== "hand" && !isInsideCanvas(pos)) return;
    toolHandlers[tool]?.onDown?.({ pos, target: e.target });
  };

  const handlePointerMove = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt?.preventDefault?.();

    if (activePointerId.current !== e.evt.pointerId) return;

    const pos = getBoardPointer();
    if (!pos) return;

    if (tool !== "hand" && !isInsideCanvas(pos)) return;
    toolHandlers[tool]?.onMove?.({ pos });
  };

  const handlePointerUp = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt?.preventDefault?.();

    if (activePointerId.current !== e.evt.pointerId) return;
    activePointerId.current = null;

    toolHandlers[tool]?.onUp?.();
  };

  /* -----------------------------
     Resize stage
  ------------------------------ */
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

  useCursor(stageRef, tool);

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      pixelRatio={pixelRatio}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ background: "#555", touchAction: "none" }} // ✅ IMPORTANT mobile
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
