const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const Item = require("../models/Item");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");
const { GoogleGenAI } = require("@google/genai");

// Rate limiter: max 10 AI analysis requests per minute per IP
const analyzeImageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many analysis requests. Please wait a moment and try again." },
  standardHeaders: true,
  legacyHeaders: false,
});

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;


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
   AI IMAGE ANALYSIS
============================ */
router.post("/analyze-image", analyzeImageLimiter, authMiddleware, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "No image provided for analysis." });
    }

    if (!ai) {
      return res.status(500).json({ message: "AI Analysis service is not configured on this server." });
    }

    const extractJsonObject = (text) => {
      if (!text) return null;
      const trimmed = String(text).trim();
      // If model already returned pure JSON, parse directly.
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          return JSON.parse(trimmed);
        } catch {
          // fall through to substring extraction
        }
      }
      // Otherwise, try to extract the first {...} block.
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      if (start >= 0 && end > start) {
        const candidate = trimmed.slice(start, end + 1);
        try {
          return JSON.parse(candidate);
        } catch {
          return null;
        }
      }
      return null;
    };

    // Extract mime type (e.g. data:image/png;base64,... -> image/png)
    let mimeType = "image/jpeg";
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = { inlineData: { data: cleanBase64, mimeType } };

    // Gemini 1.5 is shutdown; use current models.
    // FIX: "gemini-3.5-flash" does not exist; replaced with "gemini-2.0-flash"
    const candidateModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
    const prompt = `You are an expert visual analyst. Analyze the provided image of a lost or found item and extract its details.

Return ONLY a raw JSON object with EXACTLY these keys:
- "title": a concise, clear title/name of the item (e.g., "Blue Hydro Flask Water Bottle")
- "description": a detailed description of visible features, colors, brands, and condition
- "category": one of the predefined categories: "wallet", "id-card", "bottle", "stationery", "electronics", "other"

Do NOT include any explanatory text, markdown, or placeholders such as "Detected Title" or "Detected Description". If any field cannot be determined, leave it as an empty string.

Example of correct output:
{ "title": "Blue Hydro Flask Water Bottle", "description": "A blue, 500ml hydro flask with a silver lid, slightly scratched," "category": "bottle" }

Analyze the image and return ONLY the JSON.
`;


    // NOTE: The Generative AI SDK expects "parts" (text + inlineData).
    // Also: model availability differs by key/project. Try a small set of candidates.
    let result;
    let lastErr;
    for (const modelName of candidateModels) {
      try {
        result = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }, imagePart],
            },
          ],
        });
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        // Try next model only for "model not found / not supported" type errors
        const msg = String(e?.message || "");
        const status = e?.status || e?.code;
        const isModelError =
          status === 404 ||
          msg.includes("is not found") ||
          msg.includes("not supported for generateContent") ||
          msg.includes("models/");
        if (!isModelError) break;
      }
    }

    if (!result) {
      console.error("❌ AI Analysis Error (no model succeeded):", lastErr);
      // Detect permission related errors
      const errMsg = String(lastErr?.message || "");
      const statusCode = lastErr?.status || lastErr?.code;
      if (statusCode === 403 || errMsg.toLowerCase().includes("permission")) {
        return res.status(403).json({
          message:
            "AI service unavailable: provided GEMINI_API_KEY lacks required permissions. Please verify your API key.",
        });
      }
      return res.status(500).json({
        message:
          "AI model unavailable on this server key. Please try again later or fill fields manually.",
      });
    }

    const responseText =
      typeof result?.text === "string"
        ? result.text
        : typeof result?.text === "function"
          ? result.text()
          : "";
    console.log('🤖 Gemini raw response:', responseText);
    const parsedData = extractJsonObject(responseText);
    if (!parsedData || typeof parsedData !== "object") {
      return res.status(500).json({ message: "AI returned invalid JSON. Please try again or fill fields manually." });
    }

    // Normalize & validate output shape
    const safe = {
      title: typeof parsedData.title === "string" ? parsedData.title.trim() : "",
      description: typeof parsedData.description === "string" ? parsedData.description.trim() : "",
      category: typeof parsedData.category === "string" ? parsedData.category.trim() : "",
    };

    // Strict category normalization
    const allowed = new Set(["wallet", "id-card", "bottle", "stationery", "electronics", "other"]);
    if (safe.category) {
      const c = safe.category.toLowerCase();
      safe.category = allowed.has(c) ? c : "";
    }

    // Detect placeholder values
    if (safe.title && safe.title.toLowerCase().includes('detected')) {
      console.warn('⚠️ Placeholder title detected, rejecting response');
      return res.status(500).json({ message: 'AI could not extract real data. Please try another photo or fill manually.' });
    }
    if (safe.description && safe.description.toLowerCase().includes('detected')) {
      console.warn('⚠️ Placeholder description detected, rejecting response');
      return res.status(500).json({ message: 'AI could not extract real data. Please try another photo or fill manually.' });
    }
    res.json(safe);

  } catch (err) {
    console.error("❌ AI Analysis Error:", err);
    res.status(500).json({ message: "AI analysis failed. Please fill the fields manually." });
  }
});

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

    // ✅ ROBUST DUPLICATE GUARD
    // Prevent multiple active reports from the same user for the same item title/category
    // FIX: Escape regex special characters to prevent regex injection attacks
    const escapedTitle = title.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const duplicate = await Item.findOne({
      createdBy: req.user.id,
      title: { $regex: new RegExp(`^${escapedTitle}$`, "i") },
      type,
      category,
      status: "active"
    });

    if (duplicate) {
      console.log("🚫 ROBUST DUPLICATE PREVENTED:", title, "by user:", req.user.id);
      return res.status(409).json({ 
        message: `Protocol Overlap: You already have an active ${type} report for "${title}". Please manage existing entries in your dossier.` 
      });
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

    // FIX: Run per-match DB work in parallel instead of sequentially
    await Promise.all(potentialMatches.map(async (match) => {
      const lostItem = type === "lost" ? item : match;
      const foundItem = type === "found" ? item : match;
      const userToNotify = match.createdBy;

      // 1. Check for Duplicate Notifications for the match
      const exists = await Notification.findOne({
        user: userToNotify,
        lostItem: lostItem._id,
        foundItem: foundItem._id,
      });

      if (exists) return;

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
          // Run conversation + initial message creation in parallel
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
    }));

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
  try {
    const items = await Item.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("❌ GET /mine ERROR:", err);
    res.status(500).json({ message: "Failed to fetch your items" });
  }
});

router.get("/", async (req, res) => {
  try {
    // FIX: Add pagination to avoid fetching all items at once
    const page = Math.max(0, parseInt(req.query.page) || 0);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);

    const items = await Item.find({ status: "active" })
      .populate("createdBy", "name isUsnVerified")
      .select("-secretDetail")
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);

    const total = await Item.countDocuments({ status: "active" });
    res.json({ items, total, page, limit });
  } catch (err) {
    console.error("❌ GET / ERROR:", err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
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

router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("createdBy", "name isUsnVerified");
    if (!item) return res.status(404).json({ message: "Item not found" });
    
    let isOwner = false;
    let isAdmin = false;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const creatorId = item.createdBy._id || item.createdBy;
        isOwner = decoded.id === creatorId.toString();
        isAdmin = decoded.role === "admin";
      } catch (err) {
        // Invalid token is ignored, proceed as guest
      }
    }
    
    const itemData = item.toObject();
    if (!isOwner && !isAdmin) {
      delete itemData.secretDetail;
    }
    
    res.json(itemData);
  } catch (err) {
    console.error("❌ GET ITEM ERROR:", err);
    res.status(500).json({ message: "Failed to fetch item details" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await item.deleteOne();
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE ITEM ERROR:", err);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

module.exports = router;
