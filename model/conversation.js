const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: String,
    lastMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // optional: keep item info for reference
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId },
        itemType: { type: String, enum: ["LostItem", "FoundItem"] },
      },
    ],

    pairKey: {
      type: String,
      unique: true, // now unique per user pair only
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
