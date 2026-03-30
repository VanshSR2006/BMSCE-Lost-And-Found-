const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
    origin: "*", // Adjust for production
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

      // Find conversation to identify recipients
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      // Update redundant lastMessage in conversation for quick list view
      // Increment unreadCount for all participants EXCEPT the sender
      const updateObj = {
        lastMessage: {
          text,
          sender: socket.user.id,
          createdAt: new Date()
        }
      };

      // Prepare $inc object dynamically for all other participants
      const incObj = {};
      conversation.participants.forEach(pId => {
        if (pId.toString() !== socket.user.id.toString()) {
          incObj[`unreadCount.${pId}`] = 1;
        }
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        $set: updateObj,
        $inc: incObj
      });

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
const PORT = process.env.PORT || 5001;

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
