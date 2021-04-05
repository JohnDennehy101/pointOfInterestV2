"use strict";

const assert = require("chai").assert;
const AccountService = require("./account-service");
const fixtures = require("./fixtures.json");
const _ = require('lodash');

suite("Account API tests", function () {
  let users = fixtures.users;
  let newUser = fixtures.newUser;

  const accountService = new AccountService("http://localhost:3000");

  setup(async function () {
    await accountService.deleteAllUsers();
  });

  teardown(async function () {
    await accountService.deleteAllUsers();
  });

  test("get all users", async function () {
    for (let c of users) {
      await accountService.createUser(c);
    }

    const allUsers = await accountService.getUsers();
    assert.equal(allUsers.length, users.length);
  });


  test("get user", async function () {
    const c1 = await accountService.createUser(newUser);
    const c2 = await accountService.getUser(c1._id);
    assert.deepEqual(c1, c2);
  });
});