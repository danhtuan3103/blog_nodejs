const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookmarkSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  blogs: [
    {
      type: new mongoose.Schema(
        {
          blog_id: { type: mongoose.Schema.Types.ObjectId, ref: "Blog" },
        },
        { timestamps: true }
      ),
    },
  ],
});

module.exports = mongoose.model("Bookmark", bookmarkSchema);
