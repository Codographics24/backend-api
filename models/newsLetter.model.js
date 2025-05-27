const mongoose = require("mongoose");
const { Schema } = mongoose;

const newsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Invalid email format"],
    },
  },
  {
    timestamps: true, // includes createdAt & updatedAt
  }
);

newsletterSchema.index({ email: 1 });

module.exports = mongoose.model("Newsletter", newsletterSchema);
