const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    isVeg: {
      type: Boolean,
      required: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true
    },
    sessionId: {
      type: String,
      required: true,
      unique: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "paid"],
      default: "pending"
    },
    totalAmount: {
      type: Number,
      required: true
    },
    note: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
