// rooms.ts
export type Room = {
  roomId: string;
  roomName: string;
  isPublic: boolean;
  ownerId: string;   // ✅ NEW
  users: string[];   // socketIds
  strokes: any[];
};

type CreateRoomInput = {
  roomId: string;
  roomName?: string;
  isPublic?: boolean;
  ownerId: string;   // ✅ NEW
};

const rooms: Record<string, Room> = {};

export function getRoom(roomId: string): Room | undefined {
  return rooms[roomId];
}

export function getOrCreateRoom(input: CreateRoomInput): Room {
  const { roomId, roomName, isPublic, ownerId } = input;

  if (!rooms[roomId]) {
    rooms[roomId] = {
      roomId,
      roomName: (roomName?.trim() || "Untitled room").slice(0, 30),
      isPublic: Boolean(isPublic),
      ownerId,
      users: [],
      strokes: [],
    };
  } else {
    if (roomName && rooms[roomId].roomName === "Untitled room") {
      rooms[roomId].roomName = roomName.trim().slice(0, 30);
    }
    if (typeof isPublic === "boolean") {
      rooms[roomId].isPublic = isPublic;
    }
  }

  return rooms[roomId];
}

export function addUserToRoom(roomId: string, socketId: string) {
  const room = rooms[roomId];
  if (!room) return;
  if (!room.users.includes(socketId)) room.users.push(socketId);
}

export function removeUserFromRoom(roomId: string, socketId: string) {
  const room = rooms[roomId];
  if (!room) return;

  room.users = room.users.filter((id) => id !== socketId);

  if (room.users.length === 0) {
    delete rooms[roomId];
  }
}

export function getPublicRooms(): Array<{ roomId: string; roomName: string; usersCount: number }> {
  return Object.values(rooms)
    .filter((r) => r.isPublic)
    .map((r) => ({ roomId: r.roomId, roomName: r.roomName, usersCount: r.users.length }));
}
