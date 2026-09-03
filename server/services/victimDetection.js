const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const PYTHON_PATH =
  process.env.PYTHON_PATH ||
  "C:/Users/lenovo/AppData/Local/Programs/Python/Python313/python.exe";

const MODEL_PATH =
  process.env.VICTIM_MODEL_PATH ||
  process.env.DRONE_MODEL_PATH ||
  "C:/Users/lenovo/yolo26n.pt";
const SCRIPT_PATH = path.join(__dirname, "victimDetection.py");

const TIMEOUT_MS = 300000;

function runPythonDetection(imagePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_PATH, [
      SCRIPT_PATH,
      MODEL_PATH,
      imagePath,
    ]);

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Victim detection timed out"));
    }, TIMEOUT_MS);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
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
            `Failed to parse victim detection output: ${stdout.trim()}`
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

  return await runPythonDetection(imagePath);
}

module.exports = {
  detectVictims,
};