"use strict";

const assert = require("chai").assert;
const AccountService = require("./account-service");
const testUserData = require("./accounts-test-data.json");
const utils = require("../app/api/utils.js");

suite("Authentication API tests", function () {
  let users = testUserData.users;
  let newUser = testUserData.newUser;

  const accountService = new AccountService("http://localhost:4000");

  setup(async function () {
    await accountService.deleteAllUsers();
  });

  test("authenticate", async function () {
    const returnedUser = await accountService.createUser(newUser);
    const response = await accountService.authenticate(newUser);
    assert(response.success);
    assert.isDefined(response.token);
  });

  test("verify Token", async function () {
    const returnedUser = await accountService.createUser(newUser);
    const response = await accountService.authenticate(newUser);

    const userInfo = utils.decodeToken(response.token);
    assert.equal(userInfo.email, returnedUser.email);
    assert.equal(userInfo.userId, returnedUser._id);
  });
});