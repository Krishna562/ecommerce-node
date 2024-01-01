const Product = require("../models/product");
const { validationResult } = require("express-validator");
const deleteFile = require("../utils/deleteFile");
const absolutePath = require("../utils/path");
const path = require("path");
const cloudinary = require("cloudinary");
const User = require("../models/user");

// ADD PRODUCTS

exports.addProduct = async (req, res, next) => {
  const { name, price, stock, category, description } = req.body;

  const images = req.files;

  // UPLOADING USING CLOUDINARY
  const cloudinaryUploadResults = [];

  images.forEach(async (image) => {
    const cloudinaryUploadUrl = `${process.env.ONRENDER_API_URL}/images/${image.filename}`;

    if (process.env.NODE_ENV === "production") {
      try {
        const result = await cloudinary.v2.uploader.upload(cloudinaryUploadUrl);
        cloudinaryUploadResults.push(result);
      } catch (err) {
        next(err);
      }
    }
  });

  const imageUrls =
    process.env.NODE_ENV === "production"
      ? cloudinaryUploadResults.map((result) => result.secure_url)
      : images.map(
          (imgFile) => process.env.API_URL + "/images/" + imgFile.filename
        );

  try {
    const newProduct = new Product({
      name,
      price,
      stock,
      description,
      category: category[0].toUpperCase() + category.substring(1),
      images: imageUrls,
      imageIds:
        process.env.NODE_ENV === "production"
          ? cloudinaryUploadResults.map((result) => result.public_id)
          : [],
      userId: req.userId,
    });
    await newProduct.save();

    res.json({ newProduct });
  } catch (err) {
    next(err);
  }
};

// EDIT PRODUCTS

exports.postEdit = async (req, res) => {
  const productId = req.params.productId;
  const { name, price, stock, description, category } = req.body;
  const images = req.files;
  const productToEdit = await Product.findById(productId);
  const isProduction = process.env.NODE_ENV === "production";

  productToEdit.name = name;
  productToEdit.price = price;
  productToEdit.stock = stock;
  productToEdit.description = description;
  productToEdit.category = category;

  if (images.length) {
    let cloudinaryUploadResults = [];

    if (isProduction) {
      images.forEach(async (img) => {
        const cloudinaryUploadUrl = `${process.env.ONRENDER_API_URL}/images/${img.filename}`;

        try {
          const result = await cloudinary.v2.uploader.upload(
            cloudinaryUploadUrl
          );
          await cloudinary.v2.api.delete_resources(productToEdit.imageIds);
          cloudinaryUploadResults.push(result);
        } catch (err) {
          next(err);
        }
      });

      productToEdit.images = cloudinaryUploadResults.map(
        (result) => result.secure_url
      );
      productToEdit.imageIds = cloudinaryUploadResults.map(
        (result) => result.public_id
      );
    } else {
      productToEdit.images.forEach((imgToDelete) => deleteFile(imgToDelete));
      productToEdit.images = images.map(
        (imgFile) => process.env.API_URL + "/images/" + imgFile.filename
      );
      productToEdit.imageIds = [];
    }
  }
  await productToEdit.save();

  const products = await Product.find();
  res.status(200).json({ updatedProducts: products });
};

// DELETE PRODUCTS

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const productToDelete = await Product.findById(prodId);

  if (process.env.NODE_ENV === "production") {
    await cloudinary.v2.api.delete_resources(productToDelete.imageIds);
  } else {
    productToDelete.images.forEach((img) => {
      const filePath = path.join(absolutePath, img);
      deleteFile(filePath);
    });
  }
  try {
    await Product.findByIdAndDelete(prodId);

    await User.updateMany(
      { "cart.productId": prodId },
      { $pull: { cart: { productId: prodId } } }
    );

    const updatedProducts = await Product.find();

    res.status(200).json({ updatedProducts });
  } catch (err) {
    next(err);
  }
};

// GET ALL USERS

exports.allUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find();
    res.status(200).json({ allUsers });
  } catch (err) {
    next(err);
  }
};

// CHANGE USER ROLE

exports.changeUserRole = async (req, res, next) => {
  const userId = req.params.userId;
  const isAdminNow = req.body.isAdminNow;
  try {
    const userToEdit = await User.findById(userId);
    userToEdit.isAdmin = isAdminNow;
    await userToEdit.save();
    const updatedUsers = await User.find();
    res.json({ updatedUsers });
  } catch (err) {
    next(err);
  }
};
