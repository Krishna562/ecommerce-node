// const { ObjectId } = require("mongodb");
// const getDB = require("../utils/database").getDB;

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
  resetToken: { type: String, required: false },
  tokenExpiration: { type: Date, required: false },
  cart: {
    items: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        qty: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (id) {
  // if (this.cart) {
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
  // } else {
  //   const newProduct = { _id: new ObjectId(id), qty: 1 };
  //   db.collection("users").updateOne(
  //     { _id: this._id },
  //     { $set: { cart: { items: [newProduct] } } }
  //   );
  // }
};

userSchema.methods.loadCart = async function (cb) {
  // if (this.cart.items) {
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
  // } else {
  //   try {
  //     await db
  //       .collection("users")
  //       .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
  //     const user = await db
  //       .collection("users")
  //       .find({ _id: this._id })
  //       .next();
  //     const cartProducts = user.cart.items;
  //     cb(cartProducts);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
};

userSchema.methods.deleteCartProduct = function (id) {
  const updatedCartItems = this.cart.items.filter(
    (cartProd) => !cartProd._id.equals(id)
  );
  this.cart = { items: updatedCartItems };
  this.save();
};

module.exports = new model("User", userSchema);

// module.exports = class User {
//   constructor(username, email, cart, id) {
//     this.username = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     const db = getDB();
//     db.collection("users").insertOne(this);
//   }

//   static async fetchByID(id, cb) {
//     const db = getDB();
//     try {
//       const result = await db
//         .collection("users")
//         .find({ _id: new ObjectId(id) })
//         .next();
//       cb(result);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   addToCart(id) {
//     const db = getDB();
//
//   }

//   async fetchCartProducts(cb) {
//     const db = getDB();

//   }

//   deleteCartProduct(id) {
//     const db = getDB();
//
//   }

//   async addOrder(cb) {
//     const db = getDB();
//
//   }

//   async getOrders(cb) {
//     const db = getDB();
//     try {
//       const orders = await db
//         .collection("orders")
//         .find({ "user._id": this._id })
//         .toArray();
//       cb(orders);
//     } catch (err) {
//       console.log(err);
//     }
//   }
// };
