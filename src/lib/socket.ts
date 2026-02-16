import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocketUrl() {
  // En prod: https://ton-socket.onrender.com
  // En dev: fallback localhost
  return process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
}

export function getSocket() {
  if (typeof window === "undefined") {
    throw new Error("getSocket() must be called in the browser (client-side).");
  }

  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("[client] connected:", socket?.id));
    socket.on("disconnect", (reason: string)  =>
      console.log("[client] disconnected:", reason)
    );
  }

  return socket;
}
