const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

/* =====================
   ROUTES
===================== */
const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
/* =====================
   APP INIT (⚠️ MUST COME FIRST)
===================== */
const app = express();

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
/* =====================
   DB + SERVER START
===================== */
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT} (accessible on local network)`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
