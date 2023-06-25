const express = require("express");
const app = express();
const createError = require("http-errors");
require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const { logEvent } = require("./src/api/v1/hepler");
const { v4: uuid } = require("uuid");
const db = require("./src/api/v1/db/connect");
const redis = require("./src/api/v1/hepler/redisConnecter");
const route = require("./src/api/v1/routes");
const { verifyAccessTokenSocket } = require("./src/api/v1/hepler/jwt");
const server = require("http").createServer(app);
const socket = require("./src/api/v1/services/socket");
const path = require("path");
require("dotenv").config();
const session = require("express-session");
const passport = require("./src/api/v1/utils/passport");
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

io.use(verifyAccessTokenSocket);

socket.connect(io);
const fileName = path.join(__dirname, "../src/api/v1/Logs", "error.log");
app.use("/public", express.static(path.join(__dirname, "public")));
db.connect();
redis.connect();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(helmet());
// app.use(morgan());
app.use(compression());

app.use(
  session({
    secret: "session-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

route(app);

app.get("/login/success", (req, res) => {
  console.log(req.user);
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "Thành công",
      user: req.user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Xác thực thất bại",
    });
  }
});

app.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

app.get(
  "/auth/facebook",
  (req, res, next) => {
    console.log("Login with facebook");
    next();
  },
  passport.authenticate("facebook", { scope: ["profile"] })
);

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  function (req, res) {
    // Successful authentication, redirect home.

    res.json({ data: req.user });
    res.redirect(process.env.CLIENT_URL);
  }
);

// [AUTH]

// Error
app.use((req, res, next) => {
  next(createError(404, "Not Found!"));
});

app.use((err, req, res, next) => {
  logEvent(`${uuid()} --- (${req.method}) ${req.url} --- ${err.message}`);

  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    message: err.message,
  });
});

module.exports = { app, server };
