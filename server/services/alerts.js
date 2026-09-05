const Alert = require("../models/alert");

const normalizeSosStatus = (status) => {
  switch (status) {
    case "Acknowledged":
      return "ACKNOWLEDGED";

    case "Resolved":
    case "Cancelled":
      return "RESOLVED";

    case "Active":
    default:
      return "ACTIVE";
  }
};

const normalizeSosSeverity = (priority) => {
  switch (priority) {
    case "Critical":
      return "CRITICAL";

    case "High":
      return "HIGH";

    case "Medium":
      return "MEDIUM";

    default:
      return "HIGH";
  }
};

const buildDisasterAlert = (disaster) => ({
  id: disaster._id,

  type: disaster.type || "Disaster",

  title:
    disaster.description ||
    `${disaster.type || "Disaster"} Incident`,

  message:
    disaster.description ||
    `${disaster.severity || "UNKNOWN"} ${
      disaster.type || "Disaster"
    } emergency reported at ${
      disaster.location || "Unknown location"
    }.`,

  severity: disaster.severity || "MEDIUM",

  location: disaster.location || "",

  status: disaster.status || "ACTIVE",

  latitude:
    disaster.latitude !== undefined
      ? disaster.latitude
      : null,

  longitude:
    disaster.longitude !== undefined
      ? disaster.longitude
      : null,

  createdAt: disaster.createdAt,

  source: "Disaster",

  isManaged: false,
});

const buildSosAlert = (sos) => ({
  id: sos._id,

  type: "SOS Emergency",

  title: sos.notes || "SOS Distress Signal",

  message:
    sos.notes ||
    `${sos.priority || "HIGH"} priority SOS distress signal from ${
      sos.location || "Unknown location"
    }.`,

  severity: normalizeSosSeverity(sos.priority),

  location: sos.location || "",

  status: normalizeSosStatus(sos.status),

  latitude:
    sos.latitude !== undefined
      ? sos.latitude
      : null,

  longitude:
    sos.longitude !== undefined
      ? sos.longitude
      : null,

  createdAt: sos.createdAt,

  source: "SOS",

  isManaged: true,
});

const buildAlerts = (
  disasters = [],
  sosSignals = []
) => {
  const alerts = [
    ...disasters.map(buildDisasterAlert),
    ...sosSignals.map(buildSosAlert),
  ];

  return alerts.sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );
};

const createAlert = async ({
  type,
  title,
  description = "",
  severity,
  source = "",
  location = {},
  metadata = {},
}) => {
  const alert = await Alert.create({
    type,
    title,
    description,
    severity,
    source,
    location,
    metadata,
  });

  return alert;
};

module.exports = {
  buildAlerts,
  createAlert,
};