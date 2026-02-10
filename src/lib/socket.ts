import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:3001", {
      transports: ["websocket"],
    });
    socket.on("disconnect", (reason: any) =>
      console.log("[client] disconnected:", reason)
    );
  }
  return socket;
}


