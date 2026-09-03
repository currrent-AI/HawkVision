const express = require("express");
const { generateReply } = require("../services/chatbot");

const router = express.Router();

// POST a chat message and get the chatbot reply
router.post("/message", async (req, res) => {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to generate chatbot response",
        error: "message is required and must be a non-empty string",
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Failed to generate chatbot response",
        error: "message must not exceed 1000 characters",
      });
    }

    const reply = await generateReply(message.trim());

    res.status(200).json({
      success: true,
      message: "Chatbot response generated",
      data: {
        reply,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate chatbot response",
      error: error.message,
    });
  }
});

module.exports = router;
