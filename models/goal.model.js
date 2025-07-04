const mongoose = require("mongoose");

const subTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const goalSchema = new mongoose.Schema(
  {
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
    targetDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: ["Health", "Education", "Finance", "Career", "Other"],
      default: "Other",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    remindersEnabled: {
      type: Boolean,
      default: false,
    },
    subTasks: [subTaskSchema],
    status: {
      type: String,
      enum: ["Ongoing", "Completed", "Failed"],
      default: "Ongoing",
    },
    completedAt: {
      type: Date,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
