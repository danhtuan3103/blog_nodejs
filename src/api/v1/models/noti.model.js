const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotiSchema = new Schema({
  user_id: {
    type: String
  },
  max: {type: Number, default: 0},
  notifications: [
    {
      type: new mongoose.Schema(
        {
          type: {
            type: String,
            enum: ["LIKE", "UN_LIKE", "COMMENT", "POST", "REPLY", "LIKE_COMMENT","UN_LIKE _COMMENT", 'STORE', 'UN_STORE'],
            require: true,
          },
          receiver: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Blog",
              require: true,
            },
          ],
          message: { type: String, default: null },
          sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,
          },
          target: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
          },
          read_by: [
            {
              type: new mongoose.Schema({
                readerId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
                read_at: { type: Date, default: Date.now },
              }),
            },
          ],
        },
        { timestamps: true }
      ),
    },
  ],
});

module.exports = mongoose.model("Notification", NotiSchema);
