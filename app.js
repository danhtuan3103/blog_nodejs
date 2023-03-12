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
require('dotenv').config()

const io = require("socket.io")(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

io.use(verifyAccessTokenSocket);

socket.connect(io);
const fileName = path.join(__dirname, "../src/api/v1/Logs", "error.log");

db.connect();
redis.connect();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(helmet());
// app.use(morgan());
app.use(compression());

app.use(express.static("public"));
route(app);

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
