const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const jwt = require("jsonwebtoken");

// -------------------- AUTH MIDDLEWARE --------------------
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains id + role
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// -------------------- CREATE ITEM --------------------
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const item = new Item({
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      image: req.body.image,
      createdBy: req.user.id
    });

    await item.save();
    res.json({ message: "Item posted!", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- GET LOGGED-IN USER'S POSTS (MOVE ABOVE :id!!) --------------------
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading user's posts" });
  }
});

// -------------------- GET ALL ITEMS --------------------
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- GET SINGLE ITEM --------------------
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- CLAIM ITEM (OWNER ONLY) --------------------
router.put("/:id/claim", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await item.deleteOne();
    res.json({ message: "Item marked as claimed and removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- DELETE ITEM --------------------
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await item.deleteOne();

    res.json({ message: "Item removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
