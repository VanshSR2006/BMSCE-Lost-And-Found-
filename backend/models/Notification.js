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

  type: {
    type: String,
    enum: ["match", "claim_request", "system"],
    default: "match",
  },

  message: {
    type: String,
    default: "",
  },

  challengeResponse: {
    type: String,
    default: "",
  },

  requesterLostItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
