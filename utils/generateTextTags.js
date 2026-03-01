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
