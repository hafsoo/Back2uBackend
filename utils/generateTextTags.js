{/*
  function generateTextTags(data) {
  let text = "";

  if (data.itemName) text += " " + data.itemName;
  if (data.description) text += " " + data.description;
  if (data.category) text += " " + data.category;
  if (data.location) text += " " + data.location;
  if (data.customLocation) text += " " + data.customLocation;

  return [
    ...new Set(
      text
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.replace(/[^\w]/g, ""))
        .filter(word => word.length > 2)
    )
  ];
}

module.exports = generateTextTags;
*/}
function generateTextTags(data) {
  const stopWords = new Set([
    "the", "and", "with", "for", "this", "that", "have",
    "from", "was", "are", "its", "has", "but", "not", "can",
    "our", "your", "their", "been", "had", "all", "any", "into",
    "also", "just", "very", "some", "when", "then", "than",
    "there", "which", "will", "would", "could", "should",
  ]);

  let text = "";
  if (data.itemName) text += " " + data.itemName;
  if (data.description) text += " " + data.description;
  if (data.category) text += " " + data.category;
  if (data.location) text += " " + data.location;
  if (data.customLocation) text += " " + data.customLocation;

  return [
    ...new Set(
      text
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.replace(/[^\w]/g, ""))
        .filter((word) => word.length > 2 && !stopWords.has(word))
    ),
  ];
}

module.exports = generateTextTags;