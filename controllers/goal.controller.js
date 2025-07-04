const Goal = require("../models/goal.model");

// Create a new goal
exports.createGoal = async (req, res) => {
  const userId = req.user?.userId;
  const {
    title,
    description,
    targetDate,
    category,
    priority,
    remindersEnabled,
    subTasks,
  } = req.body;

  if (!title || !targetDate || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const goal = await Goal.create({
      userId,
      title,
      description,
      targetDate,
      category,
      priority,
      remindersEnabled,
      subTasks,
    });

    res.status(201).json({ message: "Goal created", data: goal });
  } catch (error) {
    console.error("Create goal error:", error);
    res.status(500).json({ error: "Failed to create goal" });
  }
};

// Get all goals for authenticated user
exports.getGoals = async (req, res) => {
  const userId = req.user?.userId;

  try {
    const goals = await Goal.find({ userId }).sort({ targetDate: 1 });
    res.status(200).json(goals);
  } catch (error) {
    console.error("Fetch goals error:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

// Get single goal by ID
exports.getGoalById = async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.status(200).json(goal);
  } catch (error) {
    console.error("Fetch goal error:", error);
    res.status(500).json({ error: "Failed to fetch goal" });
  }
};

// Update a goal
exports.updateGoal = async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ error: "Goal not found or unauthorized" });
    }

    res.status(200).json({ message: "Goal updated", data: updatedGoal });
  } catch (error) {
    console.error("Update goal error:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
};

// Mark goal as complete
exports.completeGoal = async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    const completedGoal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      { status: "Completed", completedAt: new Date(), lastUpdated: new Date() },
      { new: true }
    );

    if (!completedGoal) {
      return res.status(404).json({ error: "Goal not found or unauthorized" });
    }

    res.status(200).json({ message: "Goal completed", data: completedGoal });
  } catch (error) {
    console.error("Complete goal error:", error);
    res.status(500).json({ error: "Failed to complete goal" });
  }
};

// Mark goal as failed
exports.failGoal = async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    const failedGoal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      { status: "Failed", lastUpdated: new Date() },
      { new: true }
    );

    if (!failedGoal) {
      return res.status(404).json({ error: "Goal not found or unauthorized" });
    }

    res
      .status(200)
      .json({ message: "Goal marked as failed", data: failedGoal });
  } catch (error) {
    console.error("Fail goal error:", error);
    res.status(500).json({ error: "Failed to mark goal as failed" });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    const deleted = await Goal.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res.status(404).json({ error: "Goal not found or unauthorized" });
    }

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Delete goal error:", error);
    res.status(500).json({ error: "Failed to delete goal" });
  }
};

// Relaunch a failed goal
exports.relaunchGoal = async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal || goal.status !== "Failed") {
      return res
        .status(404)
        .json({ error: "Only failed goals can be relaunched" });
    }

    goal.status = "Ongoing";
    goal.lastUpdated = new Date();
    await goal.save();

    res.status(200).json({ message: "Goal relaunched", data: goal });
  } catch (error) {
    console.error("Relaunch goal error:", error);
    res.status(500).json({ error: "Failed to relaunch goal" });
  }
};
