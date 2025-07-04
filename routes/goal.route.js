const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goal.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");

/**
 * @route   POST /goals
 * @desc    Create a new goal
 * @access  Protected
 */
router.post("/goals", authenticateJWT, goalController.createGoal);

/**
 * @route   GET /goals
 * @desc    Get all goals for authenticated user
 * @access  Protected
 */
router.get("/goals", authenticateJWT, goalController.getGoals);

/**
 * @route   GET /goals/:id
 * @desc    Get single goal by ID (for detail view)
 * @access  Protected
 */
router.get("/goals/:id", authenticateJWT, goalController.getGoalById);

/**
 * @route   PUT /goals/:id
 * @desc    Update an existing goal by ID
 * @access  Protected
 */
router.put("/goals/:id", authenticateJWT, goalController.updateGoal);

/**
 * @route   PATCH /goals/:id/complete
 * @desc    Mark a goal as Completed
 * @access  Protected
 */
router.patch(
  "/goals/:id/complete",
  authenticateJWT,
  goalController.completeGoal
);

/**
 * @route   PATCH /goals/:id/fail
 * @desc    Mark a goal as Failed (e.g. deadline passed or abandoned)
 * @access  Protected
 */
router.patch("/goals/:id/fail", authenticateJWT, goalController.failGoal);

/**
 * @route   PATCH /goals/:id/relaunch
 * @desc    Relaunch a failed goal back to Ongoing status
 * @access  Protected
 */
router.patch(
  "/goals/:id/relaunch",
  authenticateJWT,
  goalController.relaunchGoal
);

/**
 * @route   DELETE /goals/:id
 * @desc    Permanently delete a goal
 * @access  Protected
 */
router.delete("/goals/:id", authenticateJWT, goalController.deleteGoal);

module.exports = router;
