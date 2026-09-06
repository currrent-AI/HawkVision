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

/* =========================================================
   CORS CONFIGURATION
   ========================================================= */

const allowedOrigins = [
  "https://hawkvision-3.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : []),
];

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (health checks / server-to-server requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);

      // Don't crash the server for an unknown origin
      return callback(null, false);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/* =========================================================
   BODY PARSING
   ========================================================= */

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================================================
   HEALTH / ROOT ROUTES
   ========================================================= */

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

/* =========================================================
   API ROUTES
   ========================================================= */

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

/* =========================================================
   404 HANDLER
   ========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
   ========================================================= */

app.use((error, req, res, next) => {
  console.error("Global error:", error);

  res.status(error.status || 500).json({
    success: false,
    message:
      error.message || "Internal server error",
  });
});

/* =========================================================
   EXPORT APP
   ========================================================= */

module.exports = app;