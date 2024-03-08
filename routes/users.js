const mongoose = require("mongoose");
const passport = require("passport");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/pintrestdb");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  dp: {
    type: String,
  },
  fullName: {
    type: String,
  },
});
userSchema.plugin(plm);
module.exports = mongoose.model("User", userSchema);
