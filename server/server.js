const path = require("path");
const dotenv = require("dotenv");

// Always load .env from the server folder
dotenv.config({
  path: path.join(__dirname, ".env"),
});

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);

    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 HawkVision Backend running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();