'use strict';

const User = require('../models/user');
const Boom = require("@hapi/boom");

const Users = {
  find: {
    auth: false,
    handler: async function (request, h) {
      const users = await User.find();
      return users;
    },
  },
   findOne: {
    auth: false,
    handler: async function (request, h) {
      try {
        const user = await User.findOne({ _id: request.params.id });
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        return user;
      } catch (err) {
        return Boom.notFound("No User with this id");
      }
    },
  },
  create: {
    auth: false,
    handler: async function (request, h) {
      const newUser = new User(request.payload);
      const user = await newUser.save();
      if (user) {
        return h.response(user).code(201);
      }
      return Boom.badImplementation("error creating user");
    },
  },

  edit: {
    auth: false,
    handler: async function (request, h) {

      try {
        const updatedUser = await User.updateOne({ _id: request.params.id }, request.payload);
        if (!updatedUser) {
          return Boom.notFound("No User with this id");
        }
        return updatedUser;
      } catch (err) {
        return Boom.notFound("No User with this id");
      }

    }
  },

  partiallyEdit: {
    auth: false,
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
    auth: false,
    handler: async function (request, h) {
      await User.remove({});
      return { success: true };
    },
  },

  deleteOne: {
    auth: false,
    handler: async function(request, h) {
      const response = await User.deleteOne({ _id: request.params.id });
      if (response.deletedCount == 1) {
        return { success: true };
      }
      return Boom.notFound('id not found');
    }
  },
};

module.exports = Users;