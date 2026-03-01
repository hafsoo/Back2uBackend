const express = require("express");
const router = express.Router();
const LostItem = require("../model/LostItem");
const FoundItem = require("../model/FoundItem");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// 🔍 Search Across Lost + Found Items
router.get(
  "/",
  catchAsyncErrors(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json({ success: true, results: [] });
    }

    const keyword = new RegExp(q, "i");

    const lostMatches = await LostItem.find({
      $or: [
        { itemName: keyword },
        { category: keyword },
        { location: keyword },
        { customLocation: keyword },
        { description: keyword }
      ],
    }).limit(20);

    const foundMatches = await FoundItem.find({
      $or: [
        { itemName: keyword },
        { category: keyword },
        { location: keyword },
        { customLocation: keyword },
        { description: keyword }
      ],
    }).limit(20);

    const results = [
      ...lostMatches.map((item) => ({ ...item._doc, type: "lost" })),
      ...foundMatches.map((item) => ({ ...item._doc, type: "found" })),
    ];

    res.json({ success: true, results });
  })
);

module.exports = router;
