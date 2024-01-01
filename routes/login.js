const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login");
const { check, body } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const isLoggedIn = require("../middleware/isLoggedIn");

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
      if (user) {
        const isCorrectPassword = await bcrypt.compare(input, user.password);
        if (!isCorrectPassword) {
          throw new Error("Incorrect password");
        } else {
          return true;
        }
      }
    }),
  ],
  loginController.postLogin
);

router.post("/logout", loginController.postLogout);

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

router.get("/isLoggedIn", isLoggedIn, loginController.checkAuthStatus);

router.post(
  "/pass-reset-req",
  [
    body("email")
      .trim()
      .normalizeEmail()
      .notEmpty()
      .custom(async (email) => {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("Email is not registered");
        } else {
          return true;
        }
      }),
  ],
  loginController.sendPassResetReq
);

// VERIFY RESET PASSWORD TOKEN
router.get(
  "/verify-pass-reset-token/:token",
  loginController.verifyPassResetToken
);
router.patch(
  "/reset-password",
  [
    body("confirmNewPassword").custom((confirmPass, { req }) => {
      if (confirmPass === req.body.newPassword) {
        return true;
      } else {
        throw new Error("Passwords do not match");
      }
    }),
  ],
  loginController.resetPassword
);

module.exports = router;
