const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema(
  {
    title: { type: "string", required: true },
    content: { type: "string", required: true, unique: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" ,required: true },
    thumbnail: {type: String},
    topic: {type: Array},
    like: {
      like_id: { type: mongoose.Schema.Types.ObjectId, ref: "Like", default: null},
      count: {type: Number , default: 0}

    },
    view: {
      view_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null},
      count: {type: Number , default: 0}

    },
    comment: {
      comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
      },
      count: {type: Number , default: 0}
  }
},
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
