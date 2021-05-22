"use strict";

var mocha = require('mocha')
const assert = require("chai").assert;
const AccountService = require("./account-service");
const fixtures = require("./accounts-test-data.json");
const utils = require("../app/api/utils.js");
const _ = require('lodash');
const axios = require('axios');
var describe = mocha.describe
var it = mocha.it
var beforeEach = mocha.beforeEach
const server = require("../index.js")
var chai = require("chai");

const chaiHttp = require("chai-http");

chai.use(chaiHttp);

var expect  = require("chai").expect;
var request = require("request");


const accountService = new AccountService("http://JD-2.local:4000");
suite("Account API tests", function () {
  let users = fixtures.users;
  let newUser = fixtures.newUser;


  suiteSetup(async function () {
    this.timeout(35000);
    let returnedUser = await accountService.createUser(newUser);
    await accountService.authenticate(newUser);
    await accountService.deleteAllUsers();
    returnedUser = await accountService.createUser(newUser);
    await accountService.authenticate(newUser);
  });

  suiteTeardown(async function () {
    this.timeout(35000);
    await accountService.deleteAllUsers();
    await accountService.clearAuth();
  })



  test("valid user passes schema check", async function () {
    this.timeout(35000);
    const validSchemaCheck = await utils.accountValidation(newUser);
    assert.equal(validSchemaCheck, true);
  });

  test("invalid user fails schema check", async function () {
    this.timeout(35000);
    const invalidUser = {
     firstName: "test",
      lastName: "user"
    }
    const invalidSchemaCheck = await utils.accountValidation(invalidUser);
    assert.equal(invalidSchemaCheck, false);
  });

  test("Successful sanitization check for valid payload", async function () {
    this.timeout(35000);
    const validUser = {
      ...newUser,
      email: "vovovovov@gmail.com"
    }
    const validSanitizationCheck = await utils.accountInputSanitization(validUser);

    assert.equal(validSanitizationCheck.firstName, "Bart");
  });

  test("Failed sanitization check for payload with script tag", async function () {
    this.timeout(35000);
    const invalidUser = {
      ...newUser,
      email: "Kpj@gmail.com",
      firstName: "<script>alert('test')</script>"
    }
    const invalidSanitizationCheck = await utils.accountInputSanitization(invalidUser);
    assert.equal(invalidSanitizationCheck, false);
  });


  test("get all users", async function () {
    this.timeout(35000);
    for (let c of users) {
    await accountService.createUser(c);
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
    let userTest = {
      email: c1.email,
      _id: c1._id
    }
    const userForAuth = utils.createToken(userTest);
    const c2 = await accountService.getUser(userForAuth);
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
      userType: user.userType
    };
    users.unshift(testUser);

    const allUsers = await accountService.getUsers();
    for (var i = 0; i < users.length; i++) {
      assert.equal(allUsers[i].email, users[i].email, "user emails must match");
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
    assert.equal(returnedUser.email, editedNewUser.email);
    assert.equal(returnedUser.userType, editedNewUser.userType);
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




  test("delete a user", async function () {
    let editedNewUser = {
      ...newUser,
      email: "dbdbdbdbdb@gmail.com",
    }
    let c = await accountService.createUser(editedNewUser);
    assert(c._id != null);

    let userTest = {
      email: c.email,
      _id: c._id
    }
    const userForAuth = utils.createToken(userTest);
    await accountService.deleteOneUser(userForAuth);
    c = await accountService.getUser(userForAuth);
    assert(c == null);
  });


});