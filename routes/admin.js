const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const isAuthCheck = require("../middleware/isAuth");

const { body } = require("express-validator");

router.get("/admin-products", isAuthCheck, adminController.getAdminProducts);

router.get("/add-products", isAuthCheck, adminController.getAddProducts);
router.post(
  "/products",
  isAuthCheck,
  [
    body("name")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Name must contain alteast 3 characters")
      .trim(),
    body("price").isFloat().trim(),
  ],
  adminController.postProducts
);

router.post(
  "/edit-products/:_id",
  isAuthCheck,
  adminController.postEditProduct
);
router.post(
  "/edit/:_id",
  isAuthCheck,
  [
    body("name")
      .isString()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Name must contain alteast 3 characters"),
    body("price").isFloat().trim(),
  ],
  adminController.postEdit
);

router.delete(
  "/delete-product/:productId",
  isAuthCheck,
  adminController.deleteProduct
);

module.exports = router;
