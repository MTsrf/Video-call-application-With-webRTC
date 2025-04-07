import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";

interface User {
  id: string;
  socketId: string;
}

interface Message {
  content: string;
  sender: string;
  timestamp: number;
}

interface Room {
  users: User[];
  messages: Message[];
}

const app = express();
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms: Record<string, Room> = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (roomId: string, userId: string) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        messages: [],
      };
    }

    rooms[roomId].users.push({
      id: userId,
      socketId: socket.id,
    });

    const existingUsers = rooms[roomId].users.filter(
      (user) => user.socketId !== socket.id
    );
    socket.emit("existing-users", existingUsers);

    socket.to(roomId).emit("user-connected", userId, socket.id);

    socket.emit("get-messages", rooms[roomId].messages);

    console.log(`User ${userId} joined room ${roomId}`);

    socket.on("offer", (offer: RTCSessionDescriptionInit) => {
      socket.to(roomId).emit("offer", offer, userId);
    });

    socket.on("answer", (answer: RTCSessionDescriptionInit) => {
      socket.to(roomId).emit("answer", answer, userId);
    });

    socket.on("ice-candidate", (candidate: RTCIceCandidateInit) => {
      socket.to(roomId).emit("ice-candidate", candidate, userId);
    });

    socket.on("send-message", (message: string) => {
      console.log({ message });
      const messageData: Message = {
        content: message,
        sender: userId,
        timestamp: Date.now(),
      };

      rooms[roomId].messages.push(messageData);

      io.to(roomId).emit("receive-message", messageData);
    });

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected from room ${roomId}`);

      if (rooms[roomId]) {
        rooms[roomId].users = rooms[roomId].users.filter(
          (user) => user.socketId !== socket.id
        );

        if (rooms[roomId].users.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} has been removed (empty)`);
        } else {
          socket.to(roomId).emit("user-disconnected", userId);
        }
      }
    });
  });
});

if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
