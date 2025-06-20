const Reminder = require("../models/reminder.model");
const {
  scheduleReminder,
} = require("../services/notificationScheduler.service");

// Create a new reminder
exports.createReminder = async (req, res) => {
  const {
    title,
    description,
    date,
    reminderType,
    frequency,
    priority,
    userId,
    fcmToken,
  } = req.body;

  if (!title || !date || !reminderType || !frequency || !userId || !fcmToken) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    const reminder = await Reminder.create({
      title,
      description,
      date,
      reminderType,
      frequency,
      priority,
      userId,
    });

    // Schedule notification based on frequency
    scheduleReminder({ title, date, frequency, reminderType, fcmToken });

    res.status(201).json({
      message: "Reminder created and notifications scheduled",
      data: reminder,
    });
  } catch (error) {
    console.error("Create reminder error:", error);
    res.status(500).json({ error: "Failed to create reminder" });
  }
};

// Get all reminders for a user
exports.getRemindersByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const reminders = await Reminder.find({ userId }).sort({ date: 1 });

    res.status(200).json(reminders);
  } catch (error) {
    console.error("Get reminders error:", error);
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
};

// Update a reminder by ID
exports.updateReminder = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await Reminder.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    res.status(200).json({
      message: "Reminder updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update reminder error:", error);
    res.status(500).json({ error: "Failed to update reminder" });
  }
};

// Delete a reminder by ID
exports.deleteReminder = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Reminder.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Delete reminder error:", error);
    res.status(500).json({ error: "Failed to delete reminder" });
  }
};
