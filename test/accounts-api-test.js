"use strict";

const assert = require("chai").assert;
const AccountService = require("./account-service");
const fixtures = require("./accounts-test-data.json");
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

  test("get invalid user", async function () {
    const c1 = await accountService.getUser("1234");
    assert.isNull(c1);
    const c2 = await accountService.getUser("012345678901234567890123");
    assert.isNull(c2);
  });

  test("get detailed info on users", async function () {
    for (let c of users) {
      await accountService.createUser(c);
    }

    const allUsers = await accountService.getUsers();
    for (var i = 0; i < users.length; i++) {
      assert(_.some([allUsers[i]], users[i]), "returnedUser must be a superset of newUser");
    }
  });

  test("check that users is empty", async function () {
    const allUsers = await accountService.getUsers();
    assert.equal(allUsers.length, 0);
  });

  test("create a user", async function () {
    const returnedUser = await accountService.createUser(newUser);
    assert(_.some([returnedUser], newUser), "returnedUser must be a superset of newUser");
    assert.isDefined(returnedUser._id);
  });

  test("edit a user", async function() {
    const returnedUser = await accountService.createUser(newUser);
    let editedUser = returnedUser;
    editedUser['firstName'] = 'First Name'
    editedUser['lastName'] = 'Last Name'
    const afterEditUser = await accountService.editUser(returnedUser._id, returnedUser);
    assert.isDefined(afterEditUser);
    assert.equal(1, afterEditUser.nModified);

    const updatedUser = await accountService.getUser(returnedUser._id);
    assert.equal(updatedUser['firstName'], 'First Name');
    assert.equal(updatedUser['lastName'], 'Last Name');
  })

  test("delete a user", async function () {
    let c = await accountService.createUser(newUser);
    assert(c._id != null);
    await accountService.deleteOneUser(c._id);
    c = await accountService.getUser(c._id);
    assert(c == null);
  });


});