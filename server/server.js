const path = require("path");
const dotenv = require("dotenv");

// Always load .env from the server folder
dotenv.config({
  path: path.join(__dirname, ".env"),
});

const app = require("./app");
const connectDB = require("./config/db");
const {
  runFloodMonitoringCycle,
} = require("./services/floodMonitor");

const PORT = process.env.PORT || 5000;

// Automatic flood monitoring interval
// 10 minutes = 600,000 milliseconds
const FLOOD_MONITOR_INTERVAL = 10 * 60 * 1000;

const startFloodMonitoring = () => {
  console.log(
    "🌧️ Automatic flood monitoring initialized."
  );

  /*
   * Run one monitoring cycle immediately
   * when the server starts.
   */
  runFloodMonitoringCycle()
    .then(() => {
      console.log(
        "✅ Initial flood monitoring cycle completed."
      );
    })
    .catch((error) => {
      console.error(
        "❌ Initial flood monitoring cycle failed:",
        error.message
      );
    });

  /*
   * Run another monitoring cycle every 10 minutes.
   */
  setInterval(() => {
    runFloodMonitoringCycle()
      .then(() => {
        console.log(
          "✅ Scheduled flood monitoring cycle completed."
        );
      })
      .catch((error) => {
        console.error(
          "❌ Scheduled flood monitoring cycle failed:",
          error.message
        );
      });
  }, FLOOD_MONITOR_INTERVAL);

  console.log(
    "⏱️ Next automatic flood monitoring cycle will run in 10 minutes."
  );
};

const startServer = async () => {
  try {
    console.log(
      "MONGO_URI loaded:",
      !!process.env.MONGO_URI
    );

    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `HawkVision Backend running on port ${PORT}`
      );

      /*
       * Start automatic flood monitoring
       * only after the server and database are ready.
       */
      startFloodMonitoring();
    });
  } catch (error) {
    console.error(
      "❌ Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();