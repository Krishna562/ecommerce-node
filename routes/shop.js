const express = require("express");
const router = express.Router();
const isAuthCheck = require("../middleware/isAuth");

// MY IMPORTS
const shopController = require("../controllers/shop");

// SHOP PRODUCTS
router.get("/", shopController.getShop);
router.get("/products", shopController.getProducts);

// SINGLE PRODUCT
router.get("/products/:_id", shopController.getProduct);

// ORDERS
router.get("/orders", isAuthCheck, shopController.getOrders);
router.post("/orders", isAuthCheck, shopController.postOrders);
router.get("/orders/:orderId", isAuthCheck, shopController.getInvoice);

// CHECKOUT
router.get("/checkout", shopController.getCheckout);
router.get("/checkout-success", shopController.postOrders);

// CART
router.get("/cart", isAuthCheck, shopController.getCart);
router.get("/add-to-cart/:_id", isAuthCheck, shopController.postCart);
router.post(
  "/remove-from-cart/:_id",
  isAuthCheck,
  shopController.postRemoveCartProduct
);

module.exports = router;
