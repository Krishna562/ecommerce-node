const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const multer = require("multer");
require("dotenv").config();
const helmet = require("helmet");
const compression = require("compression");
const cloudinary = require("cloudinary");
const cors = require("cors");
const cookieParser = require("cookie-parser");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(
  cors({
    origin: [process.env.ONRENDER_FRONTEND_URL, process.env.FRONTEND_URL],
    credentials: true,
  })
);

// MY IMPORTS
const admin = require("./routes/admin");
const shopRoute = require("./routes/shop");
const loginRoute = require("./routes/login");
const rootDir = require("./utils/path");

const MONGODBCONNECT_URI = `${process.env.MONGODB_URI}`;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// test
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use("/images", express.static(path.join(rootDir, "images")));

app.use(express.json());

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array("imgFiles", 3)
);

app.use(compression());
app.use(helmet());

app.use(flash());

app.use(cookieParser());

app.use("/admin", admin);

app.use(shopRoute);

app.use(loginRoute);

app.use((error, req, res, next) => {
  console.log(error);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: error.message,
  });
});

mongoose
  .connect(MONGODBCONNECT_URI)
  .then(() => app.listen(process.env.PORT || 3000));
