const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");

// MY IMPORTS
const shopController = require("../controllers/shop");

// GET ALL PRODUCTS
router.get("/all-products", shopController.getAllProducts);

// GET ALL CATEGORIES
router.get("/all-categories", shopController.getAllCategories);

// ORDERS
router.post("/orders", isLoggedIn, shopController.postOrders);
router.get("/orders/:orderId", isLoggedIn, shopController.getInvoice);

// CHECKOUT
router.get("/checkout", shopController.getCheckout);
router.get("/checkout-success", shopController.postOrders);

// CART
router.get("/add-to-cart/:_id", isLoggedIn, shopController.postCart);
router.post(
  "/remove-from-cart/:_id",
  isLoggedIn,
  shopController.postRemoveCartProduct
);

// REVIEWS
router.post("/add-review/:productId", isLoggedIn, shopController.addReview);

module.exports = router;
