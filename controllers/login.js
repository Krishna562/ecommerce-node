const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const transport = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "robin2007562@outlook.com",
    pass: "krishna_@5621",
  },
});

exports.getLogin = (req, res, next) => {
  res.render("login/login", {
    pageTitle: "User Login",
    path: "/login",
    error: null,
    errorCause: [],
    previousInfo: {
      email: "",
      password: "",
    },
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req).array();
  if (errors.length) {
    const errorCause = errors.map((err) => err.path);
    res.render("login/login", {
      pageTitle: "User Login",
      path: "/login",
      error: errors[0].msg,
      errorCause: errorCause,
      previousInfo: {
        email: email,
        password: password,
      },
    });
  } else {
    const user = await User.findOne({ email: email });
    req.session.user = user;
    req.session.loggedIn = true;
    await req.session.save();
    res.redirect("/");
  }
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getSignUp = (req, res) => {
  res.render("login/signup", {
    path: "/signup",
    pageTitle: "Sign Up",
    error: req.flash("err")[0],
    previousEmail: "",
    previousPassword: "",
    previousConfirmPassword: "",
    errorCause: [],
  });
};

exports.postSignUp = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req).array();
  if (errors.length) {
    const errorCauses = errors.map((err) => err.path);
    res.render("login/signup", {
      path: "/signup",
      pageTitle: "Sign Up",
      error: errors[0].msg,
      previousEmail: email,
      previousPassword: password,
      previousConfirmPassword: confirmPassword,
      errorCause: errorCauses,
    });
  } else {
    const encryptedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email,
      password: encryptedPassword,
      cart: { items: [] },
    });
    await newUser.save();
    res.redirect("/login");
  }
};

// RESET PASSWORD

exports.getResetPassword = (req, res) => {
  res.render("login/reset", {
    pageTitle: "Reset Password",
    path: "/reset-password",
    error: req.flash("err")[0],
  });
};

exports.postResetPassword = (req, res) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      res.redirect("/reset-password");
    } else {
      const token = buffer.toString("hex");
      const { email } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        await req.flash(
          "err",
          "No user exists with the specified email. Enter a different email"
        );
        res.redirect("/reset-password");
      } else {
        user.resetToken = token;
        user.tokenExpiration = Date.now() + 3600000;
        await user.save();
        transport.sendMail({
          from: "robin2007562@outlook.com",
          to: email,
          subject: "Password reset request",
          html: `
            <p>You (${email}) requested for a password change.</p>
            <p>Click on this <a href="https://ecommerce-node-cp25.onrender.com/create-new-password/${token}">link</a> to set a new password.</p>
          `,
        });
        res.redirect("/");
      }
    }
  });
};

exports.getCreateNewPassword = async (req, res) => {
  const token = req.params.token;
  const user = await User.findOne({
    resetToken: token,
    tokenExpiration: { $gt: Date.now() },
  });
  if (!user) {
    req.flash(
      "err",
      "the password reset request came from an anonymous source"
    );
    res.redirect("/reset-password");
  } else {
    res.render("login/createNewPassword", {
      path: "/create-new-password",
      pageTitle: "Create new password",
      error: req.flash("err")[0],
      userId: user._id,
      token: token,
    });
  }
};

exports.postCreateNewPassword = async (req, res) => {
  const { newPassword, confirmNewPassword, userId, token } = req.body;
  const user = await User.findOne({
    _id: userId,
    tokenExpiration: { $gt: Date.now() },
    resetToken: token,
  });
  const { resetToken } = user;
  if (newPassword !== confirmNewPassword) {
    req.flash("err", "the passwords do not match");
    res.redirect(`/create-new-password/${resetToken}`);
  } else {
    const newPassword = await bcrypt.hash(confirmNewPassword, 12);
    user.password = newPassword;
    user.resetToken = undefined;
    user.tokenExpiration = undefined;
    await user.save();
    res.redirect("/login");
  }
};
