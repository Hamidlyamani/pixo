// users.ts

export type User = {
  socketId: string;
  name: string;
};

const users = new Map<string, User>();

export function createUser(socketId: string): User {
  const user: User = {
    socketId,
    name: `Guest-${socketId.slice(0, 4)}`,
  };
  users.set(socketId, user);
  return user;
}

export function getUser(socketId: string): User | undefined {
  return users.get(socketId);
}

export function setUserName(socketId: string, name: string) {
  const user = users.get(socketId);
  if (!user) return;

  const clean = name.trim().slice(0, 20);
  if (clean.length < 3) return; // simple validation

  user.name = clean;
}

export function removeUser(socketId: string) {
  users.delete(socketId);
}
