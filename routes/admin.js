const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const isLoggedIn = require("../middleware/isLoggedIn");

// ADD A PRODUCT
router.post("/add-product", isLoggedIn, adminController.addProduct);

// EDIT A PRODUCT
router.patch("/edit-product/:productId", isLoggedIn, adminController.postEdit);

// DELETE A PRODUCT
router.delete(
  "/delete-product/:productId",
  isLoggedIn,
  adminController.deleteProduct
);

// GET ALL USERS
router.get("/all-users", adminController.allUsers);

// CHANGE USER ROLE
router.patch("/change-role/:userId", adminController.changeUserRole);

module.exports = router;
