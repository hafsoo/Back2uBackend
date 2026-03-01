const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemType",
    },
    itemType: {
      type: String,
      required: true,
      enum: ["LostItem", "FoundItem"],
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
      color: { type: String, required: true },
      marks: { type: String, required: true },
      proof: String,
    },
    status: {
      type: String,
      enum: ["pending", "awaiting_admin","approved", "rejected"],
      default: "pending",
    },

    // snapshot optional: if you want to store item snapshot at time of claim
    itemSnapshot: {
      itemName: String,
      description: String,
      images: Array,
      //add also this
      category: String,
      location: String,
      status: String,
      dateLost: Date,
      dateFound: Date,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);
