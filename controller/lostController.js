const express = require("express");
const router = express.Router();
const LostItem = require("../model/LostItem");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary");
const analyzeImage = require("../utils/geminiVision");
const normalizeTags = require("../utils/normalizeTags");
const { matchLostWithFound } = require("../utils/matchItems");

const generateTextTags = require("../utils/generateTextTags");
const { generateEmbedding } = require("../utils/generateEmbedding");
//const detectLabels = require("../utils/clarifaiVision");
//const detectLabels = require("../utils/geminiVision");
//const detectLabels = require("../utils/visionRest");
//const normalizeTags = require("../utils/tagNormalizer");
const { notifyFoundUsersOnNewLost } = require("../utils/notifyMatchedUsers");

// 🟢 Report Lost Item
router.post(
  "/report-lost-item",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let images = [];

      if (typeof req.body.images === "string") {
        images.push(req.body.images);
      } else {
        images = req.body.images;
      }

      const imageLinks = [];
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "lost_items",
        });

        imageLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      const lostItemData = req.body;
      lostItemData.images = imageLinks;
      // attach logged-in user
      lostItemData.reportedBy = req.user.id;

      // 🧠 AI TAG EXTRACTION (SAFE) for google vision
      //if (imageLinks.length > 0) {
      //try {
      //const aiTags = await detectLabels(imageLinks[0].url);
      //lostItemData.tags = normalizeTags(aiTags);
      //} catch (err) {
      //console.error(
      //"❌ Vision API Error (Lost):",
      //err.response?.data || err.message
      // );
      //lostItemData.tags = []; // fallback
      //}
      //}

      //now with clarfai

      //if (process.env.USE_AI === "true" && imageLinks.length > 0) {
      //try {
      //const aiTags = await detectLabels(imageLinks[0].url);
      //lostItemData.tags = normalizeTags(aiTags);
      //} catch (err) {
      //console.error("❌ Clarifai Error:", err.response?.data || err.message);
      //lostItemData.tags = [];
      //}
      //}
      //by google ai studio

      {
        /**   if (imageLinks.length > 0) {
        try {
          let allTags = [];
          for (let img of imageLinks) {
            const aiTags = await analyzeImage(img.url);
            allTags = allTags.concat(aiTags);
          }
          // normalize & remove duplicates by one line
          // lostItemData.tags = [
          //  ...new Set(allTags.map((tag) => tag.toLowerCase().trim())),
          //];
          const normalizedTags = normalizeTags(allTags, lostItemData.category);
          lostItemData.tags = normalizedTags;
        } catch (err) {
          console.error("❌ Gemini AI Error:", err.message);
          lostItemData.tags = []; // fallback
        }
      } else {
        // 🆕 NEW LOGIC FOR NO IMAGE
        const textTags = generateTextTags(lostItemData);
        lostItemData.tags = textTags;
      }

      */
      }
      ///2 way
      // 1️⃣ Generate text tags from user input
      const textTags = generateTextTags(lostItemData);

      // 2️⃣ Initialize combined tags with text tags
      let allTags = [...textTags];

      // 3️⃣ If images exist, generate AI tags and add them
      if (imageLinks.length > 0) {
        try {
          for (let img of imageLinks) {
            const aiTags = await analyzeImage(img.url); // Gemini AI tags
            allTags = allTags.concat(aiTags);
          }
        } catch (err) {
          console.error("❌ Gemini AI Error:", err.message);
        }
      }

      // 4️⃣ Normalize & remove duplicates
      lostItemData.tags = normalizeTags(allTags, lostItemData.category);

      //new embedding semantic
      // 🔥 Generate semantic embedding from tags + description
      const embeddingText =
        lostItemData.tags.join(" ") + " " + (lostItemData.description || "");

      try {
        const embedding = await generateEmbedding(embeddingText);
        lostItemData.embedding = embedding;
      } catch (err) {
        console.error("❌ Embedding Error:", err.message);
        lostItemData.embedding = [];
      }

      //db save
      const lostItem = await LostItem.create(lostItemData);

      // ✅ ADD THIS — runs in background, doesn't slow response vercel issue
      //notifyFoundUsersOnNewLost(lostItem).catch(console.error);

      // auto-match score base
      //const possibleMatches = await matchLostWithFound(
      //lostItem.tags,
      //lostItem.category,
      //lostItem,
      //);
      //abhi comment kia

      //const [possibleMatches] = await Promise.all([
      //matchLostWithFound(lostItem.tags, lostItem.category, lostItem),
      //notifyFoundUsersOnNewLost(lostItem),
      //]);
      const possibleMatches = await matchLostWithFound(
        lostItem.tags,
        lostItem.category,
        lostItem,
      );

      notifyFoundUsersOnNewLost(lostItem).catch(console.error);

      res.status(201).json({
        success: true,
        lostItem,
        possibleMatches,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

// 🟡 Get All Lost Items
router.get(
  "/get-all-lost-items",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const lostItems = await LostItem.find()
        .sort({ createdAt: -1 })
        .populate("reportedBy", "name email");
      res.status(200).json({
        success: true,
        lostItems,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// 🟢 Get Only My Lost Items
router.get(
  "/my-lost-items",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const myItems = await LostItem.find({ reportedBy: req.user.id }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        myItems,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// 🔵 Get Single Lost Item (including reporter info)
router.get(
  "/lost-item/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const item = await LostItem.findById(req.params.id).populate(
        "reportedBy",
        "name email phone avatar",
      );

      if (!item) {
        return next(new ErrorHandler("Lost item not found", 404));
      }

      res.status(200).json({
        success: true,
        item,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

// 🔵 Delete Lost Item
router.delete(
  "/delete-lost-item/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const item = await LostItem.findById(req.params.id);
      if (!item) {
        return next(new ErrorHandler("Lost item not found", 404));
      }

      // delete cloudinary images
      for (let i = 0; i < item.images.length; i++) {
        await cloudinary.v2.uploader.destroy(item.images[i].public_id);
      }

      await LostItem.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Lost item deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

// 🔴 Admin: Get All Lost Reports
router.get(
  "/admin-all-lost-items",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const lostItems = await LostItem.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        lostItems,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// 🟠 Update Lost Item (Edit Report)
router.put(
  "/update-lost-item/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        itemName,
        category,
        location,
        customLocation,
        dateLost,
        description,
      } = req.body;

      const updated = await LostItem.findByIdAndUpdate(
        req.params.id,
        {
          itemName,
          category,
          location,
          customLocation,
          dateLost,
          description,
        },
        { new: true },
      );

      if (!updated) {
        return next(new ErrorHandler("Lost item not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Lost item updated successfully!",
        updated,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

// 🟣 Update Lost Item Image
router.put(
  "/update-lost-item-image",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { itemId, imageIndex, newImage } = req.body;

    if (!itemId || newImage === undefined || imageIndex === undefined) {
      return next(new ErrorHandler("Missing data", 400));
    }

    const item = await LostItem.findById(itemId);
    if (!item) return next(new ErrorHandler("Item not found", 404));

    const idx = parseInt(imageIndex);
    if (idx < 0 || idx >= item.images.length)
      return next(new ErrorHandler("Invalid image index", 400));

    // delete old image
    await cloudinary.v2.uploader.destroy(item.images[idx].public_id);

    // upload new image
    const result = await cloudinary.v2.uploader.upload(newImage, {
      folder: "lost_items",
    });

    // replace image
    item.images[idx] = {
      public_id: result.public_id,
      url: result.secure_url,
    };
    await item.save();

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      item,
    });
  }),
);
//nothing ith this route extra no use

router.post("/match-lost-item", isAuthenticated, async (req, res) => {
  try {
    const { tags } = req.body; // lost item tags

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Tags are required" });
    }

    const matches = await matchLostWithFound(tags);

    res.status(200).json({
      success: true,
      matches,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
