const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const product = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  imageIds: {
    type: [String],
    require: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  category: {
    required: true,
    type: String,
  },
  stock: {
    required: true,
    type: Number,
  },
  description: {
    required: true,
    type: String,
  },
  reviews: [
    {
      userId: { ref: "User", required: true, type: Schema.Types.ObjectId },
      stars: { required: true, type: Number },
      comment: { required: false, type: String },
    },
  ],
});

const productModel = new model("Product", product);
module.exports = productModel;
