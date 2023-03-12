const JWT = require("jsonwebtoken");
require("dotenv").config();
const { client } = require("./redisConnecter");
const createError = require("http-errors");
const signAccessToken = async (userId) => {
  return new Promise((resolve, reject) => {
    const payload = { userId };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const option = {
      expiresIn: "5d",
    };

    JWT.sign(payload, secret, option, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

const verifyAccessToken = (req, res, next) => {
  try {
    if (!req.headers["authorization"]) {
      return next(createError.Unauthorized());
    }

    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        // console.log(err);
        if (err.name === "TokenExpiredError") {
          return res.status(200).json({
            code: 401,
            message: err.message,
          });
        }

        return next(createError.Unauthorized(err.message));
      }

      req.payload = payload;
      return next();
    });
  } catch (error) {
    return next(error);
  }
};

const verifyAccessTokenSocket = (socket, next) => {
  try {
    if (socket.handshake.query && socket.handshake.query.token) {
        const token = socket.handshake.query.token;
        console.log(token)
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
              // console.log(err);
              if (err.name === "TokenExpiredError") {
                return res.status(200).json({
                  code: 401,
                  message: err.message,
                });
              }
      
              return next(createError.Unauthorized(err.message));
            }
      
            socket.payload = payload;
            return next();
          });
    } else {
      next(new Error("Authentication error"));
    }
  } catch (error) {
    return next(error);
  }
};

const signRefreshToken = async (userId) => {
  return new Promise((resolve, reject) => {
    const payload = { userId };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const option = {
      expiresIn: "1y",
    };

    JWT.sign(payload, secret, option, (err, token) => {
      if (err) reject(err);
      client
        .set(userId.toString(), token.toString(), {
          EX: 365 * 24 * 60 * 60,
        })
        .then((result) => {
          // console.log(result);
          resolve(token);
        })
        .catch((err) => {
          throw reject(createError.InternalServerError(err));
        });
    });
  });
};

const verifyRefreshToken = async (refeshToken) => {
  return new Promise((resolve, reject) => {
    JWT.verify(
      refeshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) {
          return reject(err);
        }
        // console.log(payload)

        client
          .get(payload.userId)
          .then((result) => {
            if (refeshToken === result) {
              resolve(payload);
            } else {
              reject(createError.Unauthorized());
            }
          })
          .catch((err) => {
            return reject(createError.Unauthorized());
          });
      }
    );
  });
};
module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessTokenSocket,
};
