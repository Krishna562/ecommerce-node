const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const mongoDbSession = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const csrfProtection = csrf();
const flash = require("connect-flash");
const multer = require("multer");
require("dotenv").config();
const morgan = require("morgan");
// const helmet = require("helmet");
const compression = require("compression");
const fs = require("fs");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MY IMPORTS
const admin = require("./routes/admin");
const shopRoute = require("./routes/shop");
const loginRoute = require("./routes/login");
const rootDir = require("./utils/path");
const errController = require("./controllers/error");
const User = require("./models/user");

const MONGODBCONNECT_URI = `${process.env.MONGODB_URI}`;

const store = new mongoDbSession({
  uri: MONGODBCONNECT_URI,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
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

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.join(rootDir, "public")));
app.use("/images", express.static(path.join(rootDir, "images")));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(
  session({
    secret: "secret?lol",
    saveUninitialized: false,
    resave: false,
    store: store,
  })
);

app.use(csrfProtection);

app.use(compression());
// app.use(helmet());

// Log access folder initialization
const logAccessStream = fs.createWriteStream(
  path.join(__dirname, "morganLogs")
);
app.use(morgan("combined", { stream: logAccessStream }));

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.loggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(async (req, res, next) => {
  if (req.session.user) {
    const user = await User.findById(req.session.user._id);
    req.user = user;
  }
  next();
});

app.use(flash());

app.use("/admin", admin);

app.use(shopRoute);

app.use(loginRoute);

app.use("/500", errController.get500Page);

app.use("/", errController.get404Page);

app.use((error, req, res, next) => {
  console.log(error);
  res.redirect("/500");
});

mongoose
  .connect(MONGODBCONNECT_URI)
  .then(() => app.listen(process.env.PORT || 3000));
