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
import { nanoid } from "nanoid";

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
 */
function isValidShape(shape: any, socketId: string): shape is Shape {
  if (!shape || typeof shape !== "object") return false;

  if (typeof shape.id !== "string") return false;
  if (typeof shape.authorId !== "string") return false;
  if (shape.authorId !== socketId) return false;

  if (typeof shape.tool !== "string") return false;
  if (shape.status !== "drawing" && shape.status !== "done") return false;

  if (!("payload" in shape)) return false;

  return true;
}

export function registerEvents(io: Server, socket: Socket) {
  createUser(socket.id);

  let currentRoomId: string | null = null;

  const usersPayload = (roomId: string) => {
    const room = getRoom(roomId);
    if (!room) return [];
    return room.users
      .map((id) => getUser(id))
      .filter(Boolean)
      .map((u) => ({ id: u!.socketId, name: u!.name }));
  };

  socket.on("public-rooms:get", () => {
    socket.emit("public-rooms:list", getPublicRooms());
  });

  // ✅ CREATE
  socket.on(
    "room:create",
    (payload: { roomName?: string; isPublic?: boolean; username?: string }) => {
      const username = payload?.username;
      if (username && !isValidUserName(username)) {
        socket.emit("room:error", { code: "BAD_USERNAME" });
        return;
      }
      if (username) setUserName(socket.id, username);

      const roomId = nanoid(10);
      const roomName = (payload?.roomName?.trim() || "Untitled room").slice(0, 30);
      const isPublic = Boolean(payload?.isPublic);

      const room = getOrCreateRoom({
        roomId,
        roomName,
        isPublic,
        ownerId: socket.id,
      });

      addUserToRoom(roomId, socket.id);
      socket.join(roomId);
      currentRoomId = roomId;

      socket.emit("room:created", {
        roomId,
        roomName: room.roomName,
        isPublic: room.isPublic,
      });

      socket.emit("room:state", {
        roomId: room.roomId,
        roomName: room.roomName,
        isPublic: room.isPublic,
        ownerId: room.ownerId,
        users: usersPayload(roomId),
        shapes: room.strokes,
      });

      io.to(roomId).emit("room:users", { roomId, users: usersPayload(roomId) });
    }
  );

  // ✅ JOIN
  socket.on("room:join", (payload: { roomId: string; username?: string }) => {
    const roomId = payload?.roomId;
    const username = payload?.username;

    if (!isValidRoomId(roomId)) {
      socket.emit("room:error", { code: "BAD_ROOM_ID" });
      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      socket.emit("room:error", { code: "ROOM_NOT_FOUND" });
      return;
    }

    if (username && !isValidUserName(username)) {
      socket.emit("room:error", { code: "BAD_USERNAME" });
      return;
    }
    if (username) setUserName(socket.id, username);

    if (currentRoomId && currentRoomId !== roomId) {
      socket.leave(currentRoomId);
      removeUserFromRoom(currentRoomId, socket.id);
    }

    addUserToRoom(roomId, socket.id);
    socket.join(roomId);
    currentRoomId = roomId;

    socket.emit("room:state", {
      roomId: room.roomId,
      roomName: room.roomName,
      isPublic: room.isPublic,
      ownerId: room.ownerId,
      users: usersPayload(roomId),
      shapes: room.strokes,
    });

    io.to(roomId).emit("room:users", { roomId, users: usersPayload(roomId) });
  });

  // ✅ OWNER-ONLY visibility
  socket.on("room:set-public", (payload: { roomId: string; isPublic: boolean }) => {
    const { roomId, isPublic } = payload || ({} as any);

    if (!isValidRoomId(roomId)) {
      socket.emit("room:error", { code: "BAD_ROOM_ID" });
      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      socket.emit("room:error", { code: "ROOM_NOT_FOUND" });
      return;
    }

    if (room.ownerId !== socket.id) {
      socket.emit("room:error", { code: "NOT_OWNER" });
      return;
    }

    room.isPublic = Boolean(isPublic);

    io.to(roomId).emit("room:visibility", {
      roomId,
      isPublic: room.isPublic,
    });
  });

  socket.on("room:get-invite", (payload: { roomId: string }) => {
    const roomId = payload?.roomId;

    if (!isValidRoomId(roomId)) {
      socket.emit("room:error", { code: "BAD_ROOM_ID" });
      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      socket.emit("room:error", { code: "ROOM_NOT_FOUND" });
      return;
    }

    socket.emit("room:invite", {
      roomId,
      roomName: room.roomName,
      isPublic: room.isPublic,
      ownerId: room.ownerId,
    });
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
     Shape update (payload)
  ------------------------------ */
  socket.on(
    "shape:update",
    (data: { id: string; authorId: string; payload: any; status?: "drawing" | "done" }) => {
      if (!currentRoomId) return;

      const room = getRoom(currentRoomId);
      if (!room) return;

      if (!data || typeof data.id !== "string") return;
      if (data.authorId !== socket.id) return;
      if (!("payload" in data)) return;

      const shape = room.strokes.find((s: any) => s.id === data.id);
      if (!shape) return;

      shape.payload = data.payload;
      if (data.status === "drawing" || data.status === "done") {
        shape.status = data.status;
      }

      socket.to(currentRoomId).emit("shape:update", data);
    }
  );

  /* -----------------------------
     ✅ Shape transform (NEW)
     Rule: store transform on the shape object (doesn't touch payload)
  ------------------------------ */
  socket.on(
    "shape:transform",
    (data: {
      id: string;
      authorId: string;
      transform: any; // keep minimal, client ensures structure
      status?: "drawing" | "done";
    }) => {
      if (!currentRoomId) return;

      const room = getRoom(currentRoomId);
      if (!room) return;

      if (!data || typeof data.id !== "string") return;
      if (data.authorId !== socket.id) return;
      if (!("transform" in data)) return;

      const shape = room.strokes.find((s: any) => s.id === data.id);
      if (!shape) return;

      // store transform separately
      (shape as any).transform = data.transform;

      if (data.status === "drawing" || data.status === "done") {
        shape.status = data.status;
      }

      socket.to(currentRoomId).emit("shape:transform", data);
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
    if (currentRoomId) removeUserFromRoom(currentRoomId, socket.id);
    removeUser(socket.id);
  });
}
