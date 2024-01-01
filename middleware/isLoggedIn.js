const jsonwebtoken = require("jsonwebtoken");
const userModel = require("../models/user");

module.exports = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    const err = new Error("Token not recieved");
    err.statusCode = 401;
    next(err);
  } else {
    try {
      const decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);
      const userId = decodedToken.userId;
      const user = await userModel.findById(userId);
      if (!user) {
        const err = new Error("Token is invalid");
        err.statusCode = 401;
        throw err;
      } else {
        req.userId = userId;
        next();
      }
    } catch (err) {
      next(err);
    }
  }
};
