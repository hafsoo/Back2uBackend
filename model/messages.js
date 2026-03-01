const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
    },

    images: {
      public_id: String,
      url: String,
    },

    // ✅ Item context lives here
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    itemType: {
      type: String,
      enum: ["LostItem", "FoundItem"],
    },
    //new for count new messages
    readBy: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],

  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
