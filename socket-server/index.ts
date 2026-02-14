import { createServer } from "http";
import { Server } from "socket.io";
import { registerEvents } from "./events.ts";


const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*", 
  },
});

io.on("connection", (socket) => {
  console.log("connected:", socket.id);


socket.onAnyOutgoing((event, ...args) => {
  console.log("📤 Event envoyé:", event);
  console.log("📦 Data:", args);
});
  registerEvents(io, socket);
});

httpServer.listen(3001, () => {
  console.log(" Socket server on http://localhost:3001");
});


