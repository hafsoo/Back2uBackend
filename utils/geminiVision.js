const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Supported MIME types by Gemini Vision
const SUPPORTED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

function getMimeTypeFromUrl(url) {
  const ext = url.split("?")[0].split(".").pop().toLowerCase();
  const map = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
  };
  return map[ext] || null;
}

async function analyzeImage(imageUrl) {
  try {
    // Fetch image as Base64
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageData = Buffer.from(response.data, "binary").toString("base64");

    // Detect MIME type: first from response headers, then from URL extension
    const contentType = response.headers["content-type"]?.split(";")[0].trim();
    const mimeType =
      (SUPPORTED_MIME_TYPES.has(contentType) ? contentType : null) ||
      getMimeTypeFromUrl(imageUrl);

    if (!mimeType) {
      console.error("❌ Unsupported or undetectable image type:", contentType);
      return [];
    }

    // Get model
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    // Generate content
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType, // ✅ Dynamic instead of hardcoded "image/png"
        },
      },
      {
        text: "Identify the main objects in this image and return short tags only, separated by commas.",
      },
    ]);

    // Extract tags safely
    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) return [];

    return text
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

  } catch (err) {
    console.error("❌ Gemini AI Error in analyzeImage:", err.response?.data || err.message);
    return [];
  }
}

module.exports = analyzeImage;


/*
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeImage(imageUrl) {
  try {
    // Fetch image as Base64
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageData = Buffer.from(response.data, "binary").toString("base64");

    // Get model
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    // Generate content
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: "image/png",
        },
      },
      {
        text: "Identify the main objects in this image and return short tags only, separated by commas."
      }
    ]);

    // Log raw response for debugging
    console.log("Gemini raw response:", JSON.stringify(result, null, 2));

    // Extract tags safely from the new structure
    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) return [];

    // Split and normalize tags
    return text
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);

  } catch (err) {
    console.error("❌ Gemini AI Error in analyzeImage:", err.response?.data || err.message);
    return [];
  }
}

module.exports = analyzeImage;
*/