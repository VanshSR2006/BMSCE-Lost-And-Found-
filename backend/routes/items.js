const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");

/* ============================
   AUTH MIDDLEWARE
============================ */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ============================
   CREATE ITEM + AUTO MATCH ✅
============================ */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      location,
      date,
      image,
      thumbnail,
      category,
    } = req.body;

    if (!type || !title || !description || !location || !date || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Create item
    const item = await Item.create({
      type,
      title,
      description,
      location,
      date,
      image: image || null,
      thumbnail: thumbnail || null,
      category,
      secretDetail: req.body.secretDetail || "",
      createdBy: req.user.id,
    });

    console.log("✅ ITEM CREATED:", item.type, item.category);

    /* ============================
       BIDIRECTIONAL AUTO MATCHING
    ============================ */
    const matchType = type === "found" ? "lost" : "found";
    const potentialMatches = await Item.find({
      type: matchType,
      category,
      createdBy: { $ne: req.user.id },
    });

    const hasKeywordMatch = (str1, str2) => {
      const words1 = str1.toLowerCase().split(/\W+/).filter(w => w.length > 2);
      const words2 = str2.toLowerCase().split(/\W+/).filter(w => w.length > 2);
      return words1.some(word => words2.includes(word));
    };

    console.log(`🔍 Matching ${matchType} items:`, potentialMatches.length);

    for (const match of potentialMatches) {
      const lostItem = type === "lost" ? item : match;
      const foundItem = type === "found" ? item : match;
      const userToNotify = match.createdBy;

      // 1. Check for Duplicate Notifications for the match
      const exists = await Notification.findOne({
        user: userToNotify,
        lostItem: lostItem._id,
        foundItem: foundItem._id,
      });

      if (exists) continue;

      // 2. Similarity & Safety Check
      const isHighConfidence = hasKeywordMatch(item.title, match.title);
      const isSafeMatch = new Date(lostItem.createdAt) < new Date(foundItem.createdAt);
      
      let conversationId = null;

      // 3. Auto-Create Conversation ONLY for High-Confidence Safe Matches
      if (isSafeMatch && isHighConfidence) {
         let conv = await Conversation.findOne({
           participants: { $all: [req.user.id, userToNotify] },
           associatedItem: lostItem._id
         });

         if (!conv) {
           conv = await Conversation.create({
             participants: [req.user.id, userToNotify],
             associatedItem: lostItem._id,
             lastMessage: {
               text: `Neural Sync: Match found for ${lostItem.title}. Communication port open.`,
               sender: req.user.id
             }
           });
           
           await Message.create({
             conversationId: conv._id,
             sender: req.user.id,
             text: `Welcome. Both reports verified. Please coordinate secure handover.`,
             type: "system"
           });
         }
         conversationId = conv._id;
      }

      // 4. Create Notification for the user
      await Notification.create({
        user: userToNotify,
        lostItem: lostItem._id,
        foundItem: foundItem._id,
        status: "pending",
        type: "match",
        message: conversationId 
          ? `Neural Sync: Secure Match Located for ${lostItem.title}!` 
          : `Potential Sector Match for ${lostItem.title}. Verification required.`,
        conversationId: conversationId 
      });

      console.log("🔔 Notification sent to user:", userToNotify.toString(), "Safe/Confident:", !!conversationId);
    }

    res.status(201).json({ message: "Item posted successfully", item });
  } catch (err) {
    console.error("❌ CREATE ITEM ERROR:", err);
    res.status(500).json({ message: "Failed to create item" });
  }
});

/* ============================
   OTHER ROUTES (SANITIZED)
============================ */
router.get("/mine", authMiddleware, async (req, res) => {
  const items = await Item.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
  res.json(items);
});

router.get("/", async (req, res) => {
  // Exclude secretDetail from public listing and only show active items
  const items = await Item.find({ status: "active" }).select("-secretDetail").sort({ createdAt: -1 });
  res.json(items);
});

/* ============================
   REQUEST SECURE HANDOVER
============================ */
router.post("/:id/request-handover", authMiddleware, async (req, res) => {
  try {
    const { challengeResponse, lostItemId } = req.body;
    const foundItem = await Item.findById(req.params.id);
    const lostItem = await Item.findById(lostItemId);

    if (!foundItem || foundItem.type !== "found") {
      return res.status(404).json({ message: "Found item not found" });
    }

    // Security: Requester must own the lost item
    if (!lostItem || lostItem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You must link an active lost report of your own." });
    }

    // Create Notification for the Founder
    await Notification.create({
      user: foundItem.createdBy,
      lostItem: lostItem._id,
      foundItem: foundItem._id,
      type: "claim_request",
      message: `Direct claim request from ${req.user.name || "Anonymous User"}`,
      challengeResponse,
      requesterLostItem: lostItem._id,
      status: "pending"
    });

    res.json({ message: "Claim request submitted securely." });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit request" });
  }
});

/* ============================
   CLAIM ITEM (SECURE HANDOVER)
============================ */
router.put("/:id/claim", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Only owner can close/claim their own found item now
    if (item.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only close your own reports. Handover is handled via secure chat." });
    }

    await item.deleteOne();
    return res.json({ message: "Object signature terminated and entry secured." });

  } catch (err) {
    console.error("❌ CLAIM ERROR:", err);
    res.status(500).json({ message: "Failed to process claim request" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  
  // Only show secretDetail to owner or admin
  const isOwner = req.user && req.user.id === item.createdBy.toString();
  const isAdmin = req.user && req.user.role === "admin";
  
  const itemData = item.toObject();
  if (!isOwner && !isAdmin) {
    delete itemData.secretDetail;
  }
  
  res.json(itemData);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  if (item.createdBy.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized" });

  await item.deleteOne();
  res.json({ message: "Item deleted successfully" });
});

module.exports = router;
