const LostItem = require("../model/LostItem");
const FoundItem = require("../model/FoundItem");

// ============================================
// ITEM TYPE GROUPS — All Categories
// ============================================

const ITEM_TYPE_GROUPS = [

  // ═══════════════════════════════
  // ELECTRONICS
  // ═══════════════════════════════
  ["laptop", "macbook", "notebook", "chromebook", "thinkpad", "lenovo", "dell", "hp laptop", "asus laptop", "acer", "surface laptop", "gaming laptop", "ultrabook"],
  ["phone", "iphone", "samsung", "mobile", "smartphone", "android", "oneplus", "pixel", "redmi", "oppo", "vivo", "huawei", "realme", "nokia", "motorola", "xiaomi", "infinix", "tecno"],
  ["airpod", "earphone", "earbud", "headphone", "headset", "buds", "earpiece", "wireless earphone", "tws", "jbl earphone", "sony earphone"],
  ["powerbank", "power bank", "power-bank", "portable charger", "battery bank", "anker", "baseus"],
  ["tablet", "ipad", "tab", "surface pro", "kindle", "e-reader", "galaxy tab"],
  ["watch", "smartwatch", "apple watch", "smart watch", "fitbit", "garmin", "mi band", "fitness band", "wristband"],
  ["camera", "dslr", "canon", "nikon", "sony camera", "fujifilm", "gopro", "action camera", "webcam", "digital camera"],
  ["charger", "adapter", "charging cable", "usb cable", "type c cable", "lightning cable", "power adapter", "travel adapter"],
  ["calculator", "scientific calculator", "casio", "fx calculator"],
  ["keyboard", "mechanical keyboard", "wireless keyboard", "bluetooth keyboard"],
  ["mouse", "wireless mouse", "gaming mouse", "touchpad"],
  ["hard drive", "external drive", "ssd", "usb drive", "flash drive", "pendrive", "pen drive", "memory card", "sd card"],
  ["speaker", "bluetooth speaker", "jbl", "portable speaker", "mini speaker"],
  ["remote", "tv remote", "ac remote", "remote control"],
  ["router", "wifi device", "hotspot device", "modem"],

  // ═══════════════════════════════
  // BAGS
  // ═══════════════════════════════
  ["backpack", "rucksack", "school bag", "university bag", "student bag", "hiking bag"],
  ["handbag", "hand bag", "tote bag", "tote", "ladies bag", "women bag", "purse bag"],
  ["suitcase", "luggage", "trolley bag", "travel bag", "travel suitcase", "cabin bag"],
  ["laptop bag", "laptop case", "laptop sleeve", "sleeve", "laptop pouch"],
  ["shoulder bag", "sling bag", "crossbody", "messenger bag", "side bag"],
  ["gym bag", "duffle", "duffel", "sports bag", "kit bag"],
  ["clutch", "evening bag", "party bag", "wristlet"],
  ["drawstring bag", "string bag", "pouch bag"],
  ["diaper bag", "baby bag", "nappy bag"],
  ["camera bag", "photography bag"],
  ["tool bag", "toolbox bag"],

  // ═══════════════════════════════
  // CLOTHING
  // ═══════════════════════════════
  ["shirt", "t-shirt", "tshirt", "polo", "formal shirt", "casual shirt", "dress shirt", "kurta", "kameez"],
  ["jacket", "coat", "hoodie", "sweater", "sweatshirt", "pullover", "windbreaker", "blazer", "waistcoat", "vest", "fleece"],
  ["trouser", "pants", "jeans", "shalwar", "trousers", "chinos", "cargo pants", "sweatpants", "track pants"],
  ["shoes", "sneakers", "boots", "chappal", "sandal", "heels", "loafers", "oxfords", "moccasins", "slippers", "flip flops", "khussa", "sports shoes", "running shoes"],
  ["scarf", "dupatta", "shawl", "stole", "muffler", "neck warmer"],
  ["cap", "hat", "topi", "beanie", "beret", "sun hat", "bucket hat", "baseball cap", "turban"],
  ["dress", "frock", "gown", "maxi", "mini dress", "shalwar kameez", "suit"],
  ["abaya", "hijab", "niqab", "burqa", "prayer clothes"],
  ["uniform", "school uniform", "office uniform", "sports uniform"],
  ["socks", "stockings", "tights", "leggings"],
  ["gloves", "winter gloves", "hand gloves", "mittens"],
  ["belt", "leather belt", "fabric belt"],
  ["tie", "necktie", "bow tie"],
  ["raincoat", "poncho", "waterproof jacket"],

  // ═══════════════════════════════
  // ACCESSORIES
  // ═══════════════════════════════
  ["ring", "wedding ring", "engagement ring", "finger ring", "gold ring", "silver ring"],
  ["necklace", "chain", "locket", "pendant", "choker", "gold chain", "silver chain"],
  ["bracelet", "bangle", "kara", "wristband", "charm bracelet", "gold bracelet"],
  ["glasses", "spectacles", "sunglasses", "eyeglasses", "reading glasses", "prescription glasses", "goggles"],
  ["earring", "ear ring", "stud", "hoop earring", "jhumka", "ear stud"],
  ["brooch", "pin", "badge pin", "lapel pin"],
  ["hair clip", "hairpin", "hair band", "scrunchie", "hair tie", "bobby pin"],
  ["umbrella", "rain umbrella", "sun umbrella", "parasol"],
  ["wallet", "billfold", "money clip", "card holder", "leather wallet"],
  ["purse", "coin purse", "mini wallet"],
  ["keychain", "key ring", "key holder", "key fob"],
  ["watch strap", "watch band"],
  ["luggage tag", "bag tag", "travel tag"],

  // ═══════════════════════════════
  // BOOKS & STATIONERY
  // ═══════════════════════════════
  ["book", "novel", "textbook", "course book", "reference book", "guidebook", "manual"],
  ["notebook", "diary", "journal", "copy", "register", "spiral notebook", "composition book"],
  ["pen", "ballpoint", "gel pen", "fountain pen", "rollerball"],
  ["pencil", "mechanical pencil", "graphite pencil", "colored pencil"],
  ["marker", "highlighter", "whiteboard marker", "permanent marker", "sharpie"],
  ["eraser", "rubber eraser", "correction pen", "whitener", "liquid paper"],
  ["ruler", "scale", "measuring tape", "protractor", "compass"],
  ["stapler", "staple remover", "hole punch", "paper clip", "binder clip"],
  ["folder", "file folder", "document folder", "binder", "portfolio"],
  ["sticky notes", "post it", "memo pad", "notepad"],
  ["glue", "glue stick", "tape", "sellotape", "scotch tape"],
  ["scissors", "cutter", "box cutter", "craft knife"],
  ["sketch book", "drawing book", "art book", "coloring book"],
  ["geometry box", "math set", "compass box"],

  // ═══════════════════════════════
  // KEYS
  // ═══════════════════════════════
  ["car key", "vehicle key", "automobile key", "auto key", "car remote key"],
  ["motorcycle key", "bike key", "scooter key", "motorbike key"],
  ["house key", "home key", "apartment key", "flat key", "door key"],
  ["room key", "hostel key", "hotel key", "locker key", "cabinet key"],
  ["office key", "university key", "lab key", "classroom key"],
  ["safe key", "vault key", "mailbox key"],

  // ═══════════════════════════════
  // ID CARDS & DOCUMENTS
  // ═══════════════════════════════
  ["id card", "identity card", "student id", "student card", "university card", "college card"],
  ["cnic", "national id", "national identity card", "nadra card", "computerized id"],
  ["passport", "travel document", "passport book"],
  ["driving license", "driving licence", "driver license", "dl card"],
  ["atm card", "debit card", "credit card", "bank card", "visa card", "mastercard"],
  ["library card", "membership card", "loyalty card", "club card"],
  ["health card", "medical card", "insurance card", "sehat card"],
  ["employee card", "staff card", "work id", "office id"],
  ["certificate", "degree", "diploma", "result card", "transcript"],
  ["boarding pass", "flight ticket", "train ticket", "bus ticket"],

  // ═══════════════════════════════
  // SPORTS EQUIPMENT
  // ═══════════════════════════════
  ["cricket bat", "bat"],
  ["football", "soccer ball", "futsal ball"],
  ["cricket ball", "tennis ball", "rubber ball"],
  ["basketball", "basket ball"],
  ["volleyball", "volley ball"],
  ["badminton racket", "tennis racket", "squash racket", "racket", "racquet"],
  ["boxing gloves", "batting gloves", "cricket gloves", "goalkeeper gloves", "sports gloves"],
  ["helmet", "cricket helmet", "bike helmet", "cycling helmet", "safety helmet"],
  ["shin guard", "knee pad", "elbow pad", "protective gear"],
  ["swimming goggles", "swim cap", "swimming cap"],
  ["yoga mat", "exercise mat", "gym mat"],
  ["skipping rope", "jump rope"],
  ["dumbbell", "weight plate", "gym weight"],
  ["water bottle", "sports bottle", "sipper bottle"],
  ["protein shaker", "gym shaker", "blender bottle"],
  ["cycling shoes", "cleats", "sports cleats"],
  ["jersey", "sports shirt", "kit", "sports uniform"],

  // ═══════════════════════════════
  // MEDICAL & PERSONAL CARE
  // ═══════════════════════════════
  ["medicine", "tablet", "capsule", "pills", "injection", "prescription"],
  ["glasses case", "spectacle case", "contact lens", "lens case"],
  ["hearing aid", "ear aid"],
  ["inhaler", "nebulizer", "asthma pump"],
  ["crutches", "walking stick", "cane", "wheelchair"],
  ["first aid kit", "medical kit", "bandage", "plaster"],

  // ═══════════════════════════════
  // FOOD & CONTAINERS
  // ═══════════════════════════════
  ["lunch box", "tiffin", "food container", "meal prep box"],
  ["thermos", "flask", "vacuum flask", "coffee thermos"],
  ["water bottle", "drinking bottle", "hydro flask"],
  ["mug", "travel mug", "coffee mug", "tumbler"],

  // ═══════════════════════════════
  // MUSICAL INSTRUMENTS
  // ═══════════════════════════════
  ["guitar", "acoustic guitar", "electric guitar", "ukulele"],
  ["violin", "fiddle"],
  ["flute", "recorder", "wind instrument"],
  ["harmonica", "mouth organ"],
  ["drum sticks", "drumsticks", "percussion"],
  ["piano", "keyboard instrument", "synthesizer"],

  // ═══════════════════════════════
  // TOOLS & EQUIPMENT
  // ═══════════════════════════════
  ["screwdriver", "wrench", "spanner", "pliers", "hammer"],
  ["drill", "power drill", "electric drill"],
  ["measuring tape", "tape measure"],
  ["torch", "flashlight", "headlamp"],
  ["extension cord", "power strip", "multi plug"],
  ["tripod", "camera stand", "phone stand", "selfie stick"],

  // ═══════════════════════════════
  // KIDS & TOYS
  // ═══════════════════════════════
  ["toy", "stuffed animal", "teddy bear", "doll", "action figure"],
  ["lego", "building blocks", "puzzle"],
  ["remote control car", "rc car", "toy car"],
  ["board game", "card game", "chess", "checkers"],
  ["baby stroller", "pram", "pushchair"],
  ["baby carrier", "sling carrier"],
];

// ============================================
// HELPER FUNCTIONS
// ============================================
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

function isSameItemType(inputData, candidate) {
  const inputName = (inputData.itemName || "").toLowerCase();
  const candidateName = (candidate.itemName || "").toLowerCase();

  let inputType = null;
  let candidateType = null;

  for (let i = 0; i < ITEM_TYPE_GROUPS.length; i++) {
    const group = ITEM_TYPE_GROUPS[i];
    if (group.some((k) => inputName.includes(k))) inputType = i;
    if (group.some((k) => candidateName.includes(k))) candidateType = i;
  }

  // Dono ka type detect hua aur alag hai → filter out
  if (inputType !== null && candidateType !== null && inputType !== candidateType) {
    return false;
  }

  return true;
}

// ============================================
// HYBRID SCORE COMPUTATION
// ============================================
function computeHybridScore({ item, inputData }) {
  // 1️⃣ Embedding Similarity (Cosine)
  const embeddingSim =
    inputData.embedding?.length && item.embedding?.length
      ? cosineSimilarity(inputData.embedding, item.embedding)
      : 0;

  // 2️⃣ Tag Similarity (Jaccard)
  const inputTags = inputData.tags || [];
  const itemTags = item.tags || [];
  const commonTags = inputTags.filter((t) => itemTags.includes(t));
  const totalUniqueTags = new Set([...inputTags, ...itemTags]).size;
  const normalizedTagScore =
    totalUniqueTags === 0 ? 0 : commonTags.length / totalUniqueTags;

  // 3️⃣ Location Score (exact match)
  let locationScore = 0;
  if (
    inputData.location &&
    item.location &&
    inputData.location.toLowerCase().trim() ===
      item.location.toLowerCase().trim()
  ) {
    locationScore = 1;
  }

  // 4️⃣ Date Score
  let dateScore = 0;
  const date1 = inputData.dateLost || inputData.dateFound;
  const date2 = item.dateLost || item.dateFound;
  if (date1 && date2) {
    const diff = dateDiffInDays(date1, date2);
    if (diff <= 1)       dateScore = 1;
    else if (diff <= 3)  dateScore = 0.7;
    else if (diff <= 7)  dateScore = 0.4;
    else if (diff <= 14) dateScore = 0.2;
    else if (diff <= 30) dateScore = 0.1;
    else                 dateScore = 0;
  }

  // 5️⃣ Image Score
  const imageScore =
    inputData.images?.length > 0 && item.images?.length > 0 ? 1 : 0;

  // 6️⃣ Weights
  const weights = {
    embedding: 0.55,
    tag:       0.25,
    location:  0.10,
    date:      0.05,
    image:     0.05,
  };

  // 7️⃣ Final Hybrid Score
  const hybridScore =
    embeddingSim        * weights.embedding +
    normalizedTagScore  * weights.tag +
    locationScore       * weights.location +
    dateScore           * weights.date +
    imageScore          * weights.image;

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

// ============================================
// 30-DAY WINDOW HELPER
// ============================================
const thirtyDaysAgo = () =>
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

// ============================================
// MATCH LOST → FOUND
// ============================================
async function matchLostWithFound(tags, category, lostItemData = {}) {
  const candidates = await FoundItem.find({
    category,
    createdAt: { $gte: thirtyDaysAgo() },
  });

  const matches = candidates
    .map((item) => {
      // ✅ Fix 1: Item type check (phone vs laptop, backpack vs handbag etc.)
      if (!isSameItemType(lostItemData, item)) return null;

      const scoreObj = computeHybridScore({ item, inputData: lostItemData });

      // ✅ Fix 2: Raised thresholds + minimum tag overlap
      if (
        scoreObj.hybridScore       < 0.60 ||
        scoreObj.embeddingSim      < 0.65 ||
        scoreObj.normalizedTagScore < 0.15
      ) return null;

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

// ============================================
// MATCH FOUND → LOST
// ============================================
async function matchFoundWithLost(tags, category, foundItemData = {}) {
  const candidates = await LostItem.find({
    category,
    createdAt: { $gte: thirtyDaysAgo() },
  });

  const matches = candidates
    .map((item) => {
      // ✅ Fix 1: Item type check
      if (!isSameItemType(foundItemData, item)) return null;

      const scoreObj = computeHybridScore({ item, inputData: foundItemData });

      // ✅ Fix 2: Raised thresholds + minimum tag overlap
      if (
        scoreObj.hybridScore        < 0.60 ||
        scoreObj.embeddingSim       < 0.65 ||
        scoreObj.normalizedTagScore < 0.15
      ) return null;

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

{/** yeh sahi hn

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
      if (scoreObj.hybridScore < 0.60|| scoreObj.embeddingSim < 0.65||  scoreObj.normalizedTagScore < 0.15)
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
      if (scoreObj.hybridScore < 0.60 || scoreObj.embeddingSim < 0.65||  scoreObj.normalizedTagScore < 0.15)
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
*/}

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