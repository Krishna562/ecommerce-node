const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const orderSchema = new Schema({
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      qty: { type: Number, required: true },
    },
  ],
  orderAmount: {
    type: Number,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  status: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

module.exports = new model("Order", orderSchema);
