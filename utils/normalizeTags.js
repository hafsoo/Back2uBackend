const categoryTags = require("./categoryTags");

module.exports = function normalizeTags(tags = [], category = "") {
  const blacklist = [
    "photo",
    "image",
    "object",
    "thing",
    "product",
    "material",
    "equipment",
    "device"
  ];

  const map = {
    cellphone: "phone",
    mobile: "phone",
    iphone: "phone",
    android: "phone",
    notebook: "laptop",
    purse: "wallet",
    handbag: "bag",
    backpack: "bag",
    keys: "key"
  };

  let result = [];

  // 1️⃣ Add category-based tags
  if (category && categoryTags[category]) {
    result.push(...categoryTags[category]);
  }

  // 2️⃣ Normalize AI tags
  for (let tag of tags) {
    if (!tag) continue;

    tag = tag.toLowerCase().trim();
    if (tag.length <= 2) continue;

    const words = tag.split(" ");

    for (let w of words) {
      if (blacklist.includes(w)) continue;
      result.push(map[w] || w);
    }
  }

  return [...new Set(result)];
};
