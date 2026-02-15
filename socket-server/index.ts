import { createServer } from "http";
import { Server } from "socket.io";
import { registerEvents } from "./events.ts";

const PORT = Number(process.env.PORT ?? 3001);

// En prod: mets FRONTEND_URL = "https://ton-front.onrender.com"
const FRONTEND_URL = process.env.FRONTEND_URL;

// En dev: autorise localhost
const devOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

// Petit handler HTTP (Render / healthcheck / debug)
const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("Socket server is running");
});

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL ? [FRONTEND_URL, ...devOrigins] : devOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // Si tu veux garder tes logs outgoing, mets-les seulement en dev:
  if (process.env.NODE_ENV !== "production") {
    socket.onAnyOutgoing((event, ...args) => {
      
    });
  }

  registerEvents(io, socket);
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket server on port ${PORT}`);
  if (FRONTEND_URL) console.log("Allowed origin:", FRONTEND_URL);
});

