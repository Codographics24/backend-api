const mongoose = require("mongoose");
const { Schema } = mongoose;
const deviceSchema = require("./device.model"); // Import device schema

const userSchema = new Schema(
  {
    appleId: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Invalid email format"],
    },
    name: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    username: {
      type: String,
      trim: true,
      maxlength: 50,
      unique: true,
      sparse: true,
      lowercase: true,
      default: function () {
        return this.email.split("@")[0];
      },
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number"],
    },
    password: {
      type: String,
      select: false,
    },
    authSource: {
      type: String,
      enum: ["self", "google", "apple"],
      default: "self",
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
    },
    resetOtp: {
      type: String,
      select: false,
    },
    resetOtpExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    // New fields
    country: {
      type: String,
      trim: true,
      maxlength: 2,
    },
    timezone: {
      type: String,
      trim: true,
    },
    devices: [deviceSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Soft-delete filter
userSchema.pre(/^find/, function (next) {
  if (!this.getFilter().includeDeleted) {
    this.where({ deleted: false });
  } else {
    this.setQuery({ ...this.getFilter(), includeDeleted: undefined });
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
