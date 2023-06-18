const notiSchema = require("../models/noti.model");
const createError = require("http-errors");
const userSchema = require("../models/user.model");

class NotiController {
  async getNotification(req, res, next) {
    try {
      console.log("GET NOTIFICATIONS");
      const id = req.payload.userId;
      const user_id = new RegExp(`^${id}`);

      const isUser = await userSchema.findOne({ _id: id });

      if (!isUser) {
        return next(createError.Unauthorized());
      }
      const allNoti = await notiSchema
        .find({ user_id })
        .populate({
          path: "notifications.sender",
          select: ["username", "_id", "avatar"],
        })
        .populate({ path: "notifications.target", select: ["title", "_id"] });

      const notiArray = allNoti.reduce((init, noti) => {
        return init.concat(noti.notifications);
      }, []);

      if (allNoti) {
        res.json({
          status: "success",
          data: notiArray,
        });
      } else {
        res.json({
          status: "failed",
          error: "Cound't find notification of user",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getNotificationById(req, res, next) {
    try {
      console.log("GET ACTIVITY");
      const { id } = req.params;

      const isUser = await userSchema.findOne({ _id: id });

      if (!isUser) {
        return next(createError.Unauthorized());
      }

      const allDoc = await notiSchema
        .find({ notifications: { $elemMatch: { sender: id } } })
        .populate({
          path: "notifications.sender",
          select: ["username", "_id", "avatar"],
        })
        .populate({ path: "notifications.target", select: ["title", "_id"] });

      const allNotis = allDoc.reduce((init, notis) => {
        return init.concat(notis.notifications);
      }, []);

      if (allNotis.length > 0) {
        const activity = allNotis.filter((noti) => {
          if (noti?.sender?._id.toString() === id) {
            const type = noti.type;
            switch (type) {
              case "LIKE":
                return noti;
              case "COMMENT":
                return noti;
              case "STORE":
                return noti;
              case "REPLY":
                return noti;
              default:
                return;
            }
          }
        });

        if (activity) {
          res.json({
            status: "success",
            data: activity,
          });
        } else {
          res.json({
            status: "failed",
            error: "Cound't find notification of user",
          });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  async addNotification({ notification }) {
    try {
      const user_id = notification.receiver;
      console.log(user_id);

      const isUser = await userSchema.findOne({ _id: user_id });

      if (!isUser) {
        console.log("User not found");
      }

      const isOld = await notiSchema.findOne({ user_id });
      const _user_id = new RegExp(`^${user_id}`);

      if (!isOld) {
        const newNoti = new notiSchema({
          user_id,
          max: 1,
          notifications: notification,
        });

        await newNoti.save();

        const noti = await notiSchema
          .findOne({ user_id })
          .populate({
            path: "notifications.sender",
            select: ["username", "_id", "avatar"],
          })
          .populate({
            path: "notifications.target",
            select: ["title", "_id"],
          });

        if (noti) {
          return {
            status: "success",
            data: noti.notifications[0],
          };
        } else {
          return {
            status: "failed",
            data: null,
          };
        }
      } else {
        const newNoti = await notiSchema.findOneAndUpdate(
          { user_id: _user_id, max: { $lt: 10 } },
          {
            $push: { notifications: notification },
            $inc: { max: 1 },
            $setOnInsert: { user_id: `${user_id}_${new Date().getTime()}` },
          },
          { new: true, upsert: true }
        );

        const allNoti = await notiSchema
          .find({ user_id: _user_id })
          .populate({
            path: "notifications.sender",
            select: ["username", "_id", "avatar"],
          })
          .populate({
            path: "notifications.target",
            select: ["title", "_id"],
          });

        const notiArray = allNoti.reduce((init, noti) => {
          return init.concat(noti.notifications);
        }, []);

        const lastElem = notiArray[notiArray.length - 1];
        if (newNoti) {
          return {
            status: "success",
            data: lastElem,
          };
        } else {
          return {
            status: "failed",
            data: null,
          };
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async readOne(req, res, next) {
    try {
      console.log("READ ONE");
      const user_id = req.payload.userId;
      const _user_id = new RegExp(`^${user_id}`);

      const isUser = await userSchema.findOne({ _id: user_id });

      if (!isUser) {
        return next(createError.Unauthorized());
      }
      const id = req.params.id;

      const newNoti = await notiSchema.updateOne(
        {
          user_id: _user_id,
          "notifications._id": id,
        },
        {
          $push: { "notifications.$.read_by": { readerId: user_id } },
        }
      );

      const allNoti = await notiSchema
        .find({ user_id: _user_id })
        .populate({
          path: "notifications.sender",
          select: ["username", "_id", "avatar"],
        })
        .populate({
          path: "notifications.target",
          select: ["title", "_id"],
        });

      const notiArray = allNoti.reduce((init, noti) => {
        return init.concat(noti.notifications);
      }, []);

      if (allNoti) {
        res.json({
          status: "success",
          data: notiArray,
        });
      } else {
        res.json({
          status: "failed",
          error: "Cound't find notification of user",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async readAll(req, res, next) {
    try {
      console.log("READ ALL");
      const user_id = req.payload.userId;
      const _user_id = new RegExp(`^${user_id}`);

      const isUser = await userSchema.findOne({ _id: user_id });

      if (!isUser) {
        return next(createError.Unauthorized());
      }

      const newNoti = await notiSchema.updateMany(
        {
          user_id: _user_id,
          $not: { "notifications.read_by.readerId": user_id },
        },
        {
          $push: { "notifications.$[].read_by": { readerId: user_id } },
        }
      );

      const allNoti = await notiSchema
        .find({ user_id: _user_id })
        .populate({
          path: "notifications.sender",
          select: ["username", "_id", "avatar"],
        })
        .populate({ path: "notifications.target", select: ["title", "_id"] });

      const notiArray = allNoti.reduce((init, noti) => {
        return init.concat(noti.notifications);
      }, []);

      if (allNoti) {
        res.json({
          status: "success",
          data: notiArray,
        });
      } else {
        res.json({
          status: "failed",
          error: "Cound't find notification of user",
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotiController();
