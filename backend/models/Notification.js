const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  lostItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },

  foundItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },

  message: {
    type: String,
    default: "",
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
