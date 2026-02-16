import type { Socket } from "socket.io-client";
import { Shape, transform as Transform } from "../../../../../../types";

type ShapePayload = Shape["payload"];

type ShapeUpdateEvent = {
  id: string;
  payload: ShapePayload;
  status?: Shape["status"];
  authorId: string;
};

type ShapeTransformEvent = {
  id: string;
  transform: Transform;
  status?: Shape["status"];
  authorId: string;
};

type ShapeEndEvent = {
  id: string;
  authorId: string;
};

type RoomStateEvent = {
  shapes: Shape[];
};

type ShapeSyncDeps = {
  socket: Socket;
  authorId: string;

  addShape: (shape: Shape) => void;
  updateShape: (id: string, payload: ShapePayload, status?: Shape["status"]) => void;
  updateTransform: (id: string, t: Transform, status?: Shape["status"]) => void;
  endShape: (id: string) => void;
  setAllShapes: (shapes: Shape[]) => void;
};

function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args) => {
    const now = Date.now();

    if (now - last >= delay) {
      last = now;
      fn(...args);
      return;
    }

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      last = Date.now();
      fn(...args);
    }, delay - (now - last));
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

  socket.on("shape:update", (data: ShapeUpdateEvent) => {
    if (data.authorId === authorId) return;
    updateShape(data.id, data.payload, data.status);
  });

  socket.on("shape:transform", (data: ShapeTransformEvent) => {
    if (data.authorId === authorId) return;
    updateTransform(data.id, data.transform, data.status);
  });

  socket.on("shape:end", (data: ShapeEndEvent) => {
    if (data.authorId === authorId) return;
    endShape(data.id);
  });

  socket.on("room:state", (data: RoomStateEvent) => {
    setAllShapes(Array.isArray(data.shapes) ? data.shapes : []);
  });

  /* -----------------------------
     LOCAL → SOCKET
  ------------------------------ */

  const emitStart = (shape: Shape): void => {
    socket.emit("shape:start", shape);
  };

  const _emitUpdate = (id: string, payload: ShapePayload, status?: Shape["status"]): void => {
    socket.emit("shape:update", { id, payload, status, authorId } satisfies ShapeUpdateEvent);
  };

  const _emitTransform = (id: string, transform: Transform, status?: Shape["status"]): void => {
    socket.emit("shape:transform", { id, transform, status, authorId } satisfies ShapeTransformEvent);
  };

  const emitUpdate = throttle(_emitUpdate, 25);
  const emitTransform = throttle(_emitTransform, 25);

  const emitEnd = (id: string): void => {
    socket.emit("shape:end", { id, authorId } satisfies ShapeEndEvent);
  };

  const destroy = (): void => {
    socket.off("shape:start");
    socket.off("shape:update");
    socket.off("shape:transform");
    socket.off("shape:end");
    socket.off("room:state");
  };

  return { emitStart, emitUpdate, emitTransform, emitEnd, destroy };
}
