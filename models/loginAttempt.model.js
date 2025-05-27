const mongoose = require("mongoose");
const { Schema } = mongoose;

const loginAttemptSchema = new Schema(
  {
    ip: String,
    email: String,
    success: Boolean,
    message: String,
    timestamp: { type: Date, default: Date.now },
  },
  {
    indexes: [{ expires: 60 * 60 * 24 * 7 }], // auto-clean after 7 days (optional)
  }
);

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);
