const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const data = await mongoose.connect("mongodb://127.0.0.1:27017/Back2u"); // Replace with your DB_URL
    console.log(`✅ MongoDB connected with server: ${data.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

async function fixConversations() {
  try {
    await connectDatabase();
    const db = mongoose.connection;

    // Drop the old groupTitle index
    await db.collection("conversations").dropIndex("groupTitle_1").catch((err) => {
      if (err.codeName === "IndexNotFound") {
        console.log("Index 'groupTitle_1' does not exist or already removed");
      } else {
        throw err;
      }
    });

    console.log("✅ Old groupTitle index removed successfully!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

fixConversations();
