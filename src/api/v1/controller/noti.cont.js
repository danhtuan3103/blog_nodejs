
const notiSchema = require("../models/noti.model");

class NotiController {
  async getNotification(req, res, next) {
    const id  = req.payload.userId;
    const user_id = new RegExp(`^${id}`);

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
  }

  async getNotificationById(req, res, next) {
    const { id } = req.params;
    const user_id = new RegExp(`^${id}`);

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

    const activity = notiArray.filter((noti) => {
      if (noti.sender._id.toString() === id) {
        const type = noti.type;
        switch (type) {
          case "LIKE":
            return noti;
          case "COMMENT":
            return noti;
          case "STORE":
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

  async addNotification({ notification }) {
    try {
      const user_id = notification.receiver;

      const isOld = await notiSchema.findOne({ user_id });
      const _user_id = new RegExp(`^${user_id}`);

      if (!isOld) {
        const newNoti = new notiSchema({
          user_id,
          max: 1,
          notifications: notification,
        });
        console.log("add new");

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
        console.log("add old");

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
    const user_id = req.payload.userId;
    const _user_id = new RegExp(`^${user_id}`);

    const id = req.params.id;

    console.log("readed ", id);
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

    console.log(newNoti);
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
  }

  async readAll(req, res, next) {
    const user_id = req.payload.userId;
    const _user_id = new RegExp(`^${user_id}`);

    console.log(user_id);
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
  }
}

module.exports = new NotiController();
