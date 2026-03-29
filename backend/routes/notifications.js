const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

/* =====================
   AUTH MIDDLEWARE
===================== */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* =====================
   GET MY NOTIFICATIONS ✅
===================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    const notifications = await Notification.find({
      user: userId,
      status: "pending",
    })
      .populate("lostItem", "title location category")
      .populate("foundItem", "title location category _id")
      .sort({ createdAt: -1 });

    let result;

    if (userRole === "admin") {
      // Admins get handover request notifications (foundItem set, lostItem missing)
      result = notifications
        .filter((n) => n.foundItem) // admin notifications always have foundItem
        .map((n) => ({
          _id: n._id,
          message: n.message,
          createdAt: n.createdAt,
          type: "handover_request",
          foundItem: n.foundItem,
          lostItem: n.lostItem || null,
        }));
    } else {
      // Regular users: match notifications require both lostItem and foundItem
      result = notifications
        .filter((n) => n.lostItem && n.foundItem)
        .map((n) => ({
          _id: n._id,
          message: n.message,
          createdAt: n.createdAt,
          type: "match",
          lostItem: n.lostItem,
          foundItem: n.foundItem,
        }));
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Notification fetch error:", err);
    res.status(500).json({ message: "Failed to load notifications" });
  }
});

/* =====================
   CLEAR NOTIFICATION
===================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
