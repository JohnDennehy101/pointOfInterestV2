"use strict";

const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HandleBars = require("handlebars");
const Cookie = require("@hapi/cookie");
const env = require("dotenv");
const Joi = require("@hapi/joi");
const utils = require("./app/api/utils.js");

env.config();

const server = Hapi.server({
  port: process.env.PORT || 4000,
  routes: {cors: true},
});

require("./app/models/db");

async function init() {
  await server.register(Inert);
  await server.register(Vision);
  await server.register(Cookie);
  await server.register(require('hapi-auth-jwt2'));
  server.validator(require("@hapi/joi"));
  server.views({
    engines: {
      hbs: HandleBars,
    },
    relativeTo: __dirname,
    path: "./app/views",
    layoutPath: "./app/views/layouts",
    partialsPath: "./app/views/partials",
    layout: true,
    isCached: false,
  });

  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.cookie_name,
      password: process.env.cookie_password,
      isSecure: false,
    },
    redirectTo: "/",
  });

  server.auth.strategy("jwt", "jwt", {
    key: "secretpasswordnotrevealedtoanyone",
    validate: utils.validate,
    verifyOptions: { algorithms: ["HS256"] },
  });

  server.auth.default("session");

  server.route(require("./routes"));
  server.route(require('./routes-api'));

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
