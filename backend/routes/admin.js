const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Item = require("../models/Item");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

/* =====================================================
   STATS
===================================================== */
// ✅ GET DASHBOARD STATS
router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const activeReports = await Item.countDocuments({ type: "lost" }); // Lost items as active reports

    res.json({ totalUsers, totalItems, activeReports });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* =====================================================
   USERS
===================================================== */

// ✅ GET ALL USERS (password excluded)
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ✅ PROMOTE / DEMOTE USER ROLE
router.put("/users/:id/role", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Role updated successfully",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role" });
  }
});

// ✅ DELETE USER + ALL THEIR ITEMS
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Item.deleteMany({ createdBy: user._id });
    await user.deleteOne();

    res.json({ message: "User and their items deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

/* =====================================================
   ITEMS
===================================================== */

// ✅ GET ALL ITEMS
router.get("/items", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const items = await Item.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// ✅ DELETE ANY ITEM (ADMIN POWER)
router.delete("/items/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.deleteOne();
    res.json({ message: "Item deleted by admin" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item" });
  }
});

module.exports = router;
