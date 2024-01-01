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

userSchema.methods.addToCart = function (id) {
  const cartProduct = this.cart.items.find((item) => item._id.equals(id));
  const newProduct = {
    _id: id,
    qty: cartProduct ? cartProduct.qty + 1 : 1,
  };
  const updatedCartItems = cartProduct
    ? this.cart.items.map((item) =>
        item._id === cartProduct._id ? newProduct : item
      )
    : [...this.cart.items, newProduct];
  this.cart = { items: updatedCartItems, totalPrice: 0 };
  this.save();
};

userSchema.methods.loadCart = async function (cb) {
  try {
    const cartProductsIds = this.cart.items.map((cartProd) => {
      return cartProd._id;
    });
    const cartProducts = await Product.find({ _id: { $in: cartProductsIds } });
    const finalCartProducts = this.cart.items.map((cartProd) => {
      const prod = cartProducts.find((prod) => prod._id.equals(cartProd._id));
      const { name, image, price, _id } = prod;
      return { name, image, price, _id, qty: cartProd.qty };
    });
    const totalPrice = finalCartProducts.reduce((acc, curr) => {
      acc += curr.price * curr.qty;
      return acc;
    }, 0);
    cb(finalCartProducts, totalPrice);
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.deleteCartProduct = function (id) {
  const updatedCartItems = this.cart.items.filter(
    (cartProd) => !cartProd._id.equals(id)
  );
  this.cart = { items: updatedCartItems };
  this.save();
};

module.exports = new model("User", userSchema);
