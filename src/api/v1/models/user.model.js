const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UserSchema = new Schema(
  {
    username: { type: "string", required: true },
    email: { type: "string", required: true, unique: true },
    password: { type: "string", required: true },
    avatar: { type: "string", default: ""},
    blogs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
    }]
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
try {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(this.password, salt);
  this.password = hashPassword;
  next();
} catch (error) {
  next(error);
}
})

UserSchema.methods.isCheckPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);

  } catch (error) {
    next(error);
  }
}

module.exports = mongoose.model('User', UserSchema);
