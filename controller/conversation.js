const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Conversation = require("../model/conversation");
const Message=require("../model/messages")
const LostItem = require("../model/LostItem");
const FoundItem = require("../model/FoundItem");
const { isAuthenticated } = require("../middleware/auth");

{/*// CREATE OR GET CONVERSATION
router.post("/create", isAuthenticated, async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const currentUserId = req.user._id.toString();

    const ItemModel = itemType === "LostItem" ? LostItem : FoundItem;
    const item = await ItemModel.findById(itemId).populate("reportedBy");

    if (!item) return res.status(404).json({ message: "Item not found" });
    if (!item.reportedBy)
      return res.status(400).json({ message: "Item has no owner" });

    const ownerId = item.reportedBy._id.toString();

    // Optional: allow chat even if ownerId === currentUserId
    // if (ownerId === currentUserId) {
    //   return res.status(400).json({ message: "You cannot chat with yourself" });
    // }

    // Unique key based on two users
    const members = [ownerId, currentUserId].sort();
    const pairKey = members.join("_");

    // Check if conversation exists
    let conversation = await Conversation.findOne({ pairKey });

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        members,
        pairKey,
        items: [{ itemId, itemType }],
      });
    } else {
      // Add item if not already present
      const exists = conversation.items.some(
        (i) => i.itemId.toString() === itemId && i.itemType === itemType
      );
      if (!exists) {
        conversation.items.push({ itemId, itemType });
        await conversation.save();
      }
    }

    res.status(200).json({ conversation });
  } catch (error) {
    console.error("Conversation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
*/}
// CREATE OR GET CONVERSATION
router.post("/create", isAuthenticated, async (req, res) => {
  try {
    const { itemId, itemType, receiverId } = req.body;
    const currentUserId = req.user._id.toString();

    let ownerId;

    // ✅ CASE 1 → Admin or manual chat
    if (receiverId) {
      ownerId = receiverId.toString();
    } 
    // ✅ CASE 2 → Normal Lost–Found flow
    else {
      const ItemModel = itemType === "LostItem" ? LostItem : FoundItem;
      const item = await ItemModel.findById(itemId).populate("reportedBy");

      if (!item) return res.status(404).json({ message: "Item not found" });
      if (!item.reportedBy)
        return res.status(400).json({ message: "Item has no owner" });

      ownerId = item.reportedBy._id.toString();
    }

    // Optional self chat check
    if (ownerId === currentUserId) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    // Unique key based on two users
    const members = [ownerId, currentUserId].sort();
    const pairKey = members.join("_");

    // Check if conversation exists
    let conversation = await Conversation.findOne({ pairKey });

    if (!conversation) {
      conversation = await Conversation.create({
        members,
        pairKey,
        items: itemId ? [{ itemId, itemType }] : [],
      });
    } else {
      // Add item if provided and not already present
      if (itemId && itemType) {
        const exists = conversation.items.some(
          (i) =>
            i.itemId.toString() === itemId &&
            i.itemType === itemType
        );

        if (!exists) {
          conversation.items.push({ itemId, itemType });
          await conversation.save();
        }
      }
    }

    res.status(200).json({ conversation });
  } catch (error) {
    console.error("Conversation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



// GET USER CONVERSATIONS
router.get("/user/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const conversations = await Conversation.find({
      members: req.user._id, // directly use ObjectId from Mongoose
    })
      .populate("members", "name avatar")
      .sort({ updatedAt: -1 });

   // res.status(200).json({ conversations });

    // 🔥 ADD THIS BLOCK
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: req.user._id },
          readBy: { $ne: req.user._id },
        });

        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json({ conversations: conversationsWithUnread });

  } catch (error) {
    console.error("Fetch conversations error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE LAST MESSAGE
router.put("/update/:id", isAuthenticated, async (req, res) => {
  try {
    const { lastMessage } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const isMember = conversation.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: "Unauthorized" });

    conversation.lastMessage = lastMessage;
    conversation.lastMessageId = req.user._id;
    await conversation.save();

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error("Update conversation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
