const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const protect = require("../middleware/protect");

// =====================================================
// SIGN UP
// POST /api/auth/signup
// =====================================================

router.post("/signup", async (req, res) => {
  try {
    const {
      fullName,
      email,
      username,
      password,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // Normalize values
    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedUsername =
      username.trim();

    // Check existing user
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    });

    if (existingUser) {
      if (
        existingUser.email ===
        normalizedEmail
      ) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password,
    });

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (
      error.name === "ValidationError"
    ) {
      const messages = Object.values(
        error.errors
      ).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Server error during signup",
      error: error.message,
    });
  }
});

// =====================================================
// LOGIN
// POST /api/auth/login
// Supports EMAIL OR USERNAME
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      identifier,
    } = req.body;

    // Frontend may send email, username,
    // or a generic identifier field.
    const loginValue =
      identifier ||
      email ||
      username;

    if (
      !loginValue ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email/username and password are required",
      });
    }

    const value =
      loginValue.trim();

    // Find user by email OR username
    const user = await User.findOne({
      $or: [
        {
          email: value.toLowerCase(),
        },
        {
          username: value,
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password with hashed password
    const isMatch =
      await user.comparePassword(
        password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error during login",
      error: error.message,
    });
  }
});

// =====================================================
// GET CURRENT USER
// GET /api/auth/me
// =====================================================

router.get(
  "/me",
  protect,
  async (req, res) => {
    try {
      return res.status(200).json({
        success: true,
        user: {
          id: req.user._id,
          fullName: req.user.fullName,
          email: req.user.email,
          username: req.user.username,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch user",
      });
    }
  }
);

module.exports = router;