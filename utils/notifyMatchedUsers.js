const LostItem = require("../model/LostItem");
const FoundItem = require("../model/FoundItem");
const MatchNotification = require("../model/MatchNotification");
const sendMatchEmail = require("./sendMatchEmail");
const { matchLostWithFound, matchFoundWithLost } = require("./matchItems");

//const SCORE_THRESHOLD = 0.3;
const SCORE_THRESHOLD = 0.55;
// Called when NEW Found item posted → notify lost item owners
async function notifyLostUsersOnNewFound(foundItem) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const lostItems = await LostItem.find({
      status: "lost",
      category: foundItem.category,
      createdAt: { $gte: thirtyDaysAgo },
    }).populate("reportedBy", "name email");

    console.log(`🔍 Filtered lost items: ${lostItems.length}`);

    for (const lostItem of lostItems) {
      const matches = await matchLostWithFound(
        lostItem.tags,
        lostItem.category,
        lostItem
      );

      console.log(`📊 Matches for "${lostItem.itemName}": ${matches.length}`);

      const thisMatch = matches.find(
        (m) => m.item._id.toString() === foundItem._id.toString()
      );

      console.log(
        `🎯 Score for "${lostItem.itemName}": hybridScore=${thisMatch?.hybridScore} embeddingSim=${thisMatch?.embeddingSim}`
      );

      if (!thisMatch) continue;
      if (thisMatch.hybridScore < SCORE_THRESHOLD) continue;
     // if (thisMatch.embeddingSim < 0.2) continue;
if (thisMatch.embeddingSim < 0.45) continue;
      const alreadyNotified = await MatchNotification.findOne({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
      });
      if (alreadyNotified) continue;

      await MatchNotification.create({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
        notifiedUser: lostItem.reportedBy._id,
        score: thisMatch.hybridScore,
      });

      await sendMatchEmail({
        to: lostItem.reportedBy.email,
        userName: lostItem.reportedBy.name,
        lostItemName: lostItem.itemName,
        foundItemName: foundItem.itemName,
        score: Math.round(thisMatch.hybridScore * 100),
        foundItemId: foundItem._id,
      });

      console.log(
        `✅ Match email sent to ${lostItem.reportedBy.email} for lost item: ${lostItem.itemName}`
      );
    }
  } catch (err) {
    console.error("❌ notifyLostUsersOnNewFound error:", err.message);
  }
}

// Called when NEW Lost item posted → notify found item reporters
async function notifyFoundUsersOnNewLost(lostItem) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const foundItems = await FoundItem.find({
      status: "found",
      category: lostItem.category,
       createdAt: { $gte: thirtyDaysAgo },
    }).populate("reportedBy", "name email");

    console.log(`🔍 Filtered found items: ${foundItems.length}`);

    for (const foundItem of foundItems) {
      const matches = await matchFoundWithLost(
        foundItem.tags,
        foundItem.category,
        foundItem
      );

      console.log(`📊 Matches for "${foundItem.itemName}": ${matches.length}`);

      const thisMatch = matches.find(
        (m) => m.item._id.toString() === lostItem._id.toString()
      );

      console.log(
        `🎯 Score for "${foundItem.itemName}": hybridScore=${thisMatch?.hybridScore} embeddingSim=${thisMatch?.embeddingSim}`
      );

      if (!thisMatch) continue;
      if (thisMatch.hybridScore < SCORE_THRESHOLD) continue;
      //if (thisMatch.embeddingSim < 0.2) continue;
if (thisMatch.embeddingSim < 0.45) continue;
      const alreadyNotified = await MatchNotification.findOne({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
      });
      if (alreadyNotified) continue;

      await MatchNotification.create({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
        notifiedUser: foundItem.reportedBy._id,
        score: thisMatch.hybridScore,
      });

      await sendMatchEmail({
        to: foundItem.reportedBy.email,
        userName: foundItem.reportedBy.name,
        lostItemName: lostItem.itemName,
        foundItemName: foundItem.itemName,
        score: Math.round(thisMatch.hybridScore * 100),
        foundItemId: foundItem._id,
      });

      console.log(
        `✅ Match email sent to ${foundItem.reportedBy.email} for found item: ${foundItem.itemName}`
      );
    }
  } catch (err) {
    console.error("❌ notifyFoundUsersOnNewLost error:", err.message);
  }
}

module.exports = { notifyLostUsersOnNewFound, notifyFoundUsersOnNewLost };