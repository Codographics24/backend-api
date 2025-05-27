const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactUsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Invalid email format"],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
  },
  {
    timestamps: true, // includes createdAt & updatedAt
  }
);

module.exports = mongoose.model("ContactUs", contactUsSchema);
