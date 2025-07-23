const mongoose = require("mongoose");
const { Schema } = mongoose;

const deviceSchema = new Schema(
  {
    deviceName: {
      type: String,
      required: true,
      trim: true,
    },
    os: {
      type: String,
      required: true,
      trim: true,
    },
    lastAccess: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // prevents Mongoose from generating an _id for subdocuments
);

module.exports = deviceSchema;
