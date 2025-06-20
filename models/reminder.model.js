const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reminderType: {
    type: String,
    enum: ["Personal", "Work", "Custom"], // update with your app's types
    default: "Personal",
  },
  frequency: {
    type: String,
    enum: ["Low Orbit", "Cruising Altitude", "Hyperdrive", "Custom"],
    default: "Low Orbit",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Reminder", reminderSchema);
