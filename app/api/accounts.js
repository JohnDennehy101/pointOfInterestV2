'use strict';

const User = require('../models/user');
const Boom = require("@hapi/boom");
const utils = require('./utils.js');
const sanitizeHtml = require("sanitize-html");
const Joi = require("@hapi/joi");

const Users = {
  authenticate: {
    auth: false,
    handler: async function (request, h) {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required().min(5)
      });
      let schemaValidation = schema.validate({
        email: request.payload.email,
        password: request.payload.password
      });

      let user;
      try {
        if (sanitizeHtml(request.payload.email) && sanitizeHtml(request.payload.password) && !schemaValidation.error) {
          user = await User.findOne({ email: sanitizeHtml(request.payload.email.trim()) });
        }

        if (!user) {
          return Boom.unauthorized("User not found");
        } else if (user.password !== request.payload.password) {
          return Boom.unauthorized("Invalid password");
        } else {
          const token = utils.createToken(user);
          return h.response({ success: true, token: token }).code(201);
        }
      } catch (err) {
        return Boom.notFound("internal db failure");
      }
    },
  },
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const users = await User.find();
      return users;
    },
  },
   findOne: {
     auth: {
       strategy: "jwt",
     },
    handler: async function (request, h) {
       let decodedUserToken;
      try {
        if (sanitizeHtml(request.params.id)) {
          decodedUserToken = await utils.decodeToken(request.params.id);
        }
        else {
          return h.response().code(404);
        }

        let userId = decodedUserToken.userId;
        const user = await User.findOne({ _id: userId });
        if (!user) {
          return h.response().code(404);
        }
        return user;
      } catch (err) {
        return h.response().code(404);
      }
    },
  },
  create: {
    auth: false,
    handler: async function (request, h) {
      let newUser;
      let user;

      try {
        const validationCheck = utils.accountValidation(request.payload);


        if (!validationCheck.error) {
          const successSanitisationCheck = utils.accountInputSanitization(request.payload);
          if (successSanitisationCheck) {
            let checkEmailInUse = await User.findByEmail(successSanitisationCheck.email);

            if (checkEmailInUse) {
              return h.response().code(409);
            }

            newUser = new User(successSanitisationCheck);

            user = await newUser.save();
          }
        }

        if (user) {
          return h.response(user).code(201);
        }
        return h.response().code(400);

      }
      catch (err) {
        return h.response().code(400);
      }

    },
  },

  edit: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      let updatedUser;
      try {
        const validationCheck = utils.validate(request.payload);
        if (!validationCheck.error) {
          const successSanitisationCheck = utils.accountInputSanitization(request.payload);
          if (successSanitisationCheck) {
            updatedUser = await User.updateOne({ _id: request.params.id }, successSanitisationCheck);
          }
          }


        if (!updatedUser) {
          return h.response().code(400);
        }
        return updatedUser;
      } catch (err) {
        return h.response().code(400);
      }

    }
  },

  partiallyEdit: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const user = await User.findOne({ _id: request.params.id });
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        if (request.payload.firstName) {
          user.firstName = request.payload.firstName;
        }
        if (request.payload.lastName) {
          user.lastName = request.payload.lastName;
        }
        if (request.payload.email) {
          user.email = request.payload.email;
        }
        if (request.payload.password) {
          user.password = request.payload.password;
        }
        if (request.payload.userType) {
          if (request.payload.userType.toLowerCase() === 'admin' || request.payload.userType.toLowerCase() === 'user') {
            user.userType = request.payload.userType;
          }

        }
        await user.save();
        return user;
      } catch (err) {
        return Boom.notFound("No User with this id");
      }
    }
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      await User.remove({});
      return { success: true };
    },
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      const decodedUserToken = await utils.decodeToken(request.params.id);
      let userId = decodedUserToken.userId;
      const response = await User.deleteOne({ _id: userId });
      if (response.deletedCount == 1) {
        return { success: true };
      }
      return Boom.notFound('id not found');
    }
  },
};

module.exports = Users;