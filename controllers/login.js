const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const jsonwebtoken = require("jsonwebtoken");

const transport = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "robin2007562@outlook.com",
    pass: "krishna_@5621",
  },
});

exports.checkAuthStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ currentUser: user, isLoggedIn: true });
  } catch (err) {
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  const { email } = req.body;
  const errors = validationResult(req).array();
  if (errors.length) {
    res.status(401).json({ errorsArr: errors });
  } else {
    const user = await User.findOne({ email: email });
    const jwtToken = jsonwebtoken.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "2d",
      }
    );
    res.status(200).cookie("jwt", jwtToken, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    res.json({ currentUser: user });
  }
};

exports.postLogout = (req, res) => {
  res.clearCookie("jwt", {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "successfuly logged out" });
};

exports.postSignUp = async (req, res) => {
  const { email, password, username } = req.body;
  const errors = validationResult(req).array();
  if (errors.length) {
    res.status(401).json({ errorsArr: errors });
  } else {
    const encryptedPassword = await bcrypt.hash(password, 12);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const year = new Date().getFullYear();
    const monthIndex = new Date().getMonth();
    const month = months[monthIndex];
    const day = new Date().getDate();

    const completeCurrentDate = `${day} ${month} ${year}`;
    const newUser = new User({
      email,
      password: encryptedPassword,
      cart: { items: [] },
      dateJoined: completeCurrentDate,
      username: username,
    });
    await newUser.save();
    res.status(201).json({ message: "Signup successful" });
  }
};

// RESET PASSWORD

exports.sendPassResetReq = (req, res) => {
  const errors = validationResult(req).array();
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      next(err);
    } else {
      if (errors.length) {
        res.status(401).json({ errorsArr: errors });
      } else {
        const token = buffer.toString("hex");
        const { email } = req.body;
        const user = await User.findOne({ email });
        user.resetToken = token;
        user.tokenExpiration = Date.now() + 3600000;
        await user.save();

        // SENDING THE EMAIL

        const frontendUrl =
          process.env.NODE_ENV === "production"
            ? process.env.ONRENDER_FRONTEND_URL
            : process.env.FRONTEND_URL;

        transport.sendMail({
          from: "robin2007562@outlook.com",
          to: email,
          subject: "Password reset request",
          html: `
            <p>You (${email}) requested for a password change.</p>
            <p>Click on this <a href="${frontendUrl}/create-new-password/${token}">link</a> to set a new password.</p>
          `,
        });

        res
          .status(201)
          .json({ message: "Password reset email sent successfully" });
      }
    }
  });
};

// VERIFY RESET PASSWORD TOKEN

exports.verifyPassResetToken = async (req, res, next) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      res.status(403).json({ isValidToken: false });
    } else {
      res.status(200).json({ isValidToken: true });
    }
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const errors = validationResult(req).array();
  if (errors.length) {
    res.status(400).json({ errorsArr: errors });
  } else {
    const user = await User.findOne({
      tokenExpiration: { $gt: Date.now() },
    });
    const encNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = encNewPassword;
    user.resetToken = undefined;
    user.tokenExpiration = undefined;
    await user.save();
    res.status(200).json({ message: "Password chagned successfully" });
  }
};
