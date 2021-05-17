"use strict";

const assert = require("chai").assert;
const AccountService = require("./account-service");
const fixtures = require("./accounts-test-data.json");
const utils = require("../app/api/utils.js");
const _ = require('lodash');
const axios = require('axios');
const accountService = new AccountService("http://JD-2.local:4000");
suite("Account API tests", function () {
  let users = fixtures.users;
  let newUser = fixtures.newUser;

  suiteSetup(async function () {
    this.timeout(35000);
    await accountService.deleteAllUsers();
    const returnedUser = await accountService.createUser(newUser);
    const response = await accountService.authenticate(newUser);
    console.log(response);
  });

  suiteTeardown(async function () {
    this.timeout(35000);
    await accountService.deleteAllUsers();
    await accountService.clearAuth();
  })

  // setup(async function () {
  //   await accountService.deleteAllUsers();
  //
  // });
  //
  // teardown(async function () {
  //   await accountService.deleteAllUsers();
  // });

  test("get all users", async function () {
    this.timeout(35000);
    for (let c of users) {
      let test = await accountService.createUser(c);
      console.log(test);
    }

    const allUsers = await accountService.getUsers();
    assert.equal(allUsers.length, users.length + 1);
  });


  test("get user", async function () {
    let editedEmailNewUser = {
      ...newUser,
      email: "test134@gmail.com",
      password: "abcdefghd"
    }
    const c1 = await accountService.createUser(editedEmailNewUser);
    console.log(c1);
    let userTest = {
      email: c1.email,
      _id: c1._id
    }
    const userForAuth = utils.createToken(userTest);
    console.log(userForAuth);
    const c2 = await accountService.getUser(userForAuth);
    console.log(c2);
    assert.deepEqual(c1, c2);
  });

  test("get invalid user", async function () {
    const c1 = await accountService.getUser("1234");
    assert.isNull(c1);
    const c2 = await accountService.getUser("012345678901234567890123");
    assert.isNull(c2);
  });

  test("get detailed info on users", async function () {
    await accountService.deleteAllUsers();
    const user = await accountService.createUser(newUser);
    await accountService.authenticate(newUser);
    for (let c of users) {
      await accountService.createUser(c);
    }

    const testUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
    };
    users.unshift(testUser);

    const allUsers = await accountService.getUsers();
    for (var i = 0; i < users.length; i++) {
      assert(_.some([allUsers[i]], users[i]), "returnedUser must be a superset of newUser");
    }
  });

  test("check that users is empty", async function () {
    await accountService.deleteAllUsers();
    const user = await accountService.createUser(newUser);
    await accountService.authenticate(newUser);
    const allUser = await accountService.getUsers();
    assert.equal(allUser.length, 1);
  });

  test("create a user", async function () {
    let editedNewUser = {
      ...newUser,
      email: "babababa@gmail.com",
    }
    const returnedUser = await accountService.createUser(editedNewUser);
    console.log(returnedUser);
    console.log(newUser);
    assert(_.some([returnedUser], editedNewUser), "returnedUser must be a superset of newUser");
    assert.isDefined(returnedUser._id);
  });

  test("fully edit a user", async function() {
    let editedNewUser = {
      ...newUser,
      email: "cacacacaca@gmail.com",
    }
    const returnedUser = await accountService.createUser(editedNewUser);
    let editedUser = returnedUser;
    editedUser['firstName'] = 'First Name'
    editedUser['lastName'] = 'Last Name'
    const afterEditUser = await accountService.fullyEditUser(returnedUser._id, returnedUser);
    assert.isDefined(afterEditUser);
    assert.equal(1, afterEditUser.nModified);

    let userTest = {
      email: returnedUser.email,
      _id: returnedUser._id
    }
    const userForAuth = utils.createToken(userTest);

    const updatedUser = await accountService.getUser(userForAuth);
    assert.equal(updatedUser['firstName'], 'First Name');
    assert.equal(updatedUser['lastName'], 'Last Name');
  })

  test("patch user - firstName", async function() {
    const returnedUser = await accountService.createUser(newUser);
    const firstNameEdit = {firstName: 'John'};
    const afterNameEdit = await accountService.editUserFirstName(returnedUser._id, firstNameEdit);
    assert.isDefined(afterNameEdit);
    assert.notEqual(returnedUser.firstName, afterNameEdit.firstName);
  })

  test("patch user - lastName", async function() {
    const returnedUser = await accountService.createUser(newUser);
    const lastNameEdit = {lastName: 'Dennehy'};
    const afterNameEdit = await accountService.editUserLastName(returnedUser._id, lastNameEdit);
    assert.isDefined(afterNameEdit);
    assert.notEqual(returnedUser.lastName, afterNameEdit.lastName);
  })

  test("patch user - email", async function() {
    const returnedUser = await accountService.createUser(newUser);
    const emailEdit = {email: 'test123@gmail.com'};
    const afterEmailEdit = await accountService.editUserEmail(returnedUser._id, emailEdit);
    assert.isDefined(afterEmailEdit);
    assert.notEqual(returnedUser.email, afterEmailEdit.email);
  })

  test("patch user - password", async function() {
    const returnedUser = await accountService.createUser(newUser);
    const passwordEdit = {password: 'password123'};
    const afterPasswordEdit = await accountService.editUserPassword(returnedUser._id, passwordEdit);
    assert.isDefined(afterPasswordEdit);
    assert.notEqual(returnedUser.password, afterPasswordEdit.password);
  })

  test("patch user - user type", async function() {
    const returnedUser = await accountService.createUser(newUser);
    const userTypeEdit = {userType: 'Admin'};
    const afterUserTypeEdit = await accountService.editUserType(returnedUser._id, userTypeEdit);
    assert.isDefined(afterUserTypeEdit);
    assert.notEqual(returnedUser.userType, afterUserTypeEdit.userType);
  })



  test("delete a user", async function () {
    let c = await accountService.createUser(newUser);
    assert(c._id != null);
    await accountService.deleteOneUser(c._id);
    c = await accountService.getUser(c._id);
    assert(c == null);
  });


});