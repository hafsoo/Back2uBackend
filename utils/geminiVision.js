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
