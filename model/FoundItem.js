const mongoose = require("mongoose");

const foundItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Please enter the item name!"],
    },
    type: { type: String, default: "FoundItem" },
    category: {
      type: String,
    },
    dateFound: {
      type: String,
      required: [true, "Please enter the date the item was found!"],
    },
    location: {
      type: String,
      required: [true, "Please enter the location!"],
    },
    customLocation: {
      type: String,
    },
    description: {
      type: String,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    tags: {
      type: [String], // Optional tags array
    },
    embedding: {
      type: [Number],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // ✅ This ensures every FoundItem has a valid owner
    },
    status: {
      type: String,
      enum: ["found", "claimed"], //returned for future
      default: "found",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FoundItem", foundItemSchema);
