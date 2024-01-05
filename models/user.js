const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const Product = require("./product");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  dateJoined: {
    type: String,
    required: true,
  },
  resetToken: { type: String, required: false },
  tokenExpiration: { type: Date, required: false },
  cart: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      qty: Number,
    },
  ],
});

module.exports = new model("User", userSchema);
