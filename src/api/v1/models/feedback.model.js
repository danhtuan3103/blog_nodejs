const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
    feedback : {type: String, required: true},
  },
  { timestamps: true }
);

module.exports = mongoose.model("feedback", feedbackSchema);
