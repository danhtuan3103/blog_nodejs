const userSchema = require("../models/user.model");
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
  async getUsers(req, res, next) {
    try {
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
        element: savedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { error } = userLoginValidate(req.body);

      if (error) {
        throw createError(error.details[0].message);
      }

      let user = await userSchema.findOne({ email: email });

      if (!user) {
        throw createError.NotFound("User not registed");
      }

      const isPassWordValid = await user.isCheckPassword(password);

      if (!isPassWordValid) {
        throw createError.Unauthorized();
      }

      delete user.password;

      const accessToken = await signAccessToken(user._id);
      const refreshToken = await signRefreshToken(user._id);

      return res.json({
        status: "success",
        token: {
          accessToken,
          refreshToken,
        },
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
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

  async updateAvatar(req, res, next) {
    try {
      console.log("Updating avatar");
      const user_id = req.payload.userId;
      const { avatar } = req.body;

      const newUser = await userSchema.findOneAndUpdate(
        { _id: user_id },
        { avatar },
        { new: true }
      );

      console.log(newUser)
      console.log(newUser);

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
