const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Item = require("../models/Item");
const jwt = require("jsonwebtoken");

/* =====================
   AUTH MIDDLEWARE
===================== */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* =====================
   MARK AS READ
===================== */
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await Conversation.findByIdAndUpdate(req.params.id, {
      $set: { [`unreadCount.${userId}`]: 0 }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear unread count" });
  }
});

/* =====================
   GET ALL CONVERSATIONS
===================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const convs = await Conversation.find({
      participants: userId,
      status: "active"
    })
    .populate("participants", "name email role phone")
    .populate("associatedItem", "title type location category")
    .sort({ "lastMessage.createdAt": -1 });

    res.json(convs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load chats" });
  }
});

/* =====================
   GET SINGLE CONVERSATION
===================== */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const conv = await Conversation.findOne({
      _id: req.params.id,
      participants: userId
    })
    .populate("participants", "name email role phone")
    .populate("associatedItem", "title type location category");

    if (!conv) return res.status(404).json({ message: "Chat not found" });

    res.json(conv);
  } catch (err) {
    res.status(500).json({ message: "Failed to load chat" });
  }
});

/* =====================
   GET MESSAGES
===================== */
router.get("/:id/messages", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const messages = await Message.find({ conversationId: req.params.id })
      .sort({ createdAt: 1 });
    
    // Clear unread count for this user when they fetch messages
    await Conversation.findByIdAndUpdate(req.params.id, {
      $set: { [`unreadCount.${userId}`]: 0 }
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages" });
  }
});

/* =====================
   INITIATE CHAT (from match)
===================== */
router.post("/initiate", authMiddleware, async (req, res) => {
  const { notificationId } = req.body;
  const currentUserId = req.user.id || req.user._id;

  try {
    const notification = await Notification.findById(notificationId)
      .populate("lostItem")
      .populate("foundItem");

    if (!notification || !notification.lostItem || !notification.foundItem) {
      return res.status(400).json({ message: "Match data incomplete or parent item deleted." });
    }

    // Determine the "other" person
    const lostOwner = notification.lostItem.createdBy?.toString();
    const foundOwner = notification.foundItem.createdBy?.toString();

    if (!lostOwner || !foundOwner) {
      return res.status(404).json({ message: "Item ownership data missing." });
    }

    const otherUserId = currentUserId === lostOwner ? foundOwner : lostOwner;

    // Check if conversation already exists for this pair and item
    let conv = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
      associatedItem: notification.lostItem._id
    });

    if (!conv) {
      conv = await Conversation.create({
        participants: [currentUserId, otherUserId],
        associatedItem: notification.lostItem._id,
        lastMessage: {
          text: `Match found for: ${notification.lostItem.title}`,
          sender: currentUserId
        }
      });

      // 1. Mark the source notification as accepted
      await Notification.findByIdAndUpdate(notificationId, { 
        status: "accepted",
        conversationId: conv._id 
      });

      // 2. Notify the other user (Claimant/Founder) with a DIRECT chat link
      await Notification.create({
        user: otherUserId,
        message: `Secure Link Established: Communication for ${notification.lostItem.title} is now active.`,
        status: "pending",
        type: "match",
        conversationId: conv._id,
        lostItem: notification.lostItem._id,
        foundItem: notification.foundItem._id
      });
    }

    res.json(conv);
  } catch (err) {
    console.error("❌ Init error:", err);
    res.status(500).json({ message: "Failed to initiate chat" });
  }
});

/* =====================
   CLOSE CHAT
===================== */
router.put("/:id/close", authMiddleware, async (req, res) => {
  const { reason } = req.body;
  const conversationId = req.params.id;
  const reporterId = req.user.id || req.user._id;

  try {
    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Chat not found" });

    // 🛡️ Handle misconduct reporting (Sector Guard Protocol)
    if (reason === "misbehaving") {
      try {
        const reporterIdStr = reporterId.toString();
        const p1 = conv.participants[0].toString();
        const p2 = conv.participants[1].toString();
        const reportedUserId = p1 === reporterIdStr ? p2 : p1;

        console.log(`[Sector Guard] Incident Reported by ${reporterIdStr} against ${reportedUserId}`);

        if (reportedUserId) {
          // 1. Notify the misbehaving user (Warning)
          try {
            await Notification.create({
              user: reportedUserId,
              message: "⚠️ Sector Guard: Please follow campus guidelines. Misconduct has been reported in your recent secure link. Be polite.",
              type: "system",
              status: "pending"
            });
          } catch (e) {
            console.error("❌ Failed to warn offender:", e.message);
          }

          // 2. Notify the reporter (Confirmation)
          try {
            await Notification.create({
              user: reporterId,
              message: "🛡️ Report Logged: The sector guard has issued a formal warning to the other user. Security protocol maintained.",
              type: "system",
              status: "pending"
            });
          } catch (e) {
            console.error("❌ Failed to notify reporter:", e.message);
          }
        }
      } catch (err) {
        console.error("❌ Critical Sector Guard Logic Error:", err.message);
      }
    }

    // 🏆 Handle successful handover (Item Return/Receipt)
    if (reason === "received") {
      try {
        console.log(`[Sector Handover] Closing link: ${conversationId}. Finalizing return protocol...`);
        
        // Find the notification that spawned this chat or is linked to it
        // This gives us access to BOTH the lost and found item records.
        const sourceMatch = await Notification.findOne({ conversationId });
        
        if (sourceMatch) {
          const itemsToDelete = [];
          if (sourceMatch.lostItem) itemsToDelete.push(sourceMatch.lostItem);
          if (sourceMatch.foundItem) itemsToDelete.push(sourceMatch.foundItem);

          if (itemsToDelete.length > 0) {
            const deleteResult = await Item.deleteMany({ _id: { $in: itemsToDelete } });
            console.log(`[Sector Cleanup] Deleted ${deleteResult.deletedCount} items linked to chat: ${conversationId}`);
          }
        } else if (conv.associatedItem) {
          // Fallback: If no notification found, try deleting the single associatedItem from the conversation itself
          await Item.findByIdAndDelete(conv.associatedItem);
          console.log(`[Sector Cleanup] Deleted single associated item: ${conv.associatedItem}`);
        }
      } catch (err) {
        console.error("❌ Handover cleanup error:", err.message);
      }
    }

    await Conversation.findByIdAndUpdate(conversationId, { status: "closed" });
    res.json({ success: true, message: "Link terminated." });
  } catch (err) {
    console.error("❌ Close chat error:", err);
    res.status(500).json({ message: "Failed to close chat" });
  }
});

module.exports = router;
