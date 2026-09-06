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

/*
 * Explicit CORS headers.
 * This makes production preflight requests reliable.
 */
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
  }

  if (req.method === "OPTIONS") {
    if (origin && allowedOrigins.includes(origin)) {
      return res.sendStatus(204);
    }

    return res.sendStatus(403);
  }

  next();
});

/*
 * CORS package for normal requests.
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin header
      // (health checks / server-to-server requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
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

app.use((err, req, res, next) => {
  console.error("Global error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* =========================================================
   EXPORT APP
   ========================================================= */

module.exports = app;