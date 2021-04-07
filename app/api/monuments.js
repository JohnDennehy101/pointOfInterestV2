'use strict';

const Monument = require('../models/monuments');
const Boom = require("@hapi/boom");

const Monuments = {
  find: {
    auth: false,
    handler: async function (request, h) {
      const monuments = await Monument.find();
      return monuments;
    },
  },
  findOne: {
    auth: false,
    handler: async function (request, h) {
      try {
        const monument = await Monument.findOne({ _id: request.params.id });
        if (!monument) {
          return Boom.notFound("No monument with this id");
        }
        return monument;
      } catch (err) {
        return Boom.notFound("No monument with this id");
      }
    },
  },
  create: {
    auth: false,
    handler: async function (request, h) {
      const newMonument = new Monument(request.payload);
      const monument = await newMonument.save();
      if (monument) {
        return h.response(monument).code(201);
      }
      return Boom.badImplementation("error creating monument");
    },
  },
  edit: {
    auth: false,
    handler: async function (request, h) {
      try {
        const updatedMonument = await Monument.updateOne({ _id: request.params.id }, request.payload);
        if (!updatedMonument) {
          return Boom.notFound("No monument with this id");
        }

        return updatedMonument;
      } catch (err) {
        return Boom.notFound("No monument with this id");
      }

    }
  },
  deleteAll: {
    auth: false,
    handler: async function (request, h) {
      await Monument.deleteMany({});
      return { success: true };
    },
  },
  deleteOne: {
    auth: false,
    handler: async function(request, h) {
      const response = await Monument.deleteOne({ _id: request.params.id });
      if (response.deletedCount == 1) {
        return { success: true };
      }
      return Boom.notFound('id not found');
    }
  },
}

module.exports = Monuments;