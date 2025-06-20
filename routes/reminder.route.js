const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/reminder.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");

/**
 * Create a new reminder (Protected Route)
 */
router.post("/reminder", authenticateJWT, reminderController.createReminder);

/**
 * Get all reminders for a specific user (Protected Route)
 */
router.get(
  "/reminder/:userId",
  authenticateJWT,
  reminderController.getRemindersByUser
);

/**
 * Update a reminder by ID (Protected Route)
 */
router.put("/reminder/:id", authenticateJWT, reminderController.updateReminder);

/**
 * Soft delete a reminder by ID (Protected Route)
 */
router.delete(
  "/reminder/:id",
  authenticateJWT,
  reminderController.deleteReminder
);

module.exports = router;
