const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const orderSchema = new Schema({
  items: [
    {
      _id: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
      qty: { type: Number, required: true },
      name: { type: String, required: true },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  user: {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
});

module.exports = new model("Order", orderSchema);
