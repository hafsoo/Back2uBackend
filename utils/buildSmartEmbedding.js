const { generateEmbedding } = require("./generateEmbedding");
const analyzeImage = require("./geminiVision");
const normalizeTags = require("./normalizeTags");
const generateTextTags = require("./generateTextTags");

const categoryKeywords = {
  "Electronics": ["phone", "laptop", "charger", "earphone", "tablet", "camera", "airpod", "watch", "mobile", "samsung", "iphone", "apple"],
  "Wallet / Purse": ["wallet", "purse", "card", "leather", "pouch", "money", "cash"],
  "Clothing": ["shirt", "jacket", "dress", "scarf", "coat", "sweater", "cloth", "trouser", "shoes"],
  "Bags": ["bag", "backpack", "handbag", "suitcase", "pouch", "luggage"],
  "Books": ["book", "notebook", "diary", "novel", "textbook", "copy"],
  "Keys": ["key", "keychain", "remote"],
  "ID Card": ["card", "id", "identity", "badge"],
  "Accessories": ["watch", "ring", "bracelet", "necklace", "glasses", "belt"],
  "Stationery": ["pen", "pencil", "marker", "eraser", "ruler", "calculator"],
  "Sports Equipment": ["ball", "racket", "bat", "gloves", "helmet"],
};

function filterImageTagsByCategory(imageTags, category) {
    // "Other" category → koi filter mat lagao, sab tags rakho
  if (category === "Other" || !category) return imageTags;
  const keywords = categoryKeywords[category] || [];
  if (keywords.length === 0) return imageTags;

  const filtered = imageTags.filter(tag =>
    keywords.some(k => tag.includes(k) || k.includes(tag))
  );

  // Koi match nahi hua toh top 3 rakho fallback
  return filtered.length > 0 ? filtered : imageTags.slice(0, 3);
}

async function buildSmartData(itemData, imageLinks, category) {
  // ================================
  // 1️⃣ Check kya available hai
  // ================================
  const hasText = !!(itemData.itemName || itemData.description);
  const hasImage = imageLinks && imageLinks.length > 0;

  // ================================
  // 2️⃣ Text tags
  // ================================
  let normalizedTextTags = [];
  if (hasText) {
    const textTags = generateTextTags(itemData);
    normalizedTextTags = normalizeTags(textTags, category);
  }

  // ================================
  // 3️⃣ Image tags — category se filter
  // ================================
  let normalizedImageTags = [];
  if (hasImage) {
    try {
      let rawImageTags = [];
      for (let img of imageLinks) {
        const aiTags = await analyzeImage(img.url);
        rawImageTags = rawImageTags.concat(aiTags);
      }
      const allNormalized = normalizeTags(rawImageTags, category);

      // ✅ Category se validate — galat image tags hatao
      normalizedImageTags = filterImageTagsByCategory(allNormalized, category);
      console.log("🖼️ Filtered Image Tags:", normalizedImageTags);
    } catch (err) {
      console.error("❌ Image analysis error:", err.message);
    }
  }

  // ================================
  // 4️⃣ Adaptive strategy
  // ================================
  let embeddingText = "";
  let finalTags = [];

  if (hasText && hasImage) {
    console.log("📌 Strategy: Text + Image (text 60%, image 40%)");

    const confirmedImageTags = normalizedImageTags.filter(imgTag =>
      normalizedTextTags.some(t => t.includes(imgTag) || imgTag.includes(t))
    );
    const extraImageTags = normalizedImageTags
      .filter(imgTag =>
        !normalizedTextTags.some(t => t.includes(imgTag) || imgTag.includes(t))
      )
      .slice(0, 3);

    finalTags = [
      ...new Set([
        ...normalizedTextTags,
        ...confirmedImageTags,
        ...extraImageTags,
      ]),
    ];

    embeddingText =
      normalizedTextTags.join(" ") + " " +
      normalizedTextTags.join(" ") + " " +   // text doubled = 60%
      normalizedImageTags.join(" ") + " " +   // image = 40%
      (itemData.description || "");

  } else if (hasText && !hasImage) {
    console.log("📌 Strategy: Text only (100%)");

    finalTags = normalizedTextTags;
    embeddingText =
      normalizedTextTags.join(" ") + " " +
      (itemData.description || "");

  } else if (!hasText && hasImage) {
    console.log("📌 Strategy: Image only (100%)");

    finalTags = normalizedImageTags;
    embeddingText = normalizedImageTags.join(" ");

  } else {
    console.log("📌 Strategy: Category fallback");

    finalTags = normalizeTags([], category);
    embeddingText = category || "";
  }

  // ================================
  // 5️⃣ Embedding generate karo
  // ================================
  let embedding = [];
  try {
    if (embeddingText.trim()) {
      embedding = await generateEmbedding(embeddingText.trim());
    }
  } catch (err) {
    console.error("❌ Embedding error:", err.message);
  }

  console.log("🏷️ Final Tags:", finalTags);
  console.log(`✅ hasText: ${hasText}, hasImage: ${hasImage}, tags: ${finalTags.length}`);

  return {
    tags: finalTags,
    embedding,
    hasText,
    hasImage,
  };
}

module.exports = buildSmartData;