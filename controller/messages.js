const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const Message = require("../model/messages");
const Conversation = require("../model/conversation");
const { isAuthenticated } = require("../middleware/auth");

// SEND MESSAGE
router.post("/create", isAuthenticated, async (req, res) => {
  try {
    const { conversationId, text, images, itemId, itemType } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const isMember = conversation.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (!isMember) return res.status(403).json({ message: "Unauthorized" });

    let imageData = null;
    if (images) {
      const upload = await cloudinary.uploader.upload(images, {
        folder: "messages",
      });
      imageData = { public_id: upload.public_id, url: upload.secure_url };
    }

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      text,
      images: imageData,
      itemId,
      itemType,
      readBy: [req.user._id], // sender already read it
    });

    conversation.lastMessage = images ? "Photo" : text;
    conversation.lastMessageId = req.user._id;
    await conversation.save();

    res.status(201).json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET MESSAGES
router.get("/:conversationId", isAuthenticated, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const isMember = conversation.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (!isMember) return res.status(403).json({ message: "Unauthorized" });

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    // 🔥 Mark unread messages as read
    await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        sender: { $ne: req.user._id }, // not my own messages
        readBy: { $ne: req.user._id }, // not already read
      },
      {
        $push: { readBy: req.user._id },
      },
    );

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// DELETE MESSAGE
router.delete("/:messageId", isAuthenticated, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message)
      return res.status(404).json({ message: "Message not found" });

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Get conversation to find receiver
    const conversation = await Conversation.findById(
      message.conversationId
    );

    // Find other member (receiver)
    const receiverId = conversation.members.find(
      (m) => m.toString() !== req.user._id.toString()
    );

    await message.deleteOne();

    res.status(200).json({
      success: true,
      messageId: req.params.messageId,
      receiverId,
    });

  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
