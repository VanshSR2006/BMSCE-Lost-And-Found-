const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");
const { GoogleGenAI } = require("@google/genai");
const rateLimit = require("express-rate-limit");
const Groq = require("groq-sdk");

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
console.log(`[AI Init] GEMINI=${!!process.env.GEMINI_API_KEY} | GROQ=${!!process.env.GROQ_API_KEY} | groq client=${!!groq}`);

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
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ============================
   RATE LIMITER FOR AI ENDPOINT
============================ */
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { message: "Too many AI requests. Please wait a moment and try again." }
});

/* ============================
   AI IMAGE ANALYSIS
============================ */
/* ============================
   AI IMAGE ANALYSIS
============================ */
router.post("/analyze-image", aiRateLimiter, authMiddleware, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "No image provided for analysis." });
    }

    // Dynamic verification to ensure variables are actively pulled from Render's runtime env
    if (!ai && !process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: "AI Analysis service is not configured on this server." });
    }

    const extractJsonObject = (text) => {
      if (!text) return null;
      const trimmed = String(text).trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          return JSON.parse(trimmed);
        } catch {
          // fall through to substring extraction
        }
      }
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

    let mimeType = "image/jpeg";
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");
    const imagePart = { inlineData: { data: cleanBase64, mimeType } };

    const candidateModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

    const prompt = `You are an expert visual analyst. Analyze the provided image of a lost or found item and extract its details.

Return ONLY a raw JSON object with EXACTLY these keys:
- "title": a concise, clear title/name of the item (e.g., "Blue Hydro Flask Water Bottle")
- "description": a detailed description of visible features, colors, brands, and condition
- "category": one of the predefined categories: "wallet", "id-card", "bottle", "stationery", "electronics", "other"

Do NOT include any explanatory text, markdown, or placeholders such as "Detected Title" or "Detected Description". If any field cannot be determined, leave it as an empty string.

Example of correct output:
{ "title": "Blue Hydro Flask Water Bottle", "description": "A blue, 500ml hydro flask with a silver lid, slightly scratched", "category": "bottle" }

Analyze the image and return ONLY the JSON.`;

    let responseText = "";
    let usedGroq = false;

    if (ai) {
      try {
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
            const msg = String(e?.message || "").toUpperCase();
            const status = e?.status || e?.code || (e?.statusText ? 429 : null);

            console.warn(`⚠️ Gemini model ${modelName} encountered an error:`, msg);

            // Comprehensive check catching standard daily limits & quota blockages
            if (
              status === 429 ||
              status === 403 ||
              msg.includes("QUOTA") ||
              msg.includes("EXHAUSTED") ||
              msg.includes("LIMIT_EXCEEDED") ||
              msg.includes("429")
            ) {
              console.log("🚨 Gemini Quota hit! Breaking loop to trigger Groq fallback immediately.");
              break;
            }

            // Fallback iteration condition for missing or unsupported region models
            const isModelError =
              status === 404 ||
              msg.includes("NOT FOUND") ||
              msg.includes("NOT SUPPORTED") ||
              msg.includes("MODELS/");

            if (!isModelError) break;
          }
        }

        if (result) {
          responseText =
            typeof result?.text === "string"
              ? result.text
              : typeof result?.text === "function"
                ? result.text()
                : "";
          console.log("🤖 Gemini raw response:", responseText);
        } else {
          usedGroq = true;
        }
      } catch (geminiError) {
        console.warn("⚠️ Gemini execution failed completely, jumping to Groq...", geminiError.message || geminiError);
        usedGroq = true;
      }

      // Check if fallback execution is forced but Groq variables are completely absent
      if (usedGroq && !process.env.GROQ_API_KEY) {
        return res.status(503).json({
          message: "Gemini daily limit exhausted and Groq fallback is not configured on Render environment settings."
        });
      }
    } else {
      usedGroq = true;
    }

    if (usedGroq) {
      // Valid structural models hosted on Groq's cloud infrastructure
      const groqModels = [
        "llama-3.2-11b-vision-preview",
        "llama-3.2-90b-vision-preview"
      ];
      let groqResponse;
      let groqErr;

      // Safe inline initialization protecting backend against early null definition crashes
      const Groq = require("groq-sdk");
      const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

      for (const model of groqModels) {
        try {
          console.log(`⚡ Calling Groq API with model: ${model}...`);
          groqResponse = await groqClient.chat.completions.create({
            model: model,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${cleanBase64}`,
                    },
                  },
                ],
              },
            ],
            response_format: { type: "json_object" }
          });
          groqErr = null;
          break;
        } catch (err) {
          groqErr = err;
          console.warn(`⚠️ Groq model ${model} failed, trying next option...`, err.message || err);
        }
      }

      if (groqResponse) {
        responseText = groqResponse.choices[0].message.content;
        console.log('🤖 Groq raw response:', responseText);
      } else {
        console.error("❌ Groq Fallback Error (all models failed):", groqErr);
        return res.status(500).json({
          message: "AI analysis failed on both Gemini and Groq. Please fill fields manually."
        });
      }
    }

    const parsedData = extractJsonObject(responseText);

    if (!parsedData || typeof parsedData !== "object") {
      return res.status(500).json({ message: "AI returned invalid data structures. Please fill in the fields manually." });
    }

    const safe = {
      title: typeof parsedData.title === "string" ? parsedData.title.trim() : "",
      description: typeof parsedData.description === "string" ? parsedData.description.trim() : "",
      category: typeof parsedData.category === "string" ? parsedData.category.trim() : "",
      provider: usedGroq ? "groq" : "gemini",
    };

    const allowed = new Set(["wallet", "id-card", "bottle", "stationery", "electronics", "other"]);
    if (safe.category) {
      const c = safe.category.toLowerCase();
      safe.category = allowed.has(c) ? c : "";
    }

    if (safe.title && safe.title.toLowerCase().includes("detected")) {
      return res.status(500).json({ message: "AI could not extract real data. Please try another photo or fill in manually." });
    }
    if (safe.description && safe.description.toLowerCase().includes("detected")) {
      return res.status(500).json({ message: "AI could not extract real data. Please try another photo or fill in manually." });
    }

    res.json(safe);

  } catch (err) {
    console.error("❌ AI Analysis Critical Error:", err);
    res.status(500).json({ message: "AI analysis failed completely. Please fill in the fields manually." });
  }
});

/* ============================
   CREATE ITEM + AUTO MATCH
============================ */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { type, title, description, location, date, image, thumbnail, category } = req.body;

    if (!type || !title || !description || !location || !date || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Escape special regex characters to prevent injection
    const escaped = title.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const duplicate = await Item.findOne({
      createdBy: req.user.id,
      title: { $regex: new RegExp(`^${escaped}$`, "i") },
      type,
      category,
      status: "active"
    });

    if (duplicate) {
      console.log("🚫 DUPLICATE PREVENTED:", title, "by user:", req.user.id);
      return res.status(409).json({
        message: `Protocol Overlap: You already have an active ${type} report for "${title}". Please manage existing entries in your dossier.`
      });
    }

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

    const matchType = type === "found" ? "lost" : "found";
    const potentialMatches = await Item.find({
      type: matchType,
      category,
      createdBy: { $ne: req.user.id },
    });

    const hasKeywordMatch = (str1, str2) => {
      const stopwords = new Set(["the", "a", "an", "my", "its", "is", "in", "on", "at", "to", "and", "or", "of"]);
      const words1 = str1.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stopwords.has(w));
      const words2 = str2.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stopwords.has(w));
      return words1.some(word => words2.includes(word));
    };

    console.log(`🔍 Matching ${matchType} items:`, potentialMatches.length);

    for (const match of potentialMatches) {
      const lostItem = type === "lost" ? item : match;
      const foundItem = type === "found" ? item : match;
      const userToNotify = match.createdBy;

      const exists = await Notification.findOne({
        user: userToNotify,
        lostItem: lostItem._id,
        foundItem: foundItem._id,
      });

      if (exists) continue;

      const isHighConfidence = hasKeywordMatch(item.title, match.title);
      const isSafeMatch = new Date(lostItem.createdAt) < new Date(foundItem.createdAt);

      let conversationId = null;

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
   GET MY ITEMS
============================ */
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("❌ GET MINE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch your items" });
  }
});

/* ============================
   GET ALL ITEMS (PAGINATED)
============================ */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;

    const items = await Item.find({ status: "active" })
      .populate("createdBy", "name isUsnVerified")
      .select("-secretDetail")
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);

    res.json(items);
  } catch (err) {
    console.error("❌ GET ITEMS ERROR:", err);
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

    if (!lostItem || lostItem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You must link an active lost report of your own." });
    }

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
    console.error("❌ HANDOVER ERROR:", err);
    res.status(500).json({ message: "Failed to submit request" });
  }
});

/* ============================
   CLAIM ITEM
============================ */
router.put("/:id/claim", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only close your own reports." });
    }

    await item.deleteOne();
    return res.json({ message: "Object signature terminated and entry secured." });

  } catch (err) {
    console.error("❌ CLAIM ERROR:", err);
    res.status(500).json({ message: "Failed to process claim request" });
  }
});

/* ============================
   GET ITEM BY ID
============================ */
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
      } catch {
        // Invalid token ignored, proceed as guest
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

/* ============================
   DELETE ITEM
============================ */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await item.deleteOne();
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

module.exports = router;
