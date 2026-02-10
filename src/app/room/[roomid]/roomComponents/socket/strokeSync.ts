
import { Stroke } from "../../../../../../types";

/* ---------------------------------------------
   Types
--------------------------------------------- */

type Point = { x: number; y: number };

type StrokeSyncDeps = {
  socket: any; // Socket from socket.io-client
  authorId: string;

  // from useStrokes
  startStroke: (stroke: Stroke) => void;
  updateStroke: (id: string, point: Point) => void;
  endStroke: (id: string) => void;
  setStrokes: (strokes: Stroke[]) => void;
};

/* ---------------------------------------------
   Throttle util (emit only)
--------------------------------------------- */

function throttle<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let last = 0;
  let timer: any = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - last >= delay) {
      last = now;
      fn(...args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        fn(...args);
      }, delay - (now - last));
    }
  };
}

/* ---------------------------------------------
   Main Init
--------------------------------------------- */

export function initStrokeSync({
  socket,
  authorId,
  startStroke,
  updateStroke,
  endStroke,
  setStrokes,
}: StrokeSyncDeps) {
  /* ---------------------------------------------
     SOCKET -> LOCAL STATE
  --------------------------------------------- */

  socket.on("stroke:start", (stroke: Stroke) => {
    // avoid self-echo
    if (stroke.authorId === authorId) return;

    startStroke(stroke);
  });

  socket.on("stroke:update", (data: { id: string; point: Point; authorId: string }) => {
    if (data.authorId === authorId) return;

    updateStroke(data.id, data.point);
  });

  socket.on("stroke:end", (data: { id: string; authorId: string }) => {
    if (data.authorId === authorId) return;

    endStroke(data.id);
  });

  // room hydration (mid-session join)
  socket.on("room:state", (strokes: Stroke[]) => {
    setStrokes(strokes);
  });

  /* ---------------------------------------------
     LOCAL -> SOCKET (emitters)
  --------------------------------------------- */

  const emitStart = (stroke: Stroke) => {
    socket.emit("stroke:start", stroke);
  };

  const _emitUpdate = (id: string, point: Point) => {

    socket.emit("stroke:update", {
      id,
      point,
      authorId,
    });
  };

  // throttled update emit (≈ 60fps → 16ms, but 25ms is safer)
  const emitUpdate = throttle(_emitUpdate, 5);

  const emitEnd = (id: string) => {
    socket.emit("stroke:end", {
      id,
      authorId,
    });
  };













  /* ---------------------------------------------
     CLEANUP
  --------------------------------------------- */

  const destroy = () => {
    socket.off("stroke:start");
    socket.off("stroke:update");
    socket.off("stroke:end");
    socket.off("room:state");
  };

  /* ---------------------------------------------
     Public API
  --------------------------------------------- */

  return {
    emitStart,
    emitUpdate,
    emitEnd,
    destroy,
  };
}
