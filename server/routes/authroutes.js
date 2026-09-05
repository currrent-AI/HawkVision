const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user");
const protect = require("../middleware/protect");

const {
  sendPasswordResetEmail,
} = require("../services/emailService");

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

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedUsername =
      username.trim();

    const existingUser =
      await User.findOne({
        $or: [
          {
            email: normalizedEmail,
          },
          {
            username: normalizedUsername,
          },
        ],
      });

    if (existingUser) {
      if (
        existingUser.email ===
        normalizedEmail
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email already registered",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          "Username already taken",
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password,
    });

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
      message:
        "User registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
      },
    });

  } catch (error) {

    console.error(
      "Signup error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      const messages =
        Object.values(
          error.errors
        ).map(
          (err) => err.message
        );

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

    const loginValue =
      identifier ||
      email ||
      username;

    if (!loginValue || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email/username and password are required",
      });
    }

    const value =
      loginValue.trim();

    const user =
      await User.findOne({
        $or: [
          {
            email:
              value.toLowerCase(),
          },
          {
            username: value,
          },
        ],
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    const isMatch =
      await user.comparePassword(
        password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

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
      message:
        "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
      },
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during login",
      error: error.message,
    });
  }
});

// =====================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// =====================================================

router.post(
  "/forgot-password",
  async (req, res) => {

    try {

      const { email } =
        req.body;

      // Validate email
      if (
        !email ||
        !email.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required",
        });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      console.log(
        "Password reset requested for:",
        normalizedEmail
      );

      // Find user
      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      // Always return generic response.
      // Prevents email/account enumeration.
      const genericResponse = {
        success: true,
        message:
          "If an account exists for this email, a password reset link has been sent.",
      };

      // User doesn't exist
      if (!user) {

        console.log(
          "No account found for:",
          normalizedEmail
        );

        return res
          .status(200)
          .json(
            genericResponse
          );
      }

      console.log(
        "User found:",
        user.email
      );

      // =================================================
      // Generate secure reset token
      // =================================================

      const rawToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      // Hash token before storing
      const tokenHash =
        crypto
          .createHash("sha256")
          .update(rawToken)
          .digest("hex");

      // Store token hash
      user.passwordResetTokenHash =
        tokenHash;

      // Token expires in 15 minutes
      user.passwordResetExpires =
        new Date(
          Date.now() +
            15 * 60 * 1000
        );

      await user.save();

      console.log(
        "Password reset token generated successfully."
      );

      // =================================================
      // Create reset URL
      // =================================================

      const frontendUrl =
        process.env.FRONTEND_URL ||
        "http://localhost:5173";

      const resetUrl =
        `${frontendUrl.replace(
          /\/$/,
          ""
        )}/reset-password/${rawToken}`;

      console.log(
        "Reset URL generated successfully."
      );

      // =================================================
      // Send email
      // =================================================

      try {

        await sendPasswordResetEmail({
          to: user.email,
          fullName: user.fullName,
          resetUrl,
        });

        console.log(
          "Password reset email process completed."
        );

     } catch (emailError) {
  console.error(
    "Password reset email FULL ERROR:",
    emailError
  );

        console.error(
          "Code:",
          emailError.code
        );

        console.error(
          "Command:",
          emailError.command
        );

        console.error(
          "Response:",
          emailError.response
        );

        console.error(
          "Response Code:",
          emailError.responseCode
        );

        console.error(
          "Stack:",
          emailError.stack
        );

        console.error(
          "================================================"
        );

        // Invalidate reset token
        user.passwordResetTokenHash =
          null;

        user.passwordResetExpires =
          null;

        await user.save();

        return res.status(500).json({
          success: false,
          message:
            "Unable to send password reset email. Please try again later.",
        });
      }

      // =================================================
      // Success
      // =================================================

      return res
        .status(200)
        .json(
          genericResponse
        );

    } catch (error) {

      console.error(
        "Forgot password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while processing password reset request",
      });
    }
  }
);

// =====================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// =====================================================

router.post(
  "/reset-password",
  async (req, res) => {

    try {

      const {
        token,
        password,
      } = req.body;

      if (
        !token ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Reset token and password are required",
        });
      }

      if (
        password.length < 6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters",
        });
      }

      // Hash incoming token
      const tokenHash =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

      // Find valid user/token
      const user =
        await User.findOne({
          passwordResetTokenHash:
            tokenHash,

          passwordResetExpires: {
            $gt: new Date(),
          },
        });

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "This password reset link is invalid or has expired.",
        });
      }

      // Set new password
      user.password =
        password;

      // Clear reset token
      user.passwordResetTokenHash =
        null;

      user.passwordResetExpires =
        null;

      // save() triggers bcrypt middleware
      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Password reset successful. You can now log in with your new password.",
      });

    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while resetting password",
      });
    }
  }
);

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
          fullName:
            req.user.fullName,
          email:
            req.user.email,
          username:
            req.user.username,
        },
      });

    } catch (error) {

      console.error(
        "Get current user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch user",
      });
    }
  }
);

module.exports = router;