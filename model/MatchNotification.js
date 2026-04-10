const mongoose = require("mongoose");

const matchNotificationSchema = new mongoose.Schema({
  lostItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LostItem",
    required: true,
  },
  foundItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoundItem",
    required: true,
  },
  notifiedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  score: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate notifications for same pair
matchNotificationSchema.index(
  { lostItemId: 1, foundItemId: 1 },
  { unique: true }
);

module.exports = mongoose.model("MatchNotification", matchNotificationSchema);