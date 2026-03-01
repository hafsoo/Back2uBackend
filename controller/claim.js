// controller/claim.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Claim = require("../model/claim");
const LostItem = require("../model/LostItem");
const FoundItem = require("../model/FoundItem");
const Notification = require("../model/Notification");
const sendEmail = require("../utils/email");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../model/user");
const toStr = (id) => id?.toString();
// Submit claim
router.post(
  "/submit-claim",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { itemId, itemType, color, marks, proof } = req.body;

    if (!itemId || !itemType || !color || !marks) {
      return next(new ErrorHandler("Missing required claim data", 400));
    }

    // make sure item exists
    const itemModel = itemType === "FoundItem" ? FoundItem : LostItem;
    const item = await itemModel.findById(itemId);
    if (!item) return next(new ErrorHandler("Item not found", 404));

    const existing = await Claim.findOne({ itemId, claimant: req.user.id });
    if (existing) {
      return next(
        new ErrorHandler(
          "You have already submitted a claim for this item",
          400,
        ),
      );
    }

    const claim = await Claim.create({
      itemId,
      itemType,
      claimant: req.user.id,
      answers: { color, marks, proof },
      itemSnapshot: {
        itemName: item.itemName || item.title || "",
        description: item.description || "",
        images: item.images || [],
        //new
        category: item.category,
        location: item.location,
        status: item.status,
        dateLost: item.dateLost,
        dateFound: item.dateFound,
      },
    });

    // Notify finder (if itemType is FoundItem)
    if (itemType === "FoundItem") {
      const finder = await User.findById(item.reportedBy);
      if (finder) {
        // in-app
        await Notification.create({
          userId: finder._id,
          title: "New claim on your found item",
          body: `${req.user.name || "Someone"} claimed your item: ${item.itemName || "Found item"}.`,
          data: {
            claimId: claim._id,
            itemId: item._id,
            type: "incoming_claim",
          },
        });

        // email (best-effort)
        if (finder.email) {
          sendEmail({
            to: finder.email,
            subject: "Someone claimed your found item",
            text: `${req.user.name || "Someone"} submitted a claim on your found item: ${item.itemName || ""}. Log in to review.`,
            html: `<p><strong>${req.user.name || "Someone"}</strong> submitted a claim on your found item: <strong>${item.itemName || ""}</strong>.</p><p>Open your Incoming Claims on Back2U to review.</p>`,
          }).catch((e) => console.error("Email send error:", e));
        }
      }
    }

    res
      .status(201)
      .json({ success: true, message: "Claim submitted successfully", claim });
  }),
);

// Get my claims (claimant)
router.get(
  "/my-claims",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const claims = await Claim.find({ claimant: req.user.id })
      .populate("itemId")
      .populate("claimant", "name email");
    res.json({ success: true, claims });
  }),
);

// Delete claim (claimant)
router.delete(
  "/delete/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return next(new ErrorHandler("Claim not found", 404));
    if (claim.claimant.toString() !== req.user.id) {
      return next(new ErrorHandler("You cannot delete this claim", 403));
    }
    await claim.deleteOne();
    res.json({ success: true, message: "Claim deleted" });
  }),
);

// Finder incoming claims
router.get(
  "/incoming-claims",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    // get found items that belong to the current user
    const myFound = await FoundItem.find({ reportedBy: req.user.id }).select(
      "_id",
    );
    const myFoundIds = myFound.map((i) => i._id);

    const claims = await Claim.find({
      itemId: { $in: myFoundIds },
      itemType: "FoundItem",
      status: { $in: ["pending", "finder_approved", "awaiting_admin"] },
    })
      .populate("claimant", "name email")
      .populate({
        path: "itemId",
        select: "itemName description category images status userId",
      });

    res.json({ success: true, claims });
  }),
);

// Finder approves -> sets finder_approved and notifies admin & claimant
router.put(
  "/finder-approve/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return next(new ErrorHandler("Claim not found", 404));
    // 🔥 IMPORTANT FIX
    const itemId = claim.itemId?._id || claim.itemId;
    // only the finder of the found item can approve
    const item = await FoundItem.findById(claim.itemId);
    if (!item) return next(new ErrorHandler("Item not found", 404));

    //if (item.userId.toString() !== req.user.id) {
    //return next(new ErrorHandler("Unauthorized", 403));
    //}

    // 🔐 Ownership check (SAFE)
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler("Unauthorized action", 403));
    }

    {
      /* old aproach when finder approve goes to admin wait admin to accept
      claim.status = "awaiting_admin";
    await claim.save();
    item.status = "claimed";
    await item.save();*/
    }

    claim.status = "approved";
    await claim.save();

    // Reject other claims
    await Claim.updateMany(
      { itemId: claim.itemId, _id: { $ne: claim._id } },
      { status: "rejected" },
    );

    item.status = "claimed";
    await item.save();

    // notify claimant
    const claimant = await User.findById(claim.claimant);
    if (claimant) {
      await Notification.create({
        userId: claimant._id,
        title: "Finder approved your claim",
        body: `The finder approved your claim on "${item.itemName || "item"}". Awaiting admin verification.`,
        data: { claimId: claim._id, itemId: item._id, type: "finder_approved" },
      });

      // email claimant (best-effort)
      if (claimant.email) {
        sendEmail({
          to: claimant.email,
          subject: "Finder approved your claim — awaiting admin",
          text: `The finder approved your claim on "${item.itemName || "item"}". An admin will verify and finalize the return.`,
          html: `<p>The finder approved your claim on <b>${item.itemName || "item"}</b>. An admin will now verify and finalize the return.</p>`,
        }).catch((e) => console.error("Email send error:", e));
      }
    }

    // notify Admin(s) — you can choose whether to notify a single admin or all admins
    const admins = await User.find({ role: "Admin" }).select("email _id name");
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: "Claim awaiting admin review",
        body: `Claim by ${claimant?.name || "a user"} on "${item.itemName || "item"}" needs your review.`,
        data: { claimId: claim._id, itemId: item._id, type: "awaiting_admin" },
      });

      if (admin.email) {
        sendEmail({
          to: admin.email,
          subject: "Claim awaiting admin review",
          text: `A claim is awaiting admin review for "${item.itemName || "item"}".`,
          html: `<p>A claim requires your review for <b>${item.itemName || "item"}</b>.</p>`,
        }).catch((e) => console.error("Email send error:", e));
      }
    }

    res.json({
      success: true,
      message: "Claim approved by finder — awaiting admin",
    });
  }),
);

// Finder rejects
router.put(
  "/finder-reject/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return next(new ErrorHandler("Claim not found", 404));
    //add this
    const itemId = claim.itemId?._id || claim.itemId;
    const item = await FoundItem.findById(claim.itemId);
    if (!item) return next(new ErrorHandler("Item not found", 404));

    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler("Unauthorized", 403));
    }

    // Only the finder can reject
    /// if (!item.reportedBy.equals(req.user._id)) {
    //  return next(new ErrorHandler("Unauthorized action", 403));
    //}

    claim.status = "rejected";
    await claim.save();

    item.status = "found";
    await item.save();

    // notify claimant
    const claimant = await User.findById(claim.claimant);
    if (claimant) {
      await Notification.create({
        userId: claimant._id,
        title: "Claim rejected by finder",
        body: `The finder rejected your claim on "${item.itemName || "item"}".`,
        data: { claimId: claim._id, itemId: item._id, type: "finder_rejected" },
      });

      if (claimant.email) {
        sendEmail({
          to: claimant.email,
          subject: "Your claim was rejected by the finder",
          text: `Your claim on "${item.itemName || "item"}" was rejected by the finder.`,
          html: `<p>Your claim on <b>${item.itemName || "item"}</b> was rejected by the finder.</p>`,
        }).catch((e) => console.error("Email send error:", e));
      }
    }

    res.json({ success: true, message: "Claim rejected by finder" });
  }),
);

// Admin final decision (keeps your existing admin endpoint but updates status flows)
router.put(
  "/admin-update/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const { status } = req.body; // approved | rejected
    if (!["approved", "rejected"].includes(status)) {
      return next(new ErrorHandler("Invalid status", 400));
    }
    const claim = await Claim.findById(req.params.id);
    if (!claim) return next(new ErrorHandler("Claim not found", 404));

    // 🔒 Only allow admin if claim was escalated
    if (claim.status !== "awaiting_admin") {
      return next(
        new ErrorHandler("This claim is not awaiting admin review", 400),
      );
    }

    claim.status = status;
    await claim.save();

    // mark item appropriately
    if (status === "approved") {
      if (claim.itemType === "FoundItem") {
        await FoundItem.findByIdAndUpdate(claim.itemId, { status: "claimed" });
      } else {
        await LostItem.findByIdAndUpdate(claim.itemId, { status: "claimed" });
      }
    } else {
      // rejected
      if (claim.itemType === "FoundItem") {
        await FoundItem.findByIdAndUpdate(claim.itemId, { status: "found" });
      }
    }

    // notify claimant + finder
    const claimant = await User.findById(claim.claimant);
    const item =
      claim.itemType === "FoundItem"
        ? await FoundItem.findById(claim.itemId)
        : await LostItem.findById(claim.itemId);
    // const finder = item ? await User.findById(item.userId) : null;
    const finder = await User.findById(item.reportedBy);

    const notifyAndEmail = async (user, title, body, subject) => {
      if (!user) return;
      await Notification.create({
        userId: user._id,
        title,
        body,
        data: { claimId: claim._id },
      });
      if (user.email) {
        sendEmail({
          to: user.email,
          subject,
          text: body,
          html: `<p>${body}</p>`,
        }).catch((e) => console.error("Email send error:", e));
      }
    };

    if (status === "approved") {
      await notifyAndEmail(
        claimant,
        "Claim approved",
        `Your claim for "${item?.itemName || "item"}" has been approved.`,
        "Claim approved",
      );
      await notifyAndEmail(
        finder,
        "Claim finalized",
        `Admin approved the claim for "${item?.itemName || "item"}".`,
        "Claim finalized",
      );
    } else {
      await notifyAndEmail(
        claimant,
        "Claim rejected",
        `Your claim for "${item?.itemName || "item"}" was rejected by admin.`,
        "Claim rejected",
      );
      await notifyAndEmail(
        finder,
        "Claim rejected by admin",
        `Admin rejected the claim for "${item?.itemName || "item"}".`,
        "Claim rejected",
      );
    }

    res.json({ success: true, message: `Claim ${status}` });
  }),
);

// Admin get all claims
router.get(
  "/admin-all-claims",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res) => {
    const claims = await Claim.find()
      .sort({ createdAt: -1 })
      .populate("claimant", "name email");

    res.json({ success: true, claims });
  }),
);

router.put(
  "/finder-escalate/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return next(new ErrorHandler("Claim not found", 404));

    const item = await FoundItem.findById(claim.itemId);
    if (!item) return next(new ErrorHandler("Item not found", 404));

    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler("Unauthorized", 403));
    }

    claim.status = "awaiting_admin";
    await claim.save();

    res.json({ success: true, message: "Claim sent to admin for review" });
  }),
);

router.get(
  "/admin-single/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const claim = await Claim.findById(req.params.id).populate(
      "claimant",
      "name email",
    );

    if (!claim) {
      return next(new ErrorHandler("Claim not found", 404));
    }

    res.json({ success: true, claim });
  }),
);

module.exports = router;
