const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login");
const { check, body } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

router.get("/login", loginController.getLogin);
router.post(
  "/login",
  [
    body("email")
      .normalizeEmail()
      .custom(async (input) => {
        const user = await User.findOne({ email: input });
        if (!user) {
          throw new Error("No user with the same email id was found");
        } else {
          return true;
        }
      }),
    body("password").custom(async (input, { req }) => {
      const user = await User.findOne({ email: req.body.email });
      const isCorrectPassword = await bcrypt.compare(input, user.password);
      if (!isCorrectPassword) {
        throw new Error("Invalid password");
      } else {
        return true;
      }
    }),
  ],
  loginController.postLogin
);
router.post("/logout", loginController.postLogout);
router.get("/signup", loginController.getSignUp);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(async (input) => {
        const user = await User.findOne({ email: input });
        if (user) {
          throw new Error("A user with the same email address already exists");
        } else {
          return true;
        }
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 4 })
      .withMessage("The password must be atleast 4 characters long"),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("The passwords must be identical");
        } else {
          return true;
        }
      }),
  ],
  loginController.postSignUp
);
router.get("/reset-password", loginController.getResetPassword);
router.post("/reset-password", loginController.postResetPassword);
router.get("/create-new-password/:token", loginController.getCreateNewPassword);
router.post("/create-new-password", loginController.postCreateNewPassword);

module.exports = router;
