const userSchema = require("../models/user.model");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const ggClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const {
  userRegisterValidate,
  userLoginValidate,
} = require("../hepler/validate");
const createError = require("http-errors");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../hepler/jwt");

const { client } = require("../hepler/redisConnecter");
class UserController {
  async fbSignIn(req, res, next) {
    try {
      console.log("LOGIN WITH FACEBOOK");
      const { email } = req.body;

      let user = await userSchema.findOne({ email: email });
      if (user) {
        user = user.toObject();
        delete user.password;

        const accessToken = await signAccessToken(user._id);
        const refreshToken = await signRefreshToken(user._id);

        delete user.password;

        return res.json({
          status: "success",
          data: {
            accessToken,
            refreshToken,
            user: user,
          },
        });
      } else {
        throw createError.NotFound("User not registed");
      }
    } catch (error) {
      next(error);
    }
  }
  async fbSignUp(req, res, next) {
    try {
      console.log("SIGNUP WITH FACEBOOK");
      const { name, email, url, accessToken: token } = req.body;
      const isExits = await userSchema.findOne({ email: email });

      if (isExits) {
        throw createError.Conflict(`${email} is ready been registed`);
      }

      const user = new userSchema({
        username: name,
        email: email,
        avatar: url,
        password: token,
      });

      const savedUser = await user.save();

      const { password, ...userWithoutPass } = savedUser.toObject();

      const accessToken = await signAccessToken(user._id);
      const refreshToken = await signRefreshToken(user._id);

      if (user) {
        return res.json({
          status: "success",
          data: {
            accessToken,
            refreshToken,
            user: userWithoutPass,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }
  async googleSignUp(req, res, next) {
    try {
      console.log("SIGNUP WITH GOOGLE");

      const { token } = req.body;
      const ticket = await ggClient.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
      });

      const { name, email, picture } = ticket.getPayload();
      console.log(ticket.getPayload());

      const isExits = await userSchema.findOne({ email: email });

      if (isExits) {
        throw createError.Conflict(`${email} is ready been registed`);
      }

      const user = new userSchema({
        username: name,
        email: email,
        avatar: picture,
        password: token,
      });

      const savedUser = await user.save();

      const { password, ...userWithoutPass } = savedUser.toObject();

      const accessToken = await signAccessToken(user._id);
      const refreshToken = await signRefreshToken(user._id);

      if (user) {
        return res.json({
          status: "success",
          data: {
            accessToken,
            refreshToken,
            user: userWithoutPass,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async googleSignIn(req, res, next) {
    try {
      console.log("LOGIN WITH GOOGLE");
      const { token } = req.body;
      const ticket = await ggClient.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
      });

      const { email } = ticket.getPayload();

      let user = await userSchema.findOne({ email: email });
      if (user) {
        user = user.toObject();
        delete user.password;

        const accessToken = await signAccessToken(user._id);
        const refreshToken = await signRefreshToken(user._id);

        delete user.password;

        return res.json({
          status: "success",
          data: {
            accessToken,
            refreshToken,
            user: user,
          },
        });
      } else {
        throw createError.NotFound("User not registed");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      console.log("GET USERS");

      const q = req.query.q;

      if (q) {
        const users = await userSchema.find(
          { username: { $regex: q, $options: "i" } },
          { password: 0, createdAt: 0, updatedAt: 0 }
        );
        res.status(200).json({ data: users });
      }
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      console.log("GET USER");

      const id = req.params.id;
      const user = await userSchema
        .findOne({ _id: id }, { password: 0 })
        .populate({ path: "blogs" });

      res.send({
        status: "success",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async register(req, res, next) {
    try {
      const { username, password, email } = req.body;

      const { error } = userRegisterValidate(req.body);

      if (error) {
        throw createError(error.details[0].message);
      }

      const isExits = await userSchema.findOne({ email: email });
      if (isExits) {
        throw createError.Conflict(`${email} is ready been registed`);
      }

      const user = new userSchema({
        username: username,
        email: email,
        password: password,
      });

      const savedUser = await user.save();
      res.status(200).json({
        status: "success",
        data: { user: savedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      console.log("LOGIN");

      const { email, password } = req.body;
      const { error } = userLoginValidate(req.body);

      if (error) {
        throw createError(error.details[0].message);
      }

      let user = await userSchema.findOne({ email: email });

      if (!user) {
        throw createError.NotFound("User not registed");
      }

      const isPassWordValid = await user.isCheckPassword(password, next);

      if (!isPassWordValid) {
        throw createError.Unauthorized();
      }

      const accessToken = await signAccessToken(user._id);
      const refreshToken = await signRefreshToken(user._id);

      user = user.toObject();
      delete user.password;

      return res.json({
        status: "success",
        data: {
          accessToken,
          refreshToken,
          user: user,
        },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      console.log("LOGOUT");

      const { userId } = req.payload;

      client
        .del(userId.toString())
        .then((result) => {
          res.json({
            status: "success",
            message: "Logout",
          });
        })
        .catch((err) => {
          throw createError.InternalServerError();
        });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      console.log("REFRESH TOKEN");

      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw createError.BadRequest();
      }

      const { userId } = await verifyRefreshToken(refreshToken);
      const accToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId);

      return res.json({
        accessToken: accToken,
        refreshToken: refToken,
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      console.log("UPLOAD AVATAR");

      const user_id = req.payload.userId;

      const { path } = req.file;
      const url = req.protocol + "://" + req.get("host") + "/" + path;

      const newUser = await userSchema
        .findOneAndUpdate({ _id: user_id }, { avatar: url }, { new: true })
        .select("-password");

      return res.status(200).json({
        status: "success",
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAvatar(req, res, next) {
    try {
      console.log("UPDATE AVATAR");

      const user_id = req.payload.userId;
      const { avatar } = req.body;

      const newUser = await userSchema
        .findOneAndUpdate({ _id: user_id }, { avatar }, { new: true })
        .select("-password");

      return res.status(200).json({
        status: "success",
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
