import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import dbConnection from "./database/dbConnection.js";
import { globalError } from "./src/middleware/globalError.js";
import userRouter from "./src/modules/user/userRouter.js";
import messageRouter from "./src/modules/message/messageRouter.js";

dotenv.config();

const app = express();
app.use(express.json());

// Attach socket.io to app for access in route handlers
const server = http.createServer(app);
app.use(cors({ origin: "https://chat-app-react-livid.vercel.app" }));

const io = new Server(server, {
  cors: {
    origin: "https://chat-app-react-livid.vercel.app",
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

// Routes
app.get("/", (req, res) => {
  res.send("Server is running...");
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/messages", messageRouter);
app.use(globalError);

// WebSocket Users Store
const users = {};

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Register user socket
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID: ${socket.id}`);
  });

  // Handle private messages
  socket.on("send_private_message", ({ sender, receiver, message }) => {
    const receiverSocketId = users[receiver];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_private_message", {
        sender,
        message,
      });
    } else {
      console.log(`User ${receiver} is offline or not registered`);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    Object.keys(users).forEach((userId) => {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`User ${userId} disconnected`);
      }
    });
  });
});

// Connect to database
dbConnection();

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
