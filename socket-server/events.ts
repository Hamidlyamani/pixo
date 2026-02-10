import { Server, Socket } from "socket.io";
import {
  getOrCreateRoom,
  addUserToRoom,
  removeUserFromRoom,
  getPublicRooms,
  getRoom,
} from "./rooms.ts";
import { createUser, setUserName, getUser, removeUser } from "./users.ts";
import type { Shape } from "../types";

function isValidRoomId(roomId: any): roomId is string {
  return typeof roomId === "string" && roomId.trim().length > 0;
}

function isValidUserName(name: any): name is string {
  return (
    typeof name === "string" &&
    name.trim().length >= 3 &&
    name.trim().length <= 20
  );
}

/**
 * Minimal validation:
 * - shape has id/authorId/tool/status
 * - authorId must be socket.id
 * - payload exists
 *
 * We keep it minimal to avoid over-engineering.
 */
function isValidShape(shape: any, socketId: string): shape is Shape {
  if (!shape || typeof shape !== "object") return false;

  if (typeof shape.id !== "string") return false;
  if (typeof shape.authorId !== "string") return false;
  if (shape.authorId !== socketId) return false;

  if (typeof shape.tool !== "string") return false;
  if (shape.status !== "drawing" && shape.status !== "done") return false;

  // payload must exist (structure depends on tool, validated client-side for now)
  if (!("payload" in shape)) return false;

  return true;
}

export function registerEvents(io: Server, socket: Socket) {
  createUser(socket.id);

  let currentRoomId: string | null = null;

  /* -----------------------------
     Lobby: get public rooms (refresh only)
  ------------------------------ */
  socket.on("public-rooms:get", () => {
    socket.emit("public-rooms:list", getPublicRooms());
  });

  /* -----------------------------
     Join room (implicit room creation)
     Payload: { roomId, username, roomName?, isPublic? }
     roomName only applied at creation (A)
  ------------------------------ */
  socket.on(
    "join-room",
    (payload: {
      roomId: string;
      username?: string;
      roomName?: string;
      isPublic?: boolean;
    }) => {
      const { roomId, username, roomName, isPublic } = payload || ({} as any);

      if (!isValidRoomId(roomId)) {
        socket.emit("join:error", { code: "BAD_ROOM_ID" });
        return;
      }

      // leave previous room
      if (currentRoomId && currentRoomId !== roomId) {
        socket.leave(currentRoomId);
        removeUserFromRoom(currentRoomId, socket.id);
      }

      // username
      if (isValidUserName(username)) {
        setUserName(socket.id, username);
      }

      // create room if missing (roomName only at creation)
      const roomExisted = Boolean(getRoom(roomId));
      const room = getOrCreateRoom({
        roomId,
        roomName: roomExisted ? undefined : roomName,
        isPublic: isPublic ?? false,
      });

      // capacity
      if (room.users.length >= 5 && !room.users.includes(socket.id)) {
        socket.emit("room-full", { roomId });
        return;
      }

      addUserToRoom(roomId, socket.id);
      socket.join(roomId);
      currentRoomId = roomId;

      const users = room.users
        .map((id) => getUser(id))
        .filter(Boolean)
        .map((u) => ({ id: u!.socketId, name: u!.name }));

      // NOTE: room.strokes currently holds shapes (rename later if you want)
      socket.emit("room-state", {
        roomId: room.roomId,
        roomName: room.roomName,
        users,
        shapes: room.strokes, // better name for client
      });
    }
  );

  /* -----------------------------
     Leave room
  ------------------------------ */
  socket.on("leave-room", (payload: { roomId: string }) => {
    const roomId = payload?.roomId;
    if (!currentRoomId || currentRoomId !== roomId) return;

    socket.leave(roomId);
    removeUserFromRoom(roomId, socket.id);
    currentRoomId = null;
  });

  /* -----------------------------
     Shape start
  ------------------------------ */
  socket.on("shape:start", (shape: Shape) => {
    if (!currentRoomId) return;
    if (!isValidShape(shape, socket.id)) return;

    const room = getRoom(currentRoomId);
    if (!room) return;

    room.strokes.push(shape);
    socket.to(currentRoomId).emit("shape:start", shape);
  });

  /* -----------------------------
     Shape update
     Simple rule: replace payload + status if provided
     Client sends full payload each time (even for brush)
  ------------------------------ */
  socket.on(
    "shape:update",
    (data: {
      id: string;
      authorId: string;
      payload: any;
      status?: "drawing" | "done";
    }) => {
      if (!currentRoomId) return;

      const room = getRoom(currentRoomId);
      if (!room) return;

      if (!data || typeof data.id !== "string") return;
      if (data.authorId !== socket.id) return;
      if (!("payload" in data)) return;

      const shape = room.strokes.find((s: any) => s.id === data.id);
      if (!shape) return;

      // replace payload (keeps server dumb)
      shape.payload = data.payload;
      if (data.status === "drawing" || data.status === "done") {
        shape.status = data.status;
      }

      socket.to(currentRoomId).emit("shape:update", data);
    }
  );

  /* -----------------------------
     Shape end
  ------------------------------ */
  socket.on("shape:end", (data: { id: string; authorId: string }) => {
    if (!currentRoomId) return;

    const room = getRoom(currentRoomId);
    if (!room) return;

    if (!data || typeof data.id !== "string") return;
    if (data.authorId !== socket.id) return;

    const shape = room.strokes.find((s: any) => s.id === data.id);
    if (shape) shape.status = "done";

    socket.to(currentRoomId).emit("shape:end", data);
  });

  /* -----------------------------
     Disconnect cleanup
  ------------------------------ */
  socket.on("disconnect", () => {
    if (currentRoomId) {
      removeUserFromRoom(currentRoomId, socket.id);
    }
    removeUser(socket.id);
    console.log("disconnected:", socket.id);
  });
}
