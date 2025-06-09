const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");
const { limitLoginAttempts } = require("../middlewares/rateLimiter.middleware");

/**
 * Apple Register/Login (Public Route)
 */
router.post("/auth/apple", limitLoginAttempts, userController.loginOrRegister);

/**
 * Google Register/Login (Public Route)
 */
router.post("/auth/google", userController.googleAuth);

/**
 * Admin Register (Public Route or can be protected if restricted)
 */
router.post("/auth/admin/register", userController.adminRegister);

/**
 * Admin Login (Public Route)
 */
router.post("/auth/admin/login", userController.adminLogin);

/**
 * Email Verification - Step 1: Send OTP (Public Route)
 */
router.post("/auth/verify-email", userController.verifyEmail);

/**
 * Email Verification - Step 2: Verify OTP (Public Route)
 */
router.post("/auth/verify-code", userController.verifyOtpCode);

/**
 * Continue Signup - Complete Registration with Name, Username, and Password
 */
router.post("/auth/continue-signup/:id", userController.continueSignup);

/**
 * Check if Username Exists (Public)
 */
router.get("/auth/check-username", userController.checkUsernameExists);

/**
 * Email/Password Login (Public Route)
 */
router.post("/auth/login", userController.loginUser);

/**
 * Password Reset - Step 1: Send OTP to Email (Public)
 */
router.post(
  "/auth/reset-password-request",
  userController.sendResetPasswordEmail
);

/**
 * Password Reset - Step 2: Verify OTP (Public)
 */
router.post("/auth/verify-otp", userController.verifyOtp); // ✅ Newly added route

/**
 * Password Reset - Step 3: Set New Password (Public)
 */
router.post("/auth/reset-password", userController.resetPassword);

/**
 * Get All Users (Protected Route)
 */
router.get("/users", authenticateJWT, userController.getAllUsers);

/**
 * Get User Details by ID (Protected Route)
 */
router.get("/users/:id", authenticateJWT, userController.getUserDetails);

/**
 * Update User by ID (Protected Route)
 */
router.put("/users/:id", authenticateJWT, userController.updateUser);

/**
 * Soft Delete User by ID (Protected Route)
 */
router.delete("/users/:id", authenticateJWT, userController.softDeleteUser);

/**
 * Hard Delete User by ID (Protected Route)
 */
router.delete(
  "/users/:id/hard",
  authenticateJWT,
  userController.hardDeleteUser
);

module.exports = router;
