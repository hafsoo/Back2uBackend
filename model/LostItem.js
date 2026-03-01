const mongoose = require("mongoose");

const lostItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Please enter the item name!"],
    },
    type: { type: String, default: "LostItem" },

    category: {
      type: String,
    },
    dateLost: {
      type: String,
      required: [true, "Please enter the date the item was lost!"],
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
    },

    status: {
      type: String,
      enum: ["lost", "claimed"], //future
      default: "lost",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("LostItem", lostItemSchema);
