const axios = require("axios");

const API_KEY = process.env.VISION_API_KEY;

async function detectLabels(imageUrl) {
  const response = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
    {
      requests: [
        {
          image: { source: { imageUri: imageUrl } },
          features: [{ type: "LABEL_DETECTION", maxResults: 6 }],
        },
      ],
    }
  );

  const labels =
    response.data.responses?.[0]?.labelAnnotations || [];

  return labels.map(l => l.description.toLowerCase());
}

module.exports = detectLabels;
