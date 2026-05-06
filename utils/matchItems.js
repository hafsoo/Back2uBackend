const LostItem = require("../model/LostItem");
const FoundItem = require("../model/FoundItem");

function dateDiffInDays(date1, date2) {
  return Math.abs(
    (new Date(date1) - new Date(date2)) / (1000 * 60 * 60 * 24)
  );
}

function cosineSimilarity(a = [], b = []) {
  if (!a.length || !b.length || a.length !== b.length) return 0;

  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function computeHybridScore({ item, inputData }) {
  // ==============================
  // 1️⃣ Embedding Similarity
  // ==============================
  const embeddingSim =
    inputData.embedding?.length && item.embedding?.length
      ? cosineSimilarity(inputData.embedding, item.embedding)
      : 0;

  // ==============================
  // 2️⃣ Tag Similarity (Jaccard)
  // ==============================
  const inputTags = inputData.tags || [];
  const itemTags = item.tags || [];
  const commonTags = inputTags.filter((t) => itemTags.includes(t));
  const totalUniqueTags = new Set([...inputTags, ...itemTags]).size;
  const normalizedTagScore =
    totalUniqueTags === 0 ? 0 : commonTags.length / totalUniqueTags;

  // ==============================
  // 3️⃣ Location Score
  // ==============================
  let locationScore = 0;
  if (
    inputData.location &&
    item.location &&
    inputData.location.toLowerCase().trim() ===
      item.location.toLowerCase().trim()
  ) {
    locationScore = 1;
  }

  // ==============================
  // 4️⃣ Date Score — FIXED (dono directions)
  // ==============================
  let dateScore = 0;
  const date1 = inputData.dateLost || inputData.dateFound;
  const date2 = item.dateLost || item.dateFound;

  if (date1 && date2) {
    const diff = dateDiffInDays(date1, date2);
    if (diff <= 1) dateScore = 1;
    else if (diff <= 3) dateScore = 0.7;
    else if (diff <= 7) dateScore = 0.4;
    else if (diff <= 14) dateScore = 0.2;
    else if (diff <= 30) dateScore = 0.1;
    else dateScore = 0;
  }

  // ==============================
  // 5️⃣ Image Score — FIXED (0 not 0.5)
  // ==============================
  const imageScore =
    inputData.images?.length > 0 && item.images?.length > 0 ? 1 : 0;

  // ==============================
  // 6️⃣ Weights
  // ==============================
  const weights = {
    embedding: 0.55,
    tag: 0.25,
    location: 0.1,
    date: 0.05,
    image: 0.05,
  };

  // ==============================
  // 7️⃣ Final Score
  // ==============================
  const hybridScore =
    embeddingSim * weights.embedding +
    normalizedTagScore * weights.tag +
    locationScore * weights.location +
    dateScore * weights.date +
    imageScore * weights.image;

  return {
    hybridScore,
    embeddingSim,
    normalizedTagScore,
    locationScore,
    dateScore,
    imageScore,
    commonTags,
  };
}

async function matchLostWithFound(tags, category, lostItemData = {}) {
  // NEW — add this at the top of the file once
const thirtyDaysAgo = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const candidates = await FoundItem.find({ category, createdAt: { $gte: thirtyDaysAgo() } });

  const matches = candidates
    .map((item) => {
      const scoreObj = computeHybridScore({ item, inputData: lostItemData });
      // matchLostWithFound / matchFoundWithLost
// Note: this filters >= 0.50 for UI display.
// Email notification applies a stricter threshold (>= 0.60) in notifyMatchedUsers.js
      if (scoreObj.hybridScore < 0.50|| scoreObj.embeddingSim < 0.50)
        return null;
      return {
        item,
        matchPercentage: Math.round(scoreObj.hybridScore * 100),
        ...scoreObj,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.hybridScore - a.hybridScore);

  return matches;
}

async function matchFoundWithLost(tags, category, foundItemData = {}) {
  // NEW — add this at the top of the file once
const thirtyDaysAgo = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const candidates = await LostItem.find({ category ,createdAt: { $gte: thirtyDaysAgo() }});

  const matches = candidates
    .map((item) => {
      const scoreObj = computeHybridScore({ item, inputData: foundItemData });
      if (scoreObj.hybridScore < 0.50 || scoreObj.embeddingSim < 0.50)
        return null;
      return {
        item,
        matchPercentage: Math.round(scoreObj.hybridScore * 100),
        ...scoreObj,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.hybridScore - a.hybridScore);

  return matches;
}

module.exports = { matchLostWithFound, matchFoundWithLost };

{/*const LostItem = require("../model/LostItem");
const FoundItem = require("../model/FoundItem");


function dateDiffInDays(date1, date2) {
  return Math.abs((new Date(date1) - new Date(date2)) / (1000 * 60 * 60 * 24));
}


function cosineSimilarity(a = [], b = []) {
  if (!a.length || !b.length || a.length !== b.length) return 0;

  let dot = 0,
    magA = 0,
    magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) return 0;

  return dot / (magA * magB); // 0 → 1
}

function computeHybridScore({ item, inputData }) {
 
  const embeddingSim =
    inputData.embedding?.length && item.embedding?.length
      ? cosineSimilarity(inputData.embedding, item.embedding)
      : 0;

  
  const inputTags = inputData.tags || [];
  const itemTags = item.tags || [];

  const commonTags = inputTags.filter((t) => itemTags.includes(t));

  const totalUniqueTags = new Set([
    ...inputTags,
    ...itemTags,
  ]).size;

  const normalizedTagScore =
    totalUniqueTags === 0 ? 0 : commonTags.length / totalUniqueTags;

  
  let locationScore = 0;

  if (
    inputData.location &&
    item.location &&
    inputData.location.toLowerCase().trim() ===
      item.location.toLowerCase().trim()
  ) {
    locationScore = 1;
  }

 
  let dateScore = 0;

  if (inputData.dateLost && item.dateFound) {
    const diff = dateDiffInDays(inputData.dateLost, item.dateFound);

    if (diff <= 1) dateScore = 1;
    else if (diff <= 3) dateScore = 0.7;
    else if (diff <= 7) dateScore = 0.4;
    else if (diff <= 14) dateScore = 0.2;
    else if (diff <= 30) dateScore = 0.1;
    else dateScore = 0;
  }


  //const imageScore =inputData.images?.length > 0 && item.images?.length > 0 ? 1 : 0;
  //new if both side image then 1
const imageScore =inputData.images?.length > 0 && item.images?.length > 0 ? 1 : 0.5;

  const weights = {
    embedding: 0.55,  // still dominant
  tag: 0.25,        // bump up tags
    //embedding: 0.6,
    //tag: 0.2,
    location: 0.1,
    date: 0.05,
    image: 0.05,
  };


  const hybridScore =
    embeddingSim * weights.embedding +
    normalizedTagScore * weights.tag +
    locationScore * weights.location +
    dateScore * weights.date +
    imageScore * weights.image;

  return {
    hybridScore,
    embeddingSim,
    normalizedTagScore,
    locationScore,
    dateScore,
    imageScore,
    commonTags,
  };
}


async function matchLostWithFound(tags, category, lostItemData = {}) {
  const candidates = await FoundItem.find({ category });

  const matches = candidates
    .map((item) => {
      const scoreObj = computeHybridScore({
        item,
        inputData: lostItemData,
      });

      // 🔥 Minimum threshold (important!)
      //if (scoreObj.hybridScore < 0.65 || scoreObj.embeddingSim < 0.65) return null;
      if (scoreObj.hybridScore < 0.50 || scoreObj.embeddingSim < 0.50) return null;
      const matchPercentage = Math.round(scoreObj.hybridScore * 100);

      return {
        item,
        matchPercentage,
        ...scoreObj,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.hybridScore - a.hybridScore);

  return matches;
}


async function matchFoundWithLost(tags, category, foundItemData = {}) {
  const candidates = await LostItem.find({ category });

  const matches = candidates
    .map((item) => {
      const scoreObj = computeHybridScore({
        item,
        inputData: foundItemData,
      });

      if (scoreObj.hybridScore < 0.50 || scoreObj.embeddingSim < 0.50) return null;

      const matchPercentage = Math.round(scoreObj.hybridScore * 100);

      return {
        item,
        matchPercentage,
        ...scoreObj,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.hybridScore - a.hybridScore);

  return matches;
}

module.exports = { matchLostWithFound, matchFoundWithLost };

*/}