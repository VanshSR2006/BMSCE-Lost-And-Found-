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
      .populate("lostItem", "title location category description date createdAt")
      .populate("foundItem", "title location category description date createdAt secretDetail _id")
      .populate("requesterLostItem", "title location category description date createdAt")
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
      // Regular users: match or claim notifications
      result = notifications
        .filter((n) => n.lostItem && n.foundItem)
        .map((n) => ({
          _id: n._id,
          message: n.message,
          createdAt: n.createdAt,
          type: n.type || "match",
          lostItem: n.lostItem,
          foundItem: n.foundItem,
          challengeResponse: n.challengeResponse || "",
          requesterLostItem: n.requesterLostItem || null,
          conversationId: n.conversationId || null,
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
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id || req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Notification delete error:", err);
    res.status(500).json({ message: "Failed to delete notification" });
  }
});

module.exports = router;
