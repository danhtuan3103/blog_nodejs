const mongoose = require("mongoose");

const Schema = mongoose.Schema;
// comments: [Object,
//   {id: {type: mongoose.Types.ObjectId, require: true}},
//   {author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}},
//   {content: {type: String, required: true}},
//   {isRoot: {type: Boolean, required: true}},
//   {parrent: {type: mongoose.Types.ObjectId, required: true, default: null}},
//   { timestamps: true }

// ],
const commentSchema = new Schema({
  blog_id: { type: String, required: true },
  comments: [
    {
      type: new mongoose.Schema(
        {
          author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          content: { type: String, required: true },
          isRoot: { type: Boolean, required: true },
          parrent: {
            type: mongoose.Types.ObjectId,
            // required: true,
            default: null,
          },
        },
        { timestamps: true }
      ),
    },
  ],
  max: { type: Number, default: 0 },
});

module.exports = mongoose.model("Comment", commentSchema);
