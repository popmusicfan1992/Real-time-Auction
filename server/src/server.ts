import http from "http";
import { Server } from "socket.io";
import app from "./app";

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

import { initializeSocket } from "@/socket";

// Socket.io Logic
initializeSocket(io);

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export { io };
