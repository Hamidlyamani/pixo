// rooms.ts

export type Room = {
  roomId: string;
  roomName: string;
  isPublic: boolean;
  users: string[]; // socketIds
  strokes: any[];  // replace later with Stroke[]
};

type CreateRoomInput = {
  roomId: string;
  roomName?: string;
  isPublic?: boolean;
};

const rooms: Record<string, Room> = {};

export function getRoom(roomId: string): Room | undefined {
  return rooms[roomId];
}

export function getOrCreateRoom(input: CreateRoomInput): Room {
  const { roomId, roomName, isPublic } = input;

  if (!rooms[roomId]) {
    rooms[roomId] = {
      roomId,
      roomName: (roomName?.trim() || "Untitled room").slice(0, 30),
      isPublic: Boolean(isPublic),
      users: [],
      strokes: [],
    };
  } else {
    // Optional: allow setting roomName only if not already set
    // (keeps it simple and avoids random overwrites)
    if (roomName && rooms[roomId].roomName === "Untitled room") {
      rooms[roomId].roomName = roomName.trim().slice(0, 30);
    }

    // Optional: allow making room public later (only if explicitly passed)
    if (typeof isPublic === "boolean") {
      rooms[roomId].isPublic = isPublic;
    }
  }

  return rooms[roomId];
}

export function addUserToRoom(roomId: string, socketId: string) {
  const room = rooms[roomId];
  if (!room) return;

  if (!room.users.includes(socketId)) {
    room.users.push(socketId);
  }
}

export function removeUserFromRoom(roomId: string, socketId: string) {
  const room = rooms[roomId];
  if (!room) return;

  room.users = room.users.filter((id) => id !== socketId);

  if (room.users.length === 0) {
    delete rooms[roomId]; // cleanup
  }
}

export function getPublicRooms(): Array<{
  roomId: string;
  roomName: string;
  usersCount: number;
}> {
  return Object.values(rooms)
    .filter((r) => r.isPublic)
    .map((r) => ({
      roomId: r.roomId,
      roomName: r.roomName,
      usersCount: r.users.length,
    }));
}
