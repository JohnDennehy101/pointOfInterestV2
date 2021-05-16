const jwt = require('jsonwebtoken');
const User = require("../models/user");
const sanitizeHtml = require("sanitize-html");
const Joi = require("@hapi/joi");

exports.createToken = function (user) {
  return jwt.sign({ id: user._id, email: user.email }, 'secretpasswordnotrevealedtoanyone', {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
};

exports.decodeToken = function (token) {
  var userInfo = {};
  try {
    var decoded = jwt.verify(token, 'secretpasswordnotrevealedtoanyone');
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
  } catch (e) {
  }

  return userInfo;
};

exports.accountValidation = function(payload) {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(5),
    userType: Joi.string().regex(/User|Admin/)
  });
  let schemaValidation = schema.validate({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    password: payload.password,
    userType: payload.userType
  });

  if (schemaValidation) {
    return true;
  }
  return false;
}

exports.accountInputSanitization = function(payload) {
  if (sanitizeHtml(payload.firstName) && sanitizeHtml(payload.lastName) &&  sanitizeHtml(payload.email) && sanitizeHtml(payload.password)  &&  sanitizeHtml(payload.userType)) {
    return {
      firstName: sanitizeHtml(payload.firstName),
      lastName: sanitizeHtml(payload.lastName),
      email: sanitizeHtml(payload.email),
      password: sanitizeHtml(payload.password),
      userType: sanitizeHtml(payload.userType)
    }
  }
  else {
    return false;
  }
}

exports.validate = async function (decoded, request) {
  const user = await User.findOne({ _id: decoded.id });
  if (!user) {
    return { isValid: false };
  } else {
    return { isValid: true };
  }
};