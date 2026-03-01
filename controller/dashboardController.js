const LostItem = require("../model/LostItem");
const FoundItem = require("../model/FoundItem");
const User = require("../model/user");
const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
//const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();
//user cards

router.get(
  "/dashboard-stats",
  //isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {

    // ✅ Run all queries in parallel (faster)
    const [
      totalLost,
      totalFound,
      returnedItems,
      activeUsers,
      claimedItems,
    ] = await Promise.all([
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      FoundItem.countDocuments({ status: "claimed" }),
      User.countDocuments(),
      FoundItem.find({ status: "claimed" }),
    ]);

    // ✅ Avg response time
    let avgResponse = 0;

    if (claimedItems.length > 0) {
      const totalHours = claimedItems.reduce((acc, item) => {
        const created = new Date(item.createdAt);
        const claimed = new Date(item.updatedAt);

        return acc + (claimed - created) / (1000 * 60 * 60);
      }, 0);

      avgResponse = (totalHours / claimedItems.length).toFixed(1);
    }

    res.status(200).json({
      success: true,
      stats: {
        totalReported: totalLost + totalFound,
        returnedItems,
        avgResponse,
        activeUsers,
      },
    });
  })
);


//admin card

router.get(
  "/dashboard-cards",
  catchAsyncErrors(async (req, res, next) => {
    // ✅ Count matched items
    const [totalLost, totalFound, matchedLost, matchedFound] = await Promise.all([
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      
    ]);

   
    // ✅ Monthly reports (lost & found)
    const lostMonthly = await LostItem.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const foundMonthly = await FoundItem.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      cards: {
        monthlyReports: { lostMonthly, foundMonthly },
      },
    });
  })
);

module.exports = router;