import { Shape, transform as Transform } from "../../../../../../types";

type ShapeSyncDeps = {
  socket: any;
  authorId: string;

  addShape: (shape: Shape) => void;
  updateShape: (id: string, payload: any, status?: Shape["status"]) => void;
  updateTransform: (id: string, t: Transform, status?: Shape["status"]) => void;
  endShape: (id: string) => void;
  setAllShapes: (shapes: Shape[]) => void;
};

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

export function initShapeSync({
  socket,
  authorId,
  addShape,
  updateShape,
  updateTransform,
  endShape,
  setAllShapes,
}: ShapeSyncDeps) {
  /* -----------------------------
     SOCKET → LOCAL
  ------------------------------ */

  socket.on("shape:start", (shape: Shape) => {
    if (shape.authorId === authorId) return;
    addShape(shape);
  });

  socket.on("shape:update", (data: { id: string; payload: any; status?: Shape["status"]; authorId: string }) => {
    if (data.authorId === authorId) return;
    updateShape(data.id, data.payload, data.status);
  });

  socket.on("shape:transform", (data: { id: string; transform: Transform; status?: Shape["status"]; authorId: string }) => {
    if (data.authorId === authorId) return;
    updateTransform(data.id, data.transform, data.status);
  });

  socket.on("shape:end", (data: { id: string; authorId: string }) => {
    if (data.authorId === authorId) return;
    endShape(data.id);
  });

  // ✅ NEW EVENT NAME
  socket.on("room:state", (data: { shapes: Shape[] }) => {
    setAllShapes(data.shapes || []);
  });

  /* -----------------------------
     LOCAL → SOCKET
  ------------------------------ */

  const emitStart = (shape: Shape) => {
    socket.emit("shape:start", shape);
  };

  const _emitUpdate = (id: string, payload: any, status?: Shape["status"]) => {
    socket.emit("shape:update", { id, payload, status, authorId });
  };

  const _emitTransform = (id: string, transform: Transform, status?: Shape["status"]) => {
    socket.emit("shape:transform", { id, transform, status, authorId });
  };

  const emitUpdate = throttle(_emitUpdate, 25);
  const emitTransform = throttle(_emitTransform, 25);

  const emitEnd = (id: string) => {
    socket.emit("shape:end", { id, authorId });
  };

  const destroy = () => {
    socket.off("shape:start");
    socket.off("shape:update");
    socket.off("shape:transform");
    socket.off("shape:end");
    socket.off("room:state"); // ✅
  };

  return { emitStart, emitUpdate, emitTransform, emitEnd, destroy };
}
