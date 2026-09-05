const express = require("express");
const cors = require("cors");

const disasterRoutes = require("./routes/disasterroutes");
const shelterRoutes = require("./routes/shelterroutes");
const victimRoutes = require("./routes/victimroutes");
const droneRoutes = require("./routes/droneroutes");
const floodRoutes = require("./routes/floodroutes");
const sosRoutes = require("./routes/sosroutes");
const chatRoutes = require("./routes/chatroutes");
const alertRoutes = require("./routes/alertroutes");
const authRoutes = require("./routes/authroutes");
const floodMonitorRoutes = require("./routes/floodmonitorroutes");

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HawkVision AI Backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    system: "HawkVision AI",
    status: "operational",
  });
});

app.use("/api/disasters", disasterRoutes);
app.use("/api/shelters", shelterRoutes);
app.use("/api/victims", victimRoutes);
app.use("/api/drone", droneRoutes);
app.use("/api/flood", floodRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/flood/monitor", floodMonitorRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use((error, req, res, next) => {
  console.error("Global error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

module.exports = app;