const express = require("express");
const router = express.Router();
const FoundItem = require("../model/FoundItem");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary");
//const analyzeImage = require("../utils/geminiVision");
//const normalizeTags = require("../utils/normalizeTags");
const { matchFoundWithLost } = require("../utils/matchItems");
//const generateTextTags = require("../utils/generateTextTags");
//const { generateEmbedding } = require("../utils/generateEmbedding");
const { notifyLostUsersOnNewFound } = require("../utils/notifyMatchedUsers");
const buildSmartData = require("../utils/buildSmartEmbedding");
// 🟢 Report Found Item (require auth so req.user exists)
router.post(
  "/report-found-item",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let images = [];

      if (typeof req.body.images === "string") {
        images.push(req.body.images);
      } else {
        images = req.body.images || [];
      }

      const imageLinks = [];
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "found_items",
        });
        imageLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      const foundItemData = { ...req.body };
      foundItemData.images = imageLinks;
      // attach the logged in user id
      foundItemData.reportedBy = req.user.id;
//new matching
const smartData = await buildSmartData(
  foundItemData,
  imageLinks,
  foundItemData.category
);
foundItemData.tags = smartData.tags;
foundItemData.embedding = smartData.embedding;
   
{/** 
      
      const textTags = generateTextTags(foundItemData);
      let allTags = [...textTags];

      if (imageLinks.length > 0) {
        try {
          for (let img of imageLinks) {
            const aiTags = await analyzeImage(img.url); 
            allTags = allTags.concat(aiTags);
          }
        } catch (err) {
          console.error("❌ Gemini AI Error:", err.message);
        }
      }
      foundItemData.tags = normalizeTags(allTags, foundItemData.category);

      const embeddingText =
        foundItemData.tags.join(" ") + " " + (foundItemData.description || "");

      try {
        const embedding = await generateEmbedding(embeddingText);
        foundItemData.embedding = embedding;
      } catch (err) {
        console.error("❌ Embedding Error:", err.message);
        foundItemData.embedding = [];
      }
*/}
      const foundItem = await FoundItem.create(foundItemData);
     

      const possibleMatches = await matchFoundWithLost(
        foundItem.tags,
        foundItem.category,
        foundItem,
      );

      //await notifyLostUsersOnNewFound(foundItem).catch(console.error);
      await notifyLostUsersOnNewFound(foundItem,possibleMatches).catch(console.error);

      res.status(201).json({
        success: true,
        foundItem,
        possibleMatches,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

// Get single found item by id (populated reportedBy)
router.get(
  "/found-item/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const item = await FoundItem.findById(req.params.id).populate(
        "reportedBy",
        "name email phoneNumber avatar role",
      );
      if (!item) return next(new ErrorHandler("Found item not found", 404));

      res.status(200).json({
        success: true,
        item,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// 🟡 Get All Found Items (populate reportedBy)
router.get(
  "/get-all-found-items",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const foundItems = await FoundItem.find()
        .sort({ createdAt: -1 })
        .populate("reportedBy", "name email");
      res.status(200).json({
        success: true,
        foundItems,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// Get logged-in user's found items
router.get(
  "/my-found-items",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const foundItems = await FoundItem.find({ reportedBy: req.user.id }).sort(
        { createdAt: -1 },
      );
      res.status(200).json({
        success: true,
        foundItems,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// 🔵 Delete Found Item
router.delete(
  "/delete-found-item/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const item = await FoundItem.findById(req.params.id);
      if (!item) {
        return next(new ErrorHandler("Found item not found", 404));
      }

      for (let i = 0; i < item.images.length; i++) {
        await cloudinary.v2.uploader.destroy(item.images[i].public_id);
      }

      await FoundItem.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Found item deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

// 🔴 Admin: Get All Found Reports
router.get(
  "/admin-all-found-items",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const foundItems = await FoundItem.find()
        .sort({ createdAt: -1 })
        .populate("reportedBy", "name email");
      res.status(200).json({
        success: true,
        foundItems,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// 🟠 Update Found Item (like EditFoundReport.jsx)
router.put(
  "/update-found-item/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        itemName,
        category,
        location,
        customLocation,
        dateFound,
        description,
      } = req.body;

      const updateData = {
        itemName,
        category,
        location,
        customLocation,
        dateFound,
        description,
      };

      const updated = await FoundItem.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updated) {
        return next(new ErrorHandler("Found item not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Found item updated successfully!",
        updated,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

// 🟣 Update single image for Found Item
router.put(
  "/update-found-item-image",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { itemId, imageIndex, newImage } = req.body;

    if (!itemId || newImage === undefined || imageIndex === undefined) {
      return next(new ErrorHandler("Missing data", 400));
    }

    const item = await FoundItem.findById(itemId);
    if (!item) return next(new ErrorHandler("Item not found", 404));

    const idx = parseInt(imageIndex);
    if (idx < 0 || idx >= item.images.length)
      return next(new ErrorHandler("Invalid image index", 400));

    await cloudinary.v2.uploader.destroy(item.images[idx].public_id);

    const result = await cloudinary.v2.uploader.upload(newImage, {
      folder: "found_items",
    });

    item.images[idx] = { public_id: result.public_id, url: result.secure_url };
    await item.save();

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      item,
    });
  }),
);

module.exports = router;
