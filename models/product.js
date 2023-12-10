// const getDB = require("../utils/database").getDB;
// const { ObjectId } = require("mongodb");
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
  image: {
    type: String,
    required: true,
  },
  prodImgId: {
    type: String,
    require: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const productModel = new model("Product", product);
module.exports = productModel;

// module.exports = class Product {
//   constructor(name, imgURL, price, userID) {
//     this.name = name;
//     this.imgURL = imgURL;
//     this.price = price;
//     this.userID = userID;
//   }

//   async save() {
//     const db = getDB();
//     db.collection("products").insertOne(this);
//   }

//   static async fetchAll(cb) {
//     const db = getDB();
//     try {
//       const result = await db.collection("products").find().toArray();
//       cb(result);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   static async fetchById(id, cb) {
//     const db = getDB();
//     try {
//       const result = await db
//         .collection("products")
//         .find({ _id: new ObjectId(id) })
//         .next();
//       cb(result);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   static deleteItem(id) {
//     const db = getDB();
//     db.collection("products").deleteOne({ _id: new ObjectId(id) });
//   }

//   editProduct(id) {
//     const db = getDB();
//     db.collection("products").updateOne(
//       { _id: new ObjectId(id) },
//       { $set: this }
//     );
//   }
// };
