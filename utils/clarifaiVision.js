require("dotenv").config();
const axios = require("axios");

async function detectLabelsClarifai(imageUrl) {
  const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY?.trim();
  const USER_ID = process.env.USER_ID?.trim();
  const APP_ID = process.env.APP_ID?.trim();
  const MODEL_ID = "general-image-recognition";
  const MODEL_VERSION_ID = "aa7f35c01e0642fda5cf400f543e7c40";
  

  if (!CLARIFAI_API_KEY || !USER_ID || !APP_ID) {
    throw new Error("Missing Clarifai API credentials");
  }

  const payload = {
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID
    },
    inputs: [
      {
        data: {
          image: { url: imageUrl }
        }
      }
    ]
  };

  const headers = {
    "Authorization": `Key ${CLARIFAI_API_KEY}`,
    "Content-Type": "application/json"
  };

  try {
    const response = await axios.post(
        `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
      payload,
      { headers }
    );

    const concepts = response.data.outputs?.[0]?.data?.concepts || [];
    return concepts
      .filter(c => c.value >= 0.85)
      .map(c => c.name.toLowerCase());

  } catch (err) {
    console.error("❌ Clarifai API error:", err.response?.data || err.message);
    return [];
  }
}

// Test with an image
(async () => {
  const testImage = "https://samples.clarifai.com/metro-north.jpg";
  const tags = await detectLabelsClarifai(testImage);
  console.log("Detected tags:", tags);
})();