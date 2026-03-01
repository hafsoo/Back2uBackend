// Load environment config in dev
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "config/.env" });
}

const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const ErrorHandler = require("./middleware/error");
const app = express();

// Middleware
//app.use("/uploads", express.static("uploads"));
//app.use(express.json());
app.use(cookieParser());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:3000",
   // origin: [
   //   'https://eshop-eyuz.vercel.app',
   // ],
    credentials:true,
})
);
// Health check
app.get("/test", (req, res) => {
  res.send("✅ Backend server is running");
});

// Import routes
const user = require("./controller/user");
const lost=require("./controller/lostController")
const found=require("./controller/foundController")
const search=require("./controller/search")
const claim=require("./controller/claim")
const conversation=require("./controller/conversation")
const message=require("./controller/messages")
const statistics=require("./controller/dashboardController.js")
// Mount routes
app.use("/api/v2/user", user);
app.use("/api/v2/lost", lost);
app.use("/api/v2/found", found);
app.use("/api/v2/search",search)
app.use("/api/v2/claim",claim)
app.use("/api/v2/conversation",conversation)
app.use("/api/v2/message",message)
app.use("/api/v2/statistics",statistics)

// Error Handler (must come last)
app.use(ErrorHandler);

module.exports = app;
