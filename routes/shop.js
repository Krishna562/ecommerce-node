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
router.post("/add-to-cart/:productId", isLoggedIn, shopController.addToCart);
router.delete(
  "/remove-from-cart/:productId",
  isLoggedIn,
  shopController.removeFromCart
);

// REVIEWS
router.post("/add-review/:productId", isLoggedIn, shopController.addReview);

module.exports = router;
