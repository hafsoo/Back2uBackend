const LostItem = require("../model/LostItem");
const FoundItem = require("../model/FoundItem");
const MatchNotification = require("../model/MatchNotification");
const sendMatchEmail = require("./sendMatchEmail");
const { matchLostWithFound, matchFoundWithLost } = require("./matchItems");

//const SCORE_THRESHOLD = 0.65;
const SCORE_THRESHOLD = 0.3;

// Called when NEW Found item posted → notify lost item owners
async function notifyLostUsersOnNewFound(foundItem) {
  try {
    const lostItems = await LostItem.find({ status: "lost" }).populate(
      "reportedBy", "name email"
    );
console.log(`🔍 Total lost items: ${lostItems.length}`);

    for (const lostItem of lostItems) {
      
      const matches = await matchLostWithFound(
        lostItem.tags,
        lostItem.category,
        lostItem
      );
      console.log(`📊 Matches for "${lostItem.itemName}": ${matches.length}`);
      // m.item._id is correct because matchLostWithFound returns { item, hybridScore, ... }
      const thisMatch = matches.find(
        (m) => m.item._id.toString() === foundItem._id.toString()
      );
    console.log(`🎯 Score for "${lostItem.itemName}": hybridScore=${thisMatch?.hybridScore} embeddingSim=${thisMatch?.embeddingSim}`);
      //if (!thisMatch || thisMatch.hybridScore < SCORE_THRESHOLD) continue;
      if (!thisMatch) continue;
if (thisMatch.hybridScore < SCORE_THRESHOLD) continue;
if (thisMatch.embeddingSim < 0.45) continue;

      // Prevent duplicate emails
      const alreadyNotified = await MatchNotification.findOne({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
      });
      if (alreadyNotified) continue;

      // Save to DB
      await MatchNotification.create({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
        notifiedUser: lostItem.reportedBy._id,
        score: thisMatch.hybridScore,
      });

      // Send email
      await sendMatchEmail({
        to: lostItem.reportedBy.email,
        userName: lostItem.reportedBy.name,
        lostItemName: lostItem.itemName,
        foundItemName: foundItem.itemName,
        score: Math.round(thisMatch.hybridScore * 100),
        foundItemId: foundItem._id,
      });

      console.log(`✅ Match email sent to ${lostItem.reportedBy.email} for lost item: ${lostItem.itemName}`);
    }
  } catch (err) {
    console.error("❌ notifyLostUsersOnNewFound error:", err.message);
  }
}

// Called when NEW Lost item posted → notify found item reporters
async function notifyFoundUsersOnNewLost(lostItem) {
  try {
    const foundItems = await FoundItem.find({ status: "found" }).populate(
      "reportedBy", "name email"
    );

    for (const foundItem of foundItems) {

      const matches = await matchFoundWithLost(
        foundItem.tags,
        foundItem.category,
        foundItem
      );

      // m.item._id is correct because matchFoundWithLost returns { item, hybridScore, ... }
      const thisMatch = matches.find(
        (m) => m.item._id.toString() === lostItem._id.toString()
      );

      //if (!thisMatch || thisMatch.hybridScore < SCORE_THRESHOLD) continue;
      if (!thisMatch) continue;
if (thisMatch.hybridScore < SCORE_THRESHOLD) continue;
if (thisMatch.embeddingSim < 0.45) continue;

      // Prevent duplicate emails
      const alreadyNotified = await MatchNotification.findOne({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
      });
      if (alreadyNotified) continue;

      // Save to DB
      await MatchNotification.create({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
        notifiedUser: foundItem.reportedBy._id,
        score: thisMatch.hybridScore,
      });

      // Send email
      await sendMatchEmail({
        to: foundItem.reportedBy.email,
        userName: foundItem.reportedBy.name,
        lostItemName: lostItem.itemName,
        foundItemName: foundItem.itemName,
        score: Math.round(thisMatch.hybridScore * 100),
        foundItemId: foundItem._id,
      });

      console.log(`✅ Match email sent to ${foundItem.reportedBy.email} for found item: ${foundItem.itemName}`);
    }
  } catch (err) {
    console.error("❌ notifyFoundUsersOnNewLost error:", err.message);
  }
}

module.exports = { notifyLostUsersOnNewFound, notifyFoundUsersOnNewLost };