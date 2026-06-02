const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Injects variables directly on launch process

/* =====================
   MODELS (Required for Socket Logic)
===================== */
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

/* =====================
   ROUTES
===================== */
const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const chatRoutes = require("./routes/chat");

/* =====================
   APP INIT
===================== */
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production environments safely
    methods: ["GET", "POST"]
  }
});

/* =====================
   MIDDLEWARE
===================== */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =====================
   ROUTES REGISTRATION
===================== */
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/notifications", notificationRoutes);
app.use("/admin", adminRoutes);
app.use("/chat", chatRoutes);

/* =====================
   SOCKET.IO LOGIC
===================== */
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`📡 Socket connected: ${socket.user.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`👥 User ${socket.user.id} joined room: ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    const { conversationId, text } = data;

    try {
      const message = await Message.create({
        conversationId,
        sender: socket.user.id,
        text
      });

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const updateObj = {
        lastMessage: {
          text,
          sender: socket.user.id,
          createdAt: new Date()
        }
      };

      const socketsInRoom = await io.in(conversationId).fetchSockets();
      const activeUserIds = socketsInRoom.map(s => s.user.id.toString());

      const incObj = {};
      conversation.participants.forEach(pId => {
        const pIdStr = pId.toString();
        if (pIdStr !== socket.user.id.toString() && !activeUserIds.includes(pIdStr)) {
          incObj[`unreadCount.${pIdStr}`] = 1;
        }
      });

      if (Object.keys(incObj).length > 0) {
        await Conversation.findByIdAndUpdate(conversationId, {
          $set: updateObj,
          $inc: incObj
        });
      } else {
        await Conversation.findByIdAndUpdate(conversationId, {
          $set: updateObj
        });
      }

      io.to(conversationId).emit("new_message", message);
    } catch (err) {
      console.error("❌ Socket message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.user.id}`);
  });
});

/* =====================
   DB + SERVER START
===================== */
const PORT = Number(process.env.PORT) || 5004;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server + Socket.IO running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });