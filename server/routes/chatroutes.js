const express = require("express");
const { generateReply } = require("../services/chatbot");
const {
  generateEmergencyChatReply,
} = require("../services/alertAI");

const router = express.Router();

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { message, conversation } = req.body;

    // Validate message
    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to generate chatbot response",
        error: "message is required and must be a non-empty string",
      });
    }

    // Prevent very large messages
    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Failed to generate chatbot response",
        error: "message must not exceed 1000 characters",
      });
    }

    // Validate conversation
    if (
      conversation !== undefined &&
      !Array.isArray(conversation)
    ) {
      return res.status(400).json({
        success: false,
        message: "Failed to generate chatbot response",
        error: "conversation must be an array",
      });
    }

    // Limit conversation history
    if (conversation?.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Failed to generate chatbot response",
        error: "conversation must not exceed 20 entries",
      });
    }

    const reply = await generateEmergencyChatReply(
      message.trim(),
      conversation
    );

    return res.status(200).json({
      success: true,
      message: "Chatbot response generated",
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error("Emergency chatbot error:", error);

    return res.status(502).json({
      success: false,
      message: "Failed to generate chatbot response",
      error: "Emergency AI service is temporarily unavailable",
    });
  }
});

// POST /api/chat/message
// Kept for backward compatibility
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

    return res.status(200).json({
      success: true,
      message: "Chatbot response generated",
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error("Legacy chatbot error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate chatbot response",
      error: error.message,
    });
  }
});

module.exports = router;