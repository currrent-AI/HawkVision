const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// ============================================================
// HAWKVISION VICTIM DETECTION
// Render Backend → Colab T4 GPU → YOLO26m
// ============================================================

const PYTHON_PATH =
  process.env.PYTHON_PATH ||
  (process.platform === "win32" ? "python" : "python3");

const MODEL_PATH =
  process.env.VICTIM_MODEL_PATH ||
  process.env.DRONE_MODEL_PATH ||
  path.resolve(__dirname, "../yolo26m.pt");

const SCRIPT_PATH = path.join(__dirname, "victimDetection.py");

// Local fallback timeout
const LOCAL_TIMEOUT_MS = 300000;

// Remote Colab timeout
const REMOTE_TIMEOUT_MS = 300000;

// ============================================================
// REMOTE COLAB GPU DETECTION
// ============================================================

async function runColabDetection(imagePath) {
  const colabUrl = process.env.COLAB_GPU_URL;

  if (!colabUrl) {
    throw new Error("COLAB_GPU_URL is not configured");
  }

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  const cleanBaseUrl = colabUrl.replace(/\/+$/, "");
  const endpoint = `${cleanBaseUrl}/api/victims/detect`;

  console.log("🚀 Using Colab T4 GPU for victim detection");
  console.log("🔗 GPU endpoint:", endpoint);

  const imageBuffer = await fs.promises.readFile(imagePath);

  const filename = path.basename(imagePath);

  const formData = new FormData();

  formData.append(
    "image",
    new Blob([imageBuffer]),
    filename
  );

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REMOTE_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(
        `Colab returned invalid JSON. HTTP ${response.status}: ${
          responseText.substring(0, 500) || "empty response"
        }`
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          `Colab GPU detection failed with HTTP ${response.status}`
      );
    }

    if (data?.success === false) {
      throw new Error(
        data?.error || "Colab victim detection failed"
      );
    }

    console.log(
      `✅ Colab GPU detection completed: ${
        data?.totalVictims ?? 0
      } victims`
    );

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Colab GPU victim detection timed out after 5 minutes"
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================
// LOCAL PYTHON FALLBACK
// ============================================================

function runPythonDetection(imagePath) {
  return new Promise((resolve, reject) => {
    console.log("🐍 Using local Python victim detection");

    const child = spawn(
      PYTHON_PATH,
      [
        SCRIPT_PATH,
        MODEL_PATH,
        imagePath,
      ],
      {
        env: process.env,
      }
    );

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Victim detection timed out"));
    }, LOCAL_TIMEOUT_MS);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);

      reject(
        new Error(
          `Unable to start Python victim detection: ${error.message}`
        )
      );
    });

    child.on("close", (code) => {
      clearTimeout(timeout);

      let parsed = null;

      try {
        parsed = JSON.parse(stdout.trim());
      } catch {
        parsed = null;
      }

      if (code !== 0) {
        const detail =
          (parsed && parsed.error) ||
          stderr.trim() ||
          stdout.trim() ||
          "no error output";

        return reject(
          new Error(
            `Victim detection failed (exit code ${code}): ${detail}`
          )
        );
      }

      if (!parsed) {
        return reject(
          new Error(
            `Failed to parse victim detection output: ${
              stdout.trim() || "empty output"
            }`
          )
        );
      }

      if (parsed.error) {
        return reject(new Error(parsed.error));
      }

      resolve(parsed);
    });
  });
}

// ============================================================
// MAIN DETECTION FUNCTION
// ============================================================

async function detectVictims(imagePath) {
  if (!imagePath || typeof imagePath !== "string") {
    throw new Error("Image path is required");
  }

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  if (!fs.statSync(imagePath).isFile()) {
    throw new Error(`Path is not a file: ${imagePath}`);
  }

  // ----------------------------------------------------------
  // PRIMARY: COLAB T4 GPU
  // ----------------------------------------------------------

  if (process.env.COLAB_GPU_URL) {
    return await runColabDetection(imagePath);
  }

  // ----------------------------------------------------------
  // FALLBACK: LOCAL PYTHON
  // ----------------------------------------------------------

  if (!fs.existsSync(SCRIPT_PATH)) {
    throw new Error(
      `Victim detection script not found: ${SCRIPT_PATH}`
    );
  }

  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(
      `Victim detection model not found: ${MODEL_PATH}. ` +
        `Set VICTIM_MODEL_PATH in the Render environment variables.`
    );
  }

  return await runPythonDetection(imagePath);
}

module.exports = {
  detectVictims,
};