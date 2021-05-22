"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;
const Boom = require("@hapi/boom");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  lastUpdated: Date,
  lastLogin: String,
  userType: String,
  numberOfRecords: Number,
});

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email });
};

userSchema.methods.comparePassword = async function (userPassword) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  if (!isMatch) {
    throw Boom.unauthorized("Password mismatch");
  }
  return this;
};

module.exports = Mongoose.model("User", userSchema);
