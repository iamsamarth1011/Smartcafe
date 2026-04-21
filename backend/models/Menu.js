const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      trim: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isVeg: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menuSchema);
