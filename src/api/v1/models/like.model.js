const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new Schema(
  {
    blog_id: { type: mongoose.Schema.Types.ObjectId, ref: "Blog" },
    users: [{ type: new mongoose.Schema({
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    }, {timestamps: true})}],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Like", likeSchema);
